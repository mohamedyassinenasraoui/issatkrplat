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
} from '../controllers/adminController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';

const router = express.Router();

// All admin routes require authentication
router.use(authMiddleware);

// Student management
router.get('/students', requireRole('admin'), getStudents);
router.get('/students/:studentId', getStudent); // Allow both admin and student
router.post('/students', requireRole('admin'), createStudent);
router.put('/students/:studentId', requireRole('admin'), updateStudent);
router.delete('/students/:studentId', requireRole('admin'), deleteStudent);

// Module management
router.get('/modules', getModules);
router.post('/modules', requireRole('admin'), createModule);
router.put('/modules/:moduleId', requireRole('admin'), updateModule);
router.delete('/modules/:moduleId', requireRole('admin'), deleteModule);

// Dashboard stats
router.get('/dashboard/stats', requireRole('admin'), getDashboardStats);

export default router;

