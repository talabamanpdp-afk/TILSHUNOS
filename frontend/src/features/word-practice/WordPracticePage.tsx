import React, { useState } from 'react';
import { api } from '../../lib/api';
import { 
  PracticeDirection, PracticeSession, PracticeAttemptResult, 
  PracticeSessionSummary, VocabularyEntry 
} from '../../types';
import { 
  PlayCircle, Sparkles, HelpCircle, CheckCircle, 
  XCircle, RotateCcw, ArrowRight, ShieldCheck, Award, Flame 
} from 'lucide-react';

export const WordPracticePage: React.FC = () => {
  // Phase: 'config' | 'practicing' | 'summary'
  const [phase, setPhase] = useState<'config' | 'practicing' | 'summary'>('config');

  // Config options
  const [direction, setDirection] = useState<PracticeDirection>('TargetToNative');
  const [sessionSize, setSessionSize] = useState<number>(5);
  const [includeLearned, setIncludeLearned] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [configError, setConfigError] = useState<string | null>(null);

  // Active session
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [usedHintOnCurrent, setUsedHintOnCurrent] = useState<boolean>(false);
  const [revealedHint, setRevealedHint] = useState<string | null>(null);
  const [hintsRemaining, setHintsRemaining] = useState<number>(3);
  const [lastResult, setLastResult] = useState<PracticeAttemptResult | null>(null);

  // Summary
  const [summary, setSummary] = useState<PracticeSessionSummary | null>(null);

  const handleStartSession = async () => {
    setConfigError(null);
    setLoading(true);

    try {
      const data = await api.post<PracticeSession>('/practice/start', {
        languageCode: 'en',
        direction,
        sessionSize,
        includeLearnedWords: includeLearned,
      });

      setSession(data);
      setCurrentIndex(0);
      setHintsRemaining(data.hintsRemaining);
      setUsedHintOnCurrent(false);
      setRevealedHint(null);
      setLastResult(null);
      setPhase('practicing');
    } catch (err: any) {
      setConfigError(err.message || 'Failed to start practice session.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestHint = async () => {
    if (!session || hintsRemaining <= 0) return;
    const currentQuestion = session.questions[currentIndex];

    try {
      const res: any = await api.post(`/practice/hint/${session.sessionId}?entryId=${currentQuestion.entryId}`);
      setRevealedHint(res.hint);
      setHintsRemaining(res.hintsRemaining);
      setUsedHintOnCurrent(true);
    } catch (err: any) {
      alert(err.message || 'Cannot use hint.');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !answerInput.trim() || lastResult) return;
    const currentQuestion = session.questions[currentIndex];

    try {
      const result = await api.post<PracticeAttemptResult>('/practice/answer', {
        sessionId: session.sessionId,
        entryId: currentQuestion.entryId,
        submittedAnswer: answerInput.trim(),
        usedHint: usedHintOnCurrent,
      });

      setLastResult(result);
      setHintsRemaining(result.hintsRemaining);
    } catch (err: any) {
      alert(err.message || 'Error submitting answer');
    }
  };

  const handleNextQuestion = async () => {
    if (!session) return;

    if (currentIndex + 1 < session.questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setAnswerInput('');
      setLastResult(null);
      setUsedHintOnCurrent(false);
      setRevealedHint(null);
    } else {
      // Finish session
      try {
        const sum = await api.post<PracticeSessionSummary>(`/practice/finish/${session.sessionId}`);
        setSummary(sum);
        setPhase('summary');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 pb-24 md:pb-12 text-slate-100">
      
      {/* 1. CONFIGURATION PHASE */}
      {phase === 'config' && (
        <div className="rounded-3xl glass-panel bg-slate-900/90 border border-slate-800 p-6 sm:p-10 shadow-2xl max-w-xl mx-auto space-y-6 animate-in fade-in">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/10">
              <PlayCircle className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Start Word Practice</h1>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic evaluation, randomized orders, and strict anti-cheat scoring.
            </p>
          </div>

          {configError && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {configError}
            </div>
          )}

          {/* Direction options */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Practice Direction</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'TargetToNative', label: 'English → Uzbek' },
                { val: 'NativeToTarget', label: 'Uzbek → English' },
                { val: 'Mixed', label: 'Random Mixed' },
              ].map((d) => (
                <button
                  key={d.val}
                  type="button"
                  onClick={() => setDirection(d.val as PracticeDirection)}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                    direction === d.val
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Session Size */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Words per Session</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSessionSize(size)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    sessionSize === size
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {size} Words
                </button>
              ))}
            </div>
          </div>

          {/* Include learned toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <p className="text-xs font-bold text-white">Include Verified Learned Words</p>
              <p className="text-[11px] text-slate-400">Review words already mastered</p>
            </div>
            <input
              type="checkbox"
              checked={includeLearned}
              onChange={(e) => setIncludeLearned(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-700"
            />
          </div>

          {/* Rule note */}
          <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/20 flex items-center gap-2.5 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>A word enters <strong>Learned</strong> only after 3 consecutive correct answers without hints.</span>
          </div>

          <button
            onClick={handleStartSession}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Generating Session...' : 'Start Practice Now'}
          </button>
        </div>
      )}

      {/* 2. PRACTICING PHASE */}
      {phase === 'practicing' && session && (
        <div className="rounded-3xl glass-panel bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl max-w-xl mx-auto space-y-6 animate-in fade-in">
          
          {/* Header & Progress */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <span className="font-bold text-slate-200">
              Question {currentIndex + 1} of {session.questions.length}
            </span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className={hintsRemaining === 0 ? 'text-rose-400 font-bold' : 'text-amber-400 font-medium'}>
                {hintsRemaining} hints left
              </span>
            </div>
          </div>

          {/* Question Card */}
          <div className="text-center py-6">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase tracking-wider mb-2">
              {session.questions[currentIndex].directionPrompt}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {session.questions[currentIndex].promptWord}
            </h2>
            {session.questions[currentIndex].partOfSpeech && (
              <span className="text-xs text-slate-400 font-mono mt-1 inline-block">
                ({session.questions[currentIndex].partOfSpeech})
              </span>
            )}
          </div>

          {/* Hint revelation */}
          {revealedHint && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center animate-in fade-in">
              💡 Hint: {revealedHint}
            </div>
          )}

          {/* Answer Form */}
          {!lastResult ? (
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Type your translation..."
                className="w-full text-center text-lg font-medium px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRequestHint}
                  disabled={hintsRemaining <= 0 || usedHintOnCurrent}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Use Hint</span>
                </button>

                <button
                  type="submit"
                  disabled={!answerInput.trim()}
                  className="flex-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all"
                >
                  Check Answer
                </button>
              </div>
            </form>
          ) : (
            /* Result Feedback Card */
            <div className="space-y-4 animate-in zoom-in-95">
              <div
                className={`p-4 rounded-2xl border text-center ${
                  lastResult.isCorrect
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  {lastResult.isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-sm">Correct! Well done.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span className="font-bold text-sm">Incorrect answer</span>
                    </>
                  )}
                </div>
                <p className="text-xs mt-1">
                  Correct: <span className="font-bold text-white">{lastResult.correctAnswer}</span>
                </p>
                {lastResult.exampleSentence && (
                  <p className="text-[11px] text-slate-400 italic mt-2">
                    "{lastResult.exampleSentence}"
                  </p>
                )}
                <div className="mt-3 pt-2 border-t border-slate-800 flex justify-center items-center gap-2 text-[11px] text-slate-300 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Streak for this word: {lastResult.consecutiveCorrect}/3</span>
                </div>
              </div>

              <button
                type="button"
                autoFocus
                onClick={handleNextQuestion}
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>{currentIndex + 1 < session.questions.length ? 'Next Question' : 'Finish Session'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. SESSION SUMMARY PHASE */}
      {phase === 'summary' && summary && (
        <div className="rounded-3xl glass-panel bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl max-w-xl mx-auto space-y-6 text-center animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
            <Award className="w-9 h-9 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Session Completed!</h2>
            <p className="text-xs text-slate-400 mt-1">Your practice results are saved to your profile.</p>
          </div>

          {/* Big Accuracy Ring / Stat */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <p className="text-2xl font-extrabold text-blue-400">{summary.accuracyPercentage}%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <p className="text-2xl font-extrabold text-emerald-400">{summary.correctAnswers}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Correct</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <p className="text-2xl font-extrabold text-amber-400">{summary.hintsUsed}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Hints Used</p>
            </div>
          </div>

          {/* Promoted Words badge if any */}
          {summary.promotedToLearnedWords?.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Promoted to Learned Status (Verified)!</span>
              </div>
              <div className="space-y-1">
                {summary.promotedToLearnedWords.map((w) => (
                  <p key={w.id} className="text-xs text-slate-200">
                    • <span className="font-bold">{w.targetWord}</span> — {w.nativeTranslation}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Needs Review words */}
          {summary.needsReviewWords?.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-left">
              <p className="text-xs font-bold text-rose-400 mb-1">Words to Review:</p>
              <div className="space-y-1">
                {summary.needsReviewWords.map((w) => (
                  <p key={w.id} className="text-xs text-slate-300">
                    • {w.targetWord} ({w.nativeTranslation})
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setPhase('config')}
              className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              Start Another Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
