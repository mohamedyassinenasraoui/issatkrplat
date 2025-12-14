import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Send, CheckCircle, Clock, X } from 'lucide-react';

interface Suggestion {
  _id: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  status: string;
  adminResponse?: string;
  createdAt: string;
}

const Suggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/suggestions/student');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/suggestions', { title, content, isAnonymous });
      toast.success('Suggestion envoyée avec succès');
      setShowForm(false);
      setTitle('');
      setContent('');
      setIsAnonymous(false);
      fetchSuggestions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'reviewed':
        return <CheckCircle className="h-5 w-5 text-issat-navy dark:text-blue-400" />;
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      reviewed: 'Examinée',
      implemented: 'Implémentée',
      rejected: 'Refusée',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Suggestions</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Envoyez vos suggestions à l'université</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Send className="h-4 w-4" />
          Nouvelle suggestion
        </button>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion._id} className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{suggestion.title}</h3>
                {suggestion.isAnonymous && (
                  <span className="text-xs text-gray-500 dark:text-slate-400">Anonyme</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(suggestion.status)}
                <span className="text-sm text-gray-600 dark:text-slate-300">
                  {getStatusLabel(suggestion.status)}
                </span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-slate-300 mb-3">{suggestion.content}</p>
            {suggestion.adminResponse && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded border-l-4 border-issat-navy dark:border-blue-400">
                <p className="text-sm font-medium text-gray-800 dark:text-white mb-1">Réponse de l'administration:</p>
                <p className="text-gray-600 dark:text-slate-300">{suggestion.adminResponse}</p>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-3">
              {new Date(suggestion.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        ))}
      </div>

      {suggestions.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-12 text-center shadow-sm border border-gray-100 dark:border-slate-700">
          <p className="text-gray-500 dark:text-slate-400">Aucune suggestion envoyée</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Nouvelle suggestion</h3>
              <button 
                onClick={() => setShowForm(false)}
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Contenu</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mr-2 rounded"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-600 dark:text-slate-300">
                  Rendre cette suggestion anonyme
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg transition-colors"
                >
                  Envoyer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setTitle('');
                    setContent('');
                    setIsAnonymous(false);
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

export default Suggestions;
