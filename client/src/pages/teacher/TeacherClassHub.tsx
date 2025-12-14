import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Send, Pin, Trash2, Users, MessageSquare, Plus, X } from 'lucide-react';

interface ClassHubMessage {
  _id: string;
  title: string;
  content: string;
  type: string;
  filieres: string[];
  level: string;
  module?: { name: string; code: string };
  isPinned: boolean;
  replies: Array<{
    student: { firstName: string; lastName: string };
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
}

const TeacherClassHub: React.FC = () => {
  const [messages, setMessages] = useState<ClassHubMessage[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement',
    isPinned: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [messagesRes, studentsRes] = await Promise.all([
        api.get('/teacher/classhub'),
        api.get('/teacher/classhub/students'),
      ]);
      setMessages(messagesRes.data);
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
      await api.post('/teacher/classhub', formData);
      toast.success('Message publié!');
      setShowForm(false);
      setFormData({ title: '', content: '', type: 'announcement', isPinned: false });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce message?')) return;
    try {
      await api.delete(`/teacher/classhub/${id}`);
      toast.success('Message supprimé');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      announcement: 'Annonce',
      assignment: 'Devoir',
      resource: 'Ressource',
      discussion: 'Discussion',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400';
      case 'assignment':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400';
      case 'resource':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400';
      case 'discussion':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-400/10 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-400/10 dark:text-gray-400';
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">ClassHub</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Communiquez avec vos étudiants</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau message
        </button>
      </div>

      {/* Students Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-400/10 rounded-lg">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{students.length} étudiants</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              connectés automatiquement selon leur filière
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-100 dark:border-slate-700">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400">Aucun message publié</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm"
            >
              Publier votre premier message
            </button>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`bg-white dark:bg-slate-800 rounded-xl border ${
                message.isPinned ? 'border-emerald-500' : 'border-gray-100 dark:border-slate-700'
              }`}
            >
              <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {message.isPinned && (
                      <Pin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">{message.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(message.type)}`}>
                          {getTypeLabel(message.type)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          {new Date(message.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(message._id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600 dark:text-slate-300 whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.replies && message.replies.length > 0 && (
                <div className="px-4 pb-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">
                    {message.replies.length} réponse(s)
                  </p>
                  <div className="space-y-2">
                    {message.replies.slice(0, 3).map((reply, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {reply.student?.firstName} {reply.student?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-slate-300">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Message Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Nouveau message</h3>
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
                  Titre
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Titre du message"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="announcement">Annonce</option>
                  <option value="assignment">Devoir</option>
                  <option value="resource">Ressource</option>
                  <option value="discussion">Discussion</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Contenu
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={5}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Écrivez votre message..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isPinned" className="ml-2 text-sm text-gray-700 dark:text-slate-300">
                  Épingler ce message
                </label>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Publier
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

export default TeacherClassHub;

