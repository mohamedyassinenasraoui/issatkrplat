import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'student' | 'admin' | 'teacher';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-issat-navy rounded-2xl flex items-center justify-center mb-6">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-issat-navy border-t-transparent"></div>
        <p className="mt-4 text-gray-500 dark:text-slate-400">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user.role !== requireRole) {
    // Redirect to the appropriate dashboard based on user role
    const dashboardRoutes: Record<string, string> = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
    };
    return <Navigate to={dashboardRoutes[user.role] || '/login'} replace />;
  }

  return <>{children}</>;
};
