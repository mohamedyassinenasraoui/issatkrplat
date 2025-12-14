import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';

interface TeacherAbsence {
  _id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  reason: string;
  description?: string;
  affectedFilieres: string[];
  status: string;
  adminResponse?: string;
  notifyStudents: boolean;
  createdAt: string;
}

const TeacherAbsences: React.FC = () => {
  const [absences, setAbsences] = useState<TeacherAbsence[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
    description: '',
    notifyStudents: true,
  });

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    try {
      const response = await api.get('/teacher/absences');
      setAbsences(response.data);
    } catch (error) {
      console.error('Failed to fetch absences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teacher/absences', formData);
      toast.success('Absence signalée à l\'administration');
      setShowForm(false);
      setFormData({
        date: '',
        startTime: '',
        endTime: '',
        reason: '',
        description: '',
        notifyStudents: true,
      });
      fetchAbsences();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'acknowledged':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Pris en compte
          </span>
        );
      case 'rescheduled':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400 rounded-full text-xs">
            <Calendar className="w-3 h-3" />
            Reprogrammé
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mes absences</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Signalez vos absences à l'administration</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Signaler une absence
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-400/10 border border-blue-200 dark:border-blue-400/20 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-blue-800 dark:text-blue-300">Communication avec l'administration</p>
          <p className="text-sm text-blue-700 dark:text-blue-400/80 mt-1">
            Vos absences seront notifiées à l'administration. Si vous choisissez de notifier les étudiants,
            un message sera automatiquement publié dans ClassHub.
          </p>
        </div>
      </div>

      {/* Absences List */}
      {absences.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-100 dark:border-slate-700">
          <Calendar className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">Aucune absence signalée</p>
        </div>
      ) : (
        <div className="space-y-4">
          {absences.map((absence) => (
            <div
              key={absence._id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-400/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {new Date(absence.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {absence.startTime && absence.endTime && (
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {absence.startTime} - {absence.endTime}
                      </p>
                    )}
                  </div>
                </div>
                {getStatusBadge(absence.status)}
              </div>
              <div className="pl-12">
                <p className="text-gray-600 dark:text-slate-300 font-medium">{absence.reason}</p>
                {absence.description && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{absence.description}</p>
                )}
                {absence.notifyStudents && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                    ✓ Étudiants notifiés via ClassHub
                  </p>
                )}
                {absence.adminResponse && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Réponse de l'administration:</p>
                    <p className="text-sm text-gray-600 dark:text-slate-300">{absence.adminResponse}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Absence Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Signaler une absence</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Heure début (optionnel)
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Heure fin (optionnel)
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Raison
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Ex: Raison médicale, Conférence..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Détails supplémentaires..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyStudents"
                  checked={formData.notifyStudents}
                  onChange={(e) => setFormData({ ...formData, notifyStudents: e.target.checked })}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="notifyStudents" className="ml-2 text-sm text-gray-700 dark:text-slate-300">
                  Notifier les étudiants automatiquement
                </label>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                >
                  Signaler
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAbsences;

