import OpenAI from 'openai';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import StudentProfile from '../models/StudentProfile.js';
import Absence from '../models/Absence.js';
import Justification from '../models/Justification.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OFFICIAL_BASE = 'https://issatkr.rnu.tn/';

// Initialize OpenAI client (from ai-assistant/issat-assistant)
let client = null;

function initializeClient() {
  if (client) return client; // Already initialized
  
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.warn('⚠️ OPENAI_API_KEY not found in environment variables.');
    console.warn('   Available env vars:', Object.keys(process.env).filter(k => k.includes('OPENAI')).join(', ') || 'none');
    return null;
  }

  try {
    client = new OpenAI({
      apiKey: apiKey,
    });
    console.log('✅ External AI client initialized successfully (from ai-assistant/issat-assistant)');
    console.log('   API Key length:', apiKey.length, 'characters');
    return client;
  } catch (error) {
    console.error('⚠️ External AI client initialization error:', error.message);
    return null;
  }
}

// Try to initialize on module load
initializeClient();

/**
 * Detect language from text (from ai-assistant/issat-assistant/src/Assistant.jsx)
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
 * Get intent from question (from ai-assistant/issat-assistant/src/Assistant.jsx)
 */
function getIntent(q) {
  const t = (q || '').toLowerCase();
  if (t.includes('absence') || t.includes('absences') || t.includes('justif') || t.includes('élim') || t.includes('elim'))
    return 'absence';
  if (
    t.includes('vérifier') || t.includes('verifier') || t.includes('valider') ||
    t.includes('validate') || t.includes('check') || t.includes('fraud') ||
    t.includes('fraude') || t.includes('legitime') || t.includes('legitimate') ||
    (t.includes('certificat') && (t.includes('pdf') || t.includes('fichier') || t.includes('file')))
  )
    return 'certificate_validation';
  if (
    t.includes('attestation') || t.includes('certificat') || t.includes('inscription') ||
    t.includes('réclamation') || t.includes('reclamation') || t.includes('document') ||
    t.includes('administratif')
  )
    return 'docs';
  if (t.includes('fili') || t.includes('module') || t.includes('coefficient') || t.includes('validation') || t.includes('orientation'))
    return 'pedagogy';
  return 'general';
}

/**
 * Parse absence count from text (from ai-assistant/issat-assistant/src/Assistant.jsx)
 */
