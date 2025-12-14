import OpenAI from 'openai';
import Module from '../models/Module.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import { createRequire } from 'module';
import Absence from '../models/Absence.js';
import Justification from '../models/Justification.js';
import Notification from '../models/Notification.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { userPdfContext } from '../utils/aiContext.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Official ISSAT base URL
const OFFICIAL_BASE = 'https://issatkr.rnu.tn/';

// Initialize OpenAI client only if API key is provided
let client = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) {
  try {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY.trim(),
    });
    console.log('✅ OpenAI client initialized successfully');
  } catch (error) {
    console.warn('⚠️ OpenAI client initialization error:', error.message);
    console.warn('⚠️ AI features will use mock responses.');
  }
} else {
  console.warn('⚠️ OPENAI_API_KEY not found in environment. AI features will use mock responses.');
}

// Store conversation history per user (in production, use Redis or database)
const conversationHistory = new Map();
const MAX_HISTORY_LENGTH = 10; // Keep last 10 messages

/**
 * Detect language from text
 */
function detectLanguage(text) {
  const lower = (text || '').toLowerCase();
  const frHints = [
    'é', 'à', 'ç', 'attestation', 'absence', 'filière', 'justification',
    'réclamation', 'certificat', 'inscription', "j'ai",
  ];
  return frHints.some((h) => lower.includes(h)) ? 'fr' : 'en';
}

/**
 * Detect intent from question
 */
function getIntent(q) {
  const t = (q || '').toLowerCase();

  // Absences & justifications
  if (t.includes('absence') || t.includes('absences') || t.includes('justif') || t.includes('élim') || t.includes('elim'))
    return 'absence';

  // Procédures administratives et documents
  if (
    t.includes('attestation') || t.includes('certificat') || t.includes('inscription') ||
    t.includes('réclamation') || t.includes('reclamation') || t.includes('document') ||
    t.includes('administratif') || t.includes('procédure') || t.includes('demande') ||
    t.includes('démarche') || t.includes('bureau') || t.includes('service')
  )
    return 'docs';

  // Informations pédagogiques
  if (
    t.includes('fili') || t.includes('module') || t.includes('coefficient') ||
    t.includes('validation') || t.includes('orientation') || t.includes('pédagogique') ||
    t.includes('pedagogique') || t.includes('cours') || t.includes('matière') ||
    t.includes('matiere') || t.includes('programme') || t.includes('syllabus') ||
    t.includes('évaluation') || t.includes('evaluation') || t.includes('examen')
  )
    return 'pedagogy';

  // TPL / Hack / Events
  if (t.includes('tpl') || t.includes('hack') || t.includes('matrix') || t.includes('compus') ||
    t.includes('révolution') || t.includes('revolution') || t.includes('événement') ||
    t.includes('evenement') || t.includes('club') || t.includes('activité') || t.includes('activite'))
    return 'events';

  return 'general';
}

/**
 * Get real data from database for context
 */
async function getDatabaseContext(userId) {
  try {
    const studentProfile = await StudentProfile.findOne({ user: userId }).populate('user');
    if (!studentProfile) return null;

    // Get student's modules
    const modules = await Module.find({
      filiere: studentProfile.filiere,
      level: studentProfile.level
    }).select('name code coefficient filiere level').lean();

    // Get student's absences count
    const absences = await Absence.find({
      student: studentProfile._id,
      justified: false
    }).countDocuments();

    return {
      student: {
        firstName: studentProfile.firstName,
        lastName: studentProfile.lastName,
        filiere: studentProfile.filiere,
        level: studentProfile.level,
        group: studentProfile.group,
      },
      modules: modules.map(m => ({
        name: m.name,
        code: m.code,
        coefficient: m.coefficient,
      })),
      absencesCount: absences,
    };
  } catch (error) {
    console.error('Error getting database context:', error);
    return null;
  }
}

/**
 * Build enhanced system prompt with real data (from ai-assistant model)
 */
