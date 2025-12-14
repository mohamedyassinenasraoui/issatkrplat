import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile } from '../../types/auth';
import { User, Mail, GraduationCap, Hash, Users, BookOpen, AlertTriangle } from 'lucide-react';

const MyProfile: React.FC = () => {
  const { profile: rawProfile, user } = useAuth();
  const profile = rawProfile as StudentProfile | null;

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-issat-navy border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-slate-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mon profil</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Informations personnelles (lecture seule)</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-6 border-b border-gray-100 dark:border-slate-700">
          {profile.picture ? (
            <img
              src={profile.picture}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-issat-navy dark:border-blue-400 shadow-lg"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-issat-navy to-issat-navyLight dark:from-blue-500 dark:to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">
                {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
              </span>
            </div>
          )}
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-issat-navy dark:text-blue-400 font-medium mt-1">
              {profile.filiere} - {profile.level}
            </p>
            {profile.group && (
              <span className="inline-block mt-2 px-3 py-1 bg-issat-navy/10 dark:bg-blue-400/10 text-issat-navy dark:text-blue-400 rounded-full text-sm font-medium">
                Groupe {profile.group}
              </span>
            )}
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-start gap-4">
            <div className="p-3 bg-issat-navy/10 dark:bg-blue-400/10 rounded-xl">
              <Mail className="h-5 w-5 text-issat-navy dark:text-blue-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Email</p>
              <p className="text-gray-800 dark:text-white font-medium">{user?.email}</p>
            </div>
          </div>

          {/* Student ID */}
          {profile.studentId && (
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-start gap-4">
              <div className="p-3 bg-issat-navy/10 dark:bg-blue-400/10 rounded-xl">
                <Hash className="h-5 w-5 text-issat-navy dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">ID Étudiant</p>
                <p className="text-gray-800 dark:text-white font-medium">{profile.studentId}</p>
              </div>
            </div>
          )}

          {/* Username */}
          {profile.username && (
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-start gap-4">
              <div className="p-3 bg-issat-navy/10 dark:bg-blue-400/10 rounded-xl">
                <User className="h-5 w-5 text-issat-navy dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Nom d'utilisateur</p>
                <p className="text-gray-800 dark:text-white font-medium">{profile.username}</p>
              </div>
            </div>
          )}

          {/* Filière */}
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-start gap-4">
            <div className="p-3 bg-issat-navy/10 dark:bg-blue-400/10 rounded-xl">
              <BookOpen className="h-5 w-5 text-issat-navy dark:text-blue-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Filière</p>
              <p className="text-gray-800 dark:text-white font-medium">{profile.filiere}</p>
            </div>
          </div>

          {/* Level */}
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-start gap-4">
            <div className="p-3 bg-issat-navy/10 dark:bg-blue-400/10 rounded-xl">
              <GraduationCap className="h-5 w-5 text-issat-navy dark:text-blue-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Niveau</p>
              <p className="text-gray-800 dark:text-white font-medium">{profile.level}</p>
            </div>
          </div>

          {/* Group */}
          {profile.group && (
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-start gap-4">
              <div className="p-3 bg-issat-navy/10 dark:bg-blue-400/10 rounded-xl">
                <Users className="h-5 w-5 text-issat-navy dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Groupe</p>
                <p className="text-gray-800 dark:text-white font-medium">{profile.group}</p>
              </div>
            </div>
          )}
        </div>

        {/* Notice */}
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700/50 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">Information importante</p>
            <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-1">
              Ces informations sont fournies par l'administration et ne peuvent pas être modifiées. 
              Contactez l'administration pour toute correction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
