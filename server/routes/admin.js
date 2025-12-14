import express from 'express';
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getModules,
  createModule,
  updateModule,
  deleteModule,
  getDashboardStats,
  getTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
} from '../controllers/adminController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

// All admin routes require authentication
router.use(authMiddleware);

// Student management - with picture upload support
router.get('/students', requireRole('admin'), getStudents);
router.get('/students/:studentId', getStudent); // Allow both admin and student
router.post('/students', requireRole('admin'), upload.single('picture'), createStudent);
router.put('/students/:studentId', requireRole('admin'), upload.single('picture'), updateStudent);
router.delete('/students/:studentId', requireRole('admin'), deleteStudent);

// Module management
router.get('/modules', getModules);
router.post('/modules', requireRole('admin'), createModule);
router.put('/modules/:moduleId', requireRole('admin'), updateModule);
router.delete('/modules/:moduleId', requireRole('admin'), deleteModule);

// Timetable management
router.get('/timetable', requireRole('admin'), getTimetable);
router.post('/timetable', requireRole('admin'), createTimetableEntry);
router.put('/timetable/:entryId', requireRole('admin'), updateTimetableEntry);
router.delete('/timetable/:entryId', requireRole('admin'), deleteTimetableEntry);

// Dashboard stats
router.get('/dashboard/stats', requireRole('admin'), getDashboardStats);

export default router;
