import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Award, Plus, X, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TeacherProfile } from '../../types/auth';

interface Result {
  _id: string;
  student: { firstName: string; lastName: string; studentId?: string };
  module: { name: string; code: string };
  score: number;
  examType: string;
  semester: string;
  academicYear: string;
}

const TeacherGrades: React.FC = () => {
  const { profile: rawProfile } = useAuth();
  const profile = rawProfile as TeacherProfile | null;
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    student: '',
    module: '',
    score: 0,
    examType: 'Exam',
    semester: 'S1',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resultsRes, studentsRes] = await Promise.all([
        api.get('/results/all'),
        api.get('/teacher/classhub/students'),
      ]);
      setResults(resultsRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/results', formData);
      toast.success('Note enregistrée');
      setShowForm(false);
      setFormData({
        student: '',
        module: '',
        score: 0,
        examType: 'Exam',
        semester: 'S1',
        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette note?')) return;
    try {
      await api.delete(`/results/${id}`);
      toast.success('Note supprimée');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const filteredResults = results.filter((r) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      r.student?.firstName?.toLowerCase().includes(search) ||
      r.student?.lastName?.toLowerCase().includes(search) ||
      r.module?.name?.toLowerCase().includes(search)
    );
  });

  const getScoreColor = (score: number) => {
    if (score >= 14) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 10) return 'text-blue-600 dark:text-blue-400';
    return 'text-red-600 dark:text-red-400';
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Notes</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Gérez les notes de vos étudiants</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle note
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par étudiant ou module..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Semestre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredResults.map((result) => (
                <tr key={result._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">
                    {result.student
                      ? `${result.student.firstName} ${result.student.lastName}`
                      : <span className="text-gray-400 italic">Étudiant supprimé</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">
                    {result.module
                      ? `${result.module.name}`
                      : <span className="text-gray-400 italic">Module supprimé</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-bold ${getScoreColor(result.score)}`}>
                      {result.score}/20
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">
                    {result.examType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">
                    {result.semester}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(result._id)}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredResults.length === 0 && (
          <div className="p-12 text-center">
            <Award className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400">Aucune note enregistrée</p>
          </div>
        )}
      </div>

      {/* New Grade Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Nouvelle note</h3>
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
                  Étudiant
                </label>
                <select
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Module
                </label>
                <select
                  value={formData.module}
                  onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Sélectionner...</option>
                  {profile?.modules?.map((m: any) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Note
                  </label>
                  <input
                    type="number"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                    required
                    min="0"
                    max="20"
                    step="0.25"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="DS">DS</option>
                    <option value="Exam">Exam</option>
                    <option value="Rattrapage">Rattrapage</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Semestre
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Année
                  </label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    required
                    placeholder="2024-2025"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Enregistrer
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

export default TeacherGrades;

