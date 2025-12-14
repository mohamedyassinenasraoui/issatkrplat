import express from 'express';
import {
  getStudentResults,
  getStudentAverage,
  createResult,
  getAllResults,
  updateResult,
  deleteResult,
} from '../controllers/resultController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';

const router = express.Router();

router.use(authMiddleware);

// Student routes
router.get('/student', getStudentResults);
router.get('/student/average', getStudentAverage);

// Admin routes
router.get('/all', requireRole('admin'), getAllResults);
router.post('/', requireRole('admin'), createResult);
router.put('/:resultId', requireRole('admin'), updateResult);
router.delete('/:resultId', requireRole('admin'), deleteResult);

export default router;

