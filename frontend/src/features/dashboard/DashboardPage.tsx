import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { isStandalone } from '../../lib/pwa';
import { 
  Flame, BookMarked, PlayCircle, BookOpen, Sparkles, CheckSquare, 
  ArrowRight, ShieldCheck, Clock, Award, AlertCircle, Download 
} from 'lucide-react';

export const DashboardPage: React.FC<{ onOpenInstallModal?: () => void }> = ({ onOpenInstallModal }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await api.get('/profile/dashboard-summary');
        setSummary(data);
      } catch (err) {
        console.error('Failed to load dashboard summary', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const isPwa = isStandalone();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-28 bg-slate-800/60 rounded-3xl"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-800/40 rounded-2xl"></div>
          <div className="h-24 bg-slate-800/40 rounded-2xl"></div>
          <div className="h-24 bg-slate-800/40 rounded-2xl"></div>
          <div className="h-24 bg-slate-800/40 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8 pb-24 md:pb-12">
      
      {/* PWA Smart Install Banner for Mobile & Desktop */}
      {!isPwa && onOpenInstallModal && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Experience Tilshunos as an App</p>
              <p className="text-xs text-slate-300">Install on your device for distraction-free full-screen learning.</p>
            </div>
          </div>
          <button
            onClick={onOpenInstallModal}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all shrink-0"
          >
            Install App
          </button>
        </div>
      )}

      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl glass-panel bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {summary?.LanguageCode?.toUpperCase() || 'EN'} • {summary?.CurrentLevel || 'A1'}
              </span>
              <span className="text-xs text-slate-400">Target Language</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Consistency builds fluency. Complete today's 20-minute practice goal.
            </p>
          </div>

          {/* Daily Streak Card */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-black text-amber-400">{summary?.DailyStreak || 1} Days</p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Active Streak</p>
            </div>
          </div>
        </div>

        {/* Quick Goal progress bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Daily Goal ({summary?.DailyGoalMinutes || 20} mins)</span>
            <span className="font-semibold text-slate-200">75% Complete</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-3/4 transition-all duration-500"></div>
          </div>
        </div>
      </div>

      {/* Personal Vocabulary Retention Engine Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Personal Vocabulary Notebook</h2>
          </div>
          <Link to="/vocabulary" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <span>Manage Notebook</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Planned */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">Planned Words</p>
            <p className="text-3xl font-extrabold text-slate-100 mt-1">{summary?.PlannedWords ?? 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Ready to practice</p>
          </div>

          {/* In Progress */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-blue-900/40 shadow-sm">
            <p className="text-xs font-semibold text-blue-400">In Progress</p>
            <p className="text-3xl font-extrabold text-blue-300 mt-1">{summary?.InProgressWords ?? 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Currently training</p>
          </div>

          {/* Learned (Anti-Fraud Verified) */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-900/40 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-emerald-400">Learned Words</p>
              <span title="Anti-fraud verified">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            </div>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">{summary?.LearnedWords ?? 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">3 consecutive correct answers</p>
          </div>

          {/* Needs Review */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-rose-900/40 shadow-sm">
            <p className="text-xs font-semibold text-rose-400">Needs Review</p>
            <p className="text-3xl font-extrabold text-rose-400 mt-1">{summary?.NeedsReviewWords ?? 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Answered wrong recently</p>
          </div>
        </div>
      </section>

      {/* Action shortcuts */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Practice CTA */}
        <Link
          to="/practice"
          className="p-5 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 hover:border-blue-500/60 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">Start Practice Session</h3>
            <p className="text-xs text-slate-400 mt-0.5">Randomized directions & 3-hint limit test</p>
          </div>
        </Link>

        {/* Read Story CTA */}
        <Link
          to="/materials"
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/30 hover:border-indigo-500/60 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">Read Level Stories</h3>
            <p className="text-xs text-slate-400 mt-0.5">CEFR level-adapted articles & news</p>
          </div>
        </Link>

        {/* AI Tutor CTA */}
        <Link
          to="/ai-tutor"
          className="p-5 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/10 border border-purple-500/30 hover:border-purple-500/60 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">Chat with AI Tutor</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time grammar & pronunciation guide</p>
          </div>
        </Link>
      </section>

      {/* Active Teacher Tasks & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Tasks */}
        <div className="p-6 rounded-3xl glass-panel bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base text-white">Active Teacher Tasks</h3>
            </div>
            <Link to="/tasks" className="text-xs font-semibold text-blue-400 hover:text-blue-300">View all</Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-slate-200">Writing Essay: Cultural Heritage in 2026</p>
                <p className="text-[11px] text-slate-400">Assigned by Dilnoza Karimova • Due in 3 days</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                In Progress
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-slate-200">Vocabulary Exercise: Technology Set</p>
                <p className="text-[11px] text-slate-400">Assigned by Dilnoza Karimova • Completed</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Graded 95/100
              </span>
            </div>
          </div>
        </div>

        {/* Recent Practice History */}
        <div className="p-6 rounded-3xl glass-panel bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-base text-white">Recent Practice Sessions</h3>
            </div>
            <Link to="/practice" className="text-xs font-semibold text-blue-400 hover:text-blue-300">Practice more</Link>
          </div>

          <div className="space-y-3">
            {summary?.RecentSessions?.length > 0 ? (
              summary.RecentSessions.map((session: any) => (
                <div key={session.id} className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-slate-200">
                      {session.direction === 'TargetToNative' ? 'English → Uzbek' : 'Mixed Directions'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Score: {session.correctCount} / {session.totalQuestions} ({Math.round((session.correctCount / session.totalQuestions) * 100)}%)
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                    Finished
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                No recent sessions yet. Start your first vocabulary practice!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
