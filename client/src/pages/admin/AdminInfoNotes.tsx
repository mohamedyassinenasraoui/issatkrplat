import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, FileText, X } from 'lucide-react';

interface InfoNote {
  _id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  createdAt: string;
}

const AdminInfoNotes: React.FC = () => {
  const [notes, setNotes] = useState<InfoNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<InfoNote | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/info-notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await api.put(`/info-notes/${editingNote._id}`, formData);
        toast.success('Note mise à jour');
      } else {
        await api.post('/info-notes', formData);
        toast.success('Note créée');
      }
      setShowForm(false);
      setEditingNote(null);
      resetForm();
      fetchNotes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note?')) return;
    try {
      await api.delete(`/info-notes/${id}`);
      toast.success('Note supprimée');
      fetchNotes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Notes d'information</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Gérez les annonces universitaires</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingNote(null);
            resetForm();
          }}
          className="px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle note
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div key={note._id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <FileText className="h-6 w-6 text-issat-navy dark:text-blue-400" />
              <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs rounded">
                {note.category}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{note.title}</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 line-clamp-3">{note.content}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-slate-400 capitalize">{note.priority}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingNote(note);
                    setFormData({
                      title: note.title,
                      content: note.content,
                      category: note.category,
                      priority: note.priority,
                    });
                    setShowForm(true);
                  }}
                  className="text-issat-navy dark:text-blue-400 hover:text-issat-navyLight dark:hover:text-blue-300"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(note._id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notes.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-700">
          <FileText className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">Aucune note d'information</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {editingNote ? 'Modifier la note' : 'Nouvelle note'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingNote(null);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Titre</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Contenu</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={5}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  >
                    <option value="general">Général</option>
                    <option value="academic">Académique</option>
                    <option value="event">Événement</option>
                    <option value="administrative">Administratif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Priorité</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg transition-colors"
                >
                  {editingNote ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingNote(null);
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

export default AdminInfoNotes;
