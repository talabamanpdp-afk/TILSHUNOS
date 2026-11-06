import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic, MicOff, Volume2, Play, Pause, CheckCircle2, XCircle, AlertCircle,
  Sparkles, Award, ArrowRight, ArrowLeft, RefreshCw, Eye, EyeOff, BookOpen,
  Headphones, PenLine, Check, HelpCircle, Sun, Moon, Clock, Trophy, Shuffle,
  Bot, Zap, RotateCcw, Send, Key, ExternalLink, Globe, ChevronDown
} from 'lucide-react';
import {
  TrialTestsConfig, INITIAL_TRIAL_CONFIG, WordQuizItem,
  SpeakingQuestion, SpeakingDescribeImage, ReadingTestItem,
  ListeningTestItem, WritingTestItem, WritingEssayItem, WritingLetterItem,
  GrammarTestItem, GrammarTopicItem, SkillType, DEFAULT_SKILL_COVERS,
  DEFAULT_WRITING_ESSAYS, DEFAULT_WRITING_LETTERS, DEFAULT_GRAMMAR_TOPICS
} from '../../data/trialTestData';
import {
  evaluateWritingWithGemini, evaluateSpeakingWithGemini,
  WritingEvaluationResult, SpeakingEvaluationResult,
  getStoredAiConfig, saveStoredAiConfig, syncAiConfigFromCms,
  askAiAboutSubmission, testGeminiConnection, GeminiAiConfig
} from '../../services/geminiAiService';
import { playSpeech, stopSpeech, startListening, isSpeechRecognitionSupported, SupportedLang } from '../../utils/speech';

function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

interface TrialTestPageProps {
  onBack: () => void;
  onRegister: () => void;
  dark?: boolean;
  setDark?: (dark: boolean) => void;
  cms?: any;
  onUpdateCms?: (cms: any) => void;
}

export const TRIAL_LANGUAGES = [
  { code: 'en', flag: '🇬🇧', name: 'Ingliz tili', sub: 'English' },
  { code: 'de', flag: '🇩🇪', name: 'Nemis tili', sub: 'Deutsch' },
  { code: 'ru', flag: '🇷🇺', name: 'Rus tili', sub: 'Русский язык' },
  { code: 'tr', flag: '🇹🇷', name: 'Turk tili', sub: 'Türkçe' },
  { code: 'uz', flag: '🇺🇿', name: 'Özbek tili', sub: 'Özbekça' },
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
  defaultBg: string;
}[] = [
  {
    key: 'speaking',
    title: 'Speaking (Nutq)',
    badge: '5 savol + 1 rasm',
    desc: '30s qisqa savollar va 60s rasm tasvirlash. AI teşxisi.',
    duration: '4-5 daqiqa',
    icon: Mic,
    color: '#8b5cf6',
    defaultBg: DEFAULT_SKILL_COVERS.speaking
  },
  {
    key: 'reading',
    title: 'Reading (Öqiş)',
    badge: 'Matn & Gap-fill',
    desc: 'Matn tahlili va böş joylarni töldiriş.',
    duration: '6-8 daqiqa',
    icon: BookOpen,
    color: '#3b82f6',
    defaultBg: DEFAULT_SKILL_COVERS.reading
  },
  {
    key: 'listening',
    title: 'Listening (Tinglaş)',
    badge: 'Maks 2 marta ijro',
    desc: '2 marta tinglab böş joylarni aniq topiş topşiriği.',
    duration: '3-4 daqiqa',
    icon: Headphones,
    color: '#ec4899',
    defaultBg: DEFAULT_SKILL_COVERS.listening
  },
  {
    key: 'writing',
    title: 'Writing (Yoziş)',
    badge: 'Kamida 150 söz',
    desc: 'Berilgan mavzuda inşo va AI repetitordan çuqur tahlil.',
    duration: '10-15 daqiqa',
    icon: PenLine,
    color: '#10b981',
    defaultBg: DEFAULT_SKILL_COVERS.writing
  },
  {
    key: 'grammar',
    title: 'Grammar (Grammatika)',
    badge: 'Xatolikni aniqlash',
    desc: 'Grammatik qoidalar, xatoliklarni topiş va tahlil testi.',
    duration: '4-6 daqiqa',
    icon: Sparkles,
    color: '#f59e0b',
    defaultBg: DEFAULT_SKILL_COVERS.grammar
  },
  {
    key: 'word',
    title: 'Word Quiz (Sözlar)',
    badge: '10 ta tasodifiy',
    desc: '100 ta rasm içidan 10 ta quiz savoli va xatolar tahlili.',
    duration: '2-3 daqiqa',
    icon: Trophy,
    color: '#06b6d4',
    defaultBg: DEFAULT_SKILL_COVERS.word
  }
];

