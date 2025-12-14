import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['prof_absence', 'advertisement', 'general'],
    default: 'general',
  },
  relatedModule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    default: null,
  },
  targetAudience: [{
    type: String,
    enum: ['all', 'students', 'admins', 'L1', 'L2', 'L3', 'Informatique', 'Genie Civil'],
  }],
  attachments: [{
    type: String,
  }],
  readBy: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);

