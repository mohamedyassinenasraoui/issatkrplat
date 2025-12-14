import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Module from '../models/Module.js';
import Absence from '../models/Absence.js';
import DocumentRequest from '../models/DocumentRequest.js';
import Notification from '../models/Notification.js';

// Get all students
export const getStudents = async (req, res) => {
  try {
    const students = await StudentProfile.find()
      .populate('user', 'email')
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single student
export const getStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await StudentProfile.findById(studentId).populate('user', 'email');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Allow student to view their own profile
    const studentUserId = student.user._id ? student.user._id.toString() : student.user.toString();
    if (req.user.role === 'student' && studentUserId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You can only view your own profile' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create student
export const createStudent = async (req, res) => {
  try {
    const { email, password, firstName, lastName, studentId, filiere, level, group, username, adminPassword } = req.body;

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      role: 'student',
    });
    await user.save();

    // Create student profile
    const profile = new StudentProfile({
      user: user._id,
      firstName,
      lastName,
      studentId,
      filiere,
      level,
      group,
      username,
      adminPassword,
    });
    await profile.save();

    res.status(201).json({ user, profile });
  } catch (error) {
    console.error('Create student error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email or student ID already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const updates = req.body;

    const student = await StudentProfile.findByIdAndUpdate(
      studentId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', 'email');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await StudentProfile.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await User.findByIdAndDelete(student.user);
    await StudentProfile.findByIdAndDelete(studentId);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all modules
export const getModules = async (req, res) => {
  try {
    const modules = await Module.find().sort({ name: 1 });
    res.json(modules);
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create module
export const createModule = async (req, res) => {
  try {
    const module = new Module(req.body);
    await module.save();
    res.status(201).json(module);
  } catch (error) {
    console.error('Create module error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Module code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update module
export const updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findByIdAndUpdate(
      moduleId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json(module);
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete module
export const deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findByIdAndDelete(moduleId);

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const totalModules = await Module.countDocuments();
    const pendingDocuments = await DocumentRequest.countDocuments({ status: 'pending' });
    const totalAbsences = await Absence.countDocuments();
    const unjustifiedAbsences = await Absence.countDocuments({ justified: false });

    // Students at risk (3+ unjustified absences)
    const studentsAtRisk = await Absence.aggregate([
      { $match: { justified: false } },
      { $group: { _id: '$student', count: { $sum: 1 } } },
      { $match: { count: { $gte: 3 } } },
      { $count: 'total' },
    ]);

    res.json({
      totalStudents,
      totalModules,
      pendingDocuments,
      totalAbsences,
      unjustifiedAbsences,
      studentsAtRisk: studentsAtRisk[0]?.total || 0,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

