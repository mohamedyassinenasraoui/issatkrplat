import mongoose from 'mongoose';

const absenceSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true,
  },
  justified: {
    type: Boolean,
    default: false,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

absenceSchema.index({ student: 1, module: 1, date: 1 }, { unique: true });

export default mongoose.model('Absence', absenceSchema);

