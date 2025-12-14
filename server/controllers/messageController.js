import Message from '../models/Message.js';
import StudentProfile from '../models/StudentProfile.js';

// Get messages for student
export const getStudentMessages = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const query = {
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'students' },
        { targetAudience: student.level },
        { targetAudience: student.filiere },
      ],
    };

    const messages = await Message.find(query)
      .populate('relatedModule', 'name code')
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Get student messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all messages (admin)
export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('relatedModule', 'name code')
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Get all messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create message (admin)
export const createMessage = async (req, res) => {
  try {
    const message = new Message({
      ...req.body,
      createdBy: req.user._id,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const student = await StudentProfile.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: {
        readBy: {
          student: student._id,
          readAt: new Date(),
        },
      },
    });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete message (admin)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

