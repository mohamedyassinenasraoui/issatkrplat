import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Calendar, Trash2, Clock, MapPin, Users, BookOpen, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Module {
  _id: string;
  name: string;
  code: string;
}

interface TimetableEntry {
  _id: string;
  module: Module;
  filiere: string;
  level: string;
  group: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  type: string;
  teacher?: { firstName: string; lastName: string };
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const TYPES = ['Cours', 'TD', 'TP'];
const FILIERES = ['Licence Informatique', 'Licence Génie Civil', 'Licence Électronique', 'Master Informatique', 'Master Génie Civil'];
const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2'];
const GROUPS = ['A', 'B', 'C', 'D'];

const AdminTimetable: React.FC = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Lundi');
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  
  const [form, setForm] = useState({
    module: '',
    filiere: '',
    level: '',
    group: '',
    dayOfWeek: 'Lundi',
    startTime: '08:00',
    endTime: '10:00',
    room: '',
    type: 'Cours',
    teacher: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [timetableRes, modulesRes, teachersRes] = await Promise.all([
        api.get('/admin/timetable'),
        api.get('/admin/modules'),
        api.get('/teacher/all'),
      ]);
      setEntries(timetableRes.data);
      setModules(modulesRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/timetable', form);
      toast.success('Séance ajoutée avec succès');
      setShowModal(false);
      fetchData();
      setForm({
        module: '',
        filiere: '',
        level: '',
        group: '',
        dayOfWeek: 'Lundi',
        startTime: '08:00',
        endTime: '10:00',
        room: '',
        type: 'Cours',
        teacher: '',
      });
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette séance?')) return;
    try {
      await api.delete(`/admin/timetable/${id}`);
      toast.success('Séance supprimée');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredEntries = entries.filter(e => {
    if (selectedFiliere && e.filiere !== selectedFiliere) return false;
    if (selectedLevel && e.level !== selectedLevel) return false;
    if (selectedGroup && e.group !== selectedGroup) return false;
    return true;
  });

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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1E3A5F] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1E3A5F]/30 to-[#0a1628]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1E3A5F]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-6 p-2">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
          <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
          
          <div className="relative p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1E3A5F]/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#1E3A5F]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Gestion des Emplois du Temps</h1>
                  <p className="text-slate-400">Créer et gérer les séances de cours</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#1E3A5F] to-[#2a5a8f] text-white rounded-xl hover:shadow-lg hover:shadow-[#1E3A5F]/30 transition-all"
              >
                <Plus className="w-5 h-5" />
                Ajouter une séance
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
          <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
          
          <div className="relative p-4">
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={selectedFiliere}
                onChange={(e) => setSelectedFiliere(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#1E3A5F]"
              >
                <option value="" className="bg-slate-800">Toutes les filières</option>
                {FILIERES.map(f => (
                  <option key={f} value={f} className="bg-slate-800">{f}</option>
                ))}
              </select>
              
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#1E3A5F]"
              >
                <option value="" className="bg-slate-800">Tous les niveaux</option>
                {LEVELS.map(l => (
                  <option key={l} value={l} className="bg-slate-800">{l}</option>
                ))}
              </select>
              
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#1E3A5F]"
              >
                <option value="" className="bg-slate-800">Tous les groupes</option>
                {GROUPS.map(g => (
                  <option key={g} value={g} className="bg-slate-800">Groupe {g}</option>
                ))}
              </select>
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
                  ? 'bg-gradient-to-r from-[#1E3A5F] to-[#2a5a8f] text-white shadow-lg shadow-[#1E3A5F]/30'
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
            <div className="space-y-4">
              {filteredEntries
                .filter(e => e.dayOfWeek === selectedDay)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((entry) => (
                  <div 
                    key={entry._id}
                    className="group relative overflow-hidden rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1E3A5F] to-[#C41E3A]"></div>
                    <div className="p-4 pl-5 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="text-center min-w-[100px]">
                        <p className="text-lg font-bold text-white">{entry.startTime}</p>
                        <p className="text-xs text-slate-500">{entry.endTime}</p>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{entry.module?.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          {entry.filiere} - {entry.level} {entry.group && `Groupe ${entry.group}`}
                        </p>
                        {entry.teacher && (
                          <p className="text-xs text-[#1E3A5F] mt-1">
                            Prof. {entry.teacher.firstName} {entry.teacher.lastName}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(entry.type)}`}>
                          {entry.type}
                        </span>
                        <div className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{entry.room}</span>
                        </div>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              
              {filteredEntries.filter(e => e.dayOfWeek === selectedDay).length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">Aucune séance pour {selectedDay}</p>
                  <button
                    onClick={() => {
                      setForm({ ...form, dayOfWeek: selectedDay });
                      setShowModal(true);
                    }}
                    className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-all"
                  >
                    Ajouter une séance
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl"></div>
            <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
            
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Ajouter une séance</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Module</label>
                    <select
                      value={form.module}
                      onChange={(e) => setForm({ ...form, module: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#1E3A5F]"
                      required
                    >
                      <option value="" className="bg-slate-800">Sélectionner...</option>
                      {modules.map(m => (
                        <option key={m._id} value={m._id} className="bg-slate-800">{m.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#1E3A5F]"
                    >
                      {TYPES.map(t => (
                        <option key={t} value={t} className="bg-slate-800">{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Filière</label>
                    <select
                      value={form.filiere}
                      onChange={(e) => setForm({ ...form, filiere: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#1E3A5F]"
                      required
                    >
                      <option value="" className="bg-slate-800">Sélectionner...</option>
                      {FILIERES.map(f => (
                        <option key={f} value={f} className="bg-slate-800">{f}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Niveau</label>
                    <select
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#1E3A5F]"
                      required
                    >
                      <option value="" className="bg-slate-800">Sélectionner...</option>
                      {LEVELS.map(l => (
                        <option key={l} value={l} className="bg-slate-800">{l}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Groupe</label>
                    <select
                      value={form.group}
                      onChange={(e) => setForm({ ...form, group: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#1E3A5F]"
                    >
                      <option value="" className="bg-slate-800">Tous</option>
                      {GROUPS.map(g => (
                        <option key={g} value={g} className="bg-slate-800">{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Jour</label>
                    <select
                      value={form.dayOfWeek}
                      onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#1E3A5F]"
                    >
                      {DAYS.map(d => (
                        <option key={d} value={d} className="bg-slate-800">{d}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Salle</label>
                    <input
                      type="text"
                      value={form.room}
                      onChange={(e) => setForm({ ...form, room: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#1E3A5F]"
                      placeholder="Ex: A101"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Heure début</label>
                    <select
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#1E3A5F]"
                    >
                      {TIMES.map(t => (
                        <option key={t} value={t} className="bg-slate-800">{t}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Heure fin</label>
                    <select
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#1E3A5F]"
                    >
                      {TIMES.map(t => (
                        <option key={t} value={t} className="bg-slate-800">{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Enseignant (optionnel)</label>
                  <select
                    value={form.teacher}
                    onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#1E3A5F]"
                  >
                    <option value="" className="bg-slate-800">Non assigné</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id} className="bg-slate-800">
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#1E3A5F] to-[#2a5a8f] text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTimetable;

