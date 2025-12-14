import express from 'express';
import {
  getStudentSuggestions,
  createSuggestion,
  getAllSuggestions,
  reviewSuggestion,
} from '../controllers/suggestionController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';

const router = express.Router();

router.use(authMiddleware);

// Student routes
router.get('/student', getStudentSuggestions);
router.post('/', createSuggestion);

// Admin routes
router.get('/all', requireRole('admin'), getAllSuggestions);
router.put('/:suggestionId/review', requireRole('admin'), reviewSuggestion);

export default router;

