import mongoose from 'mongoose';

const timetableEntrySchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherProfile',
    required: true,
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
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
  dayOfWeek: {
    type: String,
    enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    required: true,
  },
  startTime: {
    type: String,
    required: true, // Format: "08:30"
  },
  endTime: {
    type: String,
    required: true, // Format: "10:00"
  },
  room: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Cours', 'TD', 'TP'],
    default: 'Cours',
  },
}, { timestamps: true });

export default mongoose.model('Timetable', timetableEntrySchema);

