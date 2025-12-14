import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile } from '../../types/auth';
import { 
  AlertCircle, FileText, Calendar, MessageSquare, Award, 
  Clock, ArrowRight, Bell
} from 'lucide-react';

interface DashboardStats {
  totalAbsences: number;
  unjustifiedAbsences: number;
  pendingDocuments: number;
  unreadMessages: number;
}

const StudentDashboard: React.FC = () => {
  const { profile: rawProfile } = useAuth();
  const profile = rawProfile as StudentProfile | null;
  const [stats, setStats] = useState<DashboardStats>({
    totalAbsences: 0,
    unjustifiedAbsences: 0,
    pendingDocuments: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [absencesRes, documentsRes, messagesRes] = await Promise.all([
          api.get('/absences/student'),
          api.get('/documents/student'),
          api.get('/messages/student'),
        ]);

        const absences = absencesRes.data;
        const documents = documentsRes.data;
        const messages = messagesRes.data;

        setStats({
          totalAbsences: absences.length,
          unjustifiedAbsences: absences.filter((a: any) => !a.justified).length,
          pendingDocuments: documents.filter((d: any) => d.status === 'pending').length,
          unreadMessages: messages.filter((m: any) => !m.readBy?.some((r: any) => r.student === profile?._id)).length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile]);

  const getAbsenceStatus = () => {
    if (stats.unjustifiedAbsences >= 4) return { status: 'danger', message: 'Risque d\'élimination!' };
    if (stats.unjustifiedAbsences >= 3) return { status: 'warning', message: 'Attention requise' };
    return { status: 'safe', message: 'Situation normale' };
  };

  const absenceStatus = getAbsenceStatus();

  const quickActions = [
    { label: 'Justifier une absence', href: '/student/absences', icon: Calendar, color: 'navy' },
    { label: 'Demander un document', href: '/student/documents', icon: FileText, color: 'navy' },
    { label: 'Consulter mes résultats', href: '/student/results', icon: Award, color: 'red' },
    { label: 'Poser une question', href: '/student/ai-assistant', icon: MessageSquare, color: 'navy' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-issat-navy border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-issat-navy to-issat-navyLight rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Bienvenue, {profile?.firstName}!
            </h1>
            <p className="text-white/80">
              {profile?.filiere} - {profile?.level} {profile?.group && `| Groupe ${profile.group}`}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Clock className="w-5 h-5 mr-2" />
              <span className="text-sm">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner (if needed) */}
      {stats.unjustifiedAbsences >= 3 && (
        <div className={`rounded-xl p-4 flex items-start space-x-4 ${
          absenceStatus.status === 'danger' 
            ? 'bg-issat-red/10 dark:bg-red-900/30 border border-issat-red/20 dark:border-red-800' 
            : 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800'
        }`}>
          <div className={`p-2 rounded-lg ${
            absenceStatus.status === 'danger' ? 'bg-issat-red/20 dark:bg-red-800' : 'bg-amber-100 dark:bg-amber-800'
          }`}>
            <AlertCircle className={`w-6 h-6 ${
              absenceStatus.status === 'danger' ? 'text-issat-red dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
            }`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${
              absenceStatus.status === 'danger' ? 'text-issat-red dark:text-red-400' : 'text-amber-800 dark:text-amber-300'
            }`}>
              {absenceStatus.status === 'danger' 
                ? '⚠️ Risque d\'élimination' 
                : '⚠️ Avertissement'}
            </h3>
            <p className={`text-sm mt-1 ${
              absenceStatus.status === 'danger' ? 'text-issat-red/80 dark:text-red-300' : 'text-amber-700 dark:text-amber-400'
            }`}>
              Vous avez {stats.unjustifiedAbsences} absence(s) non justifiée(s). 
              {absenceStatus.status === 'danger' 
                ? ' Veuillez régulariser votre situation immédiatement.'
                : ' Pensez à justifier vos absences.'}
            </p>
            <Link 
              to="/student/absences"
              className={`inline-flex items-center mt-3 text-sm font-medium ${
                absenceStatus.status === 'danger' ? 'text-issat-red dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
              } hover:underline`}
            >
              Gérer mes absences <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-issat-navy/10 dark:bg-issat-navy/20 rounded-xl">
              <Calendar className="w-6 h-6 text-issat-navy dark:text-blue-400" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              absenceStatus.status === 'safe' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' :
              absenceStatus.status === 'warning' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400' :
              'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
            }`}>
              {absenceStatus.message}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalAbsences}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Absences totales</p>
          <div className="mt-3 flex items-center text-sm">
            <span className={`font-medium ${
              stats.unjustifiedAbsences > 0 ? 'text-issat-red dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {stats.unjustifiedAbsences} non justifiée(s)
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-issat-navy/10 dark:bg-issat-navy/20 rounded-xl">
              <FileText className="w-6 h-6 text-issat-navy dark:text-blue-400" />
            </div>
            {stats.pendingDocuments > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
                En attente
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.pendingDocuments}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Demandes en cours</p>
          <Link to="/student/documents" className="mt-3 inline-flex items-center text-sm text-issat-navy dark:text-blue-400 hover:underline">
            Voir les demandes <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-issat-red/10 dark:bg-red-900/30 rounded-xl">
              <MessageSquare className="w-6 h-6 text-issat-red dark:text-red-400" />
            </div>
            {stats.unreadMessages > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-issat-red/10 dark:bg-red-900/50 text-issat-red dark:text-red-400">
                Nouveau
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.unreadMessages}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Messages non lus</p>
          <Link to="/student/messages" className="mt-3 inline-flex items-center text-sm text-issat-navy dark:text-blue-400 hover:underline">
            Lire les messages <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">--</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Moyenne générale</p>
          <Link to="/student/results" className="mt-3 inline-flex items-center text-sm text-issat-navy dark:text-blue-400 hover:underline">
            Voir mes notes <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-gray-200 dark:hover:border-slate-600 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  action.color === 'red' ? 'bg-issat-red/10 dark:bg-red-900/30' : 'bg-issat-navy/10 dark:bg-issat-navy/20'
                } group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${
                    action.color === 'red' ? 'text-issat-red dark:text-red-400' : 'text-issat-navy dark:text-blue-400'
                  }`} />
                </div>
                <p className="font-medium text-gray-800 dark:text-white text-sm">{action.label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Dernières actualités</h2>
            <Link to="/student/info-notes" className="text-sm text-issat-navy dark:text-blue-400 hover:underline flex items-center">
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <div className="p-2 bg-issat-navy/10 dark:bg-issat-navy/20 rounded-lg">
                <Bell className="w-5 h-5 text-issat-navy dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white text-sm">Bienvenue sur la plateforme!</p>
                <p className="text-gray-500 dark:text-slate-400 text-xs mt-1">Consultez les notes d'information pour les dernières actualités.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Mon groupe</h2>
            <Link to="/student/my-group" className="text-sm text-issat-navy dark:text-blue-400 hover:underline flex items-center">
              Voir détails <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-4 bg-gradient-to-r from-issat-navy/5 to-issat-red/5 dark:from-issat-navy/20 dark:to-red-900/20 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-issat-navy dark:text-blue-400">{profile?.filiere || '--'}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Filière</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-issat-navy dark:text-blue-400">{profile?.level || '--'}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Niveau</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-issat-red dark:text-red-400">{profile?.group || '--'}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Groupe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
