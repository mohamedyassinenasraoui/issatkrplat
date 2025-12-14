import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { MessageSquare, Pin, Send, BookOpen, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile } from '../../types/auth';

interface ClassHubMessage {
  _id: string;
  title: string;
  content: string;
  type: string;
  teacher: { firstName: string; lastName: string };
  module?: { name: string; code: string };
  isPinned: boolean;
  replies: Array<{
    student: { firstName: string; lastName: string };
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
}

const StudentClassHub: React.FC = () => {
  const { profile: rawProfile } = useAuth();
  const profile = rawProfile as StudentProfile | null;
  const [messages, setMessages] = useState<ClassHubMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/classhub/student');
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (messageId: string) => {
    if (!replyContent.trim()) return;
    try {
      await api.post(`/classhub/${messageId}/reply`, { content: replyContent });
      toast.success('Réponse envoyée!');
      setReplyingTo(null);
      setReplyContent('');
      fetchMessages();
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-issat-navy border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">ClassHub</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">
          Messages de vos enseignants - {profile?.filiere}
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-100 dark:border-slate-700">
          <MessageSquare className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">Aucun message de vos enseignants</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`bg-white dark:bg-slate-800 rounded-xl border ${
                message.isPinned ? 'border-emerald-500' : 'border-gray-100 dark:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {message.isPinned && (
                      <Pin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">{message.title}</h3>
                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(message.type)}`}>
                          {getTypeLabel(message.type)}
                        </span>
                        {message.module && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                            <BookOpen className="w-3 h-3" />
                            {message.module.name}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          {new Date(message.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                    <User className="w-4 h-4" />
                    <span>Prof. {message.teacher?.lastName}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-gray-600 dark:text-slate-300 whitespace-pre-wrap">{message.content}</p>
              </div>

              {/* Replies */}
              {message.replies && message.replies.length > 0 && (
                <div className="px-4 pb-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">
                    {message.replies.length} réponse(s)
                  </p>
                  <div className="space-y-2">
                    {message.replies.map((reply, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {reply.student?.firstName} {reply.student?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-slate-300">{reply.content}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                          {new Date(reply.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Section */}
              <div className="p-4 border-t border-gray-100 dark:border-slate-700">
                {replyingTo === message._id ? (
                  <div className="space-y-3">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Écrivez votre réponse..."
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReply(message._id)}
                        className="px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg flex items-center gap-2 text-sm"
                      >
                        <Send className="w-4 h-4" />
                        Envoyer
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                        className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(message._id)}
                    className="text-sm text-issat-navy dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Répondre
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentClassHub;

