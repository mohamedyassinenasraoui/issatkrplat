import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TeacherProfile } from '../../types/auth';
import { 
  Clock, MessagesSquare, Calendar, Award, Users, ArrowRight, BookOpen
} from 'lucide-react';

interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  upcomingClasses: any[];
  recentMessages: number;
}

const TeacherDashboard: React.FC = () => {
  const { profile: rawProfile } = useAuth();
  const profile = rawProfile as TeacherProfile | null;
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    upcomingClasses: [],
    recentMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [timetableRes, studentsRes] = await Promise.all([
        api.get('/teacher/timetable'),
        api.get('/teacher/classhub/students'),
      ]);

      const timetableData = timetableRes.data;
      
      // Get today's day
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const today = days[new Date().getDay()];
      
      const todayClasses = timetableData.filter((t: any) => t.dayOfWeek === today);

      setStats({
        totalClasses: timetableData.length,
        totalStudents: studentsRes.data.length,
        upcomingClasses: todayClasses,
        recentMessages: 0,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Emploi du temps', href: '/teacher/timetable', icon: Clock, color: 'emerald' },
    { label: 'ClassHub', href: '/teacher/classhub', icon: MessagesSquare, color: 'emerald' },
    { label: 'Signaler absence', href: '/teacher/absences', icon: Calendar, color: 'amber' },
    { label: 'Saisir notes', href: '/teacher/grades', icon: Award, color: 'emerald' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Bienvenue, Prof. {profile?.lastName}!
            </h1>
            <p className="text-white/80">
              {profile?.department} - {profile?.specialization}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Clock className="w-5 h-5 mr-2" />
              <span className="text-sm">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-400/10 rounded-xl">
              <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalClasses}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Cours cette semaine</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-400/10 rounded-xl">
              <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalStudents}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Étudiants</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-400/10 rounded-xl">
              <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{profile?.modules?.length || 0}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Modules enseignés</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-400/10 rounded-xl">
              <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.upcomingClasses.length}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Cours aujourd'hui</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-gray-200 dark:hover:border-slate-600 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  action.color === 'amber' ? 'bg-amber-100 dark:bg-amber-400/10' : 'bg-emerald-100 dark:bg-emerald-400/10'
                } group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${
                    action.color === 'amber' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`} />
                </div>
                <p className="font-medium text-gray-800 dark:text-white text-sm">{action.label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Cours aujourd'hui</h2>
            <Link to="/teacher/timetable" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center">
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          {stats.upcomingClasses.length > 0 ? (
            <div className="space-y-4">
              {stats.upcomingClasses.map((cls: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-400/10 rounded-lg">
                    <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {cls.module?.name || 'Module'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      {cls.startTime} - {cls.endTime} | {cls.room} | {cls.type}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 text-xs rounded-full">
                    {cls.filiere} {cls.level}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Pas de cours aujourd'hui</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Mes modules</h2>
          </div>
          {profile?.modules && profile.modules.length > 0 ? (
            <div className="space-y-3">
              {profile.modules.map((mod: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-400/10 rounded-lg">
                      <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{mod.name}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{mod.code}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun module assigné</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

