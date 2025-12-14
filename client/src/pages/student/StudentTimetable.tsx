import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile } from '../../types/auth';
import { Calendar, Clock, MapPin, BookOpen, User } from 'lucide-react';

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

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const StudentTimetable: React.FC = () => {
  const { profile: rawProfile } = useAuth();
  const profile = rawProfile as StudentProfile | null;
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(() => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const today = days[new Date().getDay()];
    return DAYS.includes(today) ? today : 'Lundi';
  });

  useEffect(() => {
    fetchTimetable();
  }, []);

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Cours': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'TD': return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
      case 'TP': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const dayEntries = timetable.filter(e => e.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

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
      </div>

      <div className="relative z-10 space-y-6 p-2">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
          <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
          
          <div className="relative p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Mon Emploi du Temps</h1>
                <p className="text-slate-400">
                  {profile?.filiere} - {profile?.level} {profile?.group && `| Groupe ${profile.group}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Timetable Grid */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
          <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
          
          <div className="relative p-6">
            <h2 className="text-lg font-bold text-white mb-4">{selectedDay}</h2>
            
            {dayEntries.length > 0 ? (
              <div className="space-y-3">
                {dayEntries.map((entry, index) => (
                  <div 
                    key={entry._id || index}
                    className="group relative overflow-hidden rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-violet-500"></div>
                    <div className="p-4 pl-5 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="text-center min-w-[100px]">
                        <div className="flex items-center justify-center gap-2 text-cyan-400">
                          <Clock className="w-4 h-4" />
                          <p className="text-lg font-bold text-white">{entry.startTime}</p>
                        </div>
                        <p className="text-xs text-slate-500">{entry.endTime}</p>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-cyan-400" />
                          <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {entry.module?.name || 'Module'}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{entry.module?.code}</p>
                        {entry.teacher && (
                          <div className="flex items-center gap-2 mt-2 text-slate-500">
                            <User className="w-3 h-3" />
                            <span className="text-xs">Prof. {entry.teacher.firstName} {entry.teacher.lastName}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(entry.type)}`}>
                          {entry.type}
                        </span>
                        <div className="flex items-center gap-1 text-slate-400 bg-white/5 px-3 py-1 rounded-lg">
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
                <p className="text-slate-400">Pas de cours ce jour</p>
                <p className="text-sm text-slate-500 mt-1">Profitez de votre temps libre! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
          <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
          
          <div className="relative p-6">
            <h2 className="text-lg font-bold text-white mb-4">Aperçu de la semaine</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {DAYS.map(day => {
                const dayClasses = timetable.filter(e => e.dayOfWeek === day);
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`p-4 rounded-xl transition-all border ${
                      selectedDay === day
                        ? 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border-cyan-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <p className="font-medium text-white text-sm">{day}</p>
                    <p className="text-2xl font-bold text-cyan-400 mt-1">{dayClasses.length}</p>
                    <p className="text-xs text-slate-500">cours</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;

