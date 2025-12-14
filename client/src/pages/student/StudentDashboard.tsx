import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile } from '../../types/auth';
import { 
  Calendar, Clock, ArrowRight, Bell, BookOpen, MapPin,
  Newspaper, ExternalLink, User, FileText, Bot
} from 'lucide-react';

interface TimetableEntry {
  _id: string;
  module: { name: string; code: string };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  type: string;
  teacher?: { firstName: string; lastName: string };
}

interface NewsItem {
  title: string;
  link: string;
  date: string;
}

const DAYS_MAP: Record<number, string> = {
  0: 'Dimanche',
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
};

const StudentDashboard: React.FC = () => {
  const { profile: rawProfile } = useAuth();
  const profile = rawProfile as StudentProfile | null;
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [news] = useState<NewsItem[]>([
    { title: "Inscription au Semestre 2 - Année Universitaire 2024/2025", link: "https://issatkr.rnu.tn/fra/home", date: "2024-12-14" },
    { title: "Calendrier des examens de fin de semestre", link: "https://issatkr.rnu.tn/fra/home", date: "2024-12-10" },
    { title: "Journée d'intégration des nouveaux étudiants", link: "https://issatkr.rnu.tn/fra/home", date: "2024-12-05" },
    { title: "Conférence: Intelligence Artificielle et Innovation", link: "https://issatkr.rnu.tn/fra/home", date: "2024-12-01" },
  ]);

  useEffect(() => {
    fetchTimetable();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [profile]);

  const fetchTimetable = async () => {
    try {
      const response = await api.get('/timetable/student');
      setTimetable(response.data);
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = DAYS_MAP[currentTime.getDay()];
  const todayClasses = timetable.filter(t => t.dayOfWeek === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

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
      {/* Hero Section with Profile */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A5F] via-[#2B4C73] to-[#1E3A5F] p-6 md:p-8">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C41E3A]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl bg-white/10">
              {profile?.picture ? (
                <img src={profile.picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#1E3A5F] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center md:text-left flex-1">
            <p className="text-white/70 text-sm font-medium mb-1">👋 Bienvenue</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Bonjour, <span className="text-[#C41E3A]">{profile?.firstName}</span>
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-white/80">
              <span className="px-3 py-1 bg-white/10 rounded-full text-sm backdrop-blur-sm border border-white/10">
                {profile?.filiere}
              </span>
              <span className="text-white/40">—</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-sm backdrop-blur-sm border border-white/10">
                {profile?.level}
              </span>
              <span className="text-white/40">|</span>
              <span className="px-3 py-1 bg-[#C41E3A]/30 text-white rounded-full text-sm backdrop-blur-sm border border-[#C41E3A]/30">
                Groupe {profile?.group}
              </span>
              <span className="text-white/40">|</span>
              <span className="text-white/60 text-sm">
                Année {new Date().getFullYear()}/{new Date().getFullYear() + 1}
              </span>
            </div>
          </div>

          {/* Current Time */}
          <div className="text-center md:text-right">
            <div className="inline-block px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <p className="text-2xl font-mono font-bold text-white">
                {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-white/60 mt-1 capitalize">
                {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timetable - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1E3A5F]/10 dark:bg-[#1E3A5F]/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#1E3A5F] dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Emploi du temps</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Cours d'aujourd'hui - {today}</p>
                  </div>
                </div>
                <Link 
                  to="/student/timetable" 
                  className="px-4 py-2 bg-[#1E3A5F]/10 hover:bg-[#1E3A5F] text-[#1E3A5F] hover:text-white dark:text-blue-400 dark:hover:text-white rounded-xl text-sm flex items-center gap-2 transition-all font-medium"
                >
                  Voir tout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="p-5">
              {todayClasses.length > 0 ? (
                <div className="space-y-3">
                  {todayClasses.map((entry, index) => (
                    <div 
                      key={entry._id || index}
                      className="group relative overflow-hidden rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all border border-gray-100 dark:border-slate-600"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1E3A5F] to-[#C41E3A]"></div>
                      <div className="p-4 pl-5 flex items-center gap-4">
                        <div className="text-center min-w-[70px]">
                          <p className="text-lg font-bold text-[#1E3A5F] dark:text-blue-400">{entry.startTime}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500">{entry.endTime}</p>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-[#1E3A5F] dark:group-hover:text-blue-400 transition-colors">
                            {entry.module?.name || 'Module'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400">{entry.module?.code}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(entry.type)}`}>
                            {entry.type}
                          </span>
                          <div className="flex items-center gap-1 text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-600 px-2 py-1 rounded-lg">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">{entry.room}</span>
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
        </div>

        {/* News & Stats */}
        <div className="space-y-6">
          {/* À la une */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A5F] to-[#C41E3A] rounded-xl flex items-center justify-center">
                  <Newspaper className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">À la une</h2>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {news.slice(0, 3).map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 bg-gray-50 dark:bg-slate-700/50 hover:bg-[#1E3A5F]/5 dark:hover:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-white group-hover:text-[#1E3A5F] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{item.date}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#1E3A5F] dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>

            <div className="px-4 pb-4">
              <a
                href="https://issatkr.rnu.tn/fra/home"
                target="_blank"
                rel="noreferrer"
                className="block w-full py-3 text-center bg-[#1E3A5F]/10 hover:bg-[#1E3A5F] text-[#1E3A5F] hover:text-white dark:text-blue-400 dark:hover:text-white rounded-xl text-sm font-medium transition-all"
              >
                Voir toutes les actualités
              </a>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#C41E3A]/10 dark:bg-[#C41E3A]/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#C41E3A]" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Mon parcours</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-[#1E3A5F]/10 dark:bg-[#1E3A5F]/20 rounded-xl border border-[#1E3A5F]/20">
                <p className="text-2xl font-bold text-[#1E3A5F] dark:text-blue-400">{profile?.filiere?.slice(0, 3) || '--'}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Filière</p>
              </div>
              <div className="p-4 bg-[#C41E3A]/10 dark:bg-[#C41E3A]/20 rounded-xl border border-[#C41E3A]/20">
                <p className="text-2xl font-bold text-[#C41E3A]">{profile?.level || '--'}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Niveau</p>
              </div>
              <div className="p-4 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl border border-amber-500/20">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{profile?.group || '--'}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Groupe</p>
              </div>
              <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl border border-emerald-500/20">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">S1</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Semestre</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Absences', icon: Calendar, href: '/student/absences', color: 'from-[#C41E3A] to-[#D93954]' },
          { label: 'Documents', icon: FileText, href: '/student/documents', color: 'from-[#1E3A5F] to-[#2B4C73]' },
          { label: 'Messages', icon: Bell, href: '/student/messages', color: 'from-amber-500 to-amber-600' },
          { label: 'Assistant IA', icon: Bot, href: '/student/ai-assistant', color: 'from-emerald-500 to-emerald-600' },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              to={item.href}
              className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-white">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default StudentDashboard;
