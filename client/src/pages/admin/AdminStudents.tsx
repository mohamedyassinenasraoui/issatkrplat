import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Users } from 'lucide-react';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  filiere: string;
  level: string;
  group?: string;
  email: string;
}

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    studentId: '',
    filiere: '',
    level: 'L1',
    group: '',
    username: '',
    adminPassword: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

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
      if (editingStudent) {
        await api.put(`/admin/students/${editingStudent._id}`, formData);
        toast.success('Étudiant mis à jour');
      } else {
        await api.post('/admin/students', formData);
        toast.success('Étudiant créé');
      }
      setShowForm(false);
      setEditingStudent(null);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet étudiant?')) return;
    try {
      await api.delete(`/admin/students/${id}`);
      toast.success('Étudiant supprimé');
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      studentId: '',
      filiere: '',
      level: 'L1',
      group: '',
      username: '',
      adminPassword: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion des étudiants</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Créez et gérez les comptes étudiants</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingStudent(null);
            resetForm();
          }}
          className="px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvel étudiant
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Filière</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Niveau</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Groupe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-slate-400">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">{student.filiere}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">{student.level}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-white">{student.group || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingStudent(student);
                        setFormData({
                          email: student.email,
                          password: '',
                          firstName: student.firstName,
                          lastName: student.lastName,
                          studentId: student.studentId || '',
                          filiere: student.filiere,
                          level: student.level,
                          group: student.group || '',
                          username: '',
                          adminPassword: '',
                        });
                        setShowForm(true);
                      }}
                      className="text-issat-navy dark:text-blue-400 hover:text-issat-navyLight dark:hover:text-blue-300 mr-4"
                    >
                      <Edit className="h-4 w-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(student._id)}
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
        {students.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400">Aucun étudiant enregistré</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {editingStudent ? 'Modifier l\'étudiant' : 'Nouvel étudiant'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingStudent(null);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Prénom</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                />
              </div>
              {!editingStudent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Mot de passe</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  />
                </div>
              )}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">ID Étudiant</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Groupe</label>
                  <input
                    type="text"
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Mot de passe admin</label>
                  <input
                    type="text"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg transition-colors"
                >
                  {editingStudent ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingStudent(null);
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

export default AdminStudents;
