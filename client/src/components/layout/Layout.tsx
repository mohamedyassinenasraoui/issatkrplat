import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  LogOut, Menu, X, Home, Calendar, FileText, Bot, Bell, MessageSquare, 
  Lightbulb, Award, Users, BarChart3, GraduationCap, User, Sun, Moon,
  ChevronLeft, ChevronRight, BookOpen, Clock, MessagesSquare
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, profile, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentNavItems = [
    { path: '/student/dashboard', label: 'Tableau de bord', icon: Home },
    { path: '/student/timetable', label: 'Emploi du temps', icon: Clock },
    { path: '/student/classhub', label: 'ClassHub', icon: MessagesSquare },
    { path: '/student/absences', label: 'Absences', icon: Calendar },
    { path: '/student/documents', label: 'Documents', icon: FileText },
    { path: '/student/ai-assistant', label: 'Assistant IA', icon: Bot },
    { path: '/student/info-notes', label: 'Notes d\'info', icon: Bell },
    { path: '/student/messages', label: 'Messages', icon: MessageSquare },
    { path: '/student/suggestions', label: 'Suggestions', icon: Lightbulb },
    { path: '/student/results', label: 'Résultats', icon: Award },
    { path: '/student/my-group', label: 'Mon groupe', icon: Users },
    { path: '/student/absences-blog', label: 'Blog absences', icon: BarChart3 },
    { path: '/student/profile', label: 'Mon profil', icon: User },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Tableau de bord', icon: Home },
    { path: '/admin/students', label: 'Étudiants', icon: Users },
    { path: '/admin/teachers', label: 'Enseignants', icon: GraduationCap },
    { path: '/admin/timetable', label: 'Emploi du temps', icon: Clock },
    { path: '/admin/absences', label: 'Absences', icon: Calendar },
    { path: '/admin/documents', label: 'Documents', icon: FileText },
    { path: '/admin/info-notes', label: 'Notes d\'info', icon: Bell },
    { path: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { path: '/admin/suggestions', label: 'Suggestions', icon: Lightbulb },
    { path: '/admin/results', label: 'Résultats', icon: Award },
  ];

  const teacherNavItems = [
    { path: '/teacher/dashboard', label: 'Tableau de bord', icon: Home },
    { path: '/teacher/timetable', label: 'Emploi du temps', icon: Clock },
    { path: '/teacher/classhub', label: 'ClassHub', icon: MessagesSquare },
    { path: '/teacher/absences', label: 'Mes absences', icon: Calendar },
    { path: '/teacher/grades', label: 'Notes', icon: Award },
    { path: '/teacher/profile', label: 'Mon profil', icon: User },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : user?.role === 'teacher' ? teacherNavItems : studentNavItems;
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  // Logo Component
  const Logo = ({ size = 'md', showText = true }: { size?: 'sm' | 'md' | 'lg', showText?: boolean }) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    };
    
    return (
      <div className="flex items-center space-x-3">
        <div className={`${sizeClasses[size]} rounded-xl overflow-hidden flex-shrink-0 bg-white p-1`}>
          <img 
            src="/images/logoissatkr.png" 
            alt="ISSAT Kairouan" 
            className="w-full h-full object-contain"
          />
        </div>
        {showText && (
          <div className="overflow-hidden">
            <span className="font-bold text-[#1E3A5F] dark:text-white block whitespace-nowrap">
              ISSAT<span className="text-[#C41E3A]">KR</span>
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
              {isStudent ? 'Espace Intranet' : isTeacher ? 'Espace Enseignant' : 'Administration'}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Student Layout with Sidebar
  if (isStudent) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
          <div className="flex justify-between items-center h-16 px-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Logo size="sm" showText={false} />
              <span className="font-bold text-[#1E3A5F] dark:text-white">ISSAT<span className="text-[#C41E3A]">KR</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-[#C41E3A] hover:bg-[#C41E3A]/10 rounded-lg"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div 
              className="absolute inset-0 bg-black/50" 
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800 shadow-xl">
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <Logo size="md" />
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#1E3A5F] text-white shadow-lg shadow-[#1E3A5F]/25'
                          : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        <div className="flex">
          {/* Desktop Sidebar */}
          <aside 
            className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 z-40 transition-all duration-300 ${
              sidebarOpen ? 'w-64' : 'w-20'
            }`}
          >
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-slate-700">
              <Link to="/student/dashboard" className="flex items-center space-x-3 overflow-hidden">
                <Logo size="md" showText={sidebarOpen} />
              </Link>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute -right-3 top-20 w-6 h-6 bg-[#1E3A5F] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#2a5a8f] transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={!sidebarOpen ? item.label : undefined}
                    className={`flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#1E3A5F] text-white shadow-lg shadow-[#1E3A5F]/25'
                        : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>

            {/* User Section */}
            <div className="p-3 border-t border-gray-200 dark:border-slate-700">
              {sidebarOpen ? (
                <div className="flex items-center space-x-3 px-3 py-2 mb-2">
                  <div className="w-10 h-10 bg-[#1E3A5F]/10 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#1E3A5F] dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {profile ? `${profile.firstName} ${profile.lastName}` : user?.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Étudiant</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-[#1E3A5F]/10 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#1E3A5F] dark:text-blue-400" />
                  </div>
                </div>
              )}
              
              <div className={`flex ${sidebarOpen ? 'space-x-2' : 'flex-col space-y-2'}`}>
                <button
                  onClick={toggleTheme}
                  title={isDark ? 'Mode clair' : 'Mode sombre'}
                  className={`${sidebarOpen ? 'flex-1' : ''} p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center`}
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleLogout}
                  title="Déconnexion"
                  className={`${sidebarOpen ? 'flex-1' : ''} p-2 rounded-lg bg-[#C41E3A]/10 text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white transition-colors flex items-center justify-center`}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
            <main className="p-4 lg:p-8 min-h-screen">
              {children}
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 px-4 lg:px-8">
              <p className="text-center text-sm text-gray-500 dark:text-slate-400">
                © 2025 ISSAT Kairouan - Institut Supérieur des Sciences Appliquées et de Technologie
              </p>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  // Teacher Layout with Sidebar
  if (isTeacher) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
          <div className="flex justify-between items-center h-16 px-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Logo size="sm" showText={false} />
              <span className="font-bold text-[#1E3A5F] dark:text-white">ISSAT<span className="text-[#C41E3A]">KR</span></span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-[#C41E3A] hover:bg-[#C41E3A]/10 rounded-lg"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div 
              className="absolute inset-0 bg-black/50" 
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800 shadow-xl">
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <Logo size="md" />
              </div>
              <nav className="p-4 space-y-1">
                {teacherNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#1E3A5F] text-white shadow-lg shadow-[#1E3A5F]/25'
                          : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        <div className="flex">
          {/* Desktop Sidebar */}
          <aside 
            className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 z-40 transition-all duration-300 ${
              sidebarOpen ? 'w-64' : 'w-20'
            }`}
          >
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-slate-700">
              <Link to="/teacher/dashboard" className="flex items-center space-x-3 overflow-hidden">
                <Logo size="md" showText={sidebarOpen} />
              </Link>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute -right-3 top-20 w-6 h-6 bg-[#1E3A5F] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#2a5a8f] transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {teacherNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={!sidebarOpen ? item.label : undefined}
                    className={`flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#1E3A5F] text-white shadow-lg shadow-[#1E3A5F]/25'
                        : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>

            {/* User Section */}
            <div className="p-3 border-t border-gray-200 dark:border-slate-700">
              {sidebarOpen ? (
                <div className="flex items-center space-x-3 px-3 py-2 mb-2">
                  <div className="w-10 h-10 bg-[#1E3A5F]/10 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#1E3A5F] dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {profile ? `${profile.firstName} ${profile.lastName}` : user?.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Enseignant</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-[#1E3A5F]/10 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#1E3A5F] dark:text-blue-400" />
                  </div>
                </div>
              )}
              
              <div className={`flex ${sidebarOpen ? 'space-x-2' : 'flex-col space-y-2'}`}>
                <button
                  onClick={toggleTheme}
                  title={isDark ? 'Mode clair' : 'Mode sombre'}
                  className={`${sidebarOpen ? 'flex-1' : ''} p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center`}
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button
                  onClick={handleLogout}
                  title="Déconnexion"
                  className={`${sidebarOpen ? 'flex-1' : ''} p-2 rounded-lg bg-[#C41E3A]/10 text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white transition-colors flex items-center justify-center`}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
            <main className="p-4 lg:p-8 min-h-screen">
              {children}
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 px-4 lg:px-8">
              <p className="text-center text-sm text-gray-500 dark:text-slate-400">
                © 2025 ISSAT Kairouan - Institut Supérieur des Sciences Appliquées et de Technologie
              </p>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  // Admin Layout with Sidebar
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="flex justify-between items-center h-16 px-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Logo size="sm" showText={false} />
            <span className="font-bold text-[#1E3A5F] dark:text-white">ISSAT<span className="text-[#C41E3A]">KR</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-[#C41E3A] hover:bg-[#C41E3A]/10 rounded-lg"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800 shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <Logo size="md" />
            </div>
            <nav className="p-4 space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#1E3A5F] text-white shadow-lg shadow-[#1E3A5F]/25'
                        : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside 
          className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 z-40 transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-slate-700">
            <Link to="/admin/dashboard" className="flex items-center space-x-3 overflow-hidden">
              <Logo size="md" showText={sidebarOpen} />
            </Link>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-20 w-6 h-6 bg-[#C41E3A] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#D93954] transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`flex items-center ${sidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#1E3A5F] text-white shadow-lg shadow-[#1E3A5F]/25'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-3 border-t border-gray-200 dark:border-slate-700">
            {sidebarOpen ? (
              <div className="flex items-center space-x-3 px-3 py-2 mb-2">
                <div className="w-10 h-10 bg-[#C41E3A]/10 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-[#C41E3A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {profile ? `${profile.firstName} ${profile.lastName}` : user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Administrateur</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 bg-[#C41E3A]/10 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-[#C41E3A]" />
                </div>
              </div>
            )}
            
            <div className={`flex ${sidebarOpen ? 'space-x-2' : 'flex-col space-y-2'}`}>
              <button
                onClick={toggleTheme}
                title={isDark ? 'Mode clair' : 'Mode sombre'}
                className={`${sidebarOpen ? 'flex-1' : ''} p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center`}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={handleLogout}
                title="Déconnexion"
                className={`${sidebarOpen ? 'flex-1' : ''} p-2 rounded-lg bg-[#C41E3A]/10 text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white transition-colors flex items-center justify-center`}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <main className="p-4 lg:p-8 min-h-screen">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 px-4 lg:px-8">
            <p className="text-center text-sm text-gray-500 dark:text-slate-400">
              © 2025 ISSAT Kairouan - Institut Supérieur des Sciences Appliquées et de Technologie
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};