export function TrialTestPage({ onBack, onRegister, dark = false, setDark, cms, onUpdateCms }: TrialTestPageProps) {
  // Config loaded from CMS or default
  const config: TrialTestsConfig = cms?.trialTests || INITIAL_TRIAL_CONFIG;

  // Selected language and skill
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [selectedSkill, setSelectedSkill] = useState<SkillType | null>(null);

  // Gemini AI Config Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [currentAiConfig, setCurrentAiConfig] = useState<GeminiAiConfig>(() => getStoredAiConfig());

  // Smart Sticky Navbar (Auto-hide on scroll down, auto-reveal on scroll up)
  const [navVisible, setNavVisible] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setNavScrolled(currentScrollY > 15);

      // Near top of page: always visible
      if (currentScrollY < 40) {
        setNavVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Scrolling UP: reveal navbar smoothly
      if (currentScrollY < lastScrollY.current - 4) {
        setNavVisible(true);
      }
      // Scrolling DOWN: hide navbar smoothly
      else if (currentScrollY > lastScrollY.current + 6 && currentScrollY > 60) {
        setNavVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync when cms changes
  useEffect(() => {
    if (config?.aiConfig?.apiKey) {
      syncAiConfigFromCms(config.aiConfig);
      setCurrentAiConfig(getStoredAiConfig());
    }
  }, [config?.aiConfig]);

  const handleSaveAiConfig = (cfg: GeminiAiConfig) => {
    saveStoredAiConfig(cfg);
    setCurrentAiConfig(cfg);
    if (onUpdateCms && cms) {
      onUpdateCms({
        ...cms,
        trialTests: {
          ...(cms?.trialTests || {}),
          aiConfig: cfg
        }
      });
    }
  };

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

        /* Fixed & Smart Sticky Header */
        .trial-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          z-index: 100;
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          box-sizing: border-box;
        }
        .trial-page-shell.dark .trial-header {
          background: rgba(15, 17, 26, 0.94);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
        }
        .trial-header.scrolled {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }
        .trial-page-shell.dark .trial-header.scrolled {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .trial-header.nav-hidden {
          transform: translateY(-100%);
        }
        .trial-header.nav-visible {
          transform: translateY(0);
        }

        .trial-page-shell {
          padding-top: 64px;
        }

        /* Brand */
        .trial-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: inherit;
          text-align: left;
          padding: 0;
        }
        .trial-brand img {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          object-fit: cover;
        }
        .trial-brand-text {
          font-size: 16px;
          font-weight: 850;
          letter-spacing: -0.3px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .trial-brand-badge {
          display: inline-block;
          font-size: 9.5px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 5px;
          background: rgba(120, 105, 245, 0.12);
          color: #7869f5;
          letter-spacing: 0.5px;
        }
        .trial-brand-sub {
          font-size: 11px;
          color: #64748b;
        }
        .trial-page-shell.dark .trial-brand-sub {
          color: #94a3b8;
        }

        .trial-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .trial-btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: transparent;
          color: inherit;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .trial-page-shell.dark .trial-btn-icon {
          border-color: rgba(255, 255, 255, 0.12);
        }
        .trial-btn-icon:hover {
          background: rgba(120, 105, 245, 0.1);
          color: #7869f5;
        }

        .trial-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 750;
          background: transparent;
          border: 1px solid rgba(0, 0, 0, 0.12);
          color: inherit;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
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
          padding: 24px 20px 60px;
          flex: 1;
          box-sizing: border-box;
        }

        /* Compact Top Bar */
        .trial-compact-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .trial-page-shell.dark .trial-compact-top-bar {
          border-bottom-color: rgba(255, 255, 255, 0.07);
        }
        .trial-top-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #7869f5;
          background: rgba(120, 105, 245, 0.1);
          padding: 3px 9px;
          border-radius: 9999px;
          margin-bottom: 4px;
        }
        .trial-top-heading {
          font-size: clamp(20px, 3.5vw, 26px);
          font-weight: 900;
          letter-spacing: -0.5px;
          margin: 0;
        }

        /* Language Dropdown Box */
        .trial-lang-dropdown-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .trial-lang-dropdown-label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 750;
          color: #64748b;
          white-space: nowrap;
        }
        .trial-page-shell.dark .trial-lang-dropdown-label {
          color: #94a3b8;
        }
        .trial-select-field-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .trial-lang-select-input {
          appearance: none;
          -webkit-appearance: none;
          background: #ffffff;
          border: 1.5px solid rgba(0, 0, 0, 0.12);
          border-radius: 12px;
          padding: 8px 34px 8px 14px;
          font-size: 13.5px;
          font-weight: 750;
          color: inherit;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .trial-page-shell.dark .trial-lang-select-input {
          background: #181c2e;
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        }
        .trial-lang-select-input:hover,
        .trial-lang-select-input:focus {
          border-color: #7869f5;
          outline: none;
          box-shadow: 0 0 0 3px rgba(120, 105, 245, 0.2);
        }
        .trial-select-arrow-icon {
          position: absolute;
          right: 12px;
          pointer-events: none;
          color: #64748b;
        }

        /* Skills Grid - 2 columns on mobile, 3 on desktop */
        .trial-skills-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 900px) {
          .trial-skills-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
        }
        @media (max-width: 640px) {
          .trial-skills-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .trial-header {
            padding: 0 14px !important;
            height: 56px !important;
          }
          .trial-page-shell {
            padding-top: 56px !important;
          }
          .trial-container {
            padding: 16px 12px 50px !important;
          }
          .trial-brand-sub {
            display: none !important;
          }
          .trial-compact-top-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
            margin-bottom: 12px !important;
            padding-bottom: 10px !important;
          }
          .trial-lang-dropdown-box {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .trial-select-field-wrap {
            flex: 1 !important;
          }
          .trial-lang-select-input {
            width: 100% !important;
          }
        }

        /* Card with Background Image & Dark Overlay */
        .trial-skill-card {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          min-height: 220px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.2s;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: left;
          padding: 16px 14px;
          box-sizing: border-box;
        }
        .trial-skill-card:hover {
          transform: translateY(-4px) scale(1.015);
          border-color: rgba(120, 105, 245, 0.85);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35), 0 0 25px rgba(120, 105, 245, 0.25);
        }
        .trial-skill-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(9, 14, 28, 0.55) 0%,
            rgba(7, 10, 22, 0.88) 55%,
            rgba(5, 7, 16, 0.98) 100%
          );
          transition: background 0.25s ease;
          z-index: 1;
        }
        .trial-skill-card:hover .trial-skill-card-overlay {
          background: linear-gradient(
            180deg,
            rgba(9, 14, 28, 0.42) 0%,
            rgba(7, 10, 22, 0.82) 50%,
            rgba(5, 7, 16, 0.96) 100%
          );
        }
        .trial-skill-top-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          z-index: 2;
          opacity: 0.9;
        }
        .trial-skill-card-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
          gap: 10px;
        }
        .trial-skill-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .trial-skill-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          color: #ffffff;
          flex-shrink: 0;
        }
        .trial-skill-time-pill {
          font-size: 10.5px;
          font-weight: 750;
          color: #e2e8f0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 2.5px 7px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }
        .trial-skill-body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .trial-skill-tag-pill {
          font-size: 9.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 2px 6px;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #cbd5e1;
          display: inline-block;
          align-self: flex-start;
          white-space: nowrap;
          margin-bottom: 2px;
        }
        .trial-skill-title {
          font-size: 15px;
          font-weight: 850;
          color: #ffffff;
          margin: 0;
          line-height: 1.25;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        }
        .trial-skill-desc {
          font-size: 11px;
          color: #cbd5e1;
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .trial-skill-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: auto;
        }
        .trial-skill-start-label {
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.3px;
        }
        .trial-skill-arrow-btn {
          width: 24px;
          height: 24px;
          border-radius: 9999px;
          display: grid;
          place-items: center;
          transition: transform 0.2s ease;
        }
        .trial-skill-card:hover .trial-skill-arrow-btn {
          transform: translateX(3px);
        }

        @media (max-width: 640px) {
          .trial-skill-card {
            min-height: 180px !important;
            padding: 12px 10px !important;
          }
          .trial-skill-icon-box {
            width: 30px !important;
            height: 30px !important;
            border-radius: 9px !important;
          }
          .trial-skill-title {
            font-size: 13.5px !important;
          }
          .trial-skill-desc {
            font-size: 10px !important;
            line-height: 1.35 !important;
          }
          .trial-skill-time-pill {
            font-size: 9px !important;
            padding: 2px 5px !important;
          }
          .trial-skill-footer-row {
            padding-top: 4px !important;
          }
          .trial-skill-start-label {
            font-size: 11px !important;
          }
          .trial-skill-arrow-btn {
            width: 22px !important;
            height: 22px !important;
          }
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

      {/* Header with smart scroll-reveal */}
      <header className={`trial-header ${navVisible ? 'nav-visible' : 'nav-hidden'} ${navScrolled ? 'scrolled' : ''}`}>
        <button className="trial-brand" onClick={onBack} title="Asosiy sahifaga qaytish">
          <img
            src="/brand_logo.png"
            alt="TILŞUNOS"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/favicon.ico'; }}
          />
          <div>
            <div className="trial-brand-text">
              TILŞUNOS<span className="trial-brand-badge">SINOV</span>
            </div>
            <div className="trial-brand-sub">Boşlanğiç diagnostika testi</div>
          </div>
        </button>

        <div className="trial-header-actions">
          {selectedSkill && (
            <button
              className="trial-back-btn"
              onClick={() => setSelectedSkill(null)}
              title="Boşqa sinovni tanlaş"
            >
              <RefreshCw size={14} /> <span>Boşqa sinov</span>
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

          <button className="trial-back-btn" onClick={onBack} title="Çiqiş">
            <ArrowLeft size={15} /> <span>Çiqiş</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="trial-container">
        {!selectedSkill ? (
          /* STEP 1: PRE-TEST SELECTOR (Sleek, Compact, No Bloated Hero) */
          <div>
            {/* Compact Top Bar */}
            <div className="trial-compact-top-bar">
              <div className="trial-top-info">
                <div className="trial-top-badge">
                  <Sparkles size={13} />
                  <span>Sinov Diagnostikasi</span>
                </div>
                <h1 className="trial-top-heading">
                  Sinov turini tanlang
                </h1>
              </div>

              {/* Language Selector Dropdown */}
              <div className="trial-lang-dropdown-box">
                <label htmlFor="trial-lang-select" className="trial-lang-dropdown-label">
                  <Globe size={14} />
                  <span>Sinov tili:</span>
                </label>
                <div className="trial-select-field-wrap">
                  <select
                    id="trial-lang-select"
                    aria-label="Sinov tilini tanlang"
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="trial-lang-select-input"
                  >
                    {TRIAL_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name} ({lang.sub})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="trial-select-arrow-icon" />
                </div>
              </div>
            </div>

            {/* Skills Grid: 2 per row on mobile, 3 per row on desktop */}
            <div className="trial-skills-grid">
              {SKILL_CARDS.map(skill => {
                const Icon = skill.icon;
                const bgImage = config?.skillCovers?.[skill.key] || skill.defaultBg;
                return (
                  <button
                    key={skill.key}
                    className="trial-skill-card"
                    onClick={() => setSelectedSkill(skill.key)}
                    style={{
                      backgroundImage: `url(${bgImage})`
                    }}
                  >
                    {/* Dark Glass Overlay */}
                    <div className="trial-skill-card-overlay" />

                    {/* Top Accent Line */}
                    <div className="trial-skill-top-accent" style={{ background: skill.color }} />

                    {/* Content */}
                    <div className="trial-skill-card-content">
                      <div className="trial-skill-top-row">
                        <div
                          className="trial-skill-icon-box"
                          style={{
                            background: `linear-gradient(135deg, ${skill.color}ee, ${skill.color}aa)`,
                            boxShadow: `0 4px 14px ${skill.color}55`
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <span className="trial-skill-time-pill">
                          <Clock size={11} />
                          {skill.duration}
                        </span>
                      </div>

                      <div className="trial-skill-body">
                        <span className="trial-skill-tag-pill">
                          {skill.badge}
                        </span>
                        <h3 className="trial-skill-title">
                          {skill.title}
                        </h3>
                        <p className="trial-skill-desc">
                          {skill.desc}
                        </p>
                      </div>

                      <div className="trial-skill-footer-row">
                        <span className="trial-skill-start-label" style={{ color: skill.color }}>
                          Boşlaş
                        </span>
                        <div
                          className="trial-skill-arrow-btn"
                          style={{ background: `${skill.color}25`, color: skill.color }}
                        >
                          <ArrowRight size={14} />
                        </div>
                      </div>
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
                onOpenAiSettings={() => setShowAiModal(true)}
                isAiActive={Boolean(currentAiConfig.apiKey)}
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
                writingPool={config.writingPool}
                lang={selectedLang}
                onComplete={onRegister}
                onOpenAiSettings={() => setShowAiModal(true)}
                isAiActive={Boolean(currentAiConfig.apiKey)}
              />
            )}
            {selectedSkill === 'grammar' && (
              <GrammarTrialModule
                testItem={config.grammar}
                grammarTopics={config.grammarTopics}
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

      {/* Gemini AI Key & Settings Modal */}
      <GeminiApiKeyModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        initialConfig={currentAiConfig}
        onSave={handleSaveAiConfig}
      />
    </div>
  );
}

/* =====================================================================
   GEMINI API KEY & SETTINGS MODAL
   ===================================================================== */
function GeminiApiKeyModal({
  isOpen,
  onClose,
  initialConfig,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  initialConfig: GeminiAiConfig;
  onSave: (cfg: GeminiAiConfig) => void;
}) {
  const [key, setKey] = useState(initialConfig.apiKey || '');
  const [model, setModel] = useState(initialConfig.model || 'gemini-2.0-flash');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setKey(initialConfig.apiKey || '');
    setModel(initialConfig.model || 'gemini-2.0-flash');
  }, [initialConfig, isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!key.trim()) {
      setTestResult({ success: false, message: 'Iltimos, avval API kalitni kiriting.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGeminiConnection(key, model);
      setTestResult({ success: res.success, message: res.message });
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Aloqa xatosi yuz berdi' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const updated: GeminiAiConfig = {
      apiKey: key.trim(),
      model,
      enabled: true,
      temperature: 0.2
    };
    onSave(updated);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(6px)',
      display: 'grid',
      placeItems: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: '#ffffff',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        color: '#0f172a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={22} color="#7869f5" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Google Gemini AI Sozlamalari</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
          >
            ✕
          </button>
        </div>

        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
          Writing, Speaking va Shadowing mashqlarida 100% haqiqiy jonli sun'iy intellekt tahlilini yoqish uchun Google Gemini API kalitini kiriting.
        </p>

        {/* API Key Input */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '6px', color: '#334155' }}>
            Gemini API Kaliti (Google AI Studio):
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AIzaSy..."
              style={{
                width: '100%',
                padding: '10px 40px 10px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13.5px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Model Selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '6px', color: '#334155' }}>
            AI Modeli:
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '13.5px',
              boxSizing: 'border-box',
              outline: 'none',
              background: '#ffffff'
            }}
          >
            <option value="gemini-2.0-flash">Gemini 2.0 Flash (Tavsiya: O‘ta tez & aniq CEFR)</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash (Tezkor tahlil)</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Eng chuqur akademik baholash)</option>
          </select>
        </div>

        {/* Free key link */}
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(120, 105, 245, 0.08)', fontSize: '12px', color: '#475569' }}>
          💡 Bepul API kalit olish uchun:{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#7869f5', fontWeight: 750, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
          >
            Google AI Studio ochish <ExternalLink size={12} />
          </a>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '12.5px',
            fontWeight: 700,
            background: testResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: testResult.success ? '#059669' : '#dc2626',
            border: `1px solid ${testResult.success ? '#10b981' : '#ef4444'}`
          }}>
            {testResult.message}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting || !key.trim()}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              background: '#f8fafc',
              fontSize: '13px',
              fontWeight: 750,
              cursor: isTesting || !key.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isTesting ? 'Tekshirilmoqda...' : 'Aloqani tekshirish'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              border: 'none',
              background: '#10b981',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Saqlash va qo‘llash
          </button>
        </div>
      </div>
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
  onComplete,
  onOpenAiSettings,
  isAiActive
}: {
  config: TrialTestsConfig['speaking'];
  lang: string;
  onComplete: () => void;
  onOpenAiSettings?: () => void;
  isAiActive?: boolean;
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
  const [part1Answers, setPart1Answers] = useState<Record<number, {
    text: string;
    score: number;
    feedback: string;
    cefrLevel?: string;
    fluencyScore?: number;
    pronunciationFeedback?: string;
    improvements?: string[];
    isLiveAi?: boolean;
    isSilence?: boolean;
  }>>({});
  const [hasRecordedCurrent, setHasRecordedCurrent] = useState(false);

  // Part 2 states
  const [part2Answer, setPart2Answer] = useState<{
    text: string;
    score: number;
    feedback: string;
    cefrLevel?: string;
    fluencyScore?: number;
    pronunciationFeedback?: string;
    improvements?: string[];
    isLiveAi?: boolean;
    isSilence?: boolean;
  } | null>(null);
  const [hasRecordedPart2, setHasRecordedPart2] = useState(false);
  const [isEvaluatingSpeaking, setIsEvaluatingSpeaking] = useState(false);

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
        const text = res.transcript || '';
        setRecognizedText(text);
        finishPart1Question(text, res.confidence);
      },
      onError: () => {
        setIsRecording(false);
        finishPart1Question(recognizedText || '', 0);
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
      finishPart1Question(recognizedText || '', 0.85);
    }
  };

  const finishPart1Question = async (text: string, confidence: number) => {
    const clean = (text || '').trim();
    const words = clean.split(/\s+/).filter(w => w.length > 1 &&
      !w.startsWith('Audioni') && !w.startsWith('Javob') && !w.startsWith('Rasm') && !w.startsWith('Tasvir'));
    const isSilence = words.length < 2;

    setHasRecordedCurrent(true);
    setIsRecording(false);

    if (isSilence) {
      setIsEvaluatingSpeaking(false);
      setPart1Answers(prev => ({
        ...prev,
        [qIndex]: {
          text: '',
          score: 0,
          feedback: '⚠️ Ovoz aniqlanmadi yoki siz gapirmadingiz. Mikrofonga yaqinroq kelib, savolga ingliz tilida ovoz chiqarib javob bering.',
          cefrLevel: 'Aniqlanmadi',
          fluencyScore: 0,
          pronunciationFeedback: 'Ovoz signali qayd etilmadi. Iltimos, mikrofon sozlamalarini tekşiring.',
          improvements: ['Mikrofon ovozini balandroq qiling', 'Savolga ingliz tilida aniq talaffuz bilan javob bering'],
          isLiveAi: false,
          isSilence: true
        }
      }));
      return;
    }

    setIsEvaluatingSpeaking(true);
    const questionText = questions[qIndex]?.question || 'Speaking Question';

    try {
      const aiRes = await evaluateSpeakingWithGemini({
        spokenText: clean,
        question: questionText,
        part: 'part1',
        targetLanguage: lang,
        lang: 'uz'
      });

      setPart1Answers(prev => ({
        ...prev,
        [qIndex]: {
          text: clean,
          score: aiRes.score,
          feedback: aiRes.feedback,
          cefrLevel: aiRes.cefrLevel,
          fluencyScore: aiRes.fluencyScore,
          pronunciationFeedback: aiRes.pronunciationFeedback,
          improvements: aiRes.improvements,
          isLiveAi: aiRes.isLiveAi,
          isSilence: aiRes.isSilence
        }
      }));
    } catch {
      const score = Math.max(55, Math.min(92, Math.round(confidence * 100) || 75));
      const feedback = 'Nutq qabul qilindi. Fikr bildirishga intilish yaxshi, nutq sur’atini barqaror saqlang.';
      setPart1Answers(prev => ({
        ...prev,
        [qIndex]: { text: clean, score, feedback, isLiveAi: false }
      }));
    } finally {
      setIsEvaluatingSpeaking(false);
    }
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
        const text = res.transcript || '';
        setRecognizedText(text);
        finishPart2(text, res.confidence);
      },
      onError: () => {
        setIsRecording(false);
        finishPart2(recognizedText || '', 0);
      },
      onEnd: () => setIsRecording(false)
    });
  };

  const finishPart2 = async (text: string, confidence: number) => {
    const clean = (text || '').trim();
    const words = clean.split(/\s+/).filter(w => w.length > 1 &&
      !w.startsWith('Rasm') && !w.startsWith('Tasvir') && !w.startsWith('Audioni'));
    const isSilence = words.length < 2;

    setHasRecordedPart2(true);
    setIsRecording(false);

    if (isSilence) {
      setIsEvaluatingSpeaking(false);
      setPart2Answer({
        text: '',
        score: 0,
        feedback: '⚠️ Rasm bo‘yicha hech qanday ovozli tasvir aniqlanmadi. Siz hech narsa gapirmadingiz yoki mikrofon audio yozmadi.',
        cefrLevel: 'Aniqlanmadi',
        fluencyScore: 0,
        pronunciationFeedback: 'Ovoz qayd etilmadi. Mikrofon sozlamalarini tekşiring.',
        isLiveAi: false,
        isSilence: true
      });
      return;
    }

    setIsEvaluatingSpeaking(true);

    try {
      const aiRes = await evaluateSpeakingWithGemini({
        spokenText: clean,
        question: describeImage.title,
        part: 'part2',
        topicTitle: describeImage.title,
        targetLanguage: lang,
        lang: 'uz'
      });

      setPart2Answer({
        text: clean,
        score: aiRes.score,
        feedback: aiRes.feedback,
        cefrLevel: aiRes.cefrLevel,
        fluencyScore: aiRes.fluencyScore,
        pronunciationFeedback: aiRes.pronunciationFeedback,
        improvements: aiRes.improvements,
        isLiveAi: aiRes.isLiveAi,
        isSilence: aiRes.isSilence
      });
    } catch {
      const score = Math.max(55, Math.min(92, Math.round(confidence * 100) || 78));
      const feedback = 'Rasm detallari tasvirlab berildi. Nutq sur’atini barqaror saqlashga harakat qiling.';
      setPart2Answer({ text: clean, score, feedback, isLiveAi: false });
    } finally {
      setIsEvaluatingSpeaking(false);
    }
  };

  // Calculate Overall Speaking Result
  const part1Avg = useMemo(() => {
    const vals = Object.values(part1Answers).filter(a => !a.isSilence);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b.score, 0) / vals.length);
  }, [part1Answers]);

  const overallSpeakingScore = useMemo(() => {
    const p2 = part2Answer && !part2Answer.isSilence ? part2Answer.score : 0;
    return Math.round((part1Avg * 0.5) + (p2 * 0.5));
  }, [part1Avg, part2Answer]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Speaking Header with AI Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#7869f5', textTransform: 'uppercase' }}>
            {currentPart === 'part1' ? `1-QISM: QISQA SAVOLLAR (5 TAdan ${qIndex + 1}-si)` : currentPart === 'part2' ? '2-QISM: RASMNI TASVIRLASH' : 'NATIJA'}
          </span>
          {onOpenAiSettings && (
            <button
              onClick={onOpenAiSettings}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '100px',
                background: isAiActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: `1px solid ${isAiActive ? '#10b981' : '#f59e0b'}`,
                color: isAiActive ? '#10b981' : '#f59e0b',
                fontSize: '11px',
                fontWeight: 750,
                cursor: 'pointer'
              }}
            >
              <Key size={11} />
              <span>{isAiActive ? '⚡ Gemini AI Faol' : '🔑 API Kalit'}</span>
            </button>
          )}
        </div>
        {currentPart !== 'result' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 800, color: timeLeft <= 10 ? '#ef4444' : '#7869f5' }}>
            <Clock size={16} /> {timeLeft} soniya
          </div>
        )}
      </div>

      {/* PART 1: 5 SHORT QUESTIONS */}
      {currentPart === 'part1' && (
        <div>
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
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '100px', background: part1Answers[qIndex]?.isSilence ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: part1Answers[qIndex]?.isSilence ? '#ef4444' : '#10b981', fontWeight: 750, fontSize: '14px' }}>
                {part1Answers[qIndex]?.isSilence ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {part1Answers[qIndex]?.isSilence ? 'Ovoz aniqlanmadi (Nutq yo‘q)' : 'Javob 1 marta qabul qilindi va tahlil qilindi'}
              </div>
            )}

            {/* Evaluation Spinner */}
            {isEvaluatingSpeaking && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 800, fontSize: '13px' }}>
                <RefreshCw className="animate-spin" size={16} /> Google Gemini AI nutqingizni tahlil qilmoqda...
              </div>
            )}

            <div style={{ marginTop: '16px', minHeight: '44px', fontStyle: 'italic', fontSize: '14.5px', color: '#475569' }}>
              {recognizedText ? `"${recognizedText}"` : (isRecording ? 'Siz gapirayapsiz, eshitmoqdaman...' : 'Mikrofon bir martalik rejimda ishlaydi.')}
            </div>
          </div>

          {/* AI Diagnosis Result for this Question */}
          {hasRecordedCurrent && part1Answers[qIndex] && (
            part1Answers[qIndex].isSilence ? (
              <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '16px', border: '1.5px solid rgba(239, 68, 68, 0.3)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} /> Ovoz aniqlanmadi (Nutq yo‘q)
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 850, color: '#ef4444' }}>
                    0 ball (Aniqlanmadi)
                  </span>
                </div>
                <p style={{ margin: '0 0 14px', fontSize: '13.5px', color: '#991b1b', lineHeight: '1.5' }}>
                  {part1Answers[qIndex].feedback}
                </p>
                <button
                  onClick={() => {
                    setHasRecordedCurrent(false);
                    setRecognizedText('');
                    setTimeLeft(30);
                    setPart1Answers(prev => {
                      const next = { ...prev };
                      delete next[qIndex];
                      return next;
                    });
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontWeight: 750,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={14} /> Qayta urinib gapirish
                </button>
              </div>
            ) : (
              <div style={{ padding: '20px', background: 'rgba(120, 105, 245, 0.05)', borderRadius: '16px', border: '1.5px solid rgba(120, 105, 245, 0.2)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#7869f5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bot size={16} /> AI Repetitor Diagnostikasi:
                    {part1Answers[qIndex].isLiveAi ? (
                      <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '6px', background: '#10b981', color: '#fff', fontWeight: 800 }}>
                        ⚡ Gemini 2.0 AI
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontWeight: 750 }}>
                        Evristik Tahlil
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 850, color: '#10b981' }}>
                    {part1Answers[qIndex].score} / 100 ball {part1Answers[qIndex].cefrLevel && `(${part1Answers[qIndex].cefrLevel})`}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: '1.5' }}>
                  {part1Answers[qIndex].feedback}
                </p>
                {part1Answers[qIndex].pronunciationFeedback && (
                  <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#64748b' }}>
                    🗣️ <strong>Talaffuz va ravonlik:</strong> {part1Answers[qIndex].pronunciationFeedback}
                  </div>
                )}
              </div>
            )
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
                  Foydali sözlar:
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
                onClick={isRecording ? () => finishPart2(recognizedText || '', 0.85) : handleStartPart2}
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
                {isRecording ? 'Tasvirni yakunlash' : 'Rasmni tasvirlashni boşlaş (60 soniya)'}
              </button>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '100px', background: part2Answer?.isSilence ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: part2Answer?.isSilence ? '#ef4444' : '#10b981', fontWeight: 750, fontSize: '14px' }}>
                {part2Answer?.isSilence ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {part2Answer?.isSilence ? 'Rasm bo‘yicha nutq aniqlanmadi' : 'Rasm tasvirlanishi muvaffaqiyatli qabul qilindi'}
              </div>
            )}

            <div style={{ marginTop: '16px', minHeight: '44px', fontStyle: 'italic', fontSize: '14px', color: '#475569' }}>
              {recognizedText ? `"${recognizedText}"` : 'Rasmni diqqat bilan ko‘rib, nimalarni ko‘rayotganingizni gapirib bering.'}
            </div>
          </div>

          {/* AI Evaluation in progress */}
          {isEvaluatingSpeaking && (
            <div style={{ textAlign: 'center', margin: '14px 0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 800, fontSize: '13px' }}>
                <RefreshCw className="animate-spin" size={16} /> Google Gemini AI rasm tasvirlanishini tahlil qilmoqda...
              </div>
            </div>
          )}

          {/* Part 2 AI Diagnosis Card */}
          {hasRecordedPart2 && part2Answer && (
            part2Answer.isSilence ? (
              <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '16px', border: '1.5px solid rgba(239, 68, 68, 0.3)', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} /> Ovoz aniqlanmadi (Nutq yo‘q)
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 850, color: '#ef4444' }}>
                    0 ball (Aniqlanmadi)
                  </span>
                </div>
                <p style={{ margin: '0 0 14px', fontSize: '13.5px', color: '#991b1b', lineHeight: '1.5' }}>
                  {part2Answer.feedback}
                </p>
                <button
                  onClick={() => {
                    setHasRecordedPart2(false);
                    setRecognizedText('');
                    setTimeLeft(60);
                    setPart2Answer(null);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontWeight: 750,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={14} /> Rasmni qayta tasvirlash
                </button>
              </div>
            ) : (
              <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', border: '1.5px solid rgba(16, 185, 129, 0.25)', marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bot size={16} /> 2-Qism AI Diagnostikasi:
                    {part2Answer.isLiveAi ? (
                      <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '6px', background: '#10b981', color: '#fff', fontWeight: 800 }}>
                        ⚡ Gemini 2.0 AI
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontWeight: 750 }}>
                        Evristik Tahlil
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 850, color: '#10b981' }}>
                    {part2Answer.score} / 100 ball {part2Answer.cefrLevel && `(${part2Answer.cefrLevel})`}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: '1.5' }}>
                  {part2Answer.feedback}
                </p>
                {part2Answer.pronunciationFeedback && (
                  <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#64748b' }}>
                    🗣️ <strong>Talaffuz va ravonlik:</strong> {part2Answer.pronunciationFeedback}
                  </div>
                )}
              </div>
            )
          )}

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
                Umumiy Speaking Natijasini köriş <Trophy size={18} />
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
            Sizning taxminiy darajangiz: {overallSpeakingScore >= 85 ? 'B2 (Mustaqil sözlashuvchi)' : 'B1 (O‘rta daraja)'}
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
            Töliq shaxsiy o‘quv rejasini boşlaş <ArrowRight size={17} />
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
            Matndagi bo‘sh joylarga to‘g‘ri sözlarni tanlang:
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
                    <option value="">-- Sözni tanlang --</option>
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
            Javoblarni tekshirish va natijani köriş
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
   - YouTube audio/video support or TTS fallback.
   - Seeking forward/backward is completely disabled in audio player mode.
   - Played exactly twice (2/2 -> 1/2 -> 0/2), then permanently locked.
   - Fill-in-the-blanks based on spoken words & admin choices.
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
  const youtubeVideoId = getYouTubeVideoId(item.youtubeUrl);

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
      alert('Tinglaş limiti tugadi! Qoidaga köra audioni faqat 2 marta eşitiş mumkin.');
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
    return (item.blanks || []).filter(b => userAnswers[b.id]?.toLowerCase() === b.correctWord.toLowerCase()).length;
  }, [isSubmitted, item.blanks, userAnswers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Strict Rule Notice */}
      <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertCircle size={20} style={{ color: '#ec4899', flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
          <strong>Qat’iy qoidalar:</strong> Audioni diqqat bilan eşiting va bo‘sh joylarni töldiring.
          Audioni jami <strong>2 marta</strong> tinglaş mumkin.
        </div>
      </div>

      {/* YouTube Player (If configured) */}
      {youtubeVideoId && (
        <div style={{ padding: '18px', background: 'rgba(0,0,0,0.04)', borderRadius: '18px', border: '1.5px solid rgba(239, 68, 68, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Play size={14} /> YouTube Listening Audiosi:
            </span>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.title}</span>
          </div>
          <div style={{ borderRadius: '14px', overflow: 'hidden', background: '#000', height: '280px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1&rel=0`}
              title={item.title}
              style={{ border: 'none', display: 'block' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Modern Locked Audio Player (Always available for TTS/native audio) */}
      <div style={{ padding: '24px', background: '#1e1e2f', color: '#ffffff', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#a78bfa', fontWeight: 800 }}>
              AUDIO TINGLAŞ DARAJASI
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
            title={isPlaying ? 'Pauza' : (playsLeft > 0 ? 'Tinglaş' : 'Limit tugagan')}
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
          Audioni diqqat bilan eşiting va böş joylarni töldiring:
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {(item.blanks || []).map(blank => {
            const selected = userAnswers[blank.id] || '';
            const isRight = selected.toLowerCase() === blank.correctWord.toLowerCase();

            return (
              <div key={blank.id} style={{ padding: '14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#ec4899', marginBottom: '4px' }}>
                  {blank.blankNumber}-böş joy {isSubmitted ? (isRight ? '✅' : `❌ (${blank.correctWord})`) : ''}:
                </label>
                {blank.hint && (
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                    💡 {blank.hint}
                  </span>
                )}
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
                  <option value="">-- Sözni tanlang --</option>
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
            Tinglaş testini tekşiriş
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '17px', fontWeight: 850, color: '#10b981' }}>
              Natija: {correctBlanksCount} / {item.blanks?.length || 0} töğri ({Math.round((correctBlanksCount / ((item.blanks?.length) || 1)) * 100)}%)
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
              Rejaga saqlaş →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   4. WRITING MODULE (ESSAY & LETTER POOL WITH RANDOM ASSIGNMENT)
   Part 1: Insho (Essay) - e.g. "Environment & Climate Change"
   Part 2: Xat (Letter) - e.g. "Formal Job Application Letter"
   Instant AI Evaluation: Grammar, Lexicon, Coherence, CEFR level & fixes.
   ===================================================================== */
function WritingTrialModule({
  testItem,
  writingPool,
  lang,
  onComplete,
  onOpenAiSettings,
  isAiActive
}: {
  testItem?: WritingTestItem;
  writingPool?: {
    essayTopics: WritingEssayItem[];
    letterTopics: WritingLetterItem[];
  };
  lang: string;
  onComplete: () => void;
  onOpenAiSettings?: () => void;
  isAiActive?: boolean;
}) {
  const essayList = writingPool?.essayTopics && writingPool.essayTopics.length > 0
    ? writingPool.essayTopics
    : DEFAULT_WRITING_ESSAYS;
  const letterList = writingPool?.letterTopics && writingPool.letterTopics.length > 0
    ? writingPool.letterTopics
    : DEFAULT_WRITING_LETTERS;

  // Task type switch: Part 1 (Essay) or Part 2 (Letter)
  const [taskType, setTaskType] = useState<'essay' | 'letter'>('essay');
  const [essayIndex, setEssayIndex] = useState(() => Math.floor(Math.random() * essayList.length));
  const [letterIndex, setLetterIndex] = useState(() => Math.floor(Math.random() * letterList.length));

  const currentEssay = essayList[essayIndex] || essayList[0];
  const currentLetter = letterList[letterIndex] || letterList[0];

  const activeTask = taskType === 'essay'
    ? {
        title: currentEssay.topicTitle,
        genre: currentEssay.genre,
        minWords: currentEssay.minWords || 150,
        description: currentEssay.promptDescription,
        bulletPoints: currentEssay.bulletPoints,
        sampleText: currentEssay.sampleBand8Text
      }
    : {
        title: currentLetter.topicTitle,
        genre: `Xat: ${currentLetter.letterType === 'formal' ? 'Rasmiy (Formal)' : currentLetter.letterType === 'informal' ? 'Do‘stona (Informal)' : 'Yarim rasmiy (Semi-formal)'}`,
        minWords: currentLetter.minWords || 120,
        description: currentLetter.promptDescription,
        bulletPoints: currentLetter.bulletPoints,
        sampleText: currentLetter.sampleBand8Text
      };

  // INDEPENDENT DRAFTS & ANALYSES (NEVER OVERWRITES ON SWITCH!)
  const [essayDraft, setEssayDraft] = useState<string>(() => {
    try { return localStorage.getItem('tilshunos_writing_essay_draft') || ''; } catch { return ''; }
  });
  const [letterDraft, setLetterDraft] = useState<string>(() => {
    try { return localStorage.getItem('tilshunos_writing_letter_draft') || ''; } catch { return ''; }
  });
  const [essayAnalysis, setEssayAnalysis] = useState<WritingEvaluationResult | null>(() => {
    try {
      const raw = localStorage.getItem('tilshunos_writing_essay_analysis');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [letterAnalysis, setLetterAnalysis] = useState<WritingEvaluationResult | null>(() => {
    try {
      const raw = localStorage.getItem('tilshunos_writing_letter_analysis');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Active draft and analysis based on current taskType
  const currentText = taskType === 'essay' ? essayDraft : letterDraft;
  const analysisResult = taskType === 'essay' ? essayAnalysis : letterAnalysis;

  const handleTextChange = (text: string) => {
    if (taskType === 'essay') {
      setEssayDraft(text);
      try { localStorage.setItem('tilshunos_writing_essay_draft', text); } catch {}
    } else {
      setLetterDraft(text);
      try { localStorage.setItem('tilshunos_writing_letter_draft', text); } catch {}
    }
  };

  const handleSetAnalysis = (res: WritingEvaluationResult | null) => {
    if (taskType === 'essay') {
      setEssayAnalysis(res);
      try {
        if (res) localStorage.setItem('tilshunos_writing_essay_analysis', JSON.stringify(res));
        else localStorage.removeItem('tilshunos_writing_essay_analysis');
      } catch {}
    } else {
      setLetterAnalysis(res);
      try {
        if (res) localStorage.setItem('tilshunos_writing_letter_analysis', JSON.stringify(res));
        else localStorage.removeItem('tilshunos_writing_letter_analysis');
      } catch {}
    }
  };

  // Live word count
  const wordCount = useMemo(() => {
    const trimmed = currentText.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [currentText]);

  const minRequired = activeTask.minWords;
  const isRequirementMet = wordCount >= minRequired;

  const handleShuffle = () => {
    if (taskType === 'essay') {
      let next = Math.floor(Math.random() * essayList.length);
      if (next === essayIndex && essayList.length > 1) next = (next + 1) % essayList.length;
      setEssayIndex(next);
    } else {
      let next = Math.floor(Math.random() * letterList.length);
      if (next === letterIndex && letterList.length > 1) next = (next + 1) % letterList.length;
      setLetterIndex(next);
    }
    // Only reset analysis for the current task
    handleSetAnalysis(null);
  };

  const handleSubmitToAI = async () => {
    if (!isRequirementMet) {
      alert(`Matnda kamida ${minRequired} ta so‘z bo‘lishi lozim. Hozirda: ${wordCount} ta so‘z.`);
      return;
    }

    setIsAnalyzing(true);
    try {
      const topicTitle = activeTask?.title || 'Writing Task';
      const topicPrompt = (activeTask as any)?.description || '';

      const result = await evaluateWritingWithGemini({
        text: currentText,
        topicTitle,
        topicPrompt,
        taskType,
        minWords: minRequired,
        targetLanguage: lang,
        lang: 'uz'
      });
      handleSetAnalysis(result);
    } catch (err: any) {
      console.error('Gemini Writing Evaluation error:', err);
      alert('Tahlil paytida xatolik yuz berdi: ' + (err.message || 'Iltimos, qayta urinib ko‘ring'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Interactive AI Tutor Q&A Chat State
  const [tutorInput, setTutorInput] = useState('');
  const [isAskingTutor, setIsAskingTutor] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<Array<{ sender: 'user' | 'tutor'; text: string }>>([]);

  const handleAskTutor = async (predefinedQuestion?: string) => {
    const question = (predefinedQuestion || tutorInput).trim();
    if (!question || isAskingTutor) return;

    setTutorMessages(prev => [...prev, { sender: 'user', text: question }]);
    if (!predefinedQuestion) setTutorInput('');
    setIsAskingTutor(true);

    try {
      const reply = await askAiAboutSubmission({
        text: currentText,
        question,
        topicTitle: activeTask.title,
        taskType,
        lang
      });
      setTutorMessages(prev => [...prev, { sender: 'tutor', text: reply }]);
    } catch (e: any) {
      setTutorMessages(prev => [
        ...prev,
        { sender: 'tutor', text: 'AI repetitor bilan aloqada xatolik yuz berdi. Iltimos, qayta so‘rang.' }
      ]);
    } finally {
      setIsAskingTutor(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Part Switcher & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setTaskType('essay')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: taskType === 'essay' ? 'none' : '1px solid rgba(0,0,0,0.1)',
              background: taskType === 'essay' ? '#10b981' : 'transparent',
              color: taskType === 'essay' ? '#ffffff' : 'inherit',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>1-Qism: Insho (Essay)</span>
            {essayDraft && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: taskType === 'essay' ? '#ffffff' : '#10b981' }} />}
          </button>
          <button
            onClick={() => setTaskType('letter')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: taskType === 'letter' ? 'none' : '1px solid rgba(0,0,0,0.1)',
              background: taskType === 'letter' ? '#7869f5' : 'transparent',
              color: taskType === 'letter' ? '#ffffff' : 'inherit',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>2-Qism: Xat (Letter)</span>
            {letterDraft && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: taskType === 'letter' ? '#ffffff' : '#7869f5' }} />}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onOpenAiSettings && (
            <button
              onClick={onOpenAiSettings}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '100px',
                background: isAiActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: `1px solid ${isAiActive ? '#10b981' : '#f59e0b'}`,
                color: isAiActive ? '#10b981' : '#f59e0b',
                fontSize: '12px',
                fontWeight: 750,
                cursor: 'pointer'
              }}
            >
              <Key size={13} />
              <span>{isAiActive ? '⚡ Gemini AI Faol' : '🔑 Gemini API Kaliti'}</span>
            </button>
          )}

          <button
            onClick={handleShuffle}
            className="outline-btn"
            style={{ padding: '7px 14px', fontSize: '12.5px', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Boshqa tasodifiy mavzuni tanlash"
          >
            <Shuffle size={14} />
            <span>Boshqa Mavzu Olish (Random)</span>
          </button>
        </div>
      </div>

      {/* Topic Prompt Card */}
      <div style={{ padding: '24px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '18px', border: '1.5px solid rgba(16, 185, 129, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.8px' }}>
            {activeTask.genre} · KAMIDA {minRequired} TA SÖZ
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: isRequirementMet ? '#10b981' : '#f59e0b' }}>
            {isRequirementMet ? '✅ Talab bajarildi' : `Yana ${minRequired - wordCount} ta so‘z kerak`}
          </span>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 10px' }}>
          {activeTask.title}
        </h2>
        <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: '1.6', margin: '0 0 12px' }}>
          {activeTask.description}
        </p>

        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: '#64748b' }}>
          {activeTask.bulletPoints.map((bp, i) => (
            <li key={i}>{bp}</li>
          ))}
        </ul>
      </div>

      {/* Textarea & Word Counter */}
      <div>
        <textarea
          rows={10}
          value={currentText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={taskType === 'essay' ? 'Inshoni shu yerga yozing...' : 'Xatni shu yerga yozing...'}
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
          {activeTask.sampleText && (
            <button
              onClick={() => handleTextChange(activeTask.sampleText || '')}
              style={{ background: 'none', border: 'none', color: '#7869f5', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              Namuna matnni yuklash (Band 8.0)
            </button>
          )}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bot size={18} /> AI Repetitor Yozma Tahlili
              </span>
              {analysisResult.isLiveAi ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 800, fontSize: '11px' }}>
                  <Zap size={11} /> {analysisResult.providerModel || 'Google Gemini 2.0 Flash'}
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 800, fontSize: '11px' }}>
                  Evristik Tahlil
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, color: analysisResult.overallScore < 50 ? '#ef4444' : '#10b981' }}>
                {analysisResult.overallScore} ball ({analysisResult.cefrScore})
              </span>
              <button
                onClick={() => handleSetAnalysis(null)}
                style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: '#64748b' }}
                title="Qayta tahlil qilish uchun natijani yopish"
              >
                Qayta tahlil ↺
              </button>
            </div>
          </div>

          {/* Genre Mismatch Banner */}
          {analysisResult.genreMismatch && (
            <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1.5px solid #ef4444', color: '#b91c1c', marginBottom: '16px', fontSize: '13.5px', fontWeight: 750, lineHeight: '1.5' }}>
              ⚠️ Janr nomuvofiqligi aniqlandi: Siz Insho (Essay) topshirig‘iga Xat (Letter) formatidagi matn kiritgansiz! Inshoda "Dear...", "Yours sincerely" kabi salomlashish va imzolar ishlatilmaydi. Shu sababli Task Achievement bali keskin pasaytirildi.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Mavzu ochilishi</div>
              <strong style={{ fontSize: '18px', color: (analysisResult.taskAchievementScore ?? 85) < 50 ? '#ef4444' : '#10b981' }}>
                {analysisResult.taskAchievementScore ?? 85}%
              </strong>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Grammatika</div>
              <strong style={{ fontSize: '18px', color: '#10b981' }}>{analysisResult.grammarScore}%</strong>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Leksik boylik</div>
              <strong style={{ fontSize: '18px', color: '#7869f5' }}>{analysisResult.lexicalScore}%</strong>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Mantiq & Bog‘liqlik</div>
              <strong style={{ fontSize: '18px', color: '#f59e0b' }}>{analysisResult.coherenceScore}%</strong>
            </div>
          </div>

          {/* Corrections */}
          {analysisResult.corrections && analysisResult.corrections.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 800 }}>
                Tuzatiş va örgatuwçi tavsiyalar:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysisResult.corrections.map((c: any, i: number) => (
                  <div key={i} style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '13px', lineHeight: '1.5' }}>
                    <div style={{ fontWeight: 800, color: '#ef4444', marginBottom: '4px' }}>
                      • {c.issue}
                    </div>
                    {c.originalSnippet && (
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '3px' }}>
                        Asl matn: <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>"{c.originalSnippet}"</span> → To‘g‘rilangan: <strong style={{ color: '#10b981' }}>"{c.correction}"</strong>
                      </div>
                    )}
                    <div style={{ color: '#334155' }}>
                      {c.advice}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Positive Points */}
          {analysisResult.positivePoints && analysisResult.positivePoints.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '13.5px', fontWeight: 800, color: '#10b981' }}>
                Kuchli tomonlaringiz:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                {analysisResult.positivePoints.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '13.5px', fontWeight: 800, color: '#f59e0b' }}>
                Keyingi qadamlar va maslahatlar:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                {analysisResult.recommendations.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive AI Tutor Q&A Chat */}
          <div style={{ marginTop: '24px', padding: '18px 20px', borderRadius: '14px', background: 'rgba(120, 105, 245, 0.06)', border: '1.5px solid rgba(120, 105, 245, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Bot size={18} color="#7869f5" />
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#7869f5' }}>
                AI Repetitorga Insho / Xatingiz Bo‘yicha Savol Berish
              </h4>
            </div>

            {/* Quick suggested chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {[
                "Qanday qilib Band 8 ga yetkazish mumkin?",
                "Mening eng katta xatoim nima?",
                "Kirish qismini qayta yozib ber",
                "Bog‘lovchilarni qanday boyitish mumkin?"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskTutor(chip)}
                  disabled={isAskingTutor}
                  style={{
                    padding: '5px 11px',
                    borderRadius: '100px',
                    background: '#ffffff',
                    border: '1px solid rgba(120, 105, 245, 0.25)',
                    fontSize: '11.5px',
                    fontWeight: 650,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  💡 {chip}
                </button>
              ))}
            </div>

            {/* Messages Log */}
            {tutorMessages.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', maxHeight: '280px', overflowY: 'auto' }}>
                {tutorMessages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: m.sender === 'user' ? 'rgba(120, 105, 245, 0.15)' : '#ffffff',
                      border: m.sender === 'user' ? '1px solid rgba(120, 105, 245, 0.3)' : '1px solid rgba(0,0,0,0.08)',
                      alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      fontSize: '13px',
                      lineHeight: '1.5'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '11px', color: m.sender === 'user' ? '#7869f5' : '#10b981', marginBottom: '3px' }}>
                      {m.sender === 'user' ? 'Sizning savolingiz:' : 'TILŞUNOS AI Repetitor:'}
                    </div>
                    <div style={{ whiteSpace: 'pre-line', color: '#1e293b' }}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Question Input */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAskTutor(); }}
                placeholder="Insho/xat yuzasidan istalgan savol so‘rang (masalan: Xatboshilarni qanday boyitish mumkin?)..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(0,0,0,0.15)',
                  fontSize: '13px',
                  background: '#ffffff',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => handleAskTutor()}
                disabled={!tutorInput.trim() || isAskingTutor}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: '#7869f5',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  border: 'none',
                  cursor: tutorInput.trim() && !isAskingTutor ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isAskingTutor ? <RefreshCw className="animate-spin" size={14} /> : <Send size={14} />}
                <span>So‘rash</span>
              </button>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
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
              Yoziş könikmasini rejaga qöşiş →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================================
   5. GRAMMAR MODULE (3-MINUTE THEORY GUIDE + TOPIC EXERCISES)
   Error Identification & Rule Explanations.
   ===================================================================== */
function GrammarTrialModule({
  testItem,
  grammarTopics,
  lang,
  onComplete
}: {
  testItem?: GrammarTestItem;
  grammarTopics?: GrammarTopicItem[];
  lang: string;
  onComplete: () => void;
}) {
  const topicsList = grammarTopics && grammarTopics.length > 0
    ? grammarTopics
    : DEFAULT_GRAMMAR_TOPICS;

  const [topicIndex, setTopicIndex] = useState(() => Math.floor(Math.random() * topicsList.length));
  const currentTopic = topicsList[topicIndex] || topicsList[0];

  const [showTheory, setShowTheory] = useState<boolean>(true);
  const [theorySecondsLeft, setTheorySecondsLeft] = useState<number>(180); // 3 minutes
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // 3-minute timer countdown
  useEffect(() => {
    let timer: any;
    if (showTheory && theorySecondsLeft > 0) {
      timer = setInterval(() => {
        setTheorySecondsLeft(s => (s > 0 ? s - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showTheory, theorySecondsLeft]);

  const handleSelectTopic = (idx: number) => {
    setTopicIndex(idx);
    setShowTheory(true);
    setTheorySecondsLeft(180);
    setAnswers({});
    setIsSubmitted(false);
  };

  const handleShuffleTopic = () => {
    let next = Math.floor(Math.random() * topicsList.length);
    if (next === topicIndex && topicsList.length > 1) next = (next + 1) % topicsList.length;
    handleSelectTopic(next);
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const correctCount = useMemo(() => {
    if (!isSubmitted) return 0;
    return currentTopic.questions.filter((q, idx) => answers[idx] === q.errorIndex).length;
  }, [isSubmitted, currentTopic.questions, answers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Topic Switcher & Random Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {topicsList.map((top, idx) => (
            <button
              key={top.id}
              onClick={() => handleSelectTopic(idx)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: topicIndex === idx ? 'none' : '1px solid rgba(0,0,0,0.1)',
                background: topicIndex === idx ? '#f59e0b' : 'transparent',
                color: topicIndex === idx ? '#ffffff' : 'inherit',
                fontSize: '12.5px',
                fontWeight: 750,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {top.title.split('(')[0]} ({top.level})
            </button>
          ))}
        </div>

        <button
          onClick={handleShuffleTopic}
          className="outline-btn"
          style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <Shuffle size={13} />
          <span>Tasodifiy Mavzu</span>
        </button>
      </div>

      {/* 3-MINUTE THEORY EXPLANATION GUIDE CARD */}
      <div style={{ padding: '22px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '18px', border: '1.5px solid rgba(245, 158, 11, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(245, 158, 11, 0.2)', color: '#d97706', fontSize: '11.5px', fontWeight: 800, marginBottom: '6px' }}>
              <Clock size={13} /> 3 DAQIQALIK SODDA QOIDA ({formatTimer(theorySecondsLeft)})
            </div>
            <h2 style={{ fontSize: '19px', fontWeight: 800, margin: 0 }}>
              {currentTopic.title} ({currentTopic.level})
            </h2>
          </div>

          <button
            onClick={() => setShowTheory(!showTheory)}
            className="outline-btn"
            style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 700 }}
          >
            {showTheory ? 'Nazariyani Yaşiriş' : 'Nazariyani Köriş'}
          </button>
        </div>

        {showTheory && (
          <div>
            <div style={{
              whiteSpace: 'pre-line',
              fontSize: '14px',
              lineHeight: '1.7',
              color: 'inherit',
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              {currentTopic.explanationGuide}
            </div>

            <div style={{ marginTop: '12px', textAlign: 'right' }}>
              <button
                onClick={() => setShowTheory(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  background: '#f59e0b',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Tuşundim, Maşqlarni Başlaş ↓
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PRACTICE QUESTIONS */}
      <div>
        <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 800 }}>
          Mavzu böyiça grammatik xatolikni aniqlang:
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentTopic.questions.map((q, qIdx) => {
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
                      Töğri shakli: {q.correctCorrection}
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
            Grammatikani tekşiriş
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '17px', fontWeight: 850, color: '#10b981' }}>
              Natija: {correctCount} / {currentTopic.questions.length} töğri ({Math.round((correctCount / currentTopic.questions.length) * 100)}%)
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
              Rejaga saqlaş →
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
              Rasmli sözlar testi yakunlandi!
            </h2>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
              Natija: {correctCount} / 10 to‘g‘ri ({correctCount * 10}%)
            </div>
          </div>

          {/* Gallery of Missed Images */}
          {missedItems.length > 0 ? (
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#ef4444', marginBottom: '14px' }}>
                Xato qilingan sözlar va ularning to‘g‘ri javoblari:
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
              Shaxsiy luğat daftariga o‘tish →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

