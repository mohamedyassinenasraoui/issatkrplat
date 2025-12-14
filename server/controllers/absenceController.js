import Absence from '../models/Absence.js';
import Justification from '../models/Justification.js';
import StudentProfile from '../models/StudentProfile.js';
import Notification from '../models/Notification.js';

// Get absences for a student
export const getStudentAbsences = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const absences = await Absence.find({ student: student._id })
      .populate('module', 'name code')
      .sort({ date: -1 });

    res.json(absences);
  } catch (error) {
    console.error('Get student absences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Record absence (admin only)
export const recordAbsence = async (req, res) => {
  try {
    const { studentId, moduleId, date } = req.body;

    const absence = new Absence({
      student: studentId,
      module: moduleId,
      date: new Date(date),
      recordedBy: req.user._id,
    });
    await absence.save();

    // Check absence count and create notifications
    const student = await StudentProfile.findById(studentId);
    const unjustifiedCount = await Absence.countDocuments({
      student: studentId,
      justified: false,
    });

    if (unjustifiedCount === 3) {
      await Notification.create({
        user: student.user,
        title: 'Avertissement d\'absence',
        message: 'Vous avez atteint 3 absences non justifiées. Attention!',
        type: 'warning',
      });
    } else if (unjustifiedCount >= 4) {
      await Notification.create({
        user: student.user,
        title: 'Risque d\'élimination',
        message: 'Vous avez atteint 4 absences non justifiées. Risque d\'élimination!',
        type: 'error',
      });
    }

    res.status(201).json(absence);
  } catch (error) {
    console.error('Record absence error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Absence already recorded for this date' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit justification
export const submitJustification = async (req, res) => {
  try {
    const { absenceId, reason, document } = req.body;

    const absence = await Absence.findById(absenceId);
    if (!absence) {
      return res.status(404).json({ message: 'Absence not found' });
    }

    const student = await StudentProfile.findOne({ user: req.user._id });
    if (absence.student.toString() !== student._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const justification = new Justification({
      student: student._id,
      absence: absenceId,
      reason,
      document: req.file ? `/uploads/${req.file.filename}` : document,
    });
    await justification.save();

    res.status(201).json(justification);
  } catch (error) {
    console.error('Submit justification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all justifications (admin)
export const getJustifications = async (req, res) => {
  try {
    const justifications = await Justification.find()
      .populate('student', 'firstName lastName studentId')
      .populate('absence', 'date module')
      .populate('absence.module', 'name code')
      .sort({ createdAt: -1 });

    res.json(justifications);
  } catch (error) {
    console.error('Get justifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Review justification (admin)
export const reviewJustification = async (req, res) => {
  try {
    const { justificationId } = req.params;
    const { status, reviewComment } = req.body;

    const justification = await Justification.findById(justificationId);
    if (!justification) {
      return res.status(404).json({ message: 'Justification not found' });
    }

    justification.status = status;
    justification.reviewedBy = req.user._id;
    justification.reviewComment = reviewComment;

    if (status === 'accepted') {
      const absence = await Absence.findById(justification.absence);
      absence.justified = true;
      await absence.save();

      const student = await StudentProfile.findById(justification.student);
      await Notification.create({
        user: student.user,
        title: 'Justification acceptée',
        message: 'Votre justification d\'absence a été acceptée.',
        type: 'success',
      });
    } else if (status === 'rejected') {
      const student = await StudentProfile.findById(justification.student);
      await Notification.create({
        user: student.user,
        title: 'Justification refusée',
        message: 'Votre justification d\'absence a été refusée.',
        type: 'error',
      });
    }

    await justification.save();
    res.json(justification);
  } catch (error) {
    console.error('Review justification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

