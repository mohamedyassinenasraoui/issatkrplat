import mongoose from 'mongoose';

const teacherProfileSchema = new mongoose.Schema({
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
  teacherId: {
    type: String,
    unique: true,
    sparse: true,
  },
  department: {
    type: String,
    trim: true,
  },
  specialization: {
    type: String,
    trim: true,
  },
  // Modules the teacher teaches
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
  }],
  // Filières the teacher teaches in (for ClassHub auto-enrollment)
  filieres: [{
    type: String,
    trim: true,
  }],
  phone: {
    type: String,
    trim: true,
  },
  office: {
    type: String,
    trim: true,
  },
  picture: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.model('TeacherProfile', teacherProfileSchema);

