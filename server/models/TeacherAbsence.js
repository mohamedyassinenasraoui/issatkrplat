import mongoose from 'mongoose';

// Teacher absence request - for notifying admin
const teacherAbsenceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherProfile',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  affectedModules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  }],
  affectedFilieres: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'rescheduled'],
    default: 'pending',
  },
  adminResponse: {
    type: String,
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  respondedAt: {
    type: Date,
  },
  // Notify students automatically
  notifyStudents: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.model('TeacherAbsence', teacherAbsenceSchema);

