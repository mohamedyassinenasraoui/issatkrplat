import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, X } from 'lucide-react';

interface Absence {
  _id: string;
  date: string;
  module: {
    _id: string;
    name: string;
    code: string;
  };
  justified: boolean;
}

const AbsenceTracker: React.FC = () => {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [selectedAbsence, setSelectedAbsence] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    try {
      const response = await api.get('/absences/student');
      setAbsences(response.data);
    } catch (error) {
      console.error('Failed to fetch absences:', error);
    }
  };

  const handleSubmitJustification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAbsence || !reason) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('absenceId', selectedAbsence);
      formData.append('reason', reason);
      if (document) {
        formData.append('document', document);
      }

      await api.post('/absences/justify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Justification soumise avec succès');
      setSelectedAbsence(null);
      setReason('');
      setDocument(null);
      fetchAbsences();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const unjustifiedCount = absences.filter((a) => !a.justified).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Suivi des absences</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Gérez vos absences et justifications</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Statistiques</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <p className="text-gray-500 dark:text-slate-400 text-sm">Total</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{absences.length}</p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <p className="text-gray-500 dark:text-slate-400 text-sm">Non justifiées</p>
            <p className={`text-2xl font-bold ${
              unjustifiedCount >= 4 ? 'text-red-600 dark:text-red-400' :
              unjustifiedCount >= 3 ? 'text-amber-600 dark:text-amber-400' :
              'text-gray-800 dark:text-white'
            }`}>
              {unjustifiedCount}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <p className="text-gray-500 dark:text-slate-400 text-sm">Justifiées</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {absences.filter((a) => a.justified).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Liste des absences</h2>
        <div className="space-y-3">
          {absences.length === 0 ? (
            <p className="text-gray-500 dark:text-slate-400 text-center py-8">Aucune absence enregistrée</p>
          ) : (
            absences.map((absence) => (
              <div
                key={absence._id}
                className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <Calendar className="h-5 w-5 text-issat-navy dark:text-blue-400" />
                  <div>
                    <p className="text-gray-800 dark:text-white font-medium">
                      {absence.module.name} ({absence.module.code})
                    </p>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">
                      {new Date(absence.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {absence.justified ? (
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm">
                      Justifiée
                    </span>
                  ) : (
                    <>
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm">
                        Non justifiée
                      </span>
                      <button
                        onClick={() => setSelectedAbsence(absence._id)}
                        className="px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg text-sm transition-colors"
                      >
                        Justifier
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedAbsence && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Déposer une justification</h3>
              <button
                onClick={() => {
                  setSelectedAbsence(null);
                  setReason('');
                  setDocument(null);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmitJustification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Motif
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  rows={4}
                  placeholder="Décrivez le motif de votre absence..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Document justificatif (optionnel)
                </label>
                <input
                  type="file"
                  onChange={(e) => setDocument(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-issat-navy file:text-white hover:file:bg-issat-navyLight"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Envoi...' : 'Soumettre'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAbsence(null);
                    setReason('');
                    setDocument(null);
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
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

export default AbsenceTracker;
