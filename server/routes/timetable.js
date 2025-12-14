import express from 'express';
import Timetable from '../models/Timetable.js';
import StudentProfile from '../models/StudentProfile.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get timetable for the logged-in student
router.get('/student', async (req, res) => {
  try {
    // Get student profile
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { filiere, level, group } = studentProfile;

    // Find timetable entries that match the student's filiere, level, and either their group or no specific group
    const timetable = await Timetable.find({
      filiere: filiere,
      level: level,
      $or: [
        { group: group },
        { group: '' },
        { group: { $exists: false } },
        { group: null },
      ],
    })
      .populate('module', 'name code')
      .populate('teacher', 'firstName lastName')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json(timetable);
  } catch (error) {
    console.error('Get student timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

