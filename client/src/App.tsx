import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import Login from './pages/auth/Login';
import Home from './pages/Home';
import FiliereDetails from './pages/FiliereDetails';
import AboutUs from './pages/AboutUs';
// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import AbsenceTracker from './components/student/AbsenceTracker';
import DocumentRequests from './components/student/DocumentRequests';
import AIAssistant from './components/student/AIAssistant';
import InfoNotes from './pages/student/InfoNotes';
import Messages from './pages/student/Messages';
import Suggestions from './pages/student/Suggestions';
import Results from './pages/student/Results';
import MyGroup from './pages/student/MyGroup';
import AbsencesBlog from './pages/student/AbsencesBlog';
import MyProfile from './pages/student/MyProfile';
import StudentClassHub from './pages/student/StudentClassHub';
import StudentTimetable from './pages/student/StudentTimetable';
// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminModules from './pages/admin/AdminModules';
import AdminAbsences from './pages/admin/AdminAbsences';
import AdminDocuments from './pages/admin/AdminDocuments';
import AdminInfoNotes from './pages/admin/AdminInfoNotes';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSuggestions from './pages/admin/AdminSuggestions';
import AdminResults from './pages/admin/AdminResults';
import AdminTimetable from './pages/admin/AdminTimetable';
// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherTimetable from './pages/teacher/TeacherTimetable';
import TeacherClassHub from './pages/teacher/TeacherClassHub';
import TeacherAbsences from './pages/teacher/TeacherAbsences';
import TeacherGrades from './pages/teacher/TeacherGrades';
import TeacherProfile from './pages/teacher/TeacherProfile';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  const getDefaultRoute = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      default:
        return '/student/dashboard';
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/filiere/:filiereId" element={<FiliereDetails />} />
      <Route path="/about-us" element={<AboutUs />} />
      
      {/* Student Routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute requireRole="student">
            <Layout>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="absences" element={<AbsenceTracker />} />
                <Route path="documents" element={<DocumentRequests />} />
                <Route path="ai-assistant" element={<AIAssistant />} />
                <Route path="info-notes" element={<InfoNotes />} />
                <Route path="messages" element={<Messages />} />
                <Route path="suggestions" element={<Suggestions />} />
                <Route path="results" element={<Results />} />
                <Route path="my-group" element={<MyGroup />} />
                <Route path="absences-blog" element={<AbsencesBlog />} />
                <Route path="profile" element={<MyProfile />} />
                <Route path="classhub" element={<StudentClassHub />} />
                <Route path="timetable" element={<StudentTimetable />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute requireRole="teacher">
            <Layout>
              <Routes>
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="timetable" element={<TeacherTimetable />} />
                <Route path="classhub" element={<TeacherClassHub />} />
                <Route path="absences" element={<TeacherAbsences />} />
                <Route path="grades" element={<TeacherGrades />} />
                <Route path="profile" element={<TeacherProfile />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requireRole="admin">
            <Layout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="modules" element={<AdminModules />} />
                <Route path="absences" element={<AdminAbsences />} />
                <Route path="documents" element={<AdminDocuments />} />
                <Route path="info-notes" element={<AdminInfoNotes />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="suggestions" element={<AdminSuggestions />} />
                <Route path="results" element={<AdminResults />} />
                <Route path="timetable" element={<AdminTimetable />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect for authenticated users */}
      {user && (
        <Route
          path="/home"
          element={<Navigate to={getDefaultRoute()} replace />}
        />
      )}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-slate-800 dark:text-white',
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
