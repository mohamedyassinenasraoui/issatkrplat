import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { 
  Users, BookOpen, FileText, AlertTriangle,
  Calendar, CheckCircle, ArrowRight
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalStudents: number;
  totalModules: number;
  pendingDocuments: number;
  totalAbsences: number;
  unjustifiedAbsences: number;
  studentsAtRisk: number;
}

const AdminDashboard: React.FC = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalModules: 0,
    pendingDocuments: 0,
    totalAbsences: 0,
    unjustifiedAbsences: 0,
    studentsAtRisk: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Justifiées', value: stats.totalAbsences - stats.unjustifiedAbsences },
    { name: 'Non justifiées', value: stats.unjustifiedAbsences },
  ];

  const COLORS = isDark ? ['#60A5FA', '#F87171'] : ['#1E3A5F', '#C41E3A'];

  const quickActions = [
    { label: 'Gérer les étudiants', href: '/admin/students', icon: Users },
    { label: 'Gérer les absences', href: '/admin/absences', icon: Calendar },
    { label: 'Traiter les documents', href: '/admin/documents', icon: FileText },
    { label: 'Publier une info', href: '/admin/info-notes', icon: BookOpen },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-issat-navy dark:border-blue-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Tableau de bord</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Vue d'ensemble de la plateforme ISSAT</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-issat-navy/10 dark:bg-blue-900/30 rounded-xl">
              <Users className="w-6 h-6 text-issat-navy dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalStudents}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Étudiants</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-issat-navy/10 dark:bg-blue-900/30 rounded-xl">
              <BookOpen className="w-6 h-6 text-issat-navy dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalModules}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Modules</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            {stats.pendingDocuments > 0 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
                À traiter
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.pendingDocuments}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Documents en attente</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-issat-navy/10 dark:bg-blue-900/30 rounded-xl">
              <Calendar className="w-6 h-6 text-issat-navy dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalAbsences}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Absences totales</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-issat-red/10 dark:bg-red-900/30 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-issat-red dark:text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.unjustifiedAbsences}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Non justifiées</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-issat-red/10 dark:bg-red-900/30 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-issat-red dark:text-red-400" />
            </div>
            {stats.studentsAtRisk > 0 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-issat-red/10 dark:bg-red-900/50 text-issat-red dark:text-red-400">
                Attention
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.studentsAtRisk}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Étudiants à risque</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Répartition des absences</h2>
          {stats.totalAbsences > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1E293B' : '#fff', 
                    border: isDark ? '1px solid #475569' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: isDark ? '#F1F5F9' : '#1E293B'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400 dark:text-slate-500">
              Aucune donnée disponible
            </div>
          )}
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-issat-navy dark:bg-blue-400 mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-slate-400">Justifiées</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-issat-red dark:bg-red-400 mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-slate-400">Non justifiées</span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Statistiques générales</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-slate-400">Taux de justification</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {stats.totalAbsences > 0
                    ? (((stats.totalAbsences - stats.unjustifiedAbsences) / stats.totalAbsences) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-issat-navy dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${stats.totalAbsences > 0 
                      ? ((stats.totalAbsences - stats.unjustifiedAbsences) / stats.totalAbsences) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-slate-400">Étudiants à risque</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {stats.totalStudents > 0 
                    ? ((stats.studentsAtRisk / stats.totalStudents) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-issat-red dark:bg-red-400 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${stats.totalStudents > 0 
                      ? (stats.studentsAtRisk / stats.totalStudents) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-issat-navy/5 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-issat-navy dark:text-blue-400">{stats.totalStudents}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Étudiants inscrits</p>
                </div>
                <div className="text-center p-4 bg-issat-red/5 dark:bg-red-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-issat-red dark:text-red-400">{stats.studentsAtRisk}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">À surveiller</p>
                </div>
              </div>
            </div>
          </div>
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
                <div className="w-12 h-12 rounded-xl bg-issat-navy/10 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-issat-navy dark:text-blue-400" />
                </div>
                <p className="font-medium text-gray-800 dark:text-white">{action.label}</p>
                <div className="flex items-center mt-2 text-sm text-issat-navy dark:text-blue-400">
                  <span>Accéder</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Activité récente</h2>
          <button className="text-sm text-issat-navy dark:text-blue-400 hover:underline">Voir tout</button>
        </div>
        <div className="space-y-4">
          {stats.pendingDocuments > 0 && (
            <div className="flex items-center space-x-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white">{stats.pendingDocuments} document(s) en attente</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">Des demandes de documents nécessitent votre attention</p>
              </div>
              <Link to="/admin/documents" className="px-4 py-2 bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors">
                Traiter
              </Link>
            </div>
          )}
          {stats.studentsAtRisk > 0 && (
            <div className="flex items-center space-x-4 p-4 bg-issat-red/5 dark:bg-red-900/20 rounded-xl">
              <div className="p-2 bg-issat-red/10 dark:bg-red-800 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-issat-red dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white">{stats.studentsAtRisk} étudiant(s) à risque d'élimination</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">Ces étudiants ont atteint le seuil critique d'absences</p>
              </div>
              <Link to="/admin/absences" className="px-4 py-2 bg-issat-red/10 dark:bg-red-800 text-issat-red dark:text-red-300 rounded-lg text-sm font-medium hover:bg-issat-red/20 dark:hover:bg-red-700 transition-colors">
                Voir
              </Link>
            </div>
          )}
          {stats.pendingDocuments === 0 && stats.studentsAtRisk === 0 && (
            <div className="flex items-center justify-center p-8 text-gray-400 dark:text-slate-500">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Tout est en ordre!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
