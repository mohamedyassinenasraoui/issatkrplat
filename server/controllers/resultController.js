import Result from '../models/Result.js';
import StudentProfile from '../models/StudentProfile.js';
import Module from '../models/Module.js';

// Get student's results
export const getStudentResults = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { academicYear, semester } = req.query;

    let query = { student: student._id };
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;

    const results = await Result.find(query)
      .populate('module', 'name code coefficient')
      .sort({ examDate: -1 });

    res.json(results);
  } catch (error) {
    console.error('Get student results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student average
export const getStudentAverage = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { academicYear, semester } = req.query;

    let query = { student: student._id };
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = semester;

    const results = await Result.find(query).populate('module', 'coefficient');

    let totalPoints = 0;
    let totalCoefficients = 0;

    results.forEach((result) => {
      const points = result.score * result.module.coefficient;
      totalPoints += points;
      totalCoefficients += result.module.coefficient;
    });

    const average = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;

    res.json({
      average: parseFloat(average.toFixed(2)),
      totalCoefficients,
      totalResults: results.length,
    });
  } catch (error) {
    console.error('Get student average error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create result (admin)
export const createResult = async (req, res) => {
  try {
    // Get module to fetch coefficient if not provided
    let coefficient = req.body.coefficient;
    if (!coefficient && req.body.module) {
      const module = await Module.findById(req.body.module);
      if (module) {
        coefficient = module.coefficient || 1;
      }
    }

    const result = new Result({
      ...req.body,
      coefficient: coefficient || 1,
      recordedBy: req.user._id,
    });
    await result.save();
    
    const populatedResult = await Result.findById(result._id)
      .populate('student', 'firstName lastName studentId')
      .populate('module', 'name code coefficient');
    
    res.status(201).json(populatedResult);
  } catch (error) {
    console.error('Create result error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Result already exists for this exam' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all results (admin)
export const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('student', 'firstName lastName studentId')
      .populate('module', 'name code coefficient')
      .sort({ examDate: -1 });

    res.json(results);
  } catch (error) {
    console.error('Get all results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update result (admin)
export const updateResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const result = await Result.findByIdAndUpdate(
      resultId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Update result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete result (admin)
export const deleteResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const result = await Result.findByIdAndDelete(resultId);

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

