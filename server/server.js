import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import absenceRoutes from './routes/absences.js';
import documentRoutes from './routes/documents.js';
import aiRoutes from './routes/ai.js';
import infoNoteRoutes from './routes/infoNotes.js';
import messageRoutes from './routes/messages.js';
import suggestionRoutes from './routes/suggestions.js';
import resultRoutes from './routes/results.js';
import teacherRoutes from './routes/teacher.js';
import classhubRoutes from './routes/classhub.js';
import timetableRoutes from './routes/timetable.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Request logging middleware (log all requests)
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('  Body:', JSON.stringify(req.body).substring(0, 100));
  }
  next();
});

// Middleware - Allow all origins for network access
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint (before routes)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ISSAT Server is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ISSAT Kairouan API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      admin: '/api/admin',
      absences: '/api/absences',
      documents: '/api/documents',
      ai: '/api/ai',
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/info-notes', infoNoteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/classhub', classhubRoutes);
app.use('/api/timetable', timetableRoutes);

// 404 handler for undefined API routes (MUST BE LAST)
app.use('/api/*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl,
    availableRoutes: [
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/health',
      'GET /api/admin/*',
      'GET /api/absences/*',
      'GET /api/documents/*',
      'POST /api/ai/ask',
    ]
  });
});

// Connect to MongoDB and start server
const MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://localhost:27017/issat').trim();

// Start server even if MongoDB connection fails (for testing)
const PORT = 5001; // Explicitly set port to 5001 as requested

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    startServer();
  })
  .catch((error) => {
    console.error('⚠️  MongoDB connection error:', error.message);
    console.error('💡 Server will start but database operations will fail');
    console.error('💡 Make sure MongoDB is running and MONGODB_URI is correct in .env');
    startServer();
  });

function startServer() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Local: http://localhost:${PORT}`);
    console.log(`📡 Network: http://0.0.0.0:${PORT}`);
    console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
    console.log(`📡 Test Login: POST http://localhost:${PORT}/api/auth/login`);
  });
}

export default app;

