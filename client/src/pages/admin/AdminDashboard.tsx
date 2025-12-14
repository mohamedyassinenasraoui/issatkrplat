import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Users, BookOpen, FileText, AlertTriangle, Calendar, 
  CheckCircle, ArrowRight, GraduationCap, TrendingUp,
  Clock, Bell, Award
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
    <div className="min-h-screen relative">
      {/* Animated background with logo colors */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1E3A5F]/30 to-[#0a1628]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1E3A5F]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#C41E3A]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1E3A5F]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 space-y-6 p-2">
        {/* Header with Logo */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A5F]/20 via-white/5 to-[#C41E3A]/10 backdrop-blur-2xl"></div>
          <div className="absolute inset-0 border border-white/10 rounded-3xl"></div>
          
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center overflow-hidden shadow-2xl">
                    <img src="/images/logo.svg" alt="ISSAT Logo" className="w-14 h-14" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#0a1628] flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Tableau de bord
                  </h1>
                  <p className="text-[#1E3A5F]/80 dark:text-slate-400 mt-1">
                    Administration ISSAT Kairouan
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#C41E3A]" />
                    <div>
                      <p className="text-2xl font-mono font-bold text-white">
                        {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Étudiants', value: stats.totalStudents, icon: Users, color: '#1E3A5F', bgColor: 'from-[#1E3A5F]/20 to-[#1E3A5F]/5' },
            { label: 'Enseignants', value: stats.totalTeachers, icon: GraduationCap, color: '#10B981', bgColor: 'from-emerald-500/20 to-emerald-500/5' },
            { label: 'Modules', value: stats.totalModules, icon: BookOpen, color: '#8B5CF6', bgColor: 'from-violet-500/20 to-violet-500/5' },
            { label: 'Documents', value: stats.pendingDocuments, icon: FileText, color: '#F59E0B', bgColor: 'from-amber-500/20 to-amber-500/5', badge: 'En attente' },
            { label: 'Absences', value: stats.totalAbsences, icon: Calendar, color: '#1E3A5F', bgColor: 'from-[#1E3A5F]/20 to-[#1E3A5F]/5' },
            { label: 'À risque', value: stats.studentsAtRisk, icon: AlertTriangle, color: '#C41E3A', bgColor: 'from-[#C41E3A]/20 to-[#C41E3A]/5', badge: 'Attention' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="relative overflow-hidden rounded-2xl group">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl`}></div>
                <div className="absolute inset-0 border border-white/10 rounded-2xl group-hover:border-white/20 transition-all"></div>
                
                <div className="relative p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: stat.color }} />
                    </div>
                    {stat.badge && stat.value > 0 && (
                      <span 
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                      >
                        {stat.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
            <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
            
            <div className="relative p-6">
              <h2 className="text-lg font-bold text-white mb-6">Répartition des absences</h2>
              
              {stats.totalAbsences > 0 ? (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(30, 41, 59, 0.9)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: 'white',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500">
                  Aucune donnée disponible
                </div>
              )}
              
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#1E3A5F]"></div>
                  <span className="text-sm text-slate-400">Justifiées</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#C41E3A]"></div>
                  <span className="text-sm text-slate-400">Non justifiées</span>
                </div>
              </div>
            </div>
          </div>

          {/* Area Chart */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
            <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
            
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Tendance des absences</h2>
                <div className="flex items-center gap-2 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Cette semaine</span>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorAbsences" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white',
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
        </div>

        {/* Quick Actions & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
              <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
              
              <div className="relative p-6">
                <h2 className="text-lg font-bold text-white mb-4">Actions rapides</h2>
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
                        className="group p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                      >
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${action.color}20` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: action.color }} />
                        </div>
                        <p className="text-sm font-medium text-white">{action.label}</p>
                        <ArrowRight className="w-4 h-4 text-slate-500 mt-2 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl"></div>
            <div className="absolute inset-0 border border-white/10 rounded-2xl"></div>
            
            <div className="relative p-6">
              <h2 className="text-lg font-bold text-white mb-4">Activité récente</h2>
              <div className="space-y-3">
                {stats.pendingDocuments > 0 && (
                  <Link
                    to="/admin/documents"
                    className="flex items-center gap-3 p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl border border-amber-500/20 transition-all group"
                  >
                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{stats.pendingDocuments} document(s)</p>
                      <p className="text-xs text-slate-400">En attente de traitement</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </Link>
                )}
                
                {stats.studentsAtRisk > 0 && (
                  <Link
                    to="/admin/absences"
                    className="flex items-center gap-3 p-3 bg-[#C41E3A]/10 hover:bg-[#C41E3A]/20 rounded-xl border border-[#C41E3A]/20 transition-all group"
                  >
                    <div className="w-8 h-8 bg-[#C41E3A]/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-[#C41E3A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{stats.studentsAtRisk} étudiant(s)</p>
                      <p className="text-xs text-slate-400">À risque d'élimination</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </Link>
                )}
                
                {stats.pendingDocuments === 0 && stats.studentsAtRisk === 0 && (
                  <div className="flex items-center justify-center py-8 text-slate-500">
                    <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" />
                    <span>Tout est en ordre!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
