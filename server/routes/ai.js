import express from 'express';
import { askAI, healthCheck, validateCertificatePDF } from '../controllers/externalAIController.js';
import { analyzeCertificatePDF, clearHistory } from '../controllers/aiController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { certificateUpload } from '../utils/pdfUpload.js';

const router = express.Router();

// Health check (no auth required)
router.get('/health', healthCheck);

// AI routes (auth required)
router.use(authMiddleware);
router.post('/ask', askAI); // Uses AI from ai-assistant/issat-assistant folder
router.post('/validate-certificate', certificateUpload.single('certificate'), validateCertificatePDF); // New endpoint for certificate validation
router.post('/analyze-certificate', certificateUpload.single('certificate'), analyzeCertificatePDF); // Keep old endpoint for compatibility
router.delete('/history', clearHistory);

export default router;

