import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import TeacherProfile from '../models/TeacherProfile.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('User not found:', email.toLowerCase().trim());
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id }).populate('user', 'email');
    } else if (user.role === 'teacher') {
      profile = await TeacherProfile.findOne({ user: user._id })
        .populate('user', 'email')
        .populate('modules', 'name code');
    }

    const responseData = {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    };

    if (profile) {
      responseData.profile = profile;
    }

    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let profile = null;

    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id }).populate('user', 'email');
    } else if (user.role === 'teacher') {
      profile = await TeacherProfile.findOne({ user: user._id })
        .populate('user', 'email')
        .populate('modules', 'name code');
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
