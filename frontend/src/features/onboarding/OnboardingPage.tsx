import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { CefrLevel } from '../../types';
import { Globe, Award, CheckCircle, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', desc: 'Global communication & business' },
  { code: 'de', name: 'German', flag: '🇩🇪', desc: 'Europe technology & university' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', desc: 'Culture, travel & regional trade' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', desc: 'Over 500 million speakers' },
  { code: 'fr', name: 'French', flag: '🇫🇷', desc: 'Diplomacy, literature & art' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', desc: 'Regional science & literature' },
];

const CEFR_LEVELS: { level: CefrLevel; title: string; desc: string }[] = [
  { level: 'PreA1', title: 'Pre-A1 Starter', desc: 'Absolute beginner with zero background' },
  { level: 'A1', title: 'A1 Beginner', desc: 'Can understand basic phrases & introduce self' },
  { level: 'A2', title: 'A2 Elementary', desc: 'Can communicate in routine everyday tasks' },
  { level: 'B1', title: 'B1 Intermediate', desc: 'Can express opinions, dreams & work topics' },
  { level: 'B2', title: 'B2 Upper-Intermediate', desc: 'Fluent technical & abstract conversations' },
  { level: 'C1', title: 'C1 Advanced', desc: 'Express ideas fluently without searching for words' },
  { level: 'C2', title: 'C2 Mastery', desc: 'Native-level precision and stylistic nuance' },
];

export const OnboardingPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [level, setLevel] = useState<CefrLevel>('A1');
  const [nativeLanguage, setNativeLanguage] = useState('uz');
  const [loading, setLoading] = useState(false);

  // Optional quick quiz recommendation
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await api.post('/profile/onboarding', {
        targetLanguage,
        level,
        nativeLanguage,
      });
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (recommended: CefrLevel) => {
    setLevel(recommended);
    setQuizOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl glass-panel bg-slate-900/90 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        
        {/* Progress step indicators */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1</span>
            <span className="text-xs font-medium text-slate-300">Target Language</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2</span>
            <span className="text-xs font-medium text-slate-300">CEFR Level</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>3</span>
            <span className="text-xs font-medium text-slate-300">Native Tongue</span>
          </div>
        </div>

        {/* Step 1: Target Language */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-white">What language do you want to master?</h2>
              <p className="text-xs text-slate-400 mt-1">You can easily add more languages later from your settings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setTargetLanguage(lang.code)}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${
                    targetLanguage === lang.code
                      ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-3xl">{lang.flag}</span>
                  <div>
                    <p className="font-bold text-sm text-white">{lang.name}</p>
                    <p className="text-xs text-slate-400">{lang.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: CEFR Level */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-white">Select your proficiency level</h2>
              <p className="text-xs text-slate-400 mt-1">
                Based on the official Common European Framework of Reference for Languages.
              </p>
            </div>

            {/* Quick Placement test button */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-200">Not sure about your level? Take our 1-minute test:</span>
              </div>
              <button
                type="button"
                onClick={() => setQuizOpen(true)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              >
                Quick Placement
              </button>
            </div>

            {quizOpen && (
              <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
                <p className="text-xs font-bold text-slate-200">Which sentence feels most natural to you?</p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleQuizAnswer('A1')}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-700/60 hover:bg-blue-600/30 text-xs text-slate-200"
                  >
                    "I am a student. I live in a quiet apartment with my cat." (A1)
                  </button>
                  <button
                    onClick={() => handleQuizAnswer('B1')}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-700/60 hover:bg-blue-600/30 text-xs text-slate-200"
                  >
                    "Although the traffic was congested, I managed to arrive before the conference commenced." (B1)
                  </button>
                  <button
                    onClick={() => handleQuizAnswer('C1')}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-700/60 hover:bg-blue-600/30 text-xs text-slate-200"
                  >
                    "The author subtly deconstructs conventional narrative paradigms through deliberate syntactic ambiguity." (C1)
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {CEFR_LEVELS.map((item) => (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => setLevel(item.level)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    level === item.level
                      ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm text-white">{item.title}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  {level === item.level && <CheckCircle className="w-5 h-5 text-blue-400" />}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Native Language for translations */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-white">Choose your native/translation language</h2>
              <p className="text-xs text-slate-400 mt-1">
                Your personal vocabulary notebook and hints will be shown with translations in this tongue.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                { code: 'uz', name: "O'zbek tili", flag: '🇺🇿' },
                { code: 'en', name: 'English', flag: '🇬🇧' },
                { code: 'ru', name: 'Русский', flag: '🇷🇺' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setNativeLanguage(item.code)}
                  className={`p-5 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                    nativeLanguage === item.code
                      ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-3xl">{item.flag}</span>
                  <span className="font-bold text-sm text-white">{item.name}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleFinish}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all active:scale-98 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{loading ? 'Setting up Dashboard...' : 'Enter Dashboard'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
