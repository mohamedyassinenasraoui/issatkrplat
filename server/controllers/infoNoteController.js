import InfoNote from '../models/InfoNote.js';
import StudentProfile from '../models/StudentProfile.js';

// Get all info notes (for students, filtered by target audience)
export const getInfoNotes = async (req, res) => {
  try {
    let query = {};

    // If student, filter by target audience
    if (req.user.role === 'student') {
      const student = await StudentProfile.findOne({ user: req.user._id });
      if (student) {
        query = {
          $or: [
            { targetAudience: 'all' },
            { targetAudience: 'students' },
            { targetAudience: student.level },
            { targetAudience: student.filiere },
          ],
        };
      }
    }

    const notes = await InfoNote.find(query)
      .populate('createdBy', 'email')
      .sort({ priority: -1, createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Get info notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create info note (admin)
export const createInfoNote = async (req, res) => {
  try {
    const note = new InfoNote({
      ...req.body,
      createdBy: req.user._id,
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('Create info note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update info note (admin)
export const updateInfoNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await InfoNote.findByIdAndUpdate(
      noteId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Info note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Update info note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete info note (admin)
export const deleteInfoNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await InfoNote.findByIdAndDelete(noteId);

    if (!note) {
      return res.status(404).json({ message: 'Info note not found' });
    }

    res.json({ message: 'Info note deleted successfully' });
  } catch (error) {
    console.error('Delete info note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Increment views
export const incrementViews = async (req, res) => {
  try {
    const { noteId } = req.params;
    await InfoNote.findByIdAndUpdate(noteId, { $inc: { views: 1 } });
    res.json({ message: 'Views incremented' });
  } catch (error) {
    console.error('Increment views error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

