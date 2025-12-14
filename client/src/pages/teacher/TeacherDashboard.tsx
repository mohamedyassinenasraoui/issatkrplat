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
      case 'Cours': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'TD': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'TP': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-emerald-950/20 to-[#0a1628]"></div>
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-6 p-2">
        {/* Header with Logo */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-white/5 to-teal-500/10 backdrop-blur-2xl"></div>
          <div className="absolute inset-0 border border-white/10 rounded-3xl"></div>
          
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden shadow-2xl shadow-emerald-500/20">
                    <img src="/images/logo.svg" alt="ISSAT Logo" className="w-14 h-14" />
                  </div>
                </div>
                
                <div>
                  <p className="text-emerald-400 text-sm font-medium mb-1">👋 Bienvenue</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Bonjour, Prof. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{profile?.lastName}</span>
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-400">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm border border-emerald-500/30">
                      {profile?.department}
                    </span>
                    {profile?.specialization && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-sm">{profile.specialization}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="px-6 py-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-2xl font-mono font-bold text-white">
                        {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Cours cette semaine', value: stats.totalClasses, icon: Clock, color: 'emerald' },
            { label: 'Étudiants', value: stats.totalStudents, icon: Users, color: 'teal' },
            { label: 'Modules enseignés', value: profile?.modules?.length || 0, icon: BookOpen, color: 'cyan' },
            { label: 'Cours aujourd\'hui', value: stats.upcomingClasses.length, icon: Calendar, color: 'amber' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            const colors: Record<string, { bg: string; text: string; border: string }> = {
              emerald: { bg: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', border: 'border-emerald-500/20' },
              teal: { bg: 'from-teal-500/20 to-teal-500/5', text: 'text-teal-400', border: 'border-teal-500/20' },
              cyan: { bg: 'from-cyan-500/20 to-cyan-500/5', text: 'text-cyan-400', border: 'border-cyan-500/20' },
              amber: { bg: 'from-amber-500/20 to-amber-500/5', text: 'text-amber-400', border: 'border-amber-500/20' },
            };
            const c = colors[stat.color];
            
            return (
              <div key={index} className="relative overflow-hidden rounded-2xl group">
                <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} backdrop-blur-xl`}></div>
                <div className={`absolute inset-0 border ${c.border} rounded-2xl`}></div>
                
                <div className="relative p-5">
                  <div className={`w-12 h-12 rounded-xl ${c.bg.replace('to-', 'to-transparent bg-gradient-to-br ')} flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${c.text}`} />
                  </div>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
            <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
            
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Cours aujourd'hui</h2>
                </div>
                <Link 
                  to="/teacher/timetable" 
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white flex items-center gap-2 transition-all border border-white/10"
                >
                  Voir tout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              {stats.upcomingClasses.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcomingClasses.map((cls: any, index: number) => (
                    <div 
                      key={index}
                      className="group relative overflow-hidden rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500"></div>
                      <div className="p-4 pl-5 flex items-center gap-4">
                        <div className="text-center min-w-[80px]">
                          <p className="text-lg font-bold text-white">{cls.startTime}</p>
                          <p className="text-xs text-slate-500">{cls.endTime}</p>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                            {cls.module?.name || 'Module'}
                          </h3>
                          <p className="text-sm text-slate-400">{cls.filiere} {cls.level} {cls.group && `- ${cls.group}`}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(cls.type)}`}>
                            {cls.type}
                          </span>
                          <div className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{cls.room}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-400">Pas de cours aujourd'hui</p>
                  <p className="text-sm text-slate-500 mt-1">Profitez de votre journée! 🎉</p>
                </div>
              )}
            </div>
          </div>

          {/* Modules */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
            <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
            
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-teal-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Mes modules</h2>
              </div>
              
              {profile?.modules && profile.modules.length > 0 ? (
                <div className="space-y-3">
                  {profile.modules.map((mod: any, index: number) => (
                    <div 
                      key={index}
                      className="p-4 bg-emerald-500/10 hover:bg-emerald-500/15 rounded-xl border border-emerald-500/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{mod.name}</p>
                          <p className="text-sm text-emerald-400/70">{mod.code}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun module assigné</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Emploi du temps', icon: Clock, href: '/teacher/timetable', color: 'from-emerald-500 to-teal-500' },
            { label: 'ClassHub', icon: MessagesSquare, href: '/teacher/classhub', color: 'from-cyan-500 to-blue-500' },
            { label: 'Signaler absence', icon: Calendar, href: '/teacher/absences', color: 'from-amber-500 to-orange-500' },
            { label: 'Saisir notes', icon: Award, href: '/teacher/grades', color: 'from-violet-500 to-purple-500' },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl group-hover:bg-white/10 transition-all"></div>
                <div className="absolute inset-0 border border-white/10 rounded-2xl group-hover:border-white/20 transition-all"></div>
                <div className="relative p-5 flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">{action.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
