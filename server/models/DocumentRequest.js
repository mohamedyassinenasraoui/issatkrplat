import mongoose from 'mongoose';

const documentRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true,
  },
  type: {
    type: String,
    enum: ['attestation_scolarite', 'certificat_inscription', 'releve_notes', 'autre'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'ready', 'rejected'],
    default: 'pending',
  },
  comment: {
    type: String,
  },
  document: {
    type: String, // URL to signed PDF
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

export default mongoose.model('DocumentRequest', documentRequestSchema);

