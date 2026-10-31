import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic, MicOff, Volume2, Play, Pause, CheckCircle2, XCircle, AlertCircle,
  Sparkles, Award, ArrowRight, ArrowLeft, RefreshCw, Eye, EyeOff, BookOpen,
  Headphones, PenLine, Check, HelpCircle, Sun, Moon, Clock, Trophy, Shuffle
} from 'lucide-react';
import {
  TrialTestsConfig, INITIAL_TRIAL_CONFIG, WordQuizItem,
  SpeakingQuestion, SpeakingDescribeImage, ReadingTestItem,
  ListeningTestItem, WritingTestItem, GrammarTestItem
} from '../../data/trialTestData';
import { playSpeech, stopSpeech, startListening, isSpeechRecognitionSupported, SupportedLang } from '../../utils/speech';

interface TrialTestPageProps {
  onBack: () => void;
  onRegister: () => void;
  dark?: boolean;
  setDark?: (dark: boolean) => void;
  cms?: any;
  onUpdateCms?: (cms: any) => void;
}

export type SkillType = 'speaking' | 'reading' | 'listening' | 'writing' | 'grammar' | 'word';

export const TRIAL_LANGUAGES = [
  { code: 'en', flag: '🇬🇧', name: 'Ingliz tili', sub: 'English' },
  { code: 'de', flag: '🇩🇪', name: 'Nemis tili', sub: 'Deutsch' },
  { code: 'ru', flag: '🇷🇺', name: 'Rus tili', sub: 'Русский язык' },
  { code: 'tr', flag: '🇹🇷', name: 'Turk tili', sub: 'Türkçe' },
  { code: 'uz', flag: '🇺🇿', name: 'O‘zbek tili', sub: 'O‘zbekcha' },
  { code: 'es', flag: '🇪🇸', name: 'Ispan tili', sub: 'Español' }
];

export const SKILL_CARDS: {
  key: SkillType;
  title: string;
  badge: string;
  desc: string;
  duration: string;
  icon: any;
  color: string;
}[] = [
  {
    key: 'speaking',
    title: 'Speaking (Nutq)',
    badge: '5 savol + 1 rasm',
    desc: '30s qisqa savollar va 60s rasm tasvirlash. 1 martalik mic va AI tashxisi.',
    duration: '4-5 daqiqa',
    icon: Mic,
    color: '#8b5cf6'
  },
  {
    key: 'reading',
    title: 'Reading (O‘qish)',
    badge: 'Matn & Gap-fill',
    desc: 'Ilmiy-ommabop matn tahlili va bo‘sh joylarni to‘g‘ri so‘zlar bilan to‘ldirish.',
    duration: '6-8 daqiqa',
    icon: BookOpen,
    color: '#3b82f6'
  },
  {
    key: 'listening',
    title: 'Listening (Tinglash)',
    badge: 'Max 2 marta ijro',
    desc: 'Audioni orqaga/oldinga o‘tkazib bo‘lmaydi. Aniq 2 marta tinglab bo‘sh joylarni topish.',
    duration: '3-4 daqiqa',
    icon: Headphones,
    color: '#ec4899'
  },
  {
    key: 'writing',
    title: 'Writing (Yozish)',
    badge: 'Kamida 150 so‘z',
    desc: 'Berilgan mavzuda insho yozish va bir zumda AI repetitordan chuqur tahlil olish.',
    duration: '10-15 daqiqa',
    icon: PenLine,
    color: '#10b981'
  },
  {
    key: 'grammar',
    title: 'Grammar (Grammatika)',
    badge: 'Xatolikni aniqlash',
    desc: 'Matndagi grammatik xatoliklarni topish va qoidalarni o‘rganish testi.',
    duration: '4-6 daqiqa',
    icon: Sparkles,
    color: '#f59e0b'
  },
  {
    key: 'word',
    title: 'Word Quiz (Rasmli so‘zlar)',
    badge: '100 tadan 10 ta random',
    desc: '100 ta rasm ichidan tasodifiy 10 ta quiz savoli. Oxirida xatolar tahlili.',
    duration: '2-3 daqiqa',
    icon: Trophy,
    color: '#06b6d4'
  }
];

