import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FileText, Download, Clock, CheckCircle, XCircle, X, Plus } from 'lucide-react';

interface DocumentRequest {
  _id: string;
  type: string;
  status: string;
  comment?: string;
  document?: string;
  createdAt: string;
}

const DocumentRequests: React.FC = () => {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/documents/student');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/documents/request', { type, comment });
      toast.success('Demande créée avec succès');
      setShowForm(false);
      setType('');
      setComment('');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
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
      processing: 'En traitement',
      ready: 'Prêt',
      rejected: 'Refusé',
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      attestation_scolarite: 'Attestation de scolarité',
      certificat_inscription: 'Certificat d\'inscription',
      releve_notes: 'Relevé de notes',
      autre: 'Autre',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Demandes de documents</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Gérez vos demandes de documents administratifs</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle demande
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Mes demandes</h2>
        <div className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-gray-500 dark:text-slate-400 text-center py-8">Aucune demande</p>
          ) : (
            requests.map((request) => (
              <div
                key={request._id}
                className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="h-5 w-5 text-issat-navy dark:text-blue-400" />
                  <div>
                    <p className="text-gray-800 dark:text-white font-medium">{getTypeLabel(request.type)}</p>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">
                      {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    {request.comment && (
                      <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{request.comment}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <span className="text-gray-700 dark:text-slate-300">{getStatusLabel(request.status)}</span>
                  </div>
                  {request.document && request.status === 'ready' && (
                    <a
                      href={request.document}
                      download
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm flex items-center space-x-2 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Télécharger</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Nouvelle demande</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Type de document
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                >
                  <option value="">Sélectionner...</option>
                  <option value="attestation_scolarite">Attestation de scolarité</option>
                  <option value="certificat_inscription">Certificat d'inscription</option>
                  <option value="releve_notes">Relevé de notes</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg transition-colors"
                >
                  Soumettre
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setType('');
                    setComment('');
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

export default DocumentRequests;
