import Suggestion from '../models/Suggestion.js';
import StudentProfile from '../models/StudentProfile.js';

// Get student's suggestions
export const getStudentSuggestions = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const suggestions = await Suggestion.find({ student: student._id })
      .populate('reviewedBy', 'email')
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (error) {
    console.error('Get student suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create suggestion
export const createSuggestion = async (req, res) => {
  try {
    const { title, content, isAnonymous } = req.body;

    const student = await StudentProfile.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const suggestion = new Suggestion({
      student: isAnonymous ? null : student._id,
      isAnonymous: isAnonymous || false,
      title,
      content,
    });
    await suggestion.save();

    res.status(201).json(suggestion);
  } catch (error) {
    console.error('Create suggestion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all suggestions (admin)
export const getAllSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find()
      .populate('student', 'firstName lastName studentId')
      .populate('reviewedBy', 'email')
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (error) {
    console.error('Get all suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Review suggestion (admin)
export const reviewSuggestion = async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const { status, adminResponse } = req.body;

    const suggestion = await Suggestion.findByIdAndUpdate(
      suggestionId,
      {
        $set: {
          status,
          adminResponse,
          reviewedBy: req.user._id,
        },
      },
      { new: true, runValidators: true }
    );

    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    res.json(suggestion);
  } catch (error) {
    console.error('Review suggestion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