async function buildSystemPrompt(userId, lang = 'fr') {
  const context = await getDatabaseContext(userId);

  const system = lang === 'fr'
    ? `Tu es l'assistant IA officiel de l'ISSAT Kairouan - TPL ISSATKR HACK V 1.0 MATRIX : COMPUS REVOLUTION.

TON RÔLE PRINCIPAL:
- Clarifier les procédures administratives floues et complexes
- Centraliser et organiser les informations pédagogiques dispersées
- Gérer les absences et justifications de manière efficace
- Fournir une assistance 24/7 intégrée et réactive
- Guider les étudiants dans toutes leurs démarches académiques

TON STYLE:
- Réponds de manière institutionnelle, claire et fiable
- Sois précis et détaillé pour les procédures administratives
- Organise les informations pédagogiques de manière structurée
- Sois empathique et encourageant
- Réponds rapidement et efficacement (assistance 24/7)`
    : `You are the official AI assistant of ISSAT Kairouan - TPL ISSATKR HACK V 1.0 MATRIX : COMPUS REVOLUTION.

YOUR MAIN ROLE:
- Clarify unclear and complex administrative procedures
- Centralize and organize scattered pedagogical information
- Efficiently manage absences and justifications
- Provide integrated 24/7 assistance
- Guide students in all their academic procedures

YOUR STYLE:
- Respond in an institutional, clear, and reliable manner
- Be precise and detailed for administrative procedures
- Organize pedagogical information in a structured way
- Be empathetic and encouraging
- Respond quickly and efficiently (24/7 assistance)`;

  const instruction = lang === 'fr'
    ? [
      'STRUCTURE DE RÉPONSE (selon le type de question):',
      '',
      '📋 Pour les PROCÉDURES ADMINISTRATIVES:',
      '✅ Clarification claire et détaillée (pas juste 1-2 lignes)',
      '📝 Étapes numérotées et précises',
      '📄 Documents requis (liste complète)',
      '⏱️ Délais exacts si connus',
      '📍 Où faire la démarche (bureau, service)',
      '💡 Conseils pratiques et pièges à éviter',
      '',
      '📚 Pour les INFORMATIONS PÉDAGOGIQUES:',
      '✅ Organisation structurée des informations',
      '📖 Modules, coefficients, filières (détails complets)',
      '🎯 Objectifs pédagogiques si pertinents',
      '📊 Informations sur les évaluations',
      '🔗 Liens avec d\'autres modules si applicable',
      '',
      '🚫 Pour les ABSENCES & JUSTIFICATIONS:',
      '✅ Règles claires et précises',
      '⚠️ Seuils d\'avertissement et d\'élimination',
      '📝 Procédure de justification étape par étape',
      '📄 Types de justificatifs acceptés',
      '⏰ Délais pour justifier',
      '',
      '🌐 Pour TOUTES les questions:',
      `📌 Sources: ${OFFICIAL_BASE}`,
      '💬 Assistance disponible 24/7',
      '',
      'RÈGLES IMPORTANTES:',
      '- N\'invente rien, mais sois exhaustif avec les informations disponibles',
      '- Si l\'information n\'est pas connue, écris \'Non précisé\' mais suggère où la trouver',
      '- Pour les procédures administratives, sois très détaillé et clair',
      '- Organise toujours les informations pédagogiques de manière structurée',
    ].join('\n')
    : [
      'RESPONSE STRUCTURE (based on question type):',
      '',
      '📋 For ADMINISTRATIVE PROCEDURES:',
      '✅ Clear and detailed clarification (not just 1-2 lines)',
      '📝 Numbered and precise steps',
      '📄 Required documents (complete list)',
      '⏱️ Exact deadlines if known',
      '📍 Where to do the procedure (office, service)',
      '💡 Practical tips and pitfalls to avoid',
      '',
      '📚 For PEDAGOGICAL INFORMATION:',
      '✅ Structured organization of information',
      '📖 Modules, coefficients, programs (complete details)',
      '🎯 Pedagogical objectives if relevant',
      '📊 Information on assessments',
      '🔗 Links with other modules if applicable',
      '',
      '🚫 For ABSENCES & JUSTIFICATIONS:',
      '✅ Clear and precise rules',
      '⚠️ Warning and elimination thresholds',
      '📝 Justification procedure step by step',
      '📄 Types of accepted justifications',
      '⏰ Deadlines for justification',
      '',
      '🌐 For ALL questions:',
      `📌 Sources: ${OFFICIAL_BASE}`,
      '💬 24/7 assistance available',
      '',
      'IMPORTANT RULES:',
      '- Do not invent, but be exhaustive with available information',
      '- If information is not known, write \'Not specified\' but suggest where to find it',
      '- For administrative procedures, be very detailed and clear',
      '- Always organize pedagogical information in a structured way',
    ].join('\n');

  let contextInfo = '';
  if (context) {
    contextInfo = lang === 'fr'
      ? `\n\nINFORMATIONS SUR L'ÉTUDIANT ACTUEL:
- Nom: ${context.student.firstName} ${context.student.lastName}
- Filière: ${context.student.filiere}
- Niveau: ${context.student.level}
- Groupe: ${context.student.group || 'Non spécifié'}
- Absences non justifiées: ${context.absencesCount}
- Modules: ${context.modules.map(m => `${m.name} (Coef: ${m.coefficient})`).join(', ')}`
      : `\n\nCURRENT STUDENT INFORMATION:
- Name: ${context.student.firstName} ${context.student.lastName}
- Program: ${context.student.filiere}
- Level: ${context.student.level}
- Group: ${context.student.group || 'Not specified'}
- Unjustified absences: ${context.absencesCount}
- Modules: ${context.modules.map(m => `${m.name} (Coef: ${m.coefficient})`).join(', ')}`;
  }

  return { system, instruction, contextInfo };
}

