import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  filiere: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: String,
    enum: ['L1', 'L2', 'L3'],
    required: true,
  },
  group: {
    type: String,
    trim: true,
  },
  picture: {
    type: String,
    default: '/uploads/default-avatar.png',
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  adminPassword: {
    type: String,
    default: null,
  },
}, { timestamps: true });

export default mongoose.model('StudentProfile', studentProfileSchema);

