import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ModuleAbsence {
  module: {
    name: string;
    code: string;
  };
  total: number;
  unjustified: number;
  percentage: number;
}

const AbsencesBlog: React.FC = () => {
  const { isDark } = useTheme();
  const [moduleAbsences, setModuleAbsences] = useState<ModuleAbsence[]>([]);

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    try {
      const response = await api.get('/absences/student');
      const absences = response.data;

      const moduleMap = new Map<string, ModuleAbsence>();
      absences.forEach((absence: any) => {
        const moduleKey = absence.module._id;
        if (!moduleMap.has(moduleKey)) {
          moduleMap.set(moduleKey, {
            module: absence.module,
            total: 0,
            unjustified: 0,
            percentage: 0,
          });
        }
        const data = moduleMap.get(moduleKey)!;
        data.total++;
        if (!absence.justified) {
          data.unjustified++;
        }
      });

      const result = Array.from(moduleMap.values()).map((item) => ({
        ...item,
        percentage: item.total > 0 ? (item.unjustified / item.total) * 100 : 0,
      }));

      setModuleAbsences(result);
    } catch (error) {
      console.error('Failed to fetch absences:', error);
    }
  };

  const getColor = (percentage: number) => {
    if (percentage >= 75) return '#EF4444';
    if (percentage >= 50) return '#F59E0B';
    return '#10B981';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Blog des absences</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Statistiques détaillées par matière</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Absences par matière</h2>
        {moduleAbsences.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-center py-8">Aucune absence enregistrée</p>
        ) : (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={moduleAbsences}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#E2E8F0'} />
                <XAxis dataKey="module.code" stroke={isDark ? '#94A3B8' : '#64748B'} />
                <YAxis stroke={isDark ? '#94A3B8' : '#64748B'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    border: isDark ? '1px solid #475569' : '1px solid #E2E8F0',
                    borderRadius: '8px',
                    color: isDark ? '#F1F5F9' : '#1E293B',
                  }}
                />
                <Bar dataKey="unjustified" name="Non justifiées">
                  {moduleAbsences.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.percentage)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {moduleAbsences.map((item, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-issat-navy dark:text-blue-400" />
                      <div>
                        <p className="text-gray-800 dark:text-white font-medium">
                          {item.module.name} ({item.module.code})
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-800 dark:text-white font-bold">
                        {item.unjustified}/{item.total}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {item.percentage.toFixed(1)}% non justifiées
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: getColor(item.percentage),
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbsencesBlog;
