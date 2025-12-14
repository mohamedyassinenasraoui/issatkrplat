import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
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
  coefficient: {
    type: Number,
    required: true,
    min: 0,
  },
  professor: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

export default mongoose.model('Module', moduleSchema);

