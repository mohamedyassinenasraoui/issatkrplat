import express from 'express';
import {
  getStudentAbsences,
  recordAbsence,
  submitJustification,
  getJustifications,
  reviewJustification,
} from '../controllers/absenceController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

router.use(authMiddleware);

// Student routes
router.get('/student', getStudentAbsences);
router.post('/justify', upload.single('document'), submitJustification);

// Admin routes
router.post('/record', requireRole('admin'), recordAbsence);
router.get('/justifications', requireRole('admin'), getJustifications);
router.put('/justifications/:justificationId/review', requireRole('admin'), reviewJustification);

export default router;