// Mock responses for common questions when OpenAI is not available
const getMockResponse = (question, context = null) => {
  const lowerQuestion = question.toLowerCase();

  // TPL / Hack / Events
  if (lowerQuestion.includes('tpl') || lowerQuestion.includes('hack') || lowerQuestion.includes('matrix') ||
    lowerQuestion.includes('compus') || lowerQuestion.includes('révolution') || lowerQuestion.includes('revolution')) {
    return `TPL ISSATKR HACK V 1.0 MATRIX : COMPUS REVOLUTION\n\n🎯 Événement technologique majeur de l'ISSAT Kairouan\n\n📅 Informations:\n- Organisé par le club TPL (Tunisian Programming Lovers)\n- Hackathon et compétitions de programmation\n- Workshops et formations techniques\n- Networking avec les professionnels\n\n💡 Pour plus d'informations:\n- Contactez le club TPL\n- Consultez les annonces dans l'espace étudiant\n- Visitez le site officiel: ${OFFICIAL_BASE}\n\n🚀 Restez connecté pour les prochains événements!`;
  }

  // Absences & justifications
  if (lowerQuestion.includes('absence') || lowerQuestion.includes('justif')) {
    let response = `🚫 ABSENCES & JUSTIFICATIONS - Règles détaillées\n\n`;
    response += `✅ Seuils d'absence:\n`;
    response += `- 3 absences non justifiées: Avertissement officiel\n`;
    response += `- 4 absences non justifiées: Risque d'élimination du module\n\n`;

    if (context && context.absencesCount > 0) {
      response += `📊 VOTRE SITUATION ACTUELLE:\n`;
      response += `- Absences non justifiées: ${context.absencesCount}\n`;
      if (context.absencesCount >= 4) {
        response += `🔴 URGENT: Vous êtes à risque d'élimination!\n`;
        response += `➡️ Justifiez immédiatement vos absences\n`;
      } else if (context.absencesCount >= 3) {
        response += `🟡 ATTENTION: Vous avez reçu un avertissement.\n`;
        response += `➡️ Justifiez vos absences dès que possible\n`;
      } else {
        response += `🟢 Statut: OK (mais restez vigilant)\n`;
      }
      response += `\n`;
    }

    response += `📝 PROCÉDURE DE JUSTIFICATION:\n`;
    response += `1. Connectez-vous à votre espace étudiant\n`;
    response += `2. Allez dans la section "Absences"\n`;
    response += `3. Cliquez sur "Justifier" pour l'absence concernée\n`;
    response += `4. Téléchargez votre document justificatif (PDF)\n`;
    response += `5. Remplissez le motif de l'absence\n`;
    response += `6. Soumettez et attendez la validation de l'administration\n\n`;
    response += `📄 TYPES DE JUSTIFICATIFS ACCEPTÉS:\n`;
    response += `- Certificat médical\n`;
    response += `- Attestation médicale\n`;
    response += `- Document officiel justifiant l'absence\n\n`;
    response += `⏰ DÉLAIS:\n`;
    response += `- Justifiez dans les 7 jours suivant l'absence\n`;
    response += `- Les justifications tardives peuvent être refusées\n\n`;
    response += `💡 CONSEIL: Utilisez l'analyse IA de certificat pour vérifier la validité de votre document avant soumission.`;

    return response;
  }

  // Procédures administratives
  if (lowerQuestion.includes('attestation') || lowerQuestion.includes('certificat') ||
    lowerQuestion.includes('document') || lowerQuestion.includes('administratif') ||
    lowerQuestion.includes('procédure') || lowerQuestion.includes('demande')) {
    return `📋 PROCÉDURES ADMINISTRATIVES - Guide détaillé\n\n📄 DOCUMENTS DISPONIBLES:\n\n1. Attestation de scolarité\n   📝 Contient: Statut d'inscription, année académique\n   📄 Documents requis: Aucun\n   ⏱️ Délai: 3-5 jours ouvrables\n   📍 Où: Bureau de la scolarité\n\n2. Certificat d'inscription\n   📝 Contient: Confirmation d'inscription officielle\n   📄 Documents requis: Aucun\n   ⏱️ Délai: 3-5 jours ouvrables\n   📍 Où: Bureau de la scolarité\n\n3. Relevé de notes\n   📝 Contient: Notes de tous les modules\n   📄 Documents requis: Aucun\n   ⏱️ Délai: 5-7 jours ouvrables\n   📍 Où: Bureau de la scolarité\n\n📝 PROCÉDURE DE DEMANDE:\n1. Connectez-vous à votre espace étudiant\n2. Allez dans la section "Documents"\n3. Cliquez sur "Nouvelle demande"\n4. Sélectionnez le type de document\n5. Ajoutez un commentaire si nécessaire\n6. Soumettez la demande\n7. Suivez le statut dans "Mes demandes"\n\n⏱️ TRAITEMENT:\n- L'administration traite les demandes dans l'ordre de réception\n- Vous recevrez une notification quand le document est prêt\n- Téléchargez le document depuis votre espace\n\n💡 CONSEIL: Faites vos demandes à l'avance pour éviter les retards.`;
  }

  // Informations pédagogiques
  if (lowerQuestion.includes('filière') || lowerQuestion.includes('module') ||
    lowerQuestion.includes('coefficient') || lowerQuestion.includes('pédagogique') ||
    lowerQuestion.includes('pedagogique') || lowerQuestion.includes('cours')) {
    let response = `📚 INFORMATIONS PÉDAGOGIQUES - Organisation structurée\n\n🎓 FILIÈRES DISPONIBLES:\n\n1. Ingénierie des Systèmes Informatiques (ISI)\n   - Focus: Développement logiciel, réseaux, IA\n   - Débouchés: Développeur, ingénieur logiciel, administrateur système\n\n2. Électronique, Électrotechnique & Automatique (EEA)\n   - Focus: Électronique, automatisation, systèmes embarqués\n   - Débouchés: Ingénieur électronique, automaticien\n\n3. Génie Mécanique (GM)\n   - Focus: Conception, fabrication, maintenance\n   - Débouchés: Ingénieur mécanique, concepteur\n\n4. Génie Énergétique (GE)\n   - Focus: Énergies renouvelables, efficacité énergétique\n   - Débouchés: Ingénieur énergétique, consultant\n\n`;

    if (context && context.modules.length > 0) {
      response += `📖 VOS MODULES (${context.student.filiere} - ${context.student.level}):\n\n`;
      context.modules.forEach(m => {
        response += `• ${m.name}\n`;
        response += `  - Code: ${m.code}\n`;
        response += `  - Coefficient: ${m.coefficient}\n\n`;
      });
    } else {
      response += `📖 SYSTÈME DE MODULES:\n`;
      response += `- Chaque module a un coefficient qui détermine son poids dans la moyenne\n`;
      response += `- La moyenne générale = Σ(note × coefficient) / Σ(coefficient)\n`;
      response += `- Les modules à fort coefficient ont plus d'impact sur la moyenne\n\n`;
    }

    response += `📊 ÉVALUATIONS:\n`;
    response += `- Contrôles continus (CC)\n`;
    response += `- Examens de fin de semestre\n`;
    response += `- Projets et travaux pratiques\n\n`;
    response += `🎯 OBJECTIFS:\n`;
    response += `- Acquérir des compétences techniques solides\n`;
    response += `- Développer l'esprit d'analyse et de résolution de problèmes\n`;
    response += `- Préparer à l'insertion professionnelle\n\n`;
    response += `💡 Pour plus de détails sur un module spécifique, posez une question précise.`;

    return response;
  }

  // Réponse générale
  return `👋 Bonjour! Je suis l'assistant IA de l'ISSAT Kairouan - TPL ISSATKR HACK V 1.0 MATRIX : COMPUS REVOLUTION\n\n🎯 JE PEUX VOUS AIDER SUR:\n\n📋 Procédures administratives\n   - Clarification des démarches floues\n   - Documents administratifs\n   - Procédures détaillées étape par étape\n\n📚 Informations pédagogiques\n   - Centralisation des infos dispersées\n   - Modules, coefficients, filières\n   - Programmes et évaluations\n\n🚫 Absences & justifications\n   - Règles et seuils\n   - Procédures de justification\n   - Analyse de certificats\n\n🎉 Événements & Clubs\n   - TPL, Hackathons, activités\n   - Clubs étudiants\n\n💬 Assistance 24/7 intégrée\n   - Réponses rapides et précises\n   - Support continu\n\nPosez-moi une question spécifique pour obtenir des informations détaillées et structurées! 🚀`;
};

