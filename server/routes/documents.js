import express from 'express';
import {
  getStudentDocuments,
  createDocumentRequest,
  getAllDocuments,
  processDocumentRequest,
} from '../controllers/documentController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

router.use(authMiddleware);

// Student routes
router.get('/student', getStudentDocuments);
router.post('/request', createDocumentRequest);

// Admin routes
router.get('/all', requireRole('admin'), getAllDocuments);
router.put('/:documentId/process', requireRole('admin'), upload.single('document'), processDocumentRequest);

export default router;

