import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Award, TrendingUp } from 'lucide-react';

interface Result {
  _id: string;
  module: {
    name: string;
    code: string;
    coefficient: number;
  };
  score: number;
  examType: string;
  semester: string;
  academicYear: string;
  examDate: string;
}

const Results: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  useEffect(() => {
    fetchResults();
    fetchAverage();
  }, [selectedYear, selectedSemester]);

  const fetchResults = async () => {
    try {
      const params: any = {};
      if (selectedYear) params.academicYear = selectedYear;
      if (selectedSemester) params.semester = selectedSemester;
      const response = await api.get('/results/student', { params });
      setResults(response.data);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  };

  const fetchAverage = async () => {
    try {
      const params: any = {};
      if (selectedYear) params.academicYear = selectedYear;
      if (selectedSemester) params.semester = selectedSemester;
      const response = await api.get('/results/student/average', { params });
      setAverage(response.data.average);
    } catch (error) {
      console.error('Failed to fetch average:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 16) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 12) return 'text-issat-navy dark:text-blue-400';
    if (score >= 10) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Résultats</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">Consultez vos notes et moyennes</p>
      </div>

      {average !== null && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-l-4 border-issat-navy dark:border-blue-400 shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Moyenne générale</p>
              <p className={`text-3xl font-bold ${getScoreColor(average)}`}>
                {average.toFixed(2)}/20
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-issat-navy dark:text-blue-400" />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Année académique (ex: 2023-2024)"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
          />
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-issat-navy/20 dark:focus:ring-blue-500/30"
          >
            <option value="">Tous les semestres</option>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
          </select>
        </div>

        <div className="space-y-3">
          {results.length === 0 ? (
            <p className="text-gray-500 dark:text-slate-400 text-center py-8">Aucun résultat</p>
          ) : (
            results.map((result) => (
              <div key={result._id} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Award className="h-5 w-5 text-issat-navy dark:text-blue-400" />
                  <div>
                    <p className="text-gray-800 dark:text-white font-medium">
                      {result.module.name} ({result.module.code})
                    </p>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">
                      {result.examType} - {result.semester} - {result.academicYear}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}/20
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Coef: {result.module.coefficient}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