/**
 * Analyze PDF certificate and classify as legitimate or fraud
 */
async function analyzeCertificate(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(fileBuffer);
    const pdfText = pdfData.text.toLowerCase();

    if (!client) {
      // Basic keyword check if no OpenAI
      const hasMedicalContent = medicalKeywords.some(keyword => pdfText.includes(keyword));

      // Store in context if legitimate-ish (or always?)
      // We can't access userId here easily without passing it.
      // Modifying analyzeCertificate signature.
      return {
        isLegitimate: hasMedicalContent,
        confidence: hasMedicalContent ? 0.6 : 0.4,
        reason: hasMedicalContent ? 'Contenu médical détecté' : 'Contenu médical non détecté',
        text: pdfText
      };
    }

    // Use OpenAI to analyze the certificate
    const analysisPrompt = `Analyse ce certificat médical et détermine s'il est légitime ou frauduleux.

Critères de légitimité:
- Présence d'informations médicales cohérentes
- Nom du médecin ou établissement médical
- Date de délivrance
- Raison médicale valide
- Format professionnel

Critères de fraude:
- Informations incohérentes ou contradictoires
- Absence d'éléments médicaux crédibles
- Format suspect ou non professionnel
- Dates incohérentes

Contenu du document:
${pdfText.substring(0, 3000)} // Limit to first 3000 chars

Réponds UNIQUEMENT au format JSON:
{
  "isLegitimate": true/false,
  "confidence": 0.0-1.0,
  "reason": "explication courte",
  "redFlags": ["liste des éléments suspects si frauduleux"]
}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en analyse de documents médicaux. Analyse les certificats et détermine leur légitimité avec précision.',
        },
        { role: 'user', content: analysisPrompt },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const answer = response.choices[0]?.message?.content || '{}';

    try {
      // Try to parse JSON response
      const jsonMatch = answer.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Error parsing AI response:', e);
    }

    // Fallback: basic analysis
    const medicalKeywords = ['médical', 'médecin', 'docteur', 'hôpital', 'clinique'];
    const hasMedicalContent = medicalKeywords.some(keyword => pdfText.includes(keyword));
    return {
      isLegitimate: hasMedicalContent,
      confidence: hasMedicalContent ? 0.7 : 0.3,
      reason: hasMedicalContent ? 'Contenu médical détecté par analyse IA' : 'Contenu médical insuffisant',
      text: pdfText
    };
  } catch (error) {
    console.error('Error analyzing certificate:', error);
    return {
      isLegitimate: false,
      confidence: 0.0,
      reason: 'Erreur lors de l\'analyse du document',
    };
  }
}

/**
 * Main AI question handler with conversation history
 */
export const askAI = async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user.id;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Get database context
    const context = await getDatabaseContext(userId);

    // If OpenAI is not configured, use mock responses
    if (!client) {
      const mockAnswer = getMockResponse(question, context);
      return res.json({ answer: mockAnswer });
    }

    // Get conversation history
    let history = conversationHistory.get(userId) || [];

    // Detect language and intent (from ai-assistant model)
    const lang = detectLanguage(question);
    const intent = getIntent(question);

    // Build system prompt with real data (from ai-assistant model)
    const { system, instruction, contextInfo } = await buildSystemPrompt(userId, lang);

    // Prepare messages with history (using structured prompt from ai-assistant)
    // Only add instructions and context to the current question, not to history
    const userMessage = `${question}\n\n${instruction}${contextInfo}`;
    const messages = [
      { role: 'system', content: system },
      ...history.slice(-MAX_HISTORY_LENGTH), // Keep last N messages (these are plain Q&A)
      { role: 'user', content: userMessage }, // Current question with instructions
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.2, // Lower temperature for more consistent responses (from ai-assistant)
      max_tokens: 1000,
    });

    const answer = response.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';

    // Update conversation history (store only plain Q&A, not enriched messages)
    // This avoids duplicating instructions in history
    history.push(
      { role: 'user', content: question }, // Store original question only
      { role: 'assistant', content: answer }
    );
    // Keep only last MAX_HISTORY_LENGTH * 2 messages (user + assistant pairs)
    if (history.length > MAX_HISTORY_LENGTH * 2) {
      history = history.slice(-MAX_HISTORY_LENGTH * 2);
    }
    conversationHistory.set(userId, history);

    res.json({ answer });
  } catch (error) {
    console.error('AI error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      question: req.body?.question,
      hasClient: !!client,
    });

    // Fallback to mock response on error
    try {
      const context = await getDatabaseContext(req.user?.id);
      const mockAnswer = getMockResponse(req.body?.question || '', context);
      res.json({ answer: mockAnswer });
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      res.status(500).json({
        message: 'Erreur lors du traitement de votre question',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

/**
 * Upload and analyze certificate PDF
 */
export const analyzeCertificatePDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const userId = req.user.id;
    const filePath = req.file.path;

    // Get student profile
    const studentProfile = await StudentProfile.findOne({ user: userId });
    if (!studentProfile) {
      // Clean up file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Analyze certificate
    const analysis = await analyzeCertificate(filePath);

    if (analysis.isLegitimate && analysis.confidence >= 0.6) {
      // Certificate is legitimate - create justification and notify admin
      try {
        // Find the most recent unjustified absence
        const recentAbsence = await Absence.findOne({
          student: studentProfile._id,
          justified: false,
        }).sort({ date: -1 });

        if (recentAbsence) {
          // Create justification
          const justification = new Justification({
            student: studentProfile._id,
            absence: recentAbsence._id,
            reason: `Certificat médical analysé par IA - ${analysis.reason}`,
            document: `/uploads/certificates/${path.basename(filePath)}`,
            status: 'pending',
          });
          await justification.save();

          // Update absence
          recentAbsence.justified = true;
          await recentAbsence.save();

          // Notify admin
          const adminUsers = await User.find({ role: 'admin' });
          for (const admin of adminUsers) {
            await Notification.create({
              user: admin._id,
              type: 'info',
              title: 'Nouvelle justification de certificat médical',
              message: `${studentProfile.firstName} ${studentProfile.lastName} a soumis un certificat médical analysé comme légitime par l'IA.`,
              link: `/admin/justifications/${justification._id}`,
            });
          }

          // Store PDF context for chat
          if (analysis.text) {
            userPdfContext.set(userId, analysis.text);
          }

          res.json({
            success: true,
            isLegitimate: true,
            confidence: analysis.confidence,
            reason: analysis.reason,
            message: 'Certificat analysé comme légitime. La justification a été créée et envoyée à l\'administration.',
            justificationId: justification._id,
          });
        } else {
          // Store PDF context for chat even if no absence found
          if (analysis.text) {
            userPdfContext.set(userId, analysis.text);
          }

          res.json({
            success: true,
            isLegitimate: true,
            confidence: analysis.confidence,
            reason: analysis.reason,
            message: 'Certificat analysé comme légitime, mais aucune absence récente trouvée.',
            warning: 'Aucune absence récente à justifier',
          });
        }
      } catch (error) {
        console.error('Error creating justification:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la création de la justification',
        });
      }
    } else {
      // Certificate is suspicious or fraudulent
      // Clean up file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({
        success: false,
        isLegitimate: false,
        confidence: analysis.confidence,
        reason: analysis.reason,
        redFlags: analysis.redFlags || [],
        message: 'Le certificat a été analysé comme suspect ou frauduleux. Veuillez soumettre un document valide.',
      });
    }
  } catch (error) {
    console.error('Certificate analysis error:', error);
    res.status(500).json({ message: 'Error analyzing certificate' });
  }
};

/**
 * Clear conversation history
 */
export const clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    conversationHistory.delete(userId);
    res.json({ message: 'Conversation history cleared' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ message: 'Error clearing history' });
  }
};
