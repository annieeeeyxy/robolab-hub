'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function CoachDashboard() {
  const { t } = useTranslation();
  const students = [
    { name: 'John Smith', skill: t('ftcMechanicalDesign'), progress: 85 },
    { name: 'Sarah Johnson', skill: t('ftcProgramming'), progress: 72 },
    { name: 'Mike Chen', skill: t('ftcElectronics'), progress: 90 },
    { name: 'Emma Davis', skill: t('ftcCadDesign'), progress: 65 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">{t('ftcCoachDashboard')}</h1>
            <p className="text-blue-600 mt-1">{t('ftcCoachDashboardLead')}</p>
          </div>
          <Link href="/ftc/">
            <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 px-4 rounded-lg transition-colors">
              {t('ftcBackHome')}
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 font-semibold">{t('ftcTeamMembers')}</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">14</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
            <div className="text-sm text-gray-600 font-semibold">{t('ftcTrainingSessions')}</div>
            <div className="text-3xl font-bold text-indigo-600 mt-2">8</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <div className="text-sm text-gray-600 font-semibold">{t('ftcRobotsInDev')}</div>
            <div className="text-3xl font-bold text-blue-400 mt-2">2</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 font-semibold">{t('ftcCompetitions')}</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">5</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md">
            <span className="text-xl">🤖</span> {t('ftcDesignTraining')}
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md">
            <span className="text-xl">📅</span> {t('ftcSchedulePractice')}
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md">
            <span className="text-xl">👥</span> {t('ftcManageMembers')}
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('ftcMemberDevelopment')}</h2>
          <div className="space-y-4">
            {students.map((student, idx) => (
              <div key={idx} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.skill}</p>
                </div>
                <div className="w-32">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${student.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-sm text-gray-600 mt-1">{student.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
