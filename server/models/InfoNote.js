import mongoose from 'mongoose';

const infoNoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'event', 'administrative'],
    default: 'general',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  targetAudience: [{
    type: String,
    enum: ['all', 'students', 'admins', 'L1', 'L2', 'L3', 'Informatique', 'Genie Civil'],
  }],
  attachments: [{
    type: String,
  }],
  views: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('InfoNote', infoNoteSchema);

