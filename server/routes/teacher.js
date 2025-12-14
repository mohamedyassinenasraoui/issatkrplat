import express from 'express';
import {
  getTeacherProfile,
  getTeacherTimetable,
  getClassHubMessages,
  createClassHubMessage,
  deleteClassHubMessage,
  getClassHubStudents,
  getTeacherAbsences,
  createTeacherAbsence,
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getAllTeacherAbsences,
  respondToTeacherAbsence,
  createTimetableEntry,
  getAllTimetable,
  deleteTimetableEntry,
} from '../controllers/teacherController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

router.use(authMiddleware);

// Teacher routes
router.get('/profile', requireRole('teacher'), getTeacherProfile);
router.get('/timetable', requireRole('teacher'), getTeacherTimetable);

// ClassHub routes (teacher)
router.get('/classhub', requireRole('teacher'), getClassHubMessages);
router.post('/classhub', requireRole('teacher'), createClassHubMessage);
router.delete('/classhub/:messageId', requireRole('teacher'), deleteClassHubMessage);
router.get('/classhub/students', requireRole('teacher'), getClassHubStudents);

// Teacher absence routes
router.get('/absences', requireRole('teacher'), getTeacherAbsences);
router.post('/absences', requireRole('teacher'), createTeacherAbsence);

// Admin routes for teacher management - with picture upload
router.get('/all', requireRole('admin'), getAllTeachers);
router.post('/', requireRole('admin'), upload.single('picture'), createTeacher);
router.put('/:teacherId', requireRole('admin'), upload.single('picture'), updateTeacher);
router.delete('/:teacherId', requireRole('admin'), deleteTeacher);

// Admin routes for teacher absences
router.get('/absences/all', requireRole('admin'), getAllTeacherAbsences);
router.put('/absences/:absenceId/respond', requireRole('admin'), respondToTeacherAbsence);

// Admin routes for timetable
router.get('/timetable/all', requireRole('admin'), getAllTimetable);
router.post('/timetable', requireRole('admin'), createTimetableEntry);
router.delete('/timetable/:entryId', requireRole('admin'), deleteTimetableEntry);

export default router;
