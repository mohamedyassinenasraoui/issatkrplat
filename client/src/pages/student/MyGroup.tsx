import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile } from '../../types/auth';
import { Users, GraduationCap, BookOpen } from 'lucide-react';

const MyGroup: React.FC = () => {
  const { profile: rawProfile } = useAuth();
  const profile = rawProfile as StudentProfile | null;
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.group) {
      fetchGroupMembers();
    }
  }, [profile]);

  const fetchGroupMembers = async () => {
    try {
      const response = await api.get('/admin/students');
      const allStudents = response.data;
      const members = allStudents.filter(
        (s: any) => s.group === profile?.group && s._id !== profile?._id
      );
      setGroupMembers(members);
    } catch (error) {
      console.error('Failed to fetch group members:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mon groupe</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Informations sur votre groupe et classe</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-l-4 border-issat-navy dark:border-blue-400 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <GraduationCap className="h-8 w-8 text-issat-navy dark:text-blue-400" />
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Filière</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{profile?.filiere || '--'}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-l-4 border-issat-navy dark:border-blue-400 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="h-8 w-8 text-issat-navy dark:text-blue-400" />
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Niveau</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{profile?.level || '--'}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-l-4 border-issat-red dark:border-red-400 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-issat-red dark:text-red-400" />
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Groupe</p>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{profile?.group || 'Non assigné'}</p>
        </div>
      </div>

      {profile?.group && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Membres du groupe</h2>
          <div className="space-y-3">
            {groupMembers.length === 0 ? (
              <p className="text-gray-500 dark:text-slate-400 text-center py-4">Aucun autre membre dans votre groupe</p>
            ) : (
              groupMembers.map((member) => (
                <div key={member._id} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <p className="text-gray-800 dark:text-white font-medium">
                    {member.firstName} {member.lastName}
                  </p>
                  {member.studentId && (
                    <p className="text-gray-500 dark:text-slate-400 text-sm">ID: {member.studentId}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGroup;
