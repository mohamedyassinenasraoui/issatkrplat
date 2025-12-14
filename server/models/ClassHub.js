import mongoose from 'mongoose';

// ClassHub message schema - for teacher-student communication
const classHubMessageSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherProfile',
    required: true,
  },
  // Target filières - students in these filières can see the message
  filieres: [{
    type: String,
    required: true,
  }],
  level: {
    type: String,
    enum: ['L1', 'L2', 'L3', 'all'],
    default: 'all',
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
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
  type: {
    type: String,
    enum: ['announcement', 'assignment', 'resource', 'discussion'],
    default: 'announcement',
  },
  attachments: [{
    filename: String,
    url: String,
  }],
  // Replies from students
  replies: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isPinned: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model('ClassHubMessage', classHubMessageSchema);

