import express from 'express';
import {
  getInfoNotes,
  createInfoNote,
  updateInfoNote,
  deleteInfoNote,
  incrementViews,
} from '../controllers/infoNoteController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getInfoNotes);
router.post('/', requireRole('admin'), createInfoNote);
router.put('/:noteId', requireRole('admin'), updateInfoNote);
router.delete('/:noteId', requireRole('admin'), deleteInfoNote);
router.post('/:noteId/views', incrementViews);

export default router;

