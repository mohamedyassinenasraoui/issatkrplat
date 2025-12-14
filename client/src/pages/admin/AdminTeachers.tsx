import React, { useEffect, useState } from 'react';
import api, { UPLOADS_BASE_URL } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, X, GraduationCap, Mail, Phone, Building, Upload, User } from 'lucide-react';

interface Teacher {
  _id: string;
  user: { email: string };
  firstName: string;
  lastName: string;
  teacherId?: string;
  department?: string;
  specialization?: string;
  filieres: string[];
  modules: Array<{ name: string; code: string; _id: string }>;
  phone?: string;
  office?: string;
  picture?: string;
}

const AdminTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
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

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => submitData.append(key, v));
        } else if (value) {
          submitData.append(key, value);
        }
      });
      if (pictureFile) {
        submitData.append('picture', pictureFile);
      }

      if (editingTeacher) {
        await api.put(`/teacher/${editingTeacher._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Enseignant modifié');
      } else {
        await api.post('/teacher', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
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
    setPicturePreview(teacher.picture ? (teacher.picture.startsWith('http') ? teacher.picture : `${UPLOADS_BASE_URL}${teacher.picture}`) : null);
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
    setPicturePreview(null);
    setPictureFile(null);
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1E3A5F] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des enseignants</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Gérez les enseignants de l'établissement</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#2B4C73] text-white rounded-lg flex items-center gap-2 transition-colors"
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
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[#1E3A5F]/10 dark:bg-[#1E3A5F]/20 flex items-center justify-center border-2 border-[#1E3A5F]/20">
                  {teacher.picture ? (
                    <img src={teacher.picture.startsWith('http') ? teacher.picture : `${UPLOADS_BASE_URL}${teacher.picture}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="w-6 h-6 text-[#1E3A5F] dark:text-blue-400" />
                  )}
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
                  className="p-2 text-gray-400 hover:text-[#1E3A5F] hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(teacher._id)}
                  className="p-2 text-gray-400 hover:text-[#C41E3A] hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{teacher.user.email}</span>
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
                    className="px-2 py-1 bg-[#1E3A5F]/10 text-[#1E3A5F] dark:text-blue-400 text-xs rounded-full"
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
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-200 dark:border-slate-700">
          <GraduationCap className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">Aucun enseignant enregistré</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full shadow-xl my-8">
            <div className="flex items-center justify-between mb-6">
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
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Picture Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700 mb-3 border-4 border-[#1E3A5F]/20">
                  {picturePreview ? (
                    <img src={picturePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer px-4 py-2 bg-[#1E3A5F]/10 hover:bg-[#1E3A5F]/20 text-[#1E3A5F] dark:text-blue-400 rounded-lg flex items-center gap-2 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Choisir une photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePictureChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required={!editingTeacher}
                    disabled={!!editingTeacher}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Mot de passe {editingTeacher && '(laisser vide)'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingTeacher}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
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
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
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
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
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
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
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
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
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
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        formData.filieres.includes(filiere)
                          ? 'bg-[#1E3A5F] text-white'
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
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                  {modules.map((mod) => (
                    <label
                      key={mod._id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-white dark:hover:bg-slate-600 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.modules.includes(mod._id)}
                        onChange={() => toggleModule(mod._id)}
                        className="w-4 h-4 text-[#1E3A5F] border-gray-300 rounded focus:ring-[#1E3A5F]"
                      />
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        {mod.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#2B4C73] text-white rounded-lg transition-colors font-medium"
                >
                  {editingTeacher ? 'Mettre à jour' : 'Créer l\'enseignant'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
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
