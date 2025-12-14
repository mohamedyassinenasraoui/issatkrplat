import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true,
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
    enum: ['S1', 'S2'],
  },
  examType: {
    type: String,
    enum: ['DS', 'Exam', 'Rattrapage'],
    default: 'Exam',
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 20,
  },
  coefficient: {
    type: Number,
    required: true,
    min: 0,
  },
  examDate: {
    type: Date,
    default: Date.now,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

resultSchema.index({ student: 1, module: 1, academicYear: 1, semester: 1, examType: 1 }, { unique: true });

export default mongoose.model('Result', resultSchema);