export function TrialTestPage({ onBack, onRegister, dark = false, setDark, cms }: TrialTestPageProps) {
  // Config loaded from CMS or default
  const config: TrialTestsConfig = cms?.trialTests || INITIAL_TRIAL_CONFIG;

  // Selected language and skill
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [selectedSkill, setSelectedSkill] = useState<SkillType | null>(null);

  return (
    <div className={`trial-page-shell ${dark ? 'dark' : ''}`}>
      {/* Dynamic Styling */}
      <style>{`
        .trial-page-shell {
          min-height: 100vh;
          background: #f6f7fb;
          color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          transition: background-color 0.25s ease, color 0.25s ease;
          display: flex;
          flex-direction: column;
        }
        .trial-page-shell.dark {
          background: #0f111a;
          color: #f1f5f9;
        }

        /* Header */
        .trial-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 28px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.07);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .trial-page-shell.dark .trial-header {
          background: rgba(17, 24, 39, 0.85);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .trial-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: inherit;
          text-align: left;
        }
        .trial-brand img {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          object-fit: cover;
        }
        .trial-brand-text {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.3px;
        }
        .trial-brand-badge {
          display: inline-block;
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
          background: #7869f518;
          color: #7869f5;
          margin-left: 6px;
        }

        .trial-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .trial-btn-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.1);
          background: transparent;
          color: inherit;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .trial-page-shell.dark .trial-btn-icon {
          border-color: rgba(255,255,255,0.12);
        }
        .trial-btn-icon:hover {
          background: rgba(120, 105, 245, 0.1);
          color: #7869f5;
        }

        .trial-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 700;
          background: transparent;
          border: 1px solid rgba(0, 0, 0, 0.12);
          color: inherit;
          cursor: pointer;
          transition: all 0.2s;
        }
        .trial-page-shell.dark .trial-back-btn {
          border-color: rgba(255, 255, 255, 0.15);
        }
        .trial-back-btn:hover {
          background: rgba(120, 105, 245, 0.1);
          border-color: #7869f5;
          color: #7869f5;
        }

        /* Container */
        .trial-container {
          max-width: 1040px;
          width: 100%;
          margin: 0 auto;
          padding: 32px 20px 60px;
          flex: 1;
        }

        /* Selection Screen */
        .trial-hero {
          text-align: center;
          margin-bottom: 36px;
        }
        .trial-hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #7869f5;
          background: rgba(120, 105, 245, 0.1);
          padding: 5px 12px;
          border-radius: 100px;
          margin-bottom: 12px;
        }
        .trial-hero h1 {
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 900;
          letter-spacing: -0.6px;
          margin: 0 0 10px;
        }
        .trial-hero p {
          font-size: 15px;
          color: #64748b;
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .trial-page-shell.dark .trial-hero p {
          color: #94a3b8;
        }

        /* Language Picker */
        .trial-lang-picker {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 36px;
        }
        .trial-lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 14px;
          background: #ffffff;
          border: 1.5px solid rgba(0, 0, 0, 0.08);
          color: inherit;
          font-size: 14px;
          font-weight: 750;
          cursor: pointer;
          transition: all 0.2s;
        }
        .trial-page-shell.dark .trial-lang-btn {
          background: #181c2e;
          border-color: rgba(255, 255, 255, 0.08);
        }
        .trial-lang-btn:hover {
          border-color: #7869f5;
          transform: translateY(-2px);
        }
        .trial-lang-btn.active {
          background: linear-gradient(135deg, #7869f5 0%, #5b4bf0 100%);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 6px 18px rgba(120, 105, 245, 0.35);
        }

        /* Skills Grid */
        .trial-skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
          gap: 18px;
        }
        .trial-skill-card {
          background: #ffffff;
          border: 1.5px solid rgba(0, 0, 0, 0.07);
          border-radius: 20px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          overflow: hidden;
          text-align: left;
        }
        .trial-page-shell.dark .trial-skill-card {
          background: #181c2e;
          border-color: rgba(255, 255, 255, 0.08);
        }
        .trial-skill-card:hover {
          transform: translateY(-4px);
          border-color: #7869f5;
          box-shadow: 0 14px 32px rgba(120, 105, 245, 0.16);
        }
        .trial-skill-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: #ffffff;
        }
        .trial-skill-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(0,0,0,0.05);
          color: #64748b;
          text-transform: uppercase;
        }
        .trial-page-shell.dark .trial-skill-badge {
          background: rgba(255,255,255,0.06);
          color: #94a3b8;
        }
        .trial-skill-card h3 {
          font-size: 18px;
          font-weight: 800;
          margin: 0;
        }
        .trial-skill-card p {
          font-size: 13.5px;
          color: #64748b;
          line-height: 1.55;
          margin: 0;
          flex: 1;
        }
        .trial-page-shell.dark .trial-skill-card p {
          color: #94a3b8;
        }
        .trial-skill-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid rgba(0,0,0,0.05);
          font-size: 12.5px;
          font-weight: 700;
          color: #7869f5;
        }
        .trial-page-shell.dark .trial-skill-footer {
          border-top-color: rgba(255,255,255,0.06);
        }

        /* Active Test Shell */
        .trial-active-wrap {
          background: #ffffff;
          border: 1.5px solid rgba(0, 0, 0, 0.08);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.04);
        }
        .trial-page-shell.dark .trial-active-wrap {
          background: #181c2e;
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2);
        }

        .trial-active-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding-bottom: 20px;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
        .trial-page-shell.dark .trial-active-nav {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }
      `}</style>

      {/* Header */}
      <header className="trial-header">
        <button className="trial-brand" onClick={onBack}>
          <img
            src="/brand_logo.png"
            alt="TILŞUNOS"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/favicon.ico'; }}
          />
          <div>
            <div className="trial-brand-text">
              TILŞUNOS<span className="trial-brand-badge">SINOV DARAJASI</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Boşlanğiç diagnostika testi</div>
          </div>
        </button>

        <div className="trial-header-actions">
          {selectedSkill && (
            <button
              className="trial-back-btn"
              onClick={() => setSelectedSkill(null)}
              title="Boşqa skillni tanlaş"
            >
              <RefreshCw size={14} /> Boşqa sinovni tanlaş
            </button>
          )}

          {setDark && (
            <button
              className="trial-btn-icon"
              onClick={() => setDark(!dark)}
              title={dark ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}

          <button className="trial-back-btn" onClick={onBack}>
            <ArrowLeft size={15} /> Chiqish
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="trial-container">
        {!selectedSkill ? (
          /* STEP 1: PRE-TEST SELECTOR */
          <div>
            <div className="trial-hero">
              <span className="trial-hero-kicker">
                <Sparkles size={14} /> BOSHLANG‘ICH DIAGNOSTIKA
              </span>
              <h1>O‘zingizni qaysi yo‘nalishda sinamoqchisiz?</h1>
              <p>
                Avval tilni, so‘ngra 6 ta amaliy ko‘nikmadan birini tanlang.
                AI repetitor sizning darajangizni aniqlab, kamchiliklaringizni ko‘rsatib beradi.
              </p>
            </div>

            {/* Language Selector */}
            <div style={{ textAlign: 'center', marginBottom: '12px', fontSize: '13px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              1. Tilni tanlang:
            </div>
            <div className="trial-lang-picker">
              {TRIAL_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  className={`trial-lang-btn ${selectedLang === lang.code ? 'active' : ''}`}
                  onClick={() => setSelectedLang(lang.code)}
                >
                  <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>

            {/* Skills Grid */}
            <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '13px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              2. Sinov turini tanlang:
            </div>
            <div className="trial-skills-grid">
              {SKILL_CARDS.map(skill => {
                const Icon = skill.icon;
                return (
                  <button
                    key={skill.key}
                    className="trial-skill-card"
                    onClick={() => setSelectedSkill(skill.key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="trial-skill-icon-wrap" style={{ background: skill.color }}>
                        <Icon size={24} />
                      </div>
                      <span className="trial-skill-badge">{skill.badge}</span>
                    </div>

                    <div>
                      <h3>{skill.title}</h3>
                      <p>{skill.desc}</p>
                    </div>

                    <div className="trial-skill-footer">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} /> {skill.duration}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Boshlash <ArrowRight size={14} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* STEP 2: ACTIVE SKILL TEST */
          <div className="trial-active-wrap">
            <div className="trial-active-nav">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>
                  {TRIAL_LANGUAGES.find(l => l.code === selectedLang)?.flag}
                </span>
                <div>
                  <strong style={{ fontSize: '17px', display: 'block' }}>
                    {SKILL_CARDS.find(s => s.key === selectedSkill)?.title}
                  </strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {TRIAL_LANGUAGES.find(l => l.code === selectedLang)?.name} sinovi
                  </span>
                </div>
              </div>

              <button
                className="trial-back-btn"
                onClick={() => setSelectedSkill(null)}
              >
                ← Boshqa skillni tanlash
              </button>
            </div>

            {/* Render Specific Skill Component */}
            {selectedSkill === 'speaking' && (
              <SpeakingTrialModule
                config={config.speaking}
                lang={selectedLang}
                onComplete={onRegister}
              />
            )}
            {selectedSkill === 'reading' && (
              <ReadingTrialModule
                tests={config.reading}
                lang={selectedLang}
                onComplete={onRegister}
              />
            )}
            {selectedSkill === 'listening' && (
              <ListeningTrialModule
                testItem={config.listening}
                lang={selectedLang}
                onComplete={onRegister}
              />
            )}
            {selectedSkill === 'writing' && (
              <WritingTrialModule
                testItem={config.writing}
                lang={selectedLang}
                onComplete={onRegister}
              />
            )}
            {selectedSkill === 'grammar' && (
              <GrammarTrialModule
                testItem={config.grammar}
                lang={selectedLang}
                onComplete={onRegister}
              />
            )}
            {selectedSkill === 'word' && (
              <WordQuizTrialModule
                pool={config.wordPool}
                lang={selectedLang}
                onComplete={onRegister}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* =====================================================================
   1. SPEAKING MODULE
   Part 1: 5 short questions (30s countdown, 1-shot mic, AI diagnosis).
   Part 2: Describe Image (60s countdown, mic, AI diagnosis).
   Result: Comprehensive CEFR speaking report.
   ===================================================================== */
function SpeakingTrialModule({
  config,
  lang,
  onComplete
}: {
  config: TrialTestsConfig['speaking'];
  lang: string;
  onComplete: () => void;
}) {
  // Step: 'part1' (0..4) | 'part2' | 'result'
  const [currentPart, setCurrentPart] = useState<'part1' | 'part2' | 'result'>('part1');
  const [qIndex, setQIndex] = useState(0); // 0 to 4
  const questions = config.part1Questions.length > 0 ? config.part1Questions : INITIAL_TRIAL_CONFIG.speaking.part1Questions;

  // Random Part 2 Image
  const describeImage = useMemo(() => {
    const list = config.part2Images.length > 0 ? config.part2Images : INITIAL_TRIAL_CONFIG.speaking.part2Images;
    return list[Math.floor(Math.random() * list.length)];
  }, [config.part2Images]);

  // Mic state & timers
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [recognizedText, setRecognizedText] = useState('');
  const [part1Answers, setPart1Answers] = useState<Record<number, { text: string; score: number; feedback: string }>>({});
  const [hasRecordedCurrent, setHasRecordedCurrent] = useState(false);

  // Part 2 states
  const [part2Answer, setPart2Answer] = useState<{ text: string; score: number; feedback: string } | null>(null);
  const [hasRecordedPart2, setHasRecordedPart2] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let interval: any;
    if (isRecording && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            handleStopRecording();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, timeLeft]);

  // Start Part 1 Recording (30s)
  const handleStartPart1 = () => {
    if (hasRecordedCurrent) return;
    if (!isSpeechRecognitionSupported()) {
      alert('Brauzeringizda mikrofondan ovoz yozib olish (Speech Recognition) qo‘llab-quvvatlanmaydi.');
      return;
    }
    setIsRecording(true);
    setTimeLeft(30);
    setRecognizedText('');

    startListening({
      lang: lang as SupportedLang,
      expectedWord: questions[qIndex]?.question,
      onPartial: (p) => setRecognizedText(p),
      onResult: (res) => {
        const text = res.transcript || 'Javob qabul qilindi';
        setRecognizedText(text);
        finishPart1Question(text, res.confidence);
      },
      onError: () => {
        setIsRecording(false);
        finishPart1Question(recognizedText || 'Javob qisman yozib olindi', 0.8);
      },
      onEnd: () => {
        setIsRecording(false);
      }
    });
  };

  const handleStopRecording = () => {
    stopSpeech();
    setIsRecording(false);
    if (!hasRecordedCurrent) {
      finishPart1Question(recognizedText || 'Audioni tahlil qilish yakunlandi', 0.85);
    }
  };

  const finishPart1Question = (text: string, confidence: number) => {
    setHasRecordedCurrent(true);
    setIsRecording(false);
    // AI Diagnosis Simulation
    const score = Math.max(72, Math.min(96, Math.round(confidence * 100) || 84));
    const feedback = score > 88
      ? 'Ajoyib ravonlik, to‘g‘ri leksika va tabiiy talaffuz!'
      : 'Yaxshi muloqot, biroq gap tuzilishida sodda fe’l shakllariga e’tibor bering.';

    setPart1Answers(prev => ({
      ...prev,
      [qIndex]: { text, score, feedback }
    }));
  };

  const handleNextPart1Question = () => {
    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1);
      setHasRecordedCurrent(false);
      setRecognizedText('');
      setTimeLeft(30);
    } else {
      // Move to Part 2
      setCurrentPart('part2');
      setTimeLeft(60);
      setRecognizedText('');
      setHasRecordedPart2(false);
    }
  };

  // Start Part 2 Recording (60s)
  const handleStartPart2 = () => {
    if (hasRecordedPart2) return;
    if (!isSpeechRecognitionSupported()) {
      alert('Brauzeringizda mikrofondan ovoz yozib olish qo‘llab-quvvatlanmaydi.');
      return;
    }
    setIsRecording(true);
    setTimeLeft(60);
    setRecognizedText('');

    startListening({
      lang: lang as SupportedLang,
      expectedWord: describeImage.title,
      onPartial: (p) => setRecognizedText(p),
      onResult: (res) => {
        const text = res.transcript || 'Rasm tasviri to‘liq yozib olindi';
        setRecognizedText(text);
        finishPart2(text, res.confidence);
      },
      onError: () => {
        setIsRecording(false);
        finishPart2(recognizedText || 'Tasvir muvaffaqiyatli saqlandi', 0.82);
      },
      onEnd: () => setIsRecording(false)
    });
  };

  const finishPart2 = (text: string, confidence: number) => {
    setHasRecordedPart2(true);
    setIsRecording(false);
    const score = Math.max(75, Math.min(97, Math.round(confidence * 100) || 86));
    const feedback = 'Rasm detallari, ranglar va harakatlar juda yaxshi tasvirlab berildi.';
    setPart2Answer({ text, score, feedback });
  };

  // Calculate Overall Speaking Result
  const part1Avg = useMemo(() => {
    const vals = Object.values(part1Answers);
    if (!vals.length) return 80;
    return Math.round(vals.reduce((a, b) => a + b.score, 0) / vals.length);
  }, [part1Answers]);

  const overallSpeakingScore = useMemo(() => {
    const p2 = part2Answer?.score || 85;
    return Math.round((part1Avg * 0.5) + (p2 * 0.5));
  }, [part1Avg, part2Answer]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* PART 1: 5 SHORT QUESTIONS */}
      {currentPart === 'part1' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#7869f5', textTransform: 'uppercase' }}>
              1-QISM: QISQA SAVOLLAR (5 TAdan {qIndex + 1}-si)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 800, color: timeLeft <= 10 ? '#ef4444' : '#7869f5' }}>
              <Clock size={16} /> {timeLeft} soniya
            </div>
          </div>

          {/* Question Card */}
          <div style={{ padding: '24px', background: 'rgba(120, 105, 245, 0.05)', borderRadius: '18px', border: '1.5px solid rgba(120, 105, 245, 0.15)', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px' }}>
              {questions[qIndex]?.question}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              {questions[qIndex]?.translation}
            </p>
            {questions[qIndex]?.hint && (
              <div style={{ marginTop: '12px', fontSize: '12.5px', color: '#7869f5', fontWeight: 650 }}>
                💡 Maslahat: {questions[qIndex]?.hint}
              </div>
            )}
          </div>

          {/* Recording Status & Transcript */}
          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            {!hasRecordedCurrent ? (
              <button
                onClick={isRecording ? handleStopRecording : handleStartPart1}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px 32px',
                  borderRadius: '100px',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#ffffff',
                  background: isRecording ? '#ef4444' : 'linear-gradient(135deg, #7869f5 0%, #5b4bf0 100%)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: isRecording ? '0 0 24px rgba(239, 68, 68, 0.5)' : '0 8px 24px rgba(120, 105, 245, 0.35)',
                  transition: 'all 0.2s'
                }}
              >
                {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
                {isRecording ? 'Javobni yakunlash (Mikrofonni o‘chirish)' : 'Mikrofonni yoqish va javob berish (30s)'}
              </button>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 750, fontSize: '14px' }}>
                <CheckCircle2 size={18} /> Javob 1 marta qabul qilindi va tahlil qilindi
              </div>
            )}

            <div style={{ marginTop: '16px', minHeight: '44px', fontStyle: 'italic', fontSize: '14.5px', color: '#475569' }}>
              {recognizedText ? `"${recognizedText}"` : (isRecording ? 'Siz gapirayapsiz, eshitmoqdaman...' : 'Mikrofon bir martalik rejimda ishlaydi.')}
            </div>
          </div>

          {/* AI Diagnosis Result for this Question */}
          {hasRecordedCurrent && part1Answers[qIndex] && (
            <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.08)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#7869f5' }}>
                  🤖 AI Repetitor Diagnostikasi:
                </span>
                <span style={{ fontSize: '15px', fontWeight: 850, color: '#10b981' }}>
                  {part1Answers[qIndex].score} / 100 ball
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#334155' }}>
                {part1Answers[qIndex].feedback}
              </p>
            </div>
          )}

          {/* Action Button */}
          {hasRecordedCurrent && (
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={handleNextPart1Question}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '14.5px',
                  fontWeight: 800,
                  color: '#ffffff',
                  background: '#7869f5',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {qIndex < questions.length - 1 ? 'Keyingi savolga o‘tish' : '2-Qism: Rasm tasvirlashga o‘tish'} <ArrowRight size={17} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* PART 2: DESCRIBE IMAGE (60s) */}
      {currentPart === 'part2' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#7869f5', textTransform: 'uppercase' }}>
              2-QISM: RASMNI TASVIRLASH (DESCRIBE IMAGE)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 800, color: timeLeft <= 15 ? '#ef4444' : '#7869f5' }}>
              <Clock size={16} /> {timeLeft} soniya
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div>
              <img
                src={describeImage.imageUrl}
                alt={describeImage.title}
                style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '16px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
                {describeImage.title}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                {describeImage.descriptionHint}
              </p>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#7869f5', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Foydali so‘zlar:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {describeImage.keyVocabulary.map((kw, i) => (
                    <span key={i} style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: 'rgba(120, 105, 245, 0.1)', color: '#7869f5' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recording Controls */}
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            {!hasRecordedPart2 ? (
              <button
                onClick={isRecording ? () => finishPart2(recognizedText || 'Tasvir yakunlandi', 0.85) : handleStartPart2}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px 32px',
                  borderRadius: '100px',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#ffffff',
                  background: isRecording ? '#ef4444' : 'linear-gradient(135deg, #7869f5 0%, #5b4bf0 100%)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: isRecording ? '0 0 24px rgba(239, 68, 68, 0.5)' : '0 8px 24px rgba(120, 105, 245, 0.35)'
                }}
              >
                {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
                {isRecording ? 'Tasvirni yakunlash' : 'Rasmni tasvirlashni boshlash (60 soniya)'}
              </button>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 750, fontSize: '14px' }}>
                <CheckCircle2 size={18} /> Rasm tasvirlanishi muvaffaqiyatli qabul qilindi
              </div>
            )}

            <div style={{ marginTop: '16px', minHeight: '44px', fontStyle: 'italic', fontSize: '14px', color: '#475569' }}>
              {recognizedText ? `"${recognizedText}"` : 'Rasmni diqqat bilan ko‘rib, nimalarni ko‘rayotganingizni gapirib bering.'}
            </div>
          </div>

          {hasRecordedPart2 && (
            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <button
                onClick={() => setCurrentPart('result')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Umumiy Speaking Natijasini ko‘rish <Trophy size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* FINAL RESULT */}
      {currentPart === 'result' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
            <Award size={36} />
          </div>

          <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            SPEAKING DIAGNOSTIKASI YAKUNLANDI
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '8px 0 16px' }}>
            Sizning taxminiy darajangiz: {overallSpeakingScore >= 85 ? 'B2 (Mustaqil so‘zlashuvchi)' : 'B1 (O‘rta daraja)'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', maxWidth: '650px', margin: '24px auto' }}>
            <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(120, 105, 245, 0.08)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>1-QISM (QISQA SAVOLLAR)</div>
              <strong style={{ fontSize: '24px', color: '#7869f5' }}>{part1Avg} / 100</strong>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.08)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>2-QISM (RASM TASVIRLASH)</div>
              <strong style={{ fontSize: '24px', color: '#10b981' }}>{part2Answer?.score || 85} / 100</strong>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.08)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>UMUMIY BALL</div>
              <strong style={{ fontSize: '24px', color: '#f59e0b' }}>{overallSpeakingScore}%</strong>
            </div>
          </div>

          <p style={{ maxWidth: '600px', margin: '0 auto 28px', fontSize: '14.5px', color: '#64748b', lineHeight: '1.6' }}>
            Nutqingiz tushunarli, talaffuzingiz aniq. Keyingi bosqichda murakkab bog‘lovchilar va idiomalar ustida ishlab, C1 darajasiga chiqishingiz mumkin!
          </p>

          <button
            onClick={onComplete}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 32px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 800,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #7869f5 0%, #5b4bf0 100%)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            To‘liq shaxsiy o‘quv rejasini boshlash <ArrowRight size={17} />
          </button>
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   2. READING MODULE
   Comprehension & Gap-Fill Reading Formats with Explanations & Scoring.
   ===================================================================== */
function ReadingTrialModule({
  tests,
  lang,
  onComplete
}: {
  tests: ReadingTestItem[];
  lang: string;
  onComplete: () => void;
}) {
  const activeTestList = tests.length > 0 ? tests : INITIAL_TRIAL_CONFIG.reading;
  const [testIdx, setTestIdx] = useState(0);
  const currentTest = activeTestList[testIdx] || activeTestList[0];

  // User Answers
  const [compAnswers, setCompAnswers] = useState<Record<number, number>>({});
  const [gapAnswers, setGapAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Switch between comprehension and gap-fill
  const handleSelectTest = (idx: number) => {
    setTestIdx(idx);
    setCompAnswers({});
    setGapAnswers({});
    setIsSubmitted(false);
  };

  // Score calculation
  const totalQuestions = currentTest.type === 'comprehension'
    ? (currentTest.questions?.length || 0)
    : (currentTest.blanks?.length || 0);

  const correctCount = useMemo(() => {
    if (!isSubmitted) return 0;
    if (currentTest.type === 'comprehension' && currentTest.questions) {
      return currentTest.questions.filter((q, idx) => compAnswers[idx] === q.correctAnswer).length;
    }
    if (currentTest.type === 'gap_fill' && currentTest.blanks) {
      return currentTest.blanks.filter(b => gapAnswers[b.id]?.toLowerCase() === b.correctWord.toLowerCase()).length;
    }
    return 0;
  }, [isSubmitted, currentTest, compAnswers, gapAnswers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Test Sub-type Selector */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {activeTestList.map((t, i) => (
          <button
            key={t.id}
            onClick={() => handleSelectTest(i)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 750,
              cursor: 'pointer',
              border: testIdx === i ? 'none' : '1px solid rgba(0,0,0,0.1)',
              background: testIdx === i ? '#7869f5' : 'transparent',
              color: testIdx === i ? '#ffffff' : 'inherit'
            }}
          >
            {t.type === 'comprehension' ? '1-Tur: Matn va savollar' : '2-Tur: Bo‘sh joylarni to‘ldirish'} ({t.level})
          </button>
        ))}
      </div>

      {/* Reading Article Box */}
      <div style={{ padding: '24px', background: 'rgba(0,0,0,0.02)', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
            {currentTest.title}
          </h2>
          <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#7869f518', color: '#7869f5' }}>
            {currentTest.genre}
          </span>
        </div>

        <div style={{ fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-line', color: 'inherit' }}>
          {currentTest.text}
        </div>
      </div>

      {/* Questions: Comprehension Type */}
      {currentTest.type === 'comprehension' && currentTest.questions && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
            Matn asosida savollarga javob bering:
          </h3>

          {currentTest.questions.map((q, qIndex) => {
            const isUserCorrect = isSubmitted && compAnswers[qIndex] === q.correctAnswer;
            return (
              <div
                key={q.id}
                style={{
                  padding: '18px',
                  borderRadius: '14px',
                  background: isSubmitted
                    ? (isUserCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)')
                    : 'transparent',
                  border: '1px solid rgba(0,0,0,0.08)'
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 750, marginBottom: '12px' }}>
                  {qIndex + 1}. {q.question}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                  {q.options.map((opt, optIndex) => {
                    const isSelected = compAnswers[qIndex] === optIndex;
                    const isRightOption = optIndex === q.correctAnswer;

                    let bg = 'rgba(0,0,0,0.02)';
                    let border = '1px solid rgba(0,0,0,0.08)';
                    let color = 'inherit';

                    if (isSubmitted) {
                      if (isRightOption) {
                        bg = 'rgba(16, 185, 129, 0.15)';
                        border = '1px solid #10b981';
                        color = '#059669';
                      } else if (isSelected && !isRightOption) {
                        bg = 'rgba(239, 68, 68, 0.15)';
                        border = '1px solid #ef4444';
                        color = '#dc2626';
                      }
                    } else if (isSelected) {
                      bg = 'rgba(120, 105, 245, 0.12)';
                      border = '1.5px solid #7869f5';
                      color = '#7869f5';
                    }

                    return (
                      <button
                        key={optIndex}
                        disabled={isSubmitted}
                        onClick={() => setCompAnswers(prev => ({ ...prev, [qIndex]: optIndex }))}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: bg,
                          border: border,
                          color: color,
                          fontSize: '13.5px',
                          fontWeight: 650,
                          textAlign: 'left',
                          cursor: isSubmitted ? 'default' : 'pointer'
                        }}
                      >
                        <strong>{String.fromCharCode(65 + optIndex)})</strong> {opt}
                      </button>
                    );
                  })}
                </div>

                {isSubmitted && (
                  <div style={{ marginTop: '10px', fontSize: '13px', color: '#059669', fontWeight: 650 }}>
                    💡 Tushuntirish: {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Questions: Gap-Fill Type */}
      {currentTest.type === 'gap_fill' && currentTest.blanks && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
            Matndagi bo‘sh joylarga to‘g‘ri so‘zlarni tanlang:
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {currentTest.blanks.map(blank => {
              const selected = gapAnswers[blank.id] || '';
              const isRight = selected.toLowerCase() === blank.correctWord.toLowerCase();

              return (
                <div key={blank.id} style={{ padding: '14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#7869f5', marginBottom: '6px' }}>
                    {blank.label} ({isSubmitted ? (isRight ? '✅ To‘g‘ri' : `❌ Xato: ${blank.correctWord}`) : 'Tanlang'}):
                  </label>
                  <select
                    disabled={isSubmitted}
                    value={selected}
                    onChange={(e) => setGapAnswers(prev => ({ ...prev, [blank.id]: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.15)',
                      fontSize: '14px',
                      background: 'inherit',
                      color: 'inherit'
                    }}
                  >
                    <option value="">-- So‘zni tanlang --</option>
                    {blank.options.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit / Score Area */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
        {!isSubmitted ? (
          <button
            onClick={() => setIsSubmitted(true)}
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              background: '#7869f5',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Javoblarni tekshirish va natijani ko‘rish
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '17px', fontWeight: 850, color: '#10b981' }}>
              Natijangiz: {correctCount} / {totalQuestions} to‘g‘ri ({Math.round((correctCount / (totalQuestions || 1)) * 100)}%)
            </span>
            <button
              onClick={onComplete}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                background: '#10b981',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Rejaga qo‘shish →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   3. LISTENING MODULE
   STRICT CONSTRAINTS:
   - Seeking forward/backward is completely disabled.
   - Played exactly twice (2/2 -> 1/2 -> 0/2), then permanently locked.
   - Fill-in-the-blanks based on spoken words.
   ===================================================================== */
function ListeningTrialModule({
  testItem,
  lang,
  onComplete
}: {
  testItem: ListeningTestItem;
  lang: string;
  onComplete: () => void;
}) {
  const item = testItem || INITIAL_TRIAL_CONFIG.listening;

  // Max 2 plays rule
  const [playsLeft, setPlaysLeft] = useState<number>(2);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioElapsedSec, setAudioElapsedSec] = useState<number>(0);
  const totalDuration = item.totalDurationSec || 60;

  // User gap answers
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Play audio safely via TTS speech synthesis
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      return;
    }

    if (playsLeft <= 0) {
      alert('Tinglash limiti tugadi! Qoidaga ko‘ra audioni faqat 2 marta eshitish mumkin.');
      return;
    }

    setPlaysLeft(p => p - 1);
    setIsPlaying(true);
    setAudioElapsedSec(0);

    playSpeech(item.narrationScript, {
      lang: lang as SupportedLang,
      rate: 0.9,
      onEnd: () => {
        setIsPlaying(false);
        setAudioElapsedSec(totalDuration);
      },
      onError: () => {
        setIsPlaying(false);
      }
    });
  };

  // Progress timer (strictly informative, NO seeking!)
  useEffect(() => {
    let t: any;
    if (isPlaying) {
      t = setInterval(() => {
        setAudioElapsedSec(sec => {
          if (sec >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return sec + 1;
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [isPlaying, totalDuration]);

  // Clean audio on unmount
  useEffect(() => {
    return () => stopSpeech();
  }, []);

  const formatSecs = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const correctBlanksCount = useMemo(() => {
    if (!isSubmitted) return 0;
    return item.blanks.filter(b => userAnswers[b.id]?.toLowerCase() === b.correctWord.toLowerCase()).length;
  }, [isSubmitted, item.blanks, userAnswers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Strict Rule Notice */}
      <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={20} style={{ color: '#ec4899', flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
          <strong>Qat’iy qoidalar:</strong> Audioni oldinga yoki orqaga o‘tkazish taqiqlangan.
          Audioni jami <strong>2 marta</strong> tinglash mumkin. Shundan so‘ng pleyer bloklanadi.
        </div>
      </div>

      {/* Modern Locked Audio Player */}
      <div style={{ padding: '24px', background: '#1e1e2f', color: '#ffffff', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#a78bfa', fontWeight: 800 }}>
              AUDIO TINGLASH DARAJASI
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800 }}>
              {item.title}
            </h3>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '100px', background: playsLeft > 0 ? 'rgba(167, 139, 250, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: playsLeft > 0 ? '#c4b5fd' : '#f87171', fontSize: '12.5px', fontWeight: 800 }}>
            <Headphones size={14} /> Qolgan imkoniyat: {playsLeft}/2
          </div>
        </div>

        {/* Informative Progress Bar (NON-SEEKABLE) */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (audioElapsedSec / totalDuration) * 100)}%`, height: '100%', background: '#a78bfa', transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94a3b8', marginTop: '6px' }}>
            <span>{formatSecs(audioElapsedSec)}</span>
            <span>{formatSecs(totalDuration)}</span>
          </div>
        </div>

        {/* Play Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleTogglePlay}
            disabled={playsLeft <= 0 && !isPlaying}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: playsLeft <= 0 && !isPlaying ? '#475569' : '#a78bfa',
              color: '#ffffff',
              border: 'none',
              cursor: playsLeft <= 0 && !isPlaying ? 'not-allowed' : 'pointer',
              display: 'inline-grid',
              placeItems: 'center',
              boxShadow: isPlaying ? '0 0 20px rgba(167, 139, 250, 0.6)' : 'none'
            }}
            title={isPlaying ? 'Pauza' : (playsLeft > 0 ? 'Tinglash' : 'Limit tugagan')}
          >
            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: '3px' }} />}
          </button>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
            {isPlaying ? 'Audio ijro etilmoqda...' : (playsLeft > 0 ? 'Audioni tinglash uchun bosing' : '🔒 Tinglash limiti tugadi')}
          </div>
        </div>
      </div>

      {/* Gap-Fill Text Area */}
      <div>
        <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 800 }}>
          Audioni diqqat bilan eshitib, bo‘sh joylarni to‘ldiring:
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {item.blanks.map(blank => {
            const selected = userAnswers[blank.id] || '';
            const isRight = selected.toLowerCase() === blank.correctWord.toLowerCase();

            return (
              <div key={blank.id} style={{ padding: '14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#ec4899', marginBottom: '6px' }}>
                  {blank.blankNumber}-bo‘sh joy {isSubmitted ? (isRight ? '✅' : `❌ (${blank.correctWord})`) : ''}:
                </label>
                <select
                  disabled={isSubmitted}
                  value={selected}
                  onChange={(e) => setUserAnswers(prev => ({ ...prev, [blank.id]: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.15)',
                    fontSize: '14px',
                    background: 'inherit',
                    color: 'inherit'
                  }}
                >
                  <option value="">-- So‘zni tanlang --</option>
                  {blank.options.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
        {!isSubmitted ? (
          <button
            onClick={() => {
              stopSpeech();
              setIsPlaying(false);
              setIsSubmitted(true);
            }}
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              background: '#ec4899',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Tinglash testini tekshirish
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '17px', fontWeight: 850, color: '#10b981' }}>
              Natija: {correctBlanksCount} / {item.blanks.length} to‘g‘ri ({Math.round((correctBlanksCount / item.blanks.length) * 100)}%)
            </span>
            <button
              onClick={onComplete}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                background: '#10b981',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Rejaga saqlash →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   4. WRITING MODULE
   Requirements: Minimum 150 words with live counter.
   Instant AI Evaluation: Grammar, Lexicon, Coherence, CEFR level & fixes.
   ===================================================================== */
function WritingTrialModule({
  testItem,
  lang,
  onComplete
}: {
  testItem: WritingTestItem;
  lang: string;
  onComplete: () => void;
}) {
  const item = testItem || INITIAL_TRIAL_CONFIG.writing;
  const [essayText, setEssayText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Live word count
  const wordCount = useMemo(() => {
    const trimmed = essayText.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [essayText]);

  const minRequired = item.minWords || 150;
  const isRequirementMet = wordCount >= minRequired;

  const handleSubmitToAI = () => {
    if (!isRequirementMet) {
      alert(`Inshoda kamida ${minRequired} ta so‘z bo‘lishi lozim. Hozirda: ${wordCount} ta so‘z.`);
      return;
    }

    setIsAnalyzing(true);
    // Instant AI Diagnostic evaluation simulation
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        cefrScore: 'B2 (Upper-Intermediate)',
        overallScore: 86,
        grammarScore: 88,
        lexicalScore: 84,
        coherenceScore: 86,
        corrections: [
          {
            issue: 'Bog‘lovchilar xilma-xilligi',
            advice: 'Har bir xatboshi boshida "Furthermore", "In contrast", "Consequently" kabi bog‘lovchilardan kengroq foydalaning.'
          },
          {
            issue: 'Grammatik qat’iylik',
            advice: 'Murakkab ergash gaplarda zamonlar muvofiqligi (Sequence of Tenses) qoidasiga amal qiling.'
          }
        ],
        positivePoints: [
          'Fikrlar aniq va mantiqiy reja bo‘yicha bayon etilgan.',
          'Kirish, asosiy qism va xulosa aniq ajratilgan.',
          'Mavzuga oid maxsus atamalardan to‘g‘ri foydalanilgan.'
        ]
      });
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Topic Prompt */}
      <div style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '18px', border: '1.5px solid rgba(16, 185, 129, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.8px' }}>
            {item.genre} · KAMIDA {minRequired} TA SO‘Z
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: isRequirementMet ? '#10b981' : '#f59e0b' }}>
            {isRequirementMet ? '✅ Talab bajarildi' : `Yana ${minRequired - wordCount} ta so‘z kerak`}
          </span>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 10px' }}>
          {item.topicTitle}
        </h2>
        <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: '1.6', margin: '0 0 12px' }}>
          {item.promptDescription}
        </p>

        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: '#64748b' }}>
          {item.bulletPoints.map((bp, i) => (
            <li key={i}>{bp}</li>
          ))}
        </ul>
      </div>

      {/* Textarea & Word Counter */}
      <div>
        <textarea
          rows={10}
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          placeholder="Inshoni shu yerga yozing..."
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: isRequirementMet ? '1.5px solid #10b981' : '1.5px solid rgba(0,0,0,0.15)',
            fontSize: '15px',
            lineHeight: '1.7',
            background: 'inherit',
            color: 'inherit',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '13px' }}>
          <span style={{ fontWeight: 800, color: isRequirementMet ? '#10b981' : '#f59e0b' }}>
            {wordCount} / {minRequired} ta so‘z
          </span>
          <button
            onClick={() => setEssayText(item.sampleBand8Text || '')}
            style={{ background: 'none', border: 'none', color: '#7869f5', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            Namuna inshoni yuklash (Band 8.0)
          </button>
        </div>
      </div>

      {/* Action Button */}
      {!analysisResult && (
        <div>
          <button
            onClick={handleSubmitToAI}
            disabled={!isRequirementMet || isAnalyzing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '12px',
              background: isRequirementMet ? '#10b981' : '#94a3b8',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 800,
              border: 'none',
              cursor: isRequirementMet ? 'pointer' : 'not-allowed'
            }}
          >
            {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {isAnalyzing ? 'AI repetitor tekshirmoqda...' : 'AI yordamchiga jo‘natish va diagnoz olish'}
          </button>
        </div>
      )}

      {/* AI Diagnostic Report */}
      {analysisResult && (
        <div style={{ padding: '24px', borderRadius: '18px', background: 'rgba(16, 185, 129, 0.05)', border: '1.5px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
              🤖 AI Repetitor Yozma Tahlili
            </span>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#10b981' }}>
              {analysisResult.overallScore} ball ({analysisResult.cefrScore})
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Grammatika aniqligi</div>
              <strong style={{ fontSize: '18px', color: '#10b981' }}>{analysisResult.grammarScore}%</strong>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Leksik boylik</div>
              <strong style={{ fontSize: '18px', color: '#7869f5' }}>{analysisResult.lexicalScore}%</strong>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Mantiq & Koherensiya</div>
              <strong style={{ fontSize: '18px', color: '#f59e0b' }}>{analysisResult.coherenceScore}%</strong>
            </div>
          </div>

          <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 800 }}>
            Tuzatish va o‘rgatuvchi tavsiyalar:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
            {analysisResult.corrections.map((c: any, i: number) => (
              <div key={i} style={{ fontSize: '13px', lineHeight: '1.5', color: '#334155' }}>
                <strong style={{ color: '#ef4444' }}>• {c.issue}:</strong> {c.advice}
              </div>
            ))}
          </div>

          <button
            onClick={onComplete}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              background: '#10b981',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Yozish ko‘nikmasini rejaga qo‘shish →
          </button>
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   5. GRAMMAR MODULE
   Error Identification & Rule Explanations.
   ===================================================================== */
function GrammarTrialModule({
  testItem,
  lang,
  onComplete
}: {
  testItem: GrammarTestItem;
  lang: string;
  onComplete: () => void;
}) {
  const item = testItem || INITIAL_TRIAL_CONFIG.grammar;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const correctCount = useMemo(() => {
    if (!isSubmitted) return 0;
    return item.questions.filter((q, idx) => answers[idx] === q.errorIndex).length;
  }, [isSubmitted, item.questions, answers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.06)', borderRadius: '16px', border: '1.5px solid rgba(245, 158, 11, 0.2)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px' }}>
          {item.title} ({item.level})
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
          {item.passage}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {item.questions.map((q, qIdx) => {
          const isUserRight = isSubmitted && answers[qIdx] === q.errorIndex;

          return (
            <div
              key={q.id}
              style={{
                padding: '18px',
                borderRadius: '14px',
                border: '1px solid rgba(0,0,0,0.08)',
                background: isSubmitted ? (isUserRight ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)') : 'transparent'
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
                {qIdx + 1}. Gap: <em>"{q.sentence}"</em>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {q.highlightedOptions.map((opt, optIdx) => {
                  const isSelected = answers[qIdx] === optIdx;
                  const isTheError = optIdx === q.errorIndex;

                  let bg = 'rgba(0,0,0,0.03)';
                  let color = 'inherit';
                  let border = '1px solid rgba(0,0,0,0.08)';

                  if (isSubmitted) {
                    if (isTheError) {
                      bg = 'rgba(16, 185, 129, 0.15)';
                      border = '1px solid #10b981';
                      color = '#059669';
                    } else if (isSelected && !isTheError) {
                      bg = 'rgba(239, 68, 68, 0.15)';
                      border = '1px solid #ef4444';
                      color = '#dc2626';
                    }
                  } else if (isSelected) {
                    bg = 'rgba(245, 158, 11, 0.15)';
                    border = '1.5px solid #f59e0b';
                    color = '#d97706';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isSubmitted}
                      onClick={() => setAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: bg,
                        border: border,
                        color: color,
                        fontSize: '13.5px',
                        fontWeight: 750,
                        cursor: isSubmitted ? 'default' : 'pointer'
                      }}
                    >
                      [{String.fromCharCode(65 + optIdx)}] {opt}
                    </button>
                  );
                })}
              </div>

              {isSubmitted && (
                <div style={{ marginTop: '12px', fontSize: '13px', lineHeight: '1.5' }}>
                  <div style={{ color: '#059669', fontWeight: 750 }}>
                    To‘g‘ri shakli: {q.correctCorrection}
                  </div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>
                    Qoida: {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {!isSubmitted ? (
          <button
            onClick={() => setIsSubmitted(true)}
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              background: '#f59e0b',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Grammatikani tekshirish
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '17px', fontWeight: 850, color: '#10b981' }}>
              Natija: {correctCount} / {item.questions.length} to‘g‘ri ({Math.round((correctCount / item.questions.length) * 100)}%)
            </span>
            <button
              onClick={onComplete}
              style={{
                padding: '10px 22px',
                borderRadius: '10px',
                background: '#10b981',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Rejaga saqlash →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   6. WORD QUIZ MODULE (100 RASMLARDAN 10 TA RANDOM RASM)
   - Picks 10 random images from the 100-pool.
   - 4-choice quiz per image.
   - Shows total score + gallery of missed images with correct answers.
   ===================================================================== */
function WordQuizTrialModule({
  pool,
  lang,
  onComplete
}: {
  pool: WordQuizItem[];
  lang: string;
  onComplete: () => void;
}) {
  const activePool = pool.length > 0 ? pool : INITIAL_TRIAL_CONFIG.wordPool;

  // 10 Random Images from 100
  const quizItems = useMemo(() => {
    const shuffled = [...activePool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, [activePool]);

  const [step, setStep] = useState(0); // 0 to 9
  const [userSelections, setUserSelections] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const currentItem = quizItems[step];

  const handleSelectOption = (chosenWord: string) => {
    setUserSelections(prev => ({ ...prev, [step]: chosenWord }));
    if (step < quizItems.length - 1) {
      setStep(step + 1);
    } else {
      setIsFinished(true);
    }
  };

  // Compute Results & Failed Items
  const correctCount = useMemo(() => {
    return quizItems.filter((item, idx) => userSelections[idx] === item.word).length;
  }, [quizItems, userSelections]);

  const missedItems = useMemo(() => {
    return quizItems
      .map((item, idx) => ({ item, selected: userSelections[idx] }))
      .filter(({ item, selected }) => selected !== item.word);
  }, [quizItems, userSelections]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {!isFinished ? (
        <div>
          {/* Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase' }}>
              RASMLI SO‘ZLAR TESTI: 10 TAdan {step + 1}-si
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
              {step + 1} / 10
            </span>
          </div>

          <div style={{ height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ width: `${((step + 1) / 10) * 100}%`, height: '100%', background: '#06b6d4', transition: 'width 0.25s' }} />
          </div>

          {/* Current Question */}
          {currentItem && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
              <div style={{ borderRadius: '18px', overflow: 'hidden', height: '300px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                <img
                  src={currentItem.image}
                  alt="Word Quiz Item"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Kategoriya: {currentItem.category}
                </div>
                <h3 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900 }}>
                  Rasmdagi narsa/harakat qanday ataladi?
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  {currentItem.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(opt)}
                      style={{
                        padding: '14px 20px',
                        borderRadius: '12px',
                        background: 'rgba(6, 182, 212, 0.06)',
                        border: '1.5px solid rgba(6, 182, 212, 0.2)',
                        color: 'inherit',
                        fontSize: '15px',
                        fontWeight: 750,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#06b6d4';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(6, 182, 212, 0.06)';
                        e.currentTarget.style.color = 'inherit';
                      }}
                    >
                      <strong style={{ marginRight: '8px' }}>{String.fromCharCode(65 + i)}.</strong> {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* RESULT & MISSED WORDS GALLERY */
        <div style={{ padding: '16px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
              <Trophy size={32} />
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 6px' }}>
              Rasmli so‘zlar testi yakunlandi!
            </h2>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
              Natija: {correctCount} / 10 to‘g‘ri ({correctCount * 10}%)
            </div>
          </div>

          {/* Gallery of Missed Images */}
          {missedItems.length > 0 ? (
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#ef4444', marginBottom: '14px' }}>
                Xato qilingan so‘zlar va ularning to‘g‘ri javoblari:
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {missedItems.map(({ item, selected }, idx) => (
                  <div key={idx} style={{ borderRadius: '14px', border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden', background: 'rgba(0,0,0,0.02)' }}>
                    <img
                      src={item.image}
                      alt={item.word}
                      style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>
                        To‘g‘ri: {item.word}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                        O‘zbekcha: {item.translation} {item.phonetic && `(${item.phonetic})`}
                      </div>
                      <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', fontWeight: 650 }}>
                        Siz belgilagan: {selected || 'Belgilanmagan'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '16px', color: '#10b981', fontWeight: 800, marginBottom: '24px' }}>
              🎉 Qoyilmaqom! Barcha 10 ta rasmni 100% to‘g‘ri topdingiz!
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setStep(0);
                setUserSelections({});
                setIsFinished(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                background: '#06b6d4',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Shuffle size={16} /> Boshqa 10 ta yangi rasm bilan qayta sinash
            </button>

            <button
              onClick={onComplete}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                background: '#10b981',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Shaxsiy lug‘at daftariga o‘tish →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

