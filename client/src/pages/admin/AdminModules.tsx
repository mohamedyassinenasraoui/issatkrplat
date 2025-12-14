import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, BookOpen, X } from 'lucide-react';

interface Module {
  _id: string;
  name: string;
  code: string;
  filiere: string;
  level: string;
  coefficient: number;
  professor?: string;
}

const AdminModules: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    filiere: '',
    level: 'L1',
    coefficient: 1,
    professor: '',
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await api.get('/admin/modules');
      setModules(response.data);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingModule) {
        await api.put(`/admin/modules/${editingModule._id}`, formData);
        toast.success('Module mis à jour');
      } else {
        await api.post('/admin/modules', formData);
        toast.success('Module créé');
      }
      setShowForm(false);
      setEditingModule(null);
      resetForm();
      fetchModules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce module?')) return;
    try {
      await api.delete(`/admin/modules/${id}`);
      toast.success('Module supprimé');
      fetchModules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      filiere: '',
      level: 'L1',
      coefficient: 1,
      professor: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion des modules</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Créez et gérez les modules</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingModule(null);
            resetForm();
          }}
          className="px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau module
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Filière</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Niveau</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Coefficient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {modules.map((module) => (
                <tr key={module._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white font-medium">{module.code}</td>
                  <td className="px-6 py-4 text-gray-800 dark:text-white">{module.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">{module.filiere}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">{module.level}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">{module.coefficient}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingModule(module);
                        setFormData({
                          name: module.name,
                          code: module.code,
                          filiere: module.filiere,
                          level: module.level,
                          coefficient: module.coefficient,
                          professor: module.professor || '',
                        });
                        setShowForm(true);
                      }}
                      className="text-issat-navy dark:text-blue-400 hover:text-issat-navyLight dark:hover:text-blue-300 mr-4"
                    >
                      <Edit className="h-4 w-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(module._id)}
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
        {modules.length === 0 && (
          <div className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400">Aucun module enregistré</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {editingModule ? 'Modifier le module' : 'Nouveau module'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingModule(null);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Filière</label>
                  <input
                    type="text"
                    value={formData.filiere}
                    onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Niveau</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  >
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Coefficient</label>
                  <input
                    type="number"
                    value={formData.coefficient}
                    onChange={(e) => setFormData({ ...formData, coefficient: Number(e.target.value) })}
                    required
                    min="0"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Professeur</label>
                  <input
                    type="text"
                    value={formData.professor}
                    onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg transition-colors"
                >
                  {editingModule ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingModule(null);
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

export default AdminModules;
