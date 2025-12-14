import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { TeacherProfile as TeacherProfileType } from '../../types/auth';
import { User, Mail, BookOpen, Building, Briefcase, Phone, MapPin, AlertTriangle } from 'lucide-react';
import { UPLOADS_BASE_URL } from '../../services/api';

const TeacherProfile: React.FC = () => {
  const { profile: rawProfile, user } = useAuth();
  const profile = rawProfile as TeacherProfileType | null;

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-slate-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mon profil</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Informations personnelles</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-6 border-b border-gray-100 dark:border-slate-700">
          {profile.picture ? (
            <img
              src={profile.picture.startsWith('http') ? profile.picture : `${UPLOADS_BASE_URL}${profile.picture}`}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-[#1E3A5F] shadow-lg"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">
                {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
              </span>
            </div>
          )}
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Prof. {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              {profile.department}
            </p>
            {profile.specialization && (
              <span className="inline-block mt-2 px-3 py-1 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-medium">
                {profile.specialization}
              </span>
            )}
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-start gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-400/10 rounded-xl">
              <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Email</p>
              <p className="text-gray-800 dark:text-white font-medium">{user?.email}</p>
            </div>
          </div>

          {/* Teacher ID */}
          {profile.teacherId && (
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-400/10 rounded-xl">
                <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">ID Enseignant</p>
                <p className="text-gray-800 dark:text-white font-medium">{profile.teacherId}</p>
              </div>
            </div>
          )}

          {/* Department */}
          {profile.department && (
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-400/10 rounded-xl">
                <Building className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Département</p>
                <p className="text-gray-800 dark:text-white font-medium">{profile.department}</p>
              </div>
            </div>
          )}

          {/* Specialization */}
          {profile.specialization && (
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-400/10 rounded-xl">
                <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Spécialisation</p>
                <p className="text-gray-800 dark:text-white font-medium">{profile.specialization}</p>
              </div>
            </div>
          )}

          {/* Phone */}
          {profile.phone && (
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-400/10 rounded-xl">
                <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Téléphone</p>
                <p className="text-gray-800 dark:text-white font-medium">{profile.phone}</p>
              </div>
            </div>
          )}

          {/* Office */}
          {profile.office && (
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 flex items-start gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-400/10 rounded-xl">
                <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Bureau</p>
                <p className="text-gray-800 dark:text-white font-medium">{profile.office}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modules Section */}
        {profile.modules && profile.modules.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Modules enseignés
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {profile.modules.map((mod: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-400/10 rounded-lg"
                >
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{mod.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{mod.code}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filières Section */}
        {profile.filieres && profile.filieres.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Filières
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.filieres.map((filiere: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-emerald-100 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium"
                >
                  {filiere}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notice */}
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700/50 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">Information</p>
            <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-1">
              Ces informations sont gérées par l'administration. 
              Contactez le secrétariat pour toute modification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;

