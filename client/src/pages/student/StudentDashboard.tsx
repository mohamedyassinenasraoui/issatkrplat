import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile } from '../../types/auth';
import { 
  Calendar, Clock, ArrowRight, Bell, BookOpen, MapPin,
  Newspaper, ExternalLink, User
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

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
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
  
  // Mock news from ISSAT website
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
      case 'Cours': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'TD': return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
      case 'TP': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-8 p-2">
        {/* Hero Section with Profile */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-violet-500/10 backdrop-blur-xl"></div>
          <div className="absolute inset-0 border border-white/10 rounded-3xl"></div>
          
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl shadow-cyan-500/20">
                  {profile?.picture ? (
                    <img src={profile.picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Welcome Text */}
              <div className="text-center md:text-left flex-1">
                <p className="text-cyan-400 text-sm font-medium mb-1">👋 Bienvenue</p>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                  Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">{profile?.firstName}</span>
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-300">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm backdrop-blur-sm border border-white/10">
                    {profile?.filiere}
                  </span>
                  <span className="text-slate-500">—</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm backdrop-blur-sm border border-white/10">
                    {profile?.level}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm backdrop-blur-sm border border-cyan-500/30">
                    Groupe {profile?.group}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400 text-sm">
                    Année {new Date().getFullYear()}/{new Date().getFullYear() + 1}
                  </span>
                </div>
              </div>

              {/* Current Time */}
              <div className="text-center md:text-right">
                <div className="inline-block px-6 py-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                  <p className="text-3xl font-mono font-bold text-white">
                    {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timetable - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl h-full">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
              <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
              
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Emploi du temps</h2>
                      <p className="text-sm text-slate-400">Cours d'aujourd'hui - {today}</p>
                    </div>
                  </div>
                  <Link 
                    to="/student/timetable" 
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white flex items-center gap-2 transition-all border border-white/10"
                  >
                    Voir tout <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {todayClasses.length > 0 ? (
                  <div className="space-y-3">
                    {todayClasses.map((entry, index) => (
                      <div 
                        key={entry._id || index}
                        className="group relative overflow-hidden rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-violet-500"></div>
                        <div className="p-4 pl-5 flex items-center gap-4">
                          <div className="text-center min-w-[80px]">
                            <p className="text-lg font-bold text-white">{entry.startTime}</p>
                            <p className="text-xs text-slate-500">{entry.endTime}</p>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                              {entry.module?.name || 'Module'}
                            </h3>
                            <p className="text-sm text-slate-400">{entry.module?.code}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(entry.type)}`}>
                              {entry.type}
                            </span>
                            <div className="flex items-center gap-1 text-slate-400">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{entry.room}</span>
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
          </div>

          {/* News & À la une */}
          <div className="space-y-6">
            {/* À la une */}
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 backdrop-blur-xl"></div>
              <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
              
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-xl flex items-center justify-center">
                    <Newspaper className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">À la une</h2>
                </div>

                <div className="space-y-3">
                  {news.slice(0, 3).map((item, index) => (
                    <a
                      key={index}
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{item.date}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                      </div>
                    </a>
                  ))}
                </div>

                <a
                  href="https://issatkr.rnu.tn/fra/home"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 block w-full py-3 text-center bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white transition-all border border-white/10"
                >
                  Voir toutes les actualités
                </a>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
              <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
              
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-violet-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Mon parcours</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                    <p className="text-2xl font-bold text-cyan-400">{profile?.filiere?.slice(0, 3) || '--'}</p>
                    <p className="text-xs text-slate-400">Filière</p>
                  </div>
                  <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
                    <p className="text-2xl font-bold text-violet-400">{profile?.level || '--'}</p>
                    <p className="text-xs text-slate-400">Niveau</p>
                  </div>
                  <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <p className="text-2xl font-bold text-amber-400">{profile?.group || '--'}</p>
                    <p className="text-xs text-slate-400">Groupe</p>
                  </div>
                  <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <p className="text-2xl font-bold text-emerald-400">S1</p>
                    <p className="text-xs text-slate-400">Semestre</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Absences', icon: Calendar, href: '/student/absences', color: 'from-red-500 to-orange-500' },
            { label: 'Documents', icon: BookOpen, href: '/student/documents', color: 'from-cyan-500 to-blue-500' },
            { label: 'Messages', icon: Bell, href: '/student/messages', color: 'from-violet-500 to-purple-500' },
            { label: 'Assistant IA', icon: User, href: '/student/ai-assistant', color: 'from-emerald-500 to-teal-500' },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.href}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl group-hover:bg-white/10 transition-all"></div>
                <div className="absolute inset-0 border border-white/10 rounded-2xl group-hover:border-white/20 transition-all"></div>
                <div className="relative p-5 flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
