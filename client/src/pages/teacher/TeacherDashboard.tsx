import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TeacherProfile } from '../../types/auth';
import { 
  Clock, MessagesSquare, Calendar, Award, Users, ArrowRight, BookOpen,
  GraduationCap, MapPin
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [timetableRes, studentsRes] = await Promise.all([
        api.get('/teacher/timetable'),
        api.get('/teacher/classhub/students'),
      ]);

      const timetableData = timetableRes.data;
      
      const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const today = days[new Date().getDay()];
      
      const todayClasses = timetableData.filter((t: any) => t.dayOfWeek === today)
        .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Cours': return 'bg-[#1E3A5F]/20 text-[#1E3A5F] dark:text-blue-300 border-[#1E3A5F]/30';
      case 'TD': return 'bg-[#C41E3A]/20 text-[#C41E3A] dark:text-red-300 border-[#C41E3A]/30';
      case 'TP': return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-300 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1E3A5F] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1E3A5F] via-[#2B4C73] to-[#1E3A5F] rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C41E3A]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden p-2">
              <img src="/images/logoissatkr.png" alt="ISSAT Logo" className="w-full h-full object-contain" />
            </div>
            
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">👋 Bienvenue</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Bonjour, Prof. <span className="text-[#C41E3A]">{profile?.lastName}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-white/70">
                <span className="px-3 py-1 bg-white/10 text-white rounded-full text-sm border border-white/10">
                  {profile?.department}
                </span>
                {profile?.specialization && (
                  <>
                    <span className="text-white/40">•</span>
                    <span className="text-sm">{profile.specialization}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#C41E3A]" />
              <div>
                <p className="text-xl font-mono font-bold text-white">
                  {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-white/60 capitalize">
                  {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cours cette semaine', value: stats.totalClasses, icon: Clock, color: '#1E3A5F', bgClass: 'bg-[#1E3A5F]/10 dark:bg-[#1E3A5F]/20' },
          { label: 'Étudiants', value: stats.totalStudents, icon: Users, color: '#C41E3A', bgClass: 'bg-[#C41E3A]/10 dark:bg-[#C41E3A]/20' },
          { label: 'Modules enseignés', value: profile?.modules?.length || 0, icon: BookOpen, color: '#8B5CF6', bgClass: 'bg-violet-500/10 dark:bg-violet-500/20' },
          { label: 'Cours aujourd\'hui', value: stats.upcomingClasses.length, icon: Calendar, color: '#F59E0B', bgClass: 'bg-amber-500/10 dark:bg-amber-500/20' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-all">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${stat.bgClass}`}>
                <Icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1E3A5F]/10 dark:bg-[#1E3A5F]/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#1E3A5F] dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Cours aujourd'hui</h2>
              </div>
              <Link 
                to="/teacher/timetable" 
                className="px-4 py-2 bg-[#1E3A5F]/10 hover:bg-[#1E3A5F] text-[#1E3A5F] hover:text-white dark:text-blue-400 dark:hover:text-white rounded-xl text-sm flex items-center gap-2 transition-all font-medium"
              >
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="p-5">
            {stats.upcomingClasses.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingClasses.map((cls: any, index: number) => (
                  <div 
                    key={index}
                    className="group relative overflow-hidden rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all border border-gray-100 dark:border-slate-600"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1E3A5F] to-[#C41E3A]"></div>
                    <div className="p-4 pl-5 flex items-center gap-4">
                      <div className="text-center min-w-[70px]">
                        <p className="text-lg font-bold text-[#1E3A5F] dark:text-blue-400">{cls.startTime}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{cls.endTime}</p>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-[#1E3A5F] dark:group-hover:text-blue-400 transition-colors">
                          {cls.module?.name || 'Module'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{cls.filiere} {cls.level} {cls.group && `- ${cls.group}`}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(cls.type)}`}>
                          {cls.type}
                        </span>
                        <div className="flex items-center gap-1 text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-600 px-2 py-1 rounded-lg">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">{cls.room}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-7 h-7 text-gray-400 dark:text-slate-500" />
                </div>
                <p className="text-gray-500 dark:text-slate-400 font-medium">Pas de cours aujourd'hui</p>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Profitez de votre journée! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Modules */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C41E3A]/10 dark:bg-[#C41E3A]/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#C41E3A]" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Mes modules</h2>
            </div>
          </div>
          
          <div className="p-4">
            {profile?.modules && profile.modules.length > 0 ? (
              <div className="space-y-3">
                {profile.modules.map((mod: any, index: number) => (
                  <div 
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-slate-700/50 hover:bg-[#1E3A5F]/5 dark:hover:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1E3A5F]/10 dark:bg-[#1E3A5F]/20 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-[#1E3A5F] dark:text-blue-400" />
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
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-600" />
                <p className="text-gray-500 dark:text-slate-400">Aucun module assigné</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Emploi du temps', icon: Clock, href: '/teacher/timetable', color: 'from-[#1E3A5F] to-[#2B4C73]' },
          { label: 'ClassHub', icon: MessagesSquare, href: '/teacher/classhub', color: 'from-[#C41E3A] to-[#D93954]' },
          { label: 'Signaler absence', icon: Calendar, href: '/teacher/absences', color: 'from-amber-500 to-amber-600' },
          { label: 'Saisir notes', icon: Award, href: '/teacher/grades', color: 'from-violet-500 to-violet-600' },
        ].map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.href}
              className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-white">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherDashboard;
