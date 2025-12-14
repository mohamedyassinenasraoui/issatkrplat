import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

interface Justification {
  _id: string;
  student: { firstName: string; lastName: string; studentId?: string };
  absence: { date: string; module: { name: string; code: string } };
  reason: string;
  status: string;
  createdAt: string;
}

const AdminAbsences: React.FC = () => {
  const [justifications, setJustifications] = useState<Justification[]>([]);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchJustifications();
  }, []);

  const fetchJustifications = async () => {
    try {
      const response = await api.get('/absences/justifications');
      setJustifications(response.data);
    } catch (error) {
      console.error('Failed to fetch justifications:', error);
    }
  };

  const handleReview = async (id: string, status: string) => {
    try {
      await api.put(`/absences/justifications/${id}/review`, {
        status,
        reviewComment,
      });
      toast.success(`Justification ${status === 'accepted' ? 'acceptée' : 'refusée'}`);
      setReviewComment('');
      fetchJustifications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      accepted: 'Acceptée',
      rejected: 'Refusée',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion des absences</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Examinez et validez les justifications</p>
      </div>

      <div className="space-y-4">
        {justifications.map((just) => (
          <div key={just._id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {just.student.firstName} {just.student.lastName}
                  {just.student.studentId && ` (${just.student.studentId})`}
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {just.absence.module.name} ({just.absence.module.code}) -{' '}
                  {new Date(just.absence.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-700">
                {getStatusIcon(just.status)}
                <span className="text-sm text-gray-700 dark:text-slate-300">{getStatusLabel(just.status)}</span>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
              <p className="text-gray-700 dark:text-slate-300">{just.reason}</p>
            </div>
            {just.status === 'pending' && (
              <div className="space-y-3">
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Commentaire (optionnel)"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  rows={2}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReview(just._id, 'accepted')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleReview(just._id, 'rejected')}
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
      {justifications.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-700">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">Aucune justification en attente</p>
        </div>
      )}
    </div>
  );
};

export default AdminAbsences;

