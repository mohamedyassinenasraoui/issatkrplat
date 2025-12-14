import OpenAI from 'openai';

// Initialize OpenAI client only if API key is provided
let client = null;
if (process.env.OPENAI_API_KEY) {
  try {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    console.warn('⚠️ OpenAI API key not configured. AI features will use mock responses.');
  }
}

// Mock responses for common questions when OpenAI is not available
const getMockResponse = (question) => {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('absence') || lowerQuestion.includes('justif')) {
    return `Règles d'absence à l'ISSAT Kairouan:
    
✅ À partir de 3 absences non justifiées: Avertissement
⚠️ À partir de 4 absences non justifiées: Risque d'élimination

Pour justifier une absence:
1. Connectez-vous à votre espace étudiant
2. Allez dans "Absences"
3. Cliquez sur "Justifier" pour l'absence concernée
4. Téléchargez votre document justificatif (médical, etc.)
5. Attendez la validation de l'administration`;
  }
  
  if (lowerQuestion.includes('attestation') || lowerQuestion.includes('certificat') || lowerQuestion.includes('document')) {
    return `Demande de documents administratifs:

📄 Types de documents disponibles:
- Attestation de scolarité
- Certificat d'inscription
- Relevé de notes

Pour faire une demande:
1. Allez dans "Documents"
2. Cliquez sur "Nouvelle demande"
3. Sélectionnez le type de document
4. Ajoutez un commentaire si nécessaire
5. L'administration traitera votre demande`;
  }
  
  if (lowerQuestion.includes('filière') || lowerQuestion.includes('module') || lowerQuestion.includes('coefficient')) {
    return `Informations académiques:

📚 Filières disponibles:
- Informatique
- Génie Civil
- (Autres filières selon l'offre)

📖 Modules:
Chaque module a un coefficient qui détermine son poids dans le calcul de la moyenne.

Pour plus d'informations, consultez votre espace étudiant ou contactez le secrétariat.`;
  }
  
  return `Bonjour! Je suis l'assistant ISSAT Kairouan.

Je peux vous aider sur:
- Procédures administratives (attestations, certificats)
- Absences et justifications
- Filières, modules, coefficients
- Orientation et informations académiques

Posez-moi une question spécifique pour obtenir des informations détaillées.

Note: Pour une assistance complète avec l'IA, veuillez configurer OPENAI_API_KEY dans le fichier .env`;
};

export const askAI = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // If OpenAI is not configured, use mock responses
    if (!client) {
      const mockAnswer = getMockResponse(question);
      return res.json({ answer: mockAnswer });
    }

    const systemPrompt = `Tu es un assistant officiel de l'ISSAT Kairouan. Réponds de manière institutionnelle, claire et fiable. 
    Tu peux aider sur:
    - Procédures administratives (attestations, certificats, inscriptions)
    - Absences et justifications (règles: 3 absences = avertissement, 4 = élimination)
    - Filières, modules, coefficients
    - Orientation et informations académiques
    
    IMPORTANT: Ne révèle jamais d'informations sensibles sur les étudiants ou les administrateurs. 
    Reste professionnel et institutionnel.`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    const answer = response.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';

    res.json({ answer });
  } catch (error) {
    console.error('AI error:', error);
    // Fallback to mock response on error
    const mockAnswer = getMockResponse(req.body?.question || '');
    res.json({ answer: mockAnswer });
  }
};

