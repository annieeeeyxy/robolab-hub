'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function StudentDashboard() {
  const { t } = useTranslation();
  const sessions = [
    { date: t('ftcTomorrow'), time: '2:00 PM', type: t('ftcProgramming'), coach: 'Coach Miller' },
    { date: t('ftcThursday'), time: '3:30 PM', type: t('ftcMechanicalDesign'), coach: 'Coach Miller' },
    { date: t('ftcSaturday'), time: '10:00 AM', type: t('ftcCompetitionPrep'), coach: 'Coach Miller' },
  ];
  const skills = [
    { skill: t('ftcProgramming'), progress: 85 },
    { skill: t('ftcMechanicalDesign'), progress: 72 },
    { skill: t('ftcElectronics'), progress: 90 },
    { skill: t('ftcCadDesign'), progress: 65 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-emerald-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">{t('ftcStudentDashboard')}</h1>
            <p className="text-black mt-1">{t('ftcStudentDashboardLead')}</p>
          </div>
          <Link href="/ftc/">
            <button className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold py-2 px-4 rounded-lg transition-colors">
              {t('ftcBackHome')}
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
            <div className="text-sm text-black font-semibold">{t('ftcTeamLead')}</div>
            <div className="text-2xl font-bold text-black mt-2">Coach Miller</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-teal-500">
            <div className="text-sm text-black font-semibold">{t('ftcPracticeSessions')}</div>
            <div className="text-3xl font-bold text-black mt-2">12</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="text-sm text-black font-semibold">{t('ftcRobotProgress')}</div>
            <div className="text-3xl font-bold text-black mt-2">78%</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-cyan-500">
            <div className="text-sm text-black font-semibold">{t('ftcCompetitions')}</div>
            <div className="text-3xl font-bold text-black mt-2">3</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md">
            <span className="text-xl">📅</span> {t('ftcViewSchedule')}
          </button>
          <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md">
            <span className="text-xl">🤖</span> {t('ftcRobotDevelopment')}
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md">
            <span className="text-xl">💬</span> {t('ftcContactCoach')}
          </button>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-black mb-4">{t('ftcUpcomingPractice')}</h2>
          <div className="space-y-4">
            {sessions.map((session, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex-1">
                  <p className="font-semibold text-black">{session.type}</p>
                  <p className="text-sm text-black">{session.date} at {session.time}</p>
                  <p className="text-xs text-black mt-1">{t('ftcLedBy', { coach: session.coach })}</p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  {t('ftcJoin')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-black mb-4">{t('ftcYourSkills')}</h2>
          <div className="space-y-4">
            {skills.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <p className="font-semibold text-black">{item.skill}</p>
                <div className="w-48">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-sm text-black mt-1">{item.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
