import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Clock, MapPin, BookOpen, Users } from 'lucide-react';

interface TimetableEntry {
  _id: string;
  module: { name: string; code: string };
  filiere: string;
  level: string;
  group?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  type: string;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const TeacherTimetable: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await api.get('/teacher/timetable');
      setTimetable(response.data);
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEntriesForDay = (day: string) => {
    return timetable
      .filter((entry) => entry.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Cours':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400';
      case 'TD':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400';
      case 'TP':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-400/10 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-400/10 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Emploi du temps</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Votre planning de cours hebdomadaire</p>
      </div>

      {timetable.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-100 dark:border-slate-700">
          <Clock className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">Aucun cours planifié</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {DAYS.map((day) => {
            const entries = getEntriesForDay(day);
            const today = DAYS[new Date().getDay() - 1] === day;
            
            return (
              <div 
                key={day} 
                className={`bg-white dark:bg-slate-800 rounded-xl border ${
                  today ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-100 dark:border-slate-700'
                }`}
              >
                <div className={`px-4 py-3 border-b ${
                  today ? 'bg-emerald-50 dark:bg-emerald-400/10 border-emerald-100 dark:border-emerald-400/20' : 'bg-gray-50 dark:bg-slate-700 border-gray-100 dark:border-slate-600'
                } rounded-t-xl`}>
                  <h3 className={`font-semibold ${today ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-800 dark:text-white'}`}>
                    {day}
                    {today && <span className="ml-2 text-xs font-normal">(Aujourd'hui)</span>}
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {entries.length > 0 ? (
                    entries.map((entry: TimetableEntry) => (
                      <div
                        key={entry._id}
                        className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-medium text-gray-800 dark:text-white">
                              {entry.module?.name || 'Module'}
                            </span>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(entry.type)}`}>
                            {entry.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{entry.startTime} - {entry.endTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{entry.room}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-slate-400">
                          <Users className="w-4 h-4" />
                          <span>{entry.filiere} {entry.level} {entry.group && `- ${entry.group}`}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 dark:text-slate-500 py-4">
                      Pas de cours
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherTimetable;

