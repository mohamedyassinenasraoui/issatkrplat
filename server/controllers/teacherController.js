import User from '../models/User.js';
import TeacherProfile from '../models/TeacherProfile.js';
import Timetable from '../models/Timetable.js';
import ClassHubMessage from '../models/ClassHub.js';
import TeacherAbsence from '../models/TeacherAbsence.js';
import StudentProfile from '../models/StudentProfile.js';
import Module from '../models/Module.js';

// Get teacher profile
export const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findOne({ user: req.user._id })
      .populate('modules', 'name code filiere level')
      .populate('user', 'email');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Get teacher profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get teacher's timetable
export const getTeacherTimetable = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const timetable = await Timetable.find({ teacher: teacher._id })
      .populate('module', 'name code')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json(timetable);
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============ ClassHub Functions ============

// Get ClassHub messages for teacher's filières
export const getClassHubMessages = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const messages = await ClassHubMessage.find({ teacher: teacher._id })
      .populate('module', 'name code')
      .populate('replies.student', 'firstName lastName')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Get ClassHub messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create ClassHub message
export const createClassHubMessage = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const { title, content, type, filieres, level, module, isPinned } = req.body;

    const message = new ClassHubMessage({
      teacher: teacher._id,
      title,
      content,
      type: type || 'announcement',
      filieres: filieres || teacher.filieres,
      level: level || 'all',
      module,
      isPinned: isPinned || false,
    });

    await message.save();

    const populatedMessage = await ClassHubMessage.findById(message._id)
      .populate('module', 'name code')
      .populate('teacher', 'firstName lastName');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Create ClassHub message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete ClassHub message
export const deleteClassHubMessage = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const message = await ClassHubMessage.findOneAndDelete({
      _id: req.params.messageId,
      teacher: teacher._id,
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete ClassHub message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get students in teacher's filières (for ClassHub)
export const getClassHubStudents = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const students = await StudentProfile.find({
      filiere: { $in: teacher.filieres },
    }).select('firstName lastName filiere level group studentId');

    res.json(students);
  } catch (error) {
    console.error('Get ClassHub students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============ Teacher Absence Functions ============

// Get teacher's absence requests
export const getTeacherAbsences = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const absences = await TeacherAbsence.find({ teacher: teacher._id })
      .populate('affectedModules', 'name code')
      .sort({ createdAt: -1 });

    res.json(absences);
  } catch (error) {
    console.error('Get teacher absences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create absence notification to admin
export const createTeacherAbsence = async (req, res) => {
  try {
    const teacher = await TeacherProfile.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const { date, startTime, endTime, reason, description, affectedModules, affectedFilieres, notifyStudents } = req.body;

    const absence = new TeacherAbsence({
      teacher: teacher._id,
      date,
      startTime,
      endTime,
      reason,
      description,
      affectedModules: affectedModules || [],
      affectedFilieres: affectedFilieres || teacher.filieres,
      notifyStudents: notifyStudents !== false,
    });

    await absence.save();

    // If notifyStudents is true, create a ClassHub message
    if (absence.notifyStudents) {
      const classHubMessage = new ClassHubMessage({
        teacher: teacher._id,
        filieres: absence.affectedFilieres,
        title: `Absence du professeur - ${new Date(date).toLocaleDateString('fr-FR')}`,
        content: `Le professeur ${teacher.firstName} ${teacher.lastName} sera absent le ${new Date(date).toLocaleDateString('fr-FR')}${startTime ? ` de ${startTime}` : ''}${endTime ? ` à ${endTime}` : ''}.\n\nRaison: ${reason}${description ? `\n\n${description}` : ''}`,
        type: 'announcement',
        isPinned: true,
      });
      await classHubMessage.save();
    }

    res.status(201).json(absence);
  } catch (error) {
    console.error('Create teacher absence error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============ Admin Functions for Teachers ============

// Get all teachers (admin)
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await TeacherProfile.find()
      .populate('user', 'email')
      .populate('modules', 'name code')
      .sort({ createdAt: -1 });

    res.json(teachers);
  } catch (error) {
    console.error('Get all teachers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create teacher (admin)
export const createTeacher = async (req, res) => {
  try {
    const { email, password, firstName, lastName, teacherId, department, specialization, filieres, modules, phone, office } = req.body;

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      role: 'teacher',
    });
    await user.save();

    // Handle picture upload
    let picture = null;
    if (req.file) {
      picture = `/uploads/${req.file.filename}`;
    }

    // Create teacher profile
    const profile = new TeacherProfile({
      user: user._id,
      firstName,
      lastName,
      teacherId,
      department,
      specialization,
      filieres: filieres || [],
      modules: modules || [],
      phone,
      office,
      picture,
    });
    await profile.save();

    res.status(201).json({ user, profile });
  } catch (error) {
    console.error('Create teacher error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email or teacher ID already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Update teacher (admin)
export const updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const updates = { ...req.body };

    // Handle picture upload
    if (req.file) {
      updates.picture = `/uploads/${req.file.filename}`;
    }

    const teacher = await TeacherProfile.findByIdAndUpdate(
      teacherId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', 'email').populate('modules', 'name code');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json(teacher);
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete teacher (admin)
export const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const teacher = await TeacherProfile.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Delete user
    await User.findByIdAndDelete(teacher.user);
    // Delete profile
    await TeacherProfile.findByIdAndDelete(teacherId);
    // Delete timetable entries
    await Timetable.deleteMany({ teacher: teacherId });

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all teacher absences (admin)
export const getAllTeacherAbsences = async (req, res) => {
  try {
    const absences = await TeacherAbsence.find()
      .populate({
        path: 'teacher',
        select: 'firstName lastName',
      })
      .populate('affectedModules', 'name code')
      .sort({ createdAt: -1 });

    res.json(absences);
  } catch (error) {
    console.error('Get all teacher absences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Respond to teacher absence (admin)
export const respondToTeacherAbsence = async (req, res) => {
  try {
    const { absenceId } = req.params;
    const { status, adminResponse } = req.body;

    const absence = await TeacherAbsence.findByIdAndUpdate(
      absenceId,
      {
        status,
        adminResponse,
        respondedBy: req.user._id,
        respondedAt: new Date(),
      },
      { new: true }
    ).populate('teacher', 'firstName lastName');

    if (!absence) {
      return res.status(404).json({ message: 'Absence not found' });
    }

    res.json(absence);
  } catch (error) {
    console.error('Respond to teacher absence error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============ Timetable Management (Admin) ============

// Create timetable entry (admin)
export const createTimetableEntry = async (req, res) => {
  try {
    const entry = new Timetable(req.body);
    await entry.save();

    const populated = await Timetable.findById(entry._id)
      .populate('teacher', 'firstName lastName')
      .populate('module', 'name code');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create timetable entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all timetable entries (admin)
export const getAllTimetable = async (req, res) => {
  try {
    const entries = await Timetable.find()
      .populate('teacher', 'firstName lastName')
      .populate('module', 'name code')
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json(entries);
  } catch (error) {
    console.error('Get all timetable error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete timetable entry (admin)
export const deleteTimetableEntry = async (req, res) => {
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.entryId);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Delete timetable entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

