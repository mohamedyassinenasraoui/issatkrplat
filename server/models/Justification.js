import mongoose from 'mongoose';

const justificationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true,
  },
  absence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Absence',
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  document: {
    type: String, // URL to uploaded file
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewComment: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.model('Justification', justificationSchema);

