import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Award, X } from 'lucide-react';

interface Result {
  _id: string;
  student: { firstName: string; lastName: string; studentId?: string };
  module: { name: string; code: string };
  score: number;
  examType: string;
  semester: string;
  academicYear: string;
}

const AdminResults: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student: '',
    module: '',
    score: 0,
    examType: 'Exam',
    semester: 'S1',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
  });

  useEffect(() => {
    fetchResults();
    fetchModules();
    fetchStudents();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await api.get('/results/all');
      setResults(response.data);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await api.get('/admin/modules');
      setModules(response.data);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/results', formData);
      toast.success('Résultat créé');
      setShowForm(false);
      resetForm();
      fetchResults();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce résultat?')) return;
    try {
      await api.delete(`/results/${id}`);
      toast.success('Résultat supprimé');
      fetchResults();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const resetForm = () => {
    setFormData({
      student: '',
      module: '',
      score: 0,
      examType: 'Exam',
      semester: 'S1',
      academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion des résultats</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Enregistrez et gérez les notes</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            resetForm();
          }}
          className="px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau résultat
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Étudiant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Module</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Note</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Semestre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {results.map((result) => (
                <tr key={result._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">
                    {result.student 
                      ? `${result.student.firstName} ${result.student.lastName}` 
                      : <span className="text-gray-400 italic">Étudiant supprimé</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">
                    {result.module 
                      ? `${result.module.name} (${result.module.code})`
                      : <span className="text-gray-400 italic">Module supprimé</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white font-bold">{result.score}/20</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">{result.examType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">{result.semester}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(result._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {results.length === 0 && (
          <div className="p-12 text-center">
            <Award className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400">Aucun résultat enregistré</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Nouveau résultat</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Étudiant</label>
                <select
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                >
                  <option value="">Sélectionner...</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Module</label>
                <select
                  value={formData.module}
                  onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                >
                  <option value="">Sélectionner...</option>
                  {modules.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Note</label>
                  <input
                    type="number"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                    required
                    min="0"
                    max="20"
                    step="0.25"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Type</label>
                  <select
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  >
                    <option value="DS">DS</option>
                    <option value="Exam">Exam</option>
                    <option value="Rattrapage">Rattrapage</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Semestre</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  >
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Année académique</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    required
                    placeholder="2023-2024"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg transition-colors"
                >
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
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

export default AdminResults;
