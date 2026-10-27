import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, BookOpen, Layers, CheckCircle, Smartphone, 
  ArrowRight, ShieldCheck, Flame, Users, Play, Award 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Next-Generation Language Mastery Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Learn languages with <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            proven scientific rigor
          </span>{' '}
          & AI.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Manage your personal vocabulary with verified anti-cheat retention, read CEFR level-adapted literature, practice speaking with certified instructors, and chat with an intelligent AI tutor.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-98 transition-all"
          >
            <span>Start Learning Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all"
          >
            <span>Explore Demo Accounts</span>
          </Link>
        </div>

        {/* Highlights Bar */}
        <div className="mt-16 pt-10 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xl">
              <ShieldCheck className="w-5 h-5" />
              <span>Anti-Fraud</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">3 verified consecutive answers required for learned status.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xl">
              <Layers className="w-5 h-5" />
              <span>CEFR Levels</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Adapted content variants from Pre-A1 to C2.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xl">
              <Users className="w-5 h-5" />
              <span>Teachers</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">1-on-1 assignments, writing feedback, and Telegram connect.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xl">
              <Smartphone className="w-5 h-5" />
              <span>Mobile-First PWA</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">1-tap install on Android, iOS, Windows and Mac.</p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Everything you need for fluent fluency.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl mx-auto">
            A cohesive suite of modules designed to train reading, writing, listening, speaking, and vocabulary retention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="card-elevated p-6 bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Personal Vocabulary Notebook</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track words through Planned, In Progress, Learned, and Needs Review states. Practice with randomized directions and a strictly enforced 3-hint ceiling.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card-elevated p-6 bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Intelligent AI Language Tutor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real LLM API integration provides instant grammar explanations, vocabulary collocations, writing feedback, and conversational dialogue tailored to your CEFR level.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card-elevated p-6 bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Teacher Collaboration & Tasks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect with verified instructors. Submit essays and exercises, receive rubric evaluations, and improve based on expert feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <p>© 2026 Tilshunos Platform. Built with modern engineering and design standards.</p>
      </footer>
    </div>
  );
};
