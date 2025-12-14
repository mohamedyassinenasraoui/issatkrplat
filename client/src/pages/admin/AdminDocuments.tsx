import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Download, FileText } from 'lucide-react';

interface DocumentRequest {
  _id: string;
  student: { firstName: string; lastName: string; studentId?: string };
  type: string;
  status: string;
  comment?: string;
  document?: string;
  createdAt: string;
}

const AdminDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRequest[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents/all');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleProcess = async (id: string, status: string) => {
    try {
      const formData = new FormData();
      formData.append('status', status);
      if (documentFile) {
        formData.append('document', documentFile);
      }

      await api.put(`/documents/${id}/process`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Document traité');
      setDocumentFile(null);
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
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

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestion des documents</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Traitement des demandes de documents</p>
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc._id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {doc.student.firstName} {doc.student.lastName}
                </h3>
                <p className="text-gray-600 dark:text-slate-300">{getTypeLabel(doc.type)}</p>
                {doc.comment && <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{doc.comment}</p>}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(doc.status)}`}>
                {doc.status}
              </span>
            </div>
            {doc.status === 'pending' && (
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-issat-navy file:text-white"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleProcess(doc._id, 'ready')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                  >
                    Marquer comme prêt
                  </button>
                  <button
                    onClick={() => handleProcess(doc._id, 'rejected')}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            )}
            {doc.document && doc.status === 'ready' && (
              <a
                href={doc.document}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-issat-navy hover:bg-issat-navyLight text-white rounded-lg mt-3 transition-colors"
              >
                <Download className="h-4 w-4" />
                Télécharger le document
              </a>
            )}
          </div>
        ))}
      </div>
      {documents.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-700">
          <FileText className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400">Aucune demande de document</p>
        </div>
      )}
    </div>
  );
};

export default AdminDocuments;
