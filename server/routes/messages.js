import express from 'express';
import {
  getStudentMessages,
  getAllMessages,
  createMessage,
  markAsRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/student', getStudentMessages);
router.post('/:messageId/read', markAsRead);

// Admin routes
router.get('/all', requireRole('admin'), getAllMessages);
router.post('/', requireRole('admin'), createMessage);
router.delete('/:messageId', requireRole('admin'), deleteMessage);

export default router;

