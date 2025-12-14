import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, X, GraduationCap, Mail, Phone, Building } from 'lucide-react';

interface Teacher {
  _id: string;
  user: { email: string };
  firstName: string;
  lastName: string;
  teacherId?: string;
  department?: string;
  specialization?: string;
  filieres: string[];
  modules: Array<{ name: string; code: string }>;
  phone?: string;
  office?: string;
}

const AdminTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    teacherId: '',
    department: '',
    specialization: '',
    filieres: [] as string[],
    modules: [] as string[],
    phone: '',
    office: '',
  });

  const filiereOptions = ['Informatique', 'Genie Civil', 'Genie Mecanique', 'Genie Electrique'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachersRes, modulesRes] = await Promise.all([
        api.get('/teacher/all'),
        api.get('/admin/modules'),
      ]);
      setTeachers(teachersRes.data);
      setModules(modulesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await api.put(`/teacher/${editingTeacher._id}`, formData);
        toast.success('Enseignant modifié');
      } else {
        await api.post('/teacher', formData);
        toast.success('Enseignant créé');
      }
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enseignant?')) return;
    try {
      await api.delete(`/teacher/${id}`);
      toast.success('Enseignant supprimé');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      email: teacher.user.email,
      password: '',
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      teacherId: teacher.teacherId || '',
      department: teacher.department || '',
      specialization: teacher.specialization || '',
      filieres: teacher.filieres || [],
      modules: teacher.modules?.map((m: any) => m._id) || [],
      phone: teacher.phone || '',
      office: teacher.office || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingTeacher(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      teacherId: '',
      department: '',
      specialization: '',
      filieres: [],
      modules: [],
      phone: '',
      office: '',
    });
  };

  const toggleFiliere = (filiere: string) => {
    setFormData((prev) => ({
      ...prev,
      filieres: prev.filieres.includes(filiere)
        ? prev.filieres.filter((f) => f !== filiere)
        : [...prev.filieres, filiere],
    }));
  };

  const toggleModule = (moduleId: string) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.includes(moduleId)
        ? prev.modules.filter((m) => m !== moduleId)
        : [...prev.modules, moduleId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-issat-navy border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion des enseignants</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Gérez les enseignants de l'établissement</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvel enseignant
        </button>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div
            key={teacher._id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-400/10 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {teacher.firstName} {teacher.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{teacher.department}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(teacher)}
                  className="p-2 text-gray-400 hover:text-issat-navy hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(teacher._id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{teacher.user.email}</span>
              </div>
              {teacher.phone && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{teacher.phone}</span>
                </div>
              )}
              {teacher.office && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span>{teacher.office}</span>
                </div>
              )}
            </div>
            {teacher.filieres && teacher.filieres.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1">
                {teacher.filieres.map((filiere, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-emerald-100 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400 text-xs rounded-full"
                  >
                    {filiere}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {teachers.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-100 dark:border-slate-700">
          <GraduationCap className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">Aucun enseignant enregistré</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full shadow-xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {editingTeacher ? 'Modifier l\'enseignant' : 'Nouvel enseignant'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required={!editingTeacher}
                    disabled={!!editingTeacher}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Mot de passe {editingTeacher && '(laisser vide pour garder)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingTeacher}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    ID Enseignant
                  </label>
                  <input
                    type="text"
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Département
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Bureau
                  </label>
                  <input
                    type="text"
                    value={formData.office}
                    onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Filières (pour ClassHub)
                </label>
                <div className="flex flex-wrap gap-2">
                  {filiereOptions.map((filiere) => (
                    <button
                      key={filiere}
                      type="button"
                      onClick={() => toggleFiliere(filiere)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.filieres.includes(filiere)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {filiere}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Modules enseignés
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  {modules.map((mod) => (
                    <label
                      key={mod._id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.modules.includes(mod._id)}
                        onChange={() => toggleModule(mod._id)}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        {mod.name} ({mod.code})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg transition-colors"
                >
                  {editingTeacher ? 'Modifier' : 'Créer'}
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

export default AdminTeachers;