function parseAbsenceCount(text) {
  const t = (text || '').toLowerCase();
  const patterns = [
    /(\d+)\s*(absence|absences)/,
    /(absence|absences)\s*[:=]?\s*(\d+)/,
    /(j'ai|jai|i have)\s*(\d+)\s*(absence|absences)?/,
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (!m) continue;
    const n = m.find((x) => /^\d+$/.test(x));
    if (n) return Number(n);
  }
  if (/^\d+$/.test(t.trim())) return Number(t.trim());
  return null;
}

const ABSENCE_WARNING_AT = 3;
const ABSENCE_ELIMINATION_AT = 4;

/**
 * Build absence risk message (from ai-assistant/issat-assistant/src/Assistant.jsx)
 */
function buildAbsenceRiskMessage(lang, count) {
  const fr = lang === 'fr';
  let statusEmoji = '🟢';
  let statusTextFR = 'OK';
  let statusTextEN = 'OK';

  if (count >= ABSENCE_ELIMINATION_AT) {
    statusEmoji = '🔴';
    statusTextFR = 'Risque élevé (élimination)';
    statusTextEN = 'High risk (elimination)';
  } else if (count >= ABSENCE_WARNING_AT) {
    statusEmoji = '🟡';
    statusTextFR = 'Attention (warning)';
    statusTextEN = 'Warning';
  }

  const msgFR = [
    `🧭 Risque d'absence (demo)`,
    `${statusEmoji} Statut: ${statusTextFR}`,
    `• Absences: ${count}`,
    `• Warning: ${ABSENCE_WARNING_AT}`,
    `• Élimination: ${ABSENCE_ELIMINATION_AT}`,
    `➡️ Clique sur "Déposer une justification" si tu as un justificatif.`,
  ].join('\n');

  const msgEN = [
    `🧭 Absence risk (demo)`,
    `${statusEmoji} Status: ${statusTextEN}`,
    `• Absences: ${count}`,
    `• Warning: ${ABSENCE_WARNING_AT}`,
    `• Elimination: ${ABSENCE_ELIMINATION_AT}`,
    `➡️ Click "Submit justification" if you have proof.`,
  ].join('\n');

  return fr ? msgFR : msgEN;
}

/**
 * Ask AI using exact logic from ai-assistant/issat-assistant/src/Assistant.jsx
 */
async function askExternalAI(question) {
  // Ensure client is initialized
  if (!client) {
    const initialized = initializeClient();
    if (!initialized) {
      throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY in .env');
    }
  }

  const lang = detectLanguage(question);

  const system = lang === 'fr'
    ? 'Tu es un assistant officiel de l\'ISSAT Kairouan. Réponds de manière institutionnelle, claire et fiable.'
    : 'You are the official assistant of ISSAT Kairouan. Respond clearly, reliably, and in an institutional tone.';

  const instruction = lang === 'fr'
    ? [
        'Structure EXACTE:',
        '✅ Réponse courte (1–2 lignes)',
        '📋 Étapes (bullet points)',
        '📄 Documents requis (ou \'Aucun\')',
        '⏱️ Délais (ou \'Non précisé\')',
        '⚠️ Remarques / Règles',
        `📌 Sources: ${OFFICIAL_BASE}`,
        '',
        'Règles:',
        '- N\'invente rien.',
        '- Si l\'information n\'est pas connue, écris \'Non précisé\'.',
      ].join('\n')
    : [
        'EXACT structure:',
        '✅ Short answer (1–2 lines)',
        '📋 Steps (bullet points)',
        '📄 Required documents (or \'None\')',
        '⏱️ Deadlines (or \'Not specified\')',
        '⚠️ Notes / Rules',
        `📌 Sources: ${OFFICIAL_BASE}`,
        '',
        'Rules:',
        '- Do not invent information.',
        '- If unknown, say \'Not specified\'.',
      ].join('\n');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: `Question: ${question}\n\n${instruction}` },
    ],
    temperature: 0.2,
  });

  return response.choices[0]?.message?.content ?? 'No response.';
}

/**
 * Main AI question handler using external AI logic from ai-assistant/issat-assistant
 * Handles special intents like absence risk and certificate validation
 */
