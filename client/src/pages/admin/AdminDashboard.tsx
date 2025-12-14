import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Users, BookOpen, FileText, AlertTriangle, Calendar, 
  CheckCircle, ArrowRight, GraduationCap, TrendingUp,
  Clock
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalModules: number;
  pendingDocuments: number;
  totalAbsences: number;
  unjustifiedAbsences: number;
  studentsAtRisk: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
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
      const [dashboardRes, teachersRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/teacher/all'),
      ]);
      setStats({
        ...dashboardRes.data,
        totalTeachers: teachersRes.data.length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Justifiées', value: stats.totalAbsences - stats.unjustifiedAbsences, color: '#1E3A5F' },
    { name: 'Non justifiées', value: stats.unjustifiedAbsences, color: '#C41E3A' },
  ];

  const trendData = [
    { name: 'Lun', absences: 4 },
    { name: 'Mar', absences: 7 },
    { name: 'Mer', absences: 3 },
    { name: 'Jeu', absences: 8 },
    { name: 'Ven', absences: 5 },
    { name: 'Sam', absences: 2 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1E3A5F] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1E3A5F] via-[#2B4C73] to-[#1E3A5F] rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C41E3A]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden p-2">
              <img src="/images/logoissatkr.png" alt="ISSAT Logo" className="w-full h-full object-contain" />
            </div>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Tableau de bord
              </h1>
              <p className="text-white/60 mt-1">
                Administration ISSAT Kairouan
              </p>
            </div>
          </div>
          
          <div className="px-5 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#C41E3A]" />
              <div>
                <p className="text-xl font-mono font-bold text-white">
                  {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-white/60 capitalize">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Étudiants', value: stats.totalStudents, icon: Users, color: '#1E3A5F', bgClass: 'bg-[#1E3A5F]/10 dark:bg-[#1E3A5F]/20' },
          { label: 'Enseignants', value: stats.totalTeachers, icon: GraduationCap, color: '#10B981', bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20' },
          { label: 'Modules', value: stats.totalModules, icon: BookOpen, color: '#8B5CF6', bgClass: 'bg-violet-500/10 dark:bg-violet-500/20' },
          { label: 'Documents', value: stats.pendingDocuments, icon: FileText, color: '#F59E0B', bgClass: 'bg-amber-500/10 dark:bg-amber-500/20', badge: 'En attente' },
          { label: 'Absences', value: stats.totalAbsences, icon: Calendar, color: '#1E3A5F', bgClass: 'bg-[#1E3A5F]/10 dark:bg-[#1E3A5F]/20' },
          { label: 'À risque', value: stats.studentsAtRisk, icon: AlertTriangle, color: '#C41E3A', bgClass: 'bg-[#C41E3A]/10 dark:bg-[#C41E3A]/20', badge: 'Attention' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bgClass}`}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                {stat.badge && stat.value > 0 && (
                  <span 
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                  >
                    {stat.badge}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Répartition des absences</h2>
          
          {stats.totalAbsences > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 dark:text-slate-500">
              Aucune donnée disponible
            </div>
          )}
          
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#1E3A5F]"></div>
              <span className="text-sm text-gray-600 dark:text-slate-400">Justifiées</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#C41E3A]"></div>
              <span className="text-sm text-gray-600 dark:text-slate-400">Non justifiées</span>
            </div>
          </div>
        </div>

        {/* Area Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Tendance des absences</h2>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Cette semaine</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorAbsences" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="absences" 
                stroke="#1E3A5F" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAbsences)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Gérer étudiants', href: '/admin/students', icon: Users, color: '#1E3A5F' },
              { label: 'Gérer enseignants', href: '/admin/teachers', icon: GraduationCap, color: '#10B981' },
              { label: 'Emploi du temps', href: '/admin/timetable', icon: Calendar, color: '#8B5CF6' },
              { label: 'Documents', href: '/admin/documents', icon: FileText, color: '#F59E0B' },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.href}
                  className="group p-4 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600 transition-all"
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: action.color }} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-white">{action.label}</p>
                  <ArrowRight className="w-4 h-4 text-gray-400 dark:text-slate-500 mt-2 group-hover:text-[#1E3A5F] dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Activité récente</h2>
          <div className="space-y-3">
            {stats.pendingDocuments > 0 && (
              <Link
                to="/admin/documents"
                className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-xl border border-amber-200 dark:border-amber-500/20 transition-all group"
              >
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{stats.pendingDocuments} document(s)</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">En attente de traitement</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
              </Link>
            )}
            
            {stats.studentsAtRisk > 0 && (
              <Link
                to="/admin/absences"
                className="flex items-center gap-3 p-3 bg-[#C41E3A]/5 dark:bg-[#C41E3A]/10 hover:bg-[#C41E3A]/10 dark:hover:bg-[#C41E3A]/20 rounded-xl border border-[#C41E3A]/20 transition-all group"
              >
                <div className="w-8 h-8 bg-[#C41E3A]/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-[#C41E3A]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{stats.studentsAtRisk} étudiant(s)</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">À risque d'élimination</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#C41E3A] transition-colors" />
              </Link>
            )}
            
            {stats.pendingDocuments === 0 && stats.studentsAtRisk === 0 && (
              <div className="flex items-center justify-center py-8 text-gray-500 dark:text-slate-400">
                <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
                <span>Tout est en ordre!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
