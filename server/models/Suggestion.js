import mongoose from 'mongoose';

const suggestionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    default: null,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'implemented', 'rejected'],
    default: 'pending',
  },
  adminResponse: {
    type: String,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });

export default mongoose.model('Suggestion', suggestionSchema);

