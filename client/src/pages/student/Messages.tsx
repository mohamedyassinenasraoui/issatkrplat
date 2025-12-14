import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Calendar, CheckCircle } from 'lucide-react';

interface Message {
  _id: string;
  title: string;
  content: string;
  type: string;
  readBy: Array<{ student: string; readAt: string }>;
  createdAt: string;
}

const Messages: React.FC = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetchMessages();
  }, [profile]);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/messages/student');
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await api.post(`/messages/${messageId}/read`);
      fetchMessages();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const isRead = (message: Message) => {
    return message.readBy?.some((r) => r.student === profile?._id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Messages</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Messages de l'administration et des professeurs</p>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`bg-white dark:bg-slate-800 rounded-lg p-6 border-l-4 ${
              isRead(message) ? 'border-gray-300 dark:border-slate-600' : 'border-issat-navy dark:border-blue-400'
            } cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm border border-gray-100 dark:border-slate-700`}
            onClick={() => !isRead(message) && markAsRead(message._id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-issat-navy dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{message.title}</h3>
                {!isRead(message) && (
                  <span className="px-2 py-1 bg-issat-navy dark:bg-blue-500 text-white text-xs rounded-full">
                    Nouveau
                  </span>
                )}
              </div>
              {isRead(message) && <CheckCircle className="h-5 w-5 text-emerald-500" />}
            </div>
            <p className="text-gray-600 dark:text-slate-300 mb-3">{message.content}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
              <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded">{message.type}</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(message.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {messages.length === 0 && (
        <p className="text-gray-500 dark:text-slate-400 text-center py-12">Aucun message</p>
      )}
    </div>
  );
};

export default Messages;
