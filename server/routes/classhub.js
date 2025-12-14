import express from 'express';
import ClassHubMessage from '../models/ClassHub.js';
import StudentProfile from '../models/StudentProfile.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get ClassHub messages for student (based on their filière)
router.get('/student', async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const messages = await ClassHubMessage.find({
      filieres: student.filiere,
      $or: [
        { level: 'all' },
        { level: student.level },
      ],
    })
      .populate('teacher', 'firstName lastName')
      .populate('module', 'name code')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Get student ClassHub messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reply to message (student)
router.post('/:messageId/reply', async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { content } = req.body;

    const message = await ClassHubMessage.findByIdAndUpdate(
      req.params.messageId,
      {
        $push: {
          replies: {
            student: student._id,
            content,
          },
        },
      },
      { new: true }
    )
      .populate('teacher', 'firstName lastName')
      .populate('replies.student', 'firstName lastName');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

