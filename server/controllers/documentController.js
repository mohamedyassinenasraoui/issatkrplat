import DocumentRequest from '../models/DocumentRequest.js';
import StudentProfile from '../models/StudentProfile.js';
import Notification from '../models/Notification.js';

// Get student's document requests
export const getStudentDocuments = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const documents = await DocumentRequest.find({ student: student._id })
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error('Get student documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create document request
export const createDocumentRequest = async (req, res) => {
  try {
    const { type, comment } = req.body;

    const student = await StudentProfile.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const documentRequest = new DocumentRequest({
      student: student._id,
      type,
      comment,
    });
    await documentRequest.save();

    res.status(201).json(documentRequest);
  } catch (error) {
    console.error('Create document request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all document requests (admin)
export const getAllDocuments = async (req, res) => {
  try {
    const documents = await DocumentRequest.find()
      .populate('student', 'firstName lastName studentId filiere')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error('Get all documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Process document request (admin)
export const processDocumentRequest = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status } = req.body;

    const documentRequest = await DocumentRequest.findById(documentId);
    if (!documentRequest) {
      return res.status(404).json({ message: 'Document request not found' });
    }

    documentRequest.status = status;
    documentRequest.processedBy = req.user._id;

    if (req.file) {
      documentRequest.document = `/uploads/${req.file.filename}`;
    }

    await documentRequest.save();

    const student = await StudentProfile.findById(documentRequest.student);
    await Notification.create({
      user: student.user,
      title: 'Document prêt',
      message: `Votre demande de document (${documentRequest.type}) est ${status === 'ready' ? 'prête' : 'traitée'}.`,
      type: status === 'ready' ? 'success' : 'info',
      link: status === 'ready' ? `/student/documents` : null,
    });

    res.json(documentRequest);
  } catch (error) {
    console.error('Process document request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

