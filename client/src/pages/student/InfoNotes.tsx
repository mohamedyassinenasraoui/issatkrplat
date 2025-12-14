import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FileText, Eye, Calendar } from 'lucide-react';

interface InfoNote {
  _id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  views: number;
  createdAt: string;
}

const InfoNotes: React.FC = () => {
  const [notes, setNotes] = useState<InfoNote[]>([]);

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

  const handleView = async (noteId: string) => {
    try {
      await api.post(`/info-notes/${noteId}/views`);
      fetchNotes();
    } catch (error) {
      console.error('Failed to increment views:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500';
      case 'high':
        return 'border-amber-500';
      case 'medium':
        return 'border-issat-navy dark:border-blue-400';
      default:
        return 'border-gray-300 dark:border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Notes d'information</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Dernières informations de l'université</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div
            key={note._id}
            className={`bg-white dark:bg-slate-800 rounded-lg p-6 border-l-4 ${getPriorityColor(note.priority)} cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm border border-gray-100 dark:border-slate-700`}
            onClick={() => handleView(note._id)}
          >
            <div className="flex items-start justify-between mb-3">
              <FileText className="h-6 w-6 text-issat-navy dark:text-blue-400" />
              <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs rounded">
                {note.category}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{note.title}</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-4 line-clamp-3">{note.content}</p>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{note.views}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(note.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {notes.length === 0 && (
        <p className="text-gray-500 dark:text-slate-400 text-center py-12">Aucune note d'information</p>
      )}
    </div>
  );
};

export default InfoNotes;