export const askAI = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Try to initialize client if not already done
    if (!client) {
      const initialized = initializeClient();
      if (!initialized) {
        console.error('❌ OpenAI client not available. Check OPENAI_API_KEY in .env file.');
        return res.status(503).json({
          message: 'AI service unavailable. OPENAI_API_KEY not configured.',
          answer: 'Le service IA n\'est pas disponible. Veuillez vérifier la configuration OPENAI_API_KEY dans le fichier .env du serveur.',
          error: process.env.NODE_ENV === 'development' ? 'OPENAI_API_KEY not found or invalid' : undefined
        });
      }
    }

    const lang = detectLanguage(question);
    const intent = getIntent(question);

    // Handle certificate validation intent
    if (intent === 'certificate_validation') {
      return res.json({
        answer: lang === 'fr'
          ? '📄 Téléchargez votre certificat PDF ci-dessous pour vérifier sa légitimité. Le système analysera automatiquement les éléments essentiels et détectera d\'éventuelles fraudes.'
          : '📄 Upload your PDF certificate below to verify its legitimacy. The system will automatically analyze essential elements and detect potential fraud.',
        intent: 'certificate_validation',
        requiresPDF: true
      });
    }

    // Handle absence risk intent
    if (intent === 'absence') {
      const count = parseAbsenceCount(question);
      if (count === null) {
        return res.json({
          answer: lang === 'fr' ? '🧭 Combien d\'absences as-tu ? (ex: 2)' : '🧭 How many absences do you have? (e.g., 2)',
          intent: 'absence'
        });
      } else {
        return res.json({
          answer: buildAbsenceRiskMessage(lang, count),
          intent: 'absence',
          absenceCount: count
        });
      }
    }

    // Regular AI question
    const answer = await askExternalAI(question);
    res.json({ answer, intent });
  } catch (error) {
    console.error('External AI error:', error);
    res.status(500).json({
      message: 'Erreur lors du traitement de votre question',
      answer: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validate certificate PDF (from ai-assistant/issat-assistant/src/PDFReader.jsx logic)
 */
function validateCertificate(pdfText, fileName) {
  const text = pdfText.toLowerCase();
  const issues = [];
  const positives = [];

  // Check for required certificate elements
  const requiredElements = [
    { key: 'institution', patterns: ['issat', 'institut', 'kairouan', 'établissement', 'établissement supérieur'] },
    { key: 'certificate_type', patterns: ['certificat', 'attestation', 'diplôme', 'relevé'] },
    { key: 'student_info', patterns: ['étudiant', 'student', 'nom', 'prénom', 'matricule', 'cne'] },
    { key: 'date', patterns: ['date', 'délivré', 'délivré le', 'le'] },
    { key: 'signature', patterns: ['signature', 'signé', 'directeur', 'responsable'] },
  ];

  // Check for presence of required elements
  requiredElements.forEach((element) => {
    const found = element.patterns.some((pattern) => text.includes(pattern));
    if (found) {
      positives.push(`✓ ${element.key} found`);
    } else {
      issues.push(`⚠ Missing: ${element.key}`);
    }
  });

  // Check for suspicious patterns (potential fraud indicators)
  const fraudIndicators = [
    { pattern: /date.*\d{4}.*date/i, issue: 'Duplicate date fields (suspicious)' },
    { pattern: /signature.*signature/i, issue: 'Multiple signature mentions (suspicious)' },
    { pattern: /copie|copy|scan|scanné/i, issue: 'Contains \'copy\' or \'scan\' text (may be a copy)' },
    { pattern: /modifié|modified|edité/i, issue: 'Contains modification indicators' },
  ];

  fraudIndicators.forEach((indicator) => {
    if (indicator.pattern.test(pdfText)) {
      issues.push(`🔴 ${indicator.issue}`);
    }
  });

  // Check for formatting inconsistencies
  const datePattern = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/g;
  const dates = pdfText.match(datePattern);
  if (dates && dates.length > 0) {
    const uniqueDates = new Set(dates);
    if (uniqueDates.size > 3) {
      issues.push('⚠ Multiple inconsistent dates found');
    } else {
      positives.push(`✓ Found ${dates.length} date(s)`);
    }
  } else {
    issues.push('⚠ No clear date format found');
  }

  // Check for official seals/stamps
  const sealPatterns = ['sceau', 'seal', 'cachet', 'stamp', 'tampon'];
  const hasSeal = sealPatterns.some((pattern) => text.includes(pattern));
  if (hasSeal) {
    positives.push('✓ Seal/stamp mentioned');
  } else {
    issues.push('⚠ No seal/stamp mentioned (may be missing)');
  }

  // Check text quality (too short might be incomplete)
  if (pdfText.length < 200) {
    issues.push('⚠ Certificate text seems too short (may be incomplete)');
  }

  // Check for student ID patterns
  const idPatterns = [/\b\d{6,10}\b/, /\b[a-z]{2,3}\d{4,6}\b/i];
  const hasId = idPatterns.some((pattern) => pattern.test(pdfText));
  if (hasId) {
    positives.push('✓ Student ID pattern found');
  }

  // Determine overall status
  const fraudScore = issues.filter((i) => i.includes('🔴')).length;
  const warningCount = issues.filter((i) => i.includes('⚠')).length;
  const positiveCount = positives.length;

  let status = 'legitimate';
  let confidence = 'high';

  if (fraudScore >= 2) {
    status = 'fraudulent';
    confidence = 'high';
  } else if (fraudScore >= 1 || warningCount >= 4) {
    status = 'suspicious';
    confidence = 'medium';
  } else if (warningCount >= 2) {
    status = 'needs_review';
    confidence = 'medium';
  } else if (positiveCount < 3) {
    status = 'incomplete';
    confidence = 'low';
  }

  return {
    status,
    confidence,
    issues,
    positives,
    textLength: pdfText.length,
    fileName,
  };
}

/**
 * Validate certificate PDF endpoint (from ai-assistant/issat-assistant/src/PDFReader.jsx)
 * If legitimate, automatically sends to admin and creates justification
 */
export const validateCertificatePDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const userId = req.user.id;
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Get student profile
    const studentProfile = await StudentProfile.findOne({ user: userId });
    if (!studentProfile) {
      // Clean up file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Read and parse PDF
    const fileBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(fileBuffer);
    const pdfText = pdfData.text;

    // Validate certificate
    const validation = validateCertificate(pdfText, fileName);

    // If certificate is legitimate, send to admin and create justification
    if (validation.status === 'legitimate' || (validation.status === 'needs_review' && validation.confidence === 'medium')) {
      try {
        // Create certificates directory if it doesn't exist
        const certificatesDir = path.join(__dirname, '../uploads/certificates');
        if (!fs.existsSync(certificatesDir)) {
          fs.mkdirSync(certificatesDir, { recursive: true });
        }

        // Move file to certificates directory
        const timestamp = Date.now();
        const newFileName = `${timestamp}-${fileName}`;
        const newFilePath = path.join(certificatesDir, newFileName);
        fs.copyFileSync(filePath, newFilePath);
        
        // Delete original file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

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
            reason: `Certificat médical validé automatiquement - Statut: ${validation.status}, Confiance: ${validation.confidence}`,
            document: `/uploads/certificates/${newFileName}`,
            status: 'pending',
          });
          await justification.save();

          // Update absence
          recentAbsence.justified = true;
          await recentAbsence.save();

          // Notify all admins
          const adminUsers = await User.find({ role: 'admin' });
          for (const admin of adminUsers) {
            await Notification.create({
              user: admin._id,
              type: 'info',
              title: 'Nouveau certificat médical validé',
              message: `${studentProfile.firstName} ${studentProfile.lastName} a soumis un certificat médical validé comme légitime par le système. Le certificat nécessite votre révision.`,
              link: `/admin/justifications/${justification._id}`,
            });
          }

          res.json({
            success: true,
            validation,
            message: 'Certificat validé comme légitime. La justification a été créée et envoyée à l\'administration pour révision.',
            justificationId: justification._id,
            sentToAdmin: true,
          });
        } else {
          // No recent absence found, but still notify admin about the certificate
          const adminUsers = await User.find({ role: 'admin' });
          for (const admin of adminUsers) {
            await Notification.create({
              user: admin._id,
              type: 'info',
              title: 'Nouveau certificat médical soumis',
              message: `${studentProfile.firstName} ${studentProfile.lastName} a soumis un certificat médical validé comme légitime, mais aucune absence récente n'a été trouvée.`,
              link: `/admin/documents`,
            });
          }

          res.json({
            success: true,
            validation,
            message: 'Certificat validé comme légitime. L\'administration a été notifiée. Aucune absence récente trouvée.',
            sentToAdmin: true,
            warning: 'Aucune absence récente à justifier',
          });
        }
      } catch (error) {
        console.error('Error processing legitimate certificate:', error);
        // Clean up file on error
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        res.status(500).json({
          success: false,
          validation,
          message: 'Erreur lors du traitement du certificat légitime',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    } else {
      // Certificate is suspicious or fraudulent - clean up and return validation result
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({
        success: false,
        validation,
        message: validation.status === 'fraudulent' 
          ? 'Certificat détecté comme frauduleux. Veuillez soumettre un document valide.'
          : 'Certificat suspect. Veuillez soumettre un document valide ou contacter l\'administration.',
        sentToAdmin: false,
      });
    }
  } catch (error) {
    console.error('Certificate validation error:', error);
    res.status(500).json({
      message: 'Error validating certificate',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Health check for external AI
 */
export const healthCheck = async (req, res) => {
  // Try to initialize if not already done
  if (!client) {
    initializeClient();
  }

  const hasApiKey = !!process.env.OPENAI_API_KEY?.trim();
  const apiKeyLength = process.env.OPENAI_API_KEY?.trim()?.length || 0;

  res.json({
    status: client ? 'ok' : 'error',
    aiAvailable: !!client,
    hasApiKey: hasApiKey,
    apiKeyLength: hasApiKey ? apiKeyLength : 0,
    source: 'AI from ai-assistant/issat-assistant folder',
    model: 'gpt-4o-mini',
    temperature: 0.2,
    features: ['askAI', 'validateCertificatePDF', 'absenceRisk', 'intentDetection'],
    message: client 
      ? 'AI service is ready' 
      : hasApiKey 
        ? 'API key found but client initialization failed' 
        : 'OPENAI_API_KEY not found in environment variables'
  });
};

