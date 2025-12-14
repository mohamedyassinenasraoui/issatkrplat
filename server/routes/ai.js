import express from 'express';
import { askAI } from '../controllers/aiController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/ask', askAI);

export default router;

