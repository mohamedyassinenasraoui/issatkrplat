import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Lightbulb } from 'lucide-react';

interface Suggestion {
  _id: string;
  student?: { firstName: string; lastName: string };
  isAnonymous: boolean;
  title: string;
  content: string;
  status: string;
  adminResponse?: string;
  createdAt: string;
}

const AdminSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/suggestions/all');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleReview = async (id: string, status: string) => {
    try {
      await api.put(`/suggestions/${id}/review`, {
        status,
        adminResponse: response,
      });
      toast.success('Suggestion examinée');
      setResponse('');
      fetchSuggestions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'implemented':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'reviewed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Suggestions</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Examinez les suggestions des étudiants</p>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion._id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{suggestion.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                  {suggestion.isAnonymous
                    ? 'Anonyme'
                    : `${suggestion.student?.firstName} ${suggestion.student?.lastName}`}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusStyles(suggestion.status)}`}>
                {suggestion.status}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
              <p className="text-gray-700 dark:text-slate-300">{suggestion.content}</p>
            </div>
            {suggestion.adminResponse && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border-l-4 border-issat-navy dark:border-blue-400">
                <p className="text-sm font-medium text-gray-800 dark:text-white mb-1">Réponse:</p>
                <p className="text-gray-600 dark:text-slate-300">{suggestion.adminResponse}</p>
              </div>
            )}
            {suggestion.status === 'pending' && (
              <div className="mt-4 space-y-3">
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Réponse (optionnel)"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  rows={3}
                />
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => handleReview(suggestion._id, 'reviewed')}
                    className="px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg transition-colors"
                  >
                    Marquer comme examinée
                  </button>
                  <button
                    onClick={() => handleReview(suggestion._id, 'implemented')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                  >
                    Implémentée
                  </button>
                  <button
                    onClick={() => handleReview(suggestion._id, 'rejected')}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {suggestions.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-700">
          <Lightbulb className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">Aucune suggestion</p>
        </div>
      )}
    </div>
  );
};

export default AdminSuggestions;
