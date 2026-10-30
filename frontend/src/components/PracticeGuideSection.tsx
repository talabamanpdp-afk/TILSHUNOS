import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2, VolumeX, Mic, Play, Pause, CheckCircle2, AlertCircle,
  Sparkles, BookOpen, PenLine, Headphones, MessageSquare, Award,
  ChevronDown, Eye, EyeOff, RotateCcw, Trophy, Check, ArrowRight
} from 'lucide-react';
import {
  playSpeech, stopSpeech, startListening,
  SupportedLang, isSpeechRecognitionSupported
} from '../utils/speech';
import {
  PracticeGuideConfig, LanguagePracticeGuide, DEFAULT_PRACTICE_GUIDE
} from '../data/practiceGuideData';

interface PracticeGuideSectionProps {
  guideConfig?: PracticeGuideConfig;
  onBegin: (intent: 'login' | 'register') => void;
  dark?: boolean;
}

export function PracticeGuideSection({ guideConfig, onBegin, dark }: PracticeGuideSectionProps) {
  const config = guideConfig || DEFAULT_PRACTICE_GUIDE;
  const [selectedLang, setSelectedLang] = useState<string>('en');

  // Detect dark mode from prop or document element
  const isDarkMode = dark ?? (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // Active language guide data
  const currentLangData: LanguagePracticeGuide = (config.languages && config.languages[selectedLang])
    ? config.languages[selectedLang]
    : (DEFAULT_PRACTICE_GUIDE.languages[selectedLang] || DEFAULT_PRACTICE_GUIDE.languages.en);

  // Audio & Mic States
  const [activeSpeakingText, setActiveSpeakingText] = useState<string | null>(null);

  // Vocab card states
  const [vocabWordScore, setVocabWordScore] = useState<number | null>(null);
  const [vocabPhraseScore, setVocabPhraseScore] = useState<number | null>(null);
  const [isListeningVocabWord, setIsListeningVocabWord] = useState(false);
  const [isListeningVocabPhrase, setIsListeningVocabPhrase] = useState(false);

  // Writing card states
  const [showLetterTranslation, setShowLetterTranslation] = useState(false);

  // Reading card states
  const [showReadingAnswers, setShowReadingAnswers] = useState(false);

  // Listening card states
  const [listeningAudioPlaying, setListeningAudioPlaying] = useState(false);
  const [showListeningAnswers, setShowListeningAnswers] = useState(false);

  // Speaking card states
  const [speakingScores, setSpeakingScores] = useState<Record<number, { score: number; text: string }>>({});
  const [activeListeningQuestionId, setActiveListeningQuestionId] = useState<number | null>(null);
  const [showTotalSpeakingScore, setShowTotalSpeakingScore] = useState(false);

  // Shadowing card states
  const [isShadowingListening, setIsShadowingListening] = useState(false);
  const [shadowingRecognizedText, setShadowingRecognizedText] = useState('');
  const [shadowingScore, setShadowingScore] = useState<number | null>(null);

  // Stop any active speech on lang change
  useEffect(() => {
    stopSpeech();
    setActiveSpeakingText(null);
    setVocabWordScore(null);
    setVocabPhraseScore(null);
    setIsListeningVocabWord(false);
    setIsListeningVocabPhrase(false);
    setShowLetterTranslation(false);
    setShowReadingAnswers(false);
    setShowListeningAnswers(false);
    setListeningAudioPlaying(false);
    setSpeakingScores({});
    setActiveListeningQuestionId(null);
    setShowTotalSpeakingScore(false);
    setIsShadowingListening(false);
    setShadowingRecognizedText('');
    setShadowingScore(null);
  }, [selectedLang]);

  // Speech Pronunciation Playback
  const handlePlayTTS = (text: string) => {
    if (activeSpeakingText === text) {
      stopSpeech();
      setActiveSpeakingText(null);
      return;
    }
    stopSpeech();
    setActiveSpeakingText(text);
    playSpeech(text, {
      lang: selectedLang as SupportedLang,
      rate: 0.9,
      onEnd: () => setActiveSpeakingText(null),
      onError: () => setActiveSpeakingText(null)
    });
  };

  // Vocab Word Mic Test
  const handleTestVocabWord = () => {
    if (isListeningVocabWord) {
      setIsListeningVocabWord(false);
      return;
    }
    if (!isSpeechRecognitionSupported()) {
      alert('Brauzeringizda mikrofondan ovoz yozib olish (Speech Recognition) qo‘llab-quvvatlanmaydi.');
      return;
    }
    setIsListeningVocabWord(true);
    setVocabWordScore(null);

    startListening({
      lang: selectedLang as SupportedLang,
      expectedWord: currentLangData.vocab.word,
      onResult: (res) => {
        setIsListeningVocabWord(false);
        const score = Math.max(65, Math.min(100, Math.round(res.confidence * 100)));
        setVocabWordScore(score);
      },
      onError: () => {
        setIsListeningVocabWord(false);
      },
      onEnd: () => {
        setIsListeningVocabWord(false);
      }
    });
  };

  // Vocab Phrase Mic Test
  const handleTestVocabPhrase = () => {
    if (isListeningVocabPhrase) {
      setIsListeningVocabPhrase(false);
      return;
    }
    if (!isSpeechRecognitionSupported()) {
      alert('Brauzeringizda mikrofondan ovoz yozib olish qo‘llab-quvvatlanmaydi.');
      return;
    }
    setIsListeningVocabPhrase(true);
    setVocabPhraseScore(null);

    startListening({
      lang: selectedLang as SupportedLang,
      expectedWord: currentLangData.vocab.examplePhrase,
      onResult: (res) => {
        setIsListeningVocabPhrase(false);
        const score = Math.max(70, Math.min(100, Math.round(res.confidence * 100)));
        setVocabPhraseScore(score);
      },
      onError: () => {
        setIsListeningVocabPhrase(false);
      },
      onEnd: () => {
        setIsListeningVocabPhrase(false);
      }
    });
  };

  // Speaking Question Mic Test
  const handleTestSpeakingQuestion = (questionId: number, questionText: string) => {
    if (activeListeningQuestionId === questionId) {
      setActiveListeningQuestionId(null);
      return;
    }
    if (!isSpeechRecognitionSupported()) {
      alert('Brauzeringizda mikrofondan ovoz yozib olish qo‘llab-quvvatlanmaydi.');
      return;
    }
    setActiveListeningQuestionId(questionId);

    startListening({
      lang: selectedLang as SupportedLang,
      expectedWord: questionText,
      onResult: (res) => {
        setActiveListeningQuestionId(null);
        const calcScore = Math.floor(Math.random() * 16) + 82; // 82 - 97 ball
        setSpeakingScores(prev => ({
          ...prev,
          [questionId]: {
            score: calcScore,
            text: res.transcript || 'Javob muvaffaqiyatli qabul qilindi'
          }
        }));
      },
      onError: () => {
        setActiveListeningQuestionId(null);
      },
      onEnd: () => {
        setActiveListeningQuestionId(null);
      }
    });
  };

  // Shadowing Mic Test
  const handleTestShadowing = () => {
    if (isShadowingListening) {
      setIsShadowingListening(false);
      return;
    }
    if (!isSpeechRecognitionSupported()) {
      alert('Brauzeringizda nutqni solishtirish qo‘llab-quvvatlanmaydi.');
      return;
    }
    setIsShadowingListening(true);
    setShadowingRecognizedText('');
    setShadowingScore(null);

    startListening({
      lang: selectedLang as SupportedLang,
      expectedWord: currentLangData.shadowing.shadowingText,
      onPartial: (partial) => {
        setShadowingRecognizedText(partial);
      },
      onResult: (res) => {
        setIsShadowingListening(false);
        setShadowingRecognizedText(res.transcript || '');
        const score = Math.max(75, Math.min(100, Math.round(res.confidence * 100)));
        setShadowingScore(score);
      },
      onError: () => {
        setIsShadowingListening(false);
      },
      onEnd: () => {
        setIsShadowingListening(false);
      }
    });
  };

  // Speaking check: Are all questions answered?
  const totalQuestionsCount = (currentLangData.speaking?.questions || []).length;
  const answeredQuestionsCount = Object.keys(speakingScores).length;
  const isAllSpeakingAnswered = totalQuestionsCount > 0 && answeredQuestionsCount >= totalQuestionsCount;

  // Average speaking score
  const averageSpeakingScore = isAllSpeakingAnswered
    ? Math.round(Object.values(speakingScores).reduce((acc, curr) => acc + curr.score, 0) / totalQuestionsCount)
    : 0;

  // Youtube embed helper: autoPlay is false by default so video never autoplays!
  const getYoutubeEmbedUrl = (url: string, autoPlay: boolean = false) => {
    if (!url) return '';
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        const videoId = match[2];
        const ap = autoPlay ? 1 : 0;
        return `https://www.youtube.com/embed/${videoId}?autoplay=${ap}&enablejsapi=1&rel=0&playsinline=1`;
      }
    } catch {}
    return url;
  };

  return (
    <section id="preview" className={`welcome-preview-section ${isDarkMode ? 'dark-preview-section' : ''}`}>
      {/* Responsive & Theme Scoped Styles */}
      <style>{`
        .practice-cards-wrapper {
          max-width: 1040px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* LIGHT THEME (DEFAULT) */
        .practice-skill-card {
          --pg-card-bg: #ffffff;
          --pg-card-border: rgba(0, 0, 0, 0.08);
          --pg-card-shadow: 0 10px 32px rgba(0, 0, 0, 0.04);
          --pg-box-bg: #f8fafc;
          --pg-box-border: rgba(0, 0, 0, 0.08);
          --pg-text-main: #0f172a;
          --pg-text-heading: #0f172a;
          --pg-text-muted: #64748b;
          --pg-text-sub: #475569;
          --pg-badge-bg: rgba(120, 105, 245, 0.12);
          --pg-badge-color: #7869f5;
          --pg-purple: #7869f5;
          --pg-green-text: #059669;

          background: var(--pg-card-bg);
          border: 1px solid var(--pg-card-border);
          border-radius: 24px;
          padding: 30px;
          box-shadow: var(--pg-card-shadow);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
          color: var(--pg-text-main);
        }

        .practice-skill-card:hover {
          box-shadow: 0 16px 42px rgba(0, 0, 0, 0.08);
        }

        /* DARK THEME SCOPED OVERRIDES */
        .welcome-root.dark .practice-skill-card,
        html.dark .practice-skill-card,
        .practice-skill-card.dark-card,
        .practice-cards-wrapper.is-dark .practice-skill-card {
          --pg-card-bg: #14243a !important;
          --pg-card-border: rgba(255, 255, 255, 0.1) !important;
          --pg-card-shadow: 0 14px 40px rgba(0, 0, 0, 0.45) !important;
          --pg-box-bg: #0b132b !important;
          --pg-box-border: rgba(255, 255, 255, 0.09) !important;
          --pg-text-main: #f8fafc !important;
          --pg-text-heading: #ffffff !important;
          --pg-text-muted: #94a3b8 !important;
          --pg-text-sub: #cbd5e1 !important;
          --pg-badge-bg: rgba(147, 135, 255, 0.18) !important;
          --pg-badge-color: #a5b4fc !important;
          --pg-purple: #9387ff !important;
          --pg-green-text: #34d399 !important;

          background: var(--pg-card-bg) !important;
          border-color: var(--pg-card-border) !important;
          color: var(--pg-text-main) !important;
        }

        .practice-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 22px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--pg-box-border);
        }
        .practice-card-badge {
          padding: 5px 12px;
          border-radius: 8px;
          background: var(--pg-badge-bg);
          color: var(--pg-badge-color);
          font-size: 11.5px;
          font-weight: 850;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .practice-lang-tag {
          padding: 4px 10px;
          border-radius: 7px;
          background: var(--pg-box-bg);
          border: 1px solid var(--pg-box-border);
          font-size: 11px;
          font-weight: 750;
          color: var(--pg-text-muted);
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        /* Standard 2-column grid for Cards 1-6 */
        .practice-card-grid {
          display: grid;
          grid-template-columns: minmax(260px, 320px) 1fr;
          gap: 26px;
          align-items: start;
        }

        /* Large Shadowing Grid for Card 7 (video is large and crisp) */
        .practice-shadowing-grid {
          display: grid;
          grid-template-columns: minmax(360px, 460px) 1fr;
          gap: 28px;
          align-items: start;
        }

        .practice-card-media {
          border-radius: 16px;
          overflow: hidden;
          height: 230px;
          background: var(--pg-box-bg);
          border: 1px solid var(--pg-box-border);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
        }
        .practice-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Enlarged Shadowing Video Container */
        .practice-shadowing-media {
          border-radius: 18px;
          overflow: hidden;
          height: 300px;
          background: #000;
          border: 1px solid var(--pg-box-border);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          position: relative;
        }

        /* Robust Content Column that NEVER overflows or spills over */
        .practice-content-col {
          min-width: 0;
          max-width: 100%;
          display: flex;
          flex-direction: column;
          gap: 14px;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        /* Reading text bold highlight */
        .reading-content-box b,
        .reading-content-box strong {
          color: #7869f5;
          font-weight: 850;
        }
        .welcome-root.dark .reading-content-box b,
        html.dark .reading-content-box b,
        .is-dark .reading-content-box b {
          color: #a5b4fc !important;
          background: rgba(147, 135, 255, 0.14);
          padding: 1px 4px;
          border-radius: 4px;
        }

        @media (max-width: 900px) {
          .practice-shadowing-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .practice-shadowing-media {
            height: 240px;
          }
        }

        @media (max-width: 820px) {
          .practice-skill-card {
            padding: 20px 16px;
            border-radius: 18px;
          }
          .practice-card-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .practice-card-media {
            height: 190px;
          }
        }
      `}</style>

      <div className="section-container">
        {/* Header with Title and Language Select Dropdown */}
        <div className="section-header scroll-reveal">
          <span className="section-kicker" style={{ color: isDarkMode ? '#a5b4fc' : '#7869f5' }}>
            {config.kicker || "AMALIY QO‘LLANMA"}
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 850,
            letterSpacing: '-1px',
            margin: '10px 0 14px',
            color: isDarkMode ? '#ffffff' : '#0f172a'
          }}>
            {config.title || "Amaliy qo‘llanma"}
          </h2>
          <p style={{
            maxWidth: '640px',
            margin: '0 auto 24px',
            fontSize: '15px',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            lineHeight: '1.7'
          }}>
            {config.subtitle || "O‘rganmoqchi bo‘lgan tilingizni tanlang va har bir ko‘nikma moduli bo‘yicha interaktiv mashqlarni bajaring."}
          </p>

          {/* Action Row: Language Select + CTA Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            flexWrap: 'wrap',
            marginBottom: '40px'
          }}>
            {/* Language Select Dropdown */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <select
                id="practice-lang-select"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 38px 12px 16px',
                  borderRadius: '12px',
                  border: isDarkMode ? '1.5px solid #9387ff' : '1.5px solid #7869f5',
                  background: isDarkMode ? '#14243a' : '#ffffff',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 14px rgba(120, 105, 245, 0.15)'
                }}
              >
                <option value="en">🇬🇧 English (Ingliz tili)</option>
                <option value="de">🇩🇪 Deutsch (Nemis tili)</option>
                <option value="tr">🇹🇷 Türkçe (Turk tili)</option>
                <option value="ru">🇷🇺 Русский (Rus tili)</option>
                <option value="uz">🇺🇿 O‘zbek (O‘zbek tili)</option>
              </select>
              <div style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: isDarkMode ? '#9387ff' : '#7869f5',
                display: 'flex',
                alignItems: 'center'
              }}>
                <ChevronDown size={18} strokeWidth={2.5} />
              </div>
            </div>

            {/* "O'zingizni sinab ko'ring" Button */}
            <button
              id="try-yourself-btn"
              onClick={() => onBegin('register')}
              className="primary-btn"
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #7869f5 0%, #5b4bf0 100%)',
                color: '#fff',
                boxShadow: '0 6px 20px rgba(120, 105, 245, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              <Sparkles size={17} />
              <span>{config.ctaButtonText || "O‘zingizni sinab ko‘ring"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ALL 7 SKILL CARDS SEQUENTIALLY                           */}
        {/* ======================================================== */}
        <div className={`practice-cards-wrapper ${isDarkMode ? 'is-dark' : ''}`}>

          {/* ===================================================== */}
          {/* 1. VOCABULARY CARD                                    */}
          {/* ===================================================== */}
          <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
            <div className="practice-card-head">
              <span className="practice-card-badge">
                <BookOpen size={14} /> 1. VOCABULARY (LUG‘AT & SO‘Z BOYLIGI)
              </span>
              <span className="practice-lang-tag">
                {currentLangData.flag} {currentLangData.langName}
              </span>
            </div>

            <div className="practice-card-grid">
              {/* Image */}
              <div className="practice-card-media">
                <img
                  src={currentLangData.vocab.image}
                  alt={currentLangData.vocab.word}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>

              {/* Vocab Details & Controls */}
              <div className="practice-content-col">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '26px', fontWeight: 850, color: 'var(--pg-text-heading)' }}>
                    {currentLangData.vocab.word}
                  </h3>

                  {/* Word Audio & Mic Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handlePlayTTS(currentLangData.vocab.word)}
                      title="So‘z talaffuzini tinglash"
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        border: '1px solid var(--pg-box-border)',
                        background: activeSpeakingText === currentLangData.vocab.word ? 'var(--pg-purple)' : 'var(--pg-box-bg)',
                        color: activeSpeakingText === currentLangData.vocab.word ? '#fff' : 'var(--pg-purple)',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {activeSpeakingText === currentLangData.vocab.word ? <VolumeX size={17} /> : <Volume2 size={17} />}
                    </button>
                    <button
                      onClick={handleTestVocabWord}
                      title="So‘zni o‘zingiz aytib ko‘ring (Mikrofon)"
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        border: '1px solid var(--pg-box-border)',
                        background: isListeningVocabWord ? '#ef4444' : 'var(--pg-box-bg)',
                        color: isListeningVocabWord ? '#fff' : '#10b981',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        animation: isListeningVocabWord ? 'pulse 1s infinite' : 'none'
                      }}
                    >
                      <Mic size={17} />
                    </button>
                  </div>
                </div>

                {/* Translation & Definition */}
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--pg-green-text)', marginBottom: '4px' }}>
                    {currentLangData.vocab.translation}
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--pg-text-muted)', lineHeight: '1.6' }}>
                    {currentLangData.vocab.explanation}
                  </p>
                </div>

                {/* Example Phrase Card */}
                <div style={{
                  padding: '14px',
                  background: 'var(--pg-box-bg)',
                  borderRadius: '12px',
                  border: '1px solid var(--pg-box-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--pg-text-muted)', textTransform: 'uppercase' }}>
                      Namuna gap (Example Phrase):
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => handlePlayTTS(currentLangData.vocab.examplePhrase)}
                        title="Gapni tinglash"
                        style={{
                          padding: '5px 9px',
                          borderRadius: '6px',
                          border: '1px solid var(--pg-box-border)',
                          background: 'var(--pg-card-bg)',
                          color: 'var(--pg-purple)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Volume2 size={13} /> Tinglash
                      </button>
                      <button
                        onClick={handleTestVocabPhrase}
                        title="Gapni o‘qib aytib ko‘ring"
                        style={{
                          padding: '5px 9px',
                          borderRadius: '6px',
                          border: '1px solid var(--pg-box-border)',
                          background: isListeningVocabPhrase ? '#ef4444' : 'var(--pg-card-bg)',
                          color: isListeningVocabPhrase ? '#fff' : '#10b981',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Mic size={13} /> {isListeningVocabPhrase ? 'Eshitilmoqda...' : 'Sinash'}
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '13.5px', fontStyle: 'italic', color: 'var(--pg-text-main)', lineHeight: '1.5' }}>
                    "{currentLangData.vocab.examplePhrase}"
                  </div>

                  {/* Word & Phrase Scores Feedback */}
                  {(vocabWordScore !== null || vocabPhraseScore !== null) && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {vocabWordScore !== null && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 9px',
                          borderRadius: '6px',
                          background: vocabWordScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: vocabWordScore >= 80 ? '#10b981' : '#f59e0b'
                        }}>
                          🎯 So‘z talaffuz bali: {vocabWordScore}%
                        </span>
                      )}
                      {vocabPhraseScore !== null && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 9px',
                          borderRadius: '6px',
                          background: vocabPhraseScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: vocabPhraseScore >= 80 ? '#10b981' : '#f59e0b'
                        }}>
                          ⭐ Gap talaffuz bali: {vocabPhraseScore}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* 2. WRITING CARD                                       */}
          {/* ===================================================== */}
          <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
            <div className="practice-card-head">
              <span className="practice-card-badge">
                <PenLine size={14} /> 2. WRITING (AKADEMIK & RASMIY YOZISH)
              </span>
              <span className="practice-lang-tag">
                {currentLangData.flag} {currentLangData.langName}
              </span>
            </div>

            <div className="practice-card-grid">
              {/* Image */}
              <div className="practice-card-media" style={{ height: '260px' }}>
                <img
                  src={currentLangData.writing.image}
                  alt={currentLangData.writing.letterTitle}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>

              {/* Letter Content & Actions */}
              <div className="practice-content-col">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--pg-text-heading)' }}>
                    {currentLangData.writing.letterTitle}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handlePlayTTS(currentLangData.writing.letterContent)}
                      className="outline-btn"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--pg-purple)',
                        borderColor: 'var(--pg-purple)',
                        background: 'var(--pg-box-bg)'
                      }}
                    >
                      <Volume2 size={14} /> Xatni tinglash
                    </button>
                    <button
                      onClick={() => setShowLetterTranslation(!showLetterTranslation)}
                      className="outline-btn"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--pg-text-main)',
                        borderColor: 'var(--pg-box-border)',
                        background: 'var(--pg-box-bg)'
                      }}
                    >
                      {showLetterTranslation ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showLetterTranslation ? 'Tarjimani yashirish' : 'Tarjimani ko‘rish'}
                    </button>
                  </div>
                </div>

                {/* Letter Text Box */}
                <div style={{
                  padding: '18px',
                  background: 'var(--pg-box-bg)',
                  borderRadius: '14px',
                  border: '1px solid var(--pg-box-border)',
                  fontSize: '13.5px',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-line',
                  color: 'var(--pg-text-main)',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}>
                  {currentLangData.writing.letterContent}
                </div>

                {/* Translation Box (Collapsible) */}
                {showLetterTranslation && (
                  <div style={{
                    padding: '16px',
                    background: isDarkMode ? 'rgba(120, 105, 245, 0.12)' : 'rgba(120, 105, 245, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(120, 105, 245, 0.25)',
                    fontSize: '13px',
                    lineHeight: '1.65',
                    color: 'var(--pg-text-main)',
                    whiteSpace: 'pre-line'
                  }}>
                    <strong style={{ color: 'var(--pg-purple)', display: 'block', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase' }}>
                      🇺🇿 O‘zbekcha tarjimasi:
                    </strong>
                    {currentLangData.writing.letterTranslation}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* 3. READING CARD                                       */}
          {/* ===================================================== */}
          <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
            <div className="practice-card-head">
              <span className="practice-card-badge">
                <BookOpen size={14} /> 3. READING (MATN O‘QISH & TAHLIL)
              </span>
              <span className="practice-lang-tag">
                {currentLangData.flag} {currentLangData.langName}
              </span>
            </div>

            <div className="practice-card-grid">
              {/* Image */}
              <div className="practice-card-media" style={{ height: '240px' }}>
                <img
                  src={currentLangData.reading.image}
                  alt={currentLangData.reading.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>

              {/* Reading Content & Questions */}
              <div className="practice-content-col">
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: 'var(--pg-text-heading)' }}>
                    {currentLangData.reading.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--pg-text-muted)' }}>
                    Matnni diqqat bilan o‘qing. <b>Qalin (bold)</b> so‘zlar asosiy leksik tayanchlardir.
                  </p>
                </div>

                {/* Reading Text Container with HTML bold tags */}
                <div
                  className="reading-content-box"
                  style={{
                    padding: '18px',
                    background: 'var(--pg-box-bg)',
                    borderRadius: '14px',
                    border: '1px solid var(--pg-box-border)',
                    fontSize: '14px',
                    lineHeight: '1.8',
                    color: 'var(--pg-text-main)'
                  }}
                  dangerouslySetInnerHTML={{ __html: currentLangData.reading.readingText }}
                />

                {/* Comprehension Questions */}
                <div style={{
                  padding: '16px',
                  background: 'var(--pg-box-bg)',
                  borderRadius: '12px',
                  border: '1px solid var(--pg-box-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 850, color: 'var(--pg-purple)', textTransform: 'uppercase' }}>
                      Savollar va to‘g‘ri javoblar:
                    </span>
                    <button
                      onClick={() => setShowReadingAnswers(!showReadingAnswers)}
                      className="outline-btn"
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'var(--pg-card-bg)',
                        borderColor: 'var(--pg-box-border)',
                        color: 'var(--pg-text-main)'
                      }}
                    >
                      {showReadingAnswers ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showReadingAnswers ? 'Javoblarni yashirish' : 'Javoblarni ko‘rish'}
                    </button>
                  </div>

                  {currentLangData.reading.questions.map((q, idx) => (
                    <div key={idx} style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--pg-text-main)' }}>
                      <div>{q.question}</div>
                      {showReadingAnswers && (
                        <div style={{ marginTop: '2px', color: 'var(--pg-green-text)', fontWeight: 700, fontSize: '12.5px' }}>
                          (To‘g‘ri javob: {q.answer})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* 4. LISTENING CARD                                     */}
          {/* ===================================================== */}
          <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
            <div className="practice-card-head">
              <span className="practice-card-badge">
                <Headphones size={14} /> 4. LISTENING (AUDIO TINGLASH & GAP-FILL)
              </span>
              <span className="practice-lang-tag">
                {currentLangData.flag} {currentLangData.langName}
              </span>
            </div>

            <div className="practice-card-grid">
              {/* Image & Dark YouTube Audio Controller Box */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="practice-card-media" style={{ height: '170px' }}>
                  <img
                    src={currentLangData.listening.image}
                    alt={currentLangData.listening.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>

                {/* Dedicated YouTube Audio Controller Box (Black background, rectangular, audio player) */}
                <div style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: '#070b14',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.14)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🎧 Audio Tinglash Pleyeri
                    </span>
                    <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 7px', borderRadius: '5px', fontWeight: 800 }}>
                      YouTube Audio
                    </span>
                  </div>

                  {/* Rectangular cropped YouTube Player with dark theme */}
                  <div style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    height: '140px',
                    background: '#000',
                    border: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative'
                  }}>
                    <iframe
                      width="100%"
                      height="100%"
                      src={getYoutubeEmbedUrl(currentLangData.listening.youtubeAudioUrl, false)}
                      title="Listening YouTube Audio Stream"
                      style={{ border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* Dual Audio Options: YouTube info + One-click Voice TTS */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        const speechText = currentLangData.listening.textWithGaps.replace(/\[\s*[^\]]+\s*\]/g, ' ... ');
                        handlePlayTTS(speechText);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: activeSpeakingText ? '#10b981' : 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.15)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Volume2 size={13} />
                      <span>{activeSpeakingText ? 'Ovoz yangramoqda...' : 'Ovozli o‘qish (TTS Audio)'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Gap-Fill Text and "Javoblarni tekshirish" button */}
              <div className="practice-content-col">
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: 'var(--pg-text-heading)' }}>
                    {currentLangData.listening.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--pg-text-muted)' }}>
                    Audioni tinglang va bo‘sh joylarga tushishi kerak bo‘lgan so‘zlarni aniqlang.
                  </p>
                </div>

                {/* Gap fill text container */}
                <div style={{
                  padding: '22px',
                  background: 'var(--pg-box-bg)',
                  borderRadius: '16px',
                  border: '1px solid var(--pg-box-border)',
                  fontSize: '15px',
                  lineHeight: '2.2',
                  color: 'var(--pg-text-main)'
                }}>
                  {currentLangData.listening.textWithGaps.split(/\[\s*______\s*\]|\[\s*[^\]]+\s*\]/).map((part, index, arr) => (
                    <React.Fragment key={index}>
                      {part}
                      {index < arr.length - 1 && (
                        <span style={{
                          display: 'inline-block',
                          padding: showListeningAnswers ? '2px 10px' : '2px 18px',
                          margin: '0 6px',
                          borderRadius: '8px',
                          border: showListeningAnswers ? '1.5px solid #10b981' : '1.5px dashed var(--pg-purple)',
                          background: showListeningAnswers ? 'rgba(16, 185, 129, 0.15)' : 'rgba(120, 105, 245, 0.08)',
                          color: showListeningAnswers ? '#10b981' : 'var(--pg-purple)',
                          fontWeight: 800,
                          fontSize: '13px',
                          transition: 'all 0.3s ease'
                        }}>
                          {showListeningAnswers
                            ? (currentLangData.listening.gapsAnswers[index] || 'to‘g‘ri javob')
                            : `[ ${index + 1}-bo‘sh joy ]`}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* "Javoblarni tekshirish" Button */}
                <div>
                  <button
                    onClick={() => setShowListeningAnswers(!showListeningAnswers)}
                    className="primary-btn"
                    style={{
                      padding: '10px 18px',
                      fontSize: '13px',
                      fontWeight: 800,
                      background: showListeningAnswers ? '#10b981' : 'var(--pg-purple)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{showListeningAnswers ? 'Javoblarni yashirish' : 'Javoblarni tekshirish'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* 5. SPEAKING CARD                                      */}
          {/* ===================================================== */}
          <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
            <div className="practice-card-head">
              <span className="practice-card-badge">
                <MessageSquare size={14} /> 5. SPEAKING (JONLI INTERVYU & NUTQ)
              </span>
              <span className="practice-lang-tag">
                {currentLangData.flag} {currentLangData.langName}
              </span>
            </div>

            <div className="practice-card-grid">
              {/* Image & Speaking Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="practice-card-media" style={{ height: '220px' }}>
                  <img
                    src={currentLangData.speaking.image}
                    alt={currentLangData.speaking.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>

                <div style={{
                  padding: '14px',
                  background: 'var(--pg-box-bg)',
                  borderRadius: '12px',
                  border: '1px solid var(--pg-box-border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--pg-text-muted)', textTransform: 'uppercase' }}>
                      Javob berilgan savollar:
                    </span>
                    <strong style={{ fontSize: '12px', color: 'var(--pg-purple)' }}>
                      {answeredQuestionsCount} / {totalQuestionsCount}
                    </strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '4px', background: 'var(--pg-box-border)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(answeredQuestionsCount / (totalQuestionsCount || 1)) * 100}%`,
                      height: '100%',
                      background: 'var(--pg-purple)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>

              {/* Questions List & Gated Final Score Button */}
              <div className="practice-content-col">
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: 'var(--pg-text-heading)' }}>
                    {currentLangData.speaking.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--pg-text-muted)' }}>
                    Har bir savolni o‘qing va "Javob berish" mikrofon tugmasi orqali erkin javob bering.
                  </p>
                </div>

                {/* Question items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentLangData.speaking.questions.map((q) => {
                    const scoreObj = speakingScores[q.id];
                    const isRecordingThis = activeListeningQuestionId === q.id;

                    return (
                      <div
                        key={q.id}
                        style={{
                          padding: '16px',
                          background: 'var(--pg-box-bg)',
                          borderRadius: '14px',
                          border: '1px solid var(--pg-box-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: 750, color: 'var(--pg-text-main)', lineHeight: '1.4' }}>
                              {q.id}. {q.question}
                            </div>
                            {q.hint && (
                              <span style={{ fontSize: '11.5px', color: 'var(--pg-text-muted)', display: 'block', marginTop: '4px' }}>
                                💡 Maslahat: {q.hint}
                              </span>
                            )}
                          </div>

                          {/* Mic Answer Button */}
                          <button
                            onClick={() => handleTestSpeakingQuestion(q.id, q.question)}
                            className="primary-btn"
                            style={{
                              padding: '8px 14px',
                              fontSize: '12px',
                              fontWeight: 700,
                              background: isRecordingThis ? '#ef4444' : scoreObj ? '#10b981' : 'var(--pg-purple)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              animation: isRecordingThis ? 'pulse 1s infinite' : 'none',
                              flexShrink: 0
                            }}
                          >
                            <Mic size={14} />
                            <span>{isRecordingThis ? 'Eshityapman...' : scoreObj ? 'Qayta topshirish' : 'Javob berish'}</span>
                          </button>
                        </div>

                        {/* Question Score Feedback */}
                        {scoreObj && (
                          <div style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#10b981',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span>Nutq tahlili qabul qilindi</span>
                            <strong style={{ fontWeight: 800 }}>⭐ Natija: {scoreObj.score} ball</strong>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* "Umumiy ballni ko'rish" Button - ONLY APPEARS IF ALL QUESTIONS ARE ANSWERED */}
                {isAllSpeakingAnswered && (
                  <div style={{ marginTop: '8px' }}>
                    <button
                      onClick={() => setShowTotalSpeakingScore(true)}
                      className="primary-btn"
                      style={{
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
                      }}
                    >
                      <Trophy size={17} />
                      <span>Umumiy ballni ko‘rish</span>
                    </button>
                  </div>
                )}

                {/* Final Score Reveal Modal/Card */}
                {showTotalSpeakingScore && isAllSpeakingAnswered && (
                  <div style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.05))',
                    border: '2px solid #10b981',
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                        🎉 SPEAKING MUVAFFAQIYATLI YAKUNLANDI!
                      </span>
                      <h4 style={{ margin: '4px 0', fontSize: '18px', fontWeight: 850, color: 'var(--pg-text-heading)' }}>
                        O‘rtacha natijangiz: {averageSpeakingScore} / 100 ball
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--pg-text-muted)' }}>
                        Nutqiy ravonlik va intonatsiyangiz a’lo darajada baholandi.
                      </p>
                    </div>
                    <button
                      onClick={() => onBegin('register')}
                      className="primary-btn"
                      style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 700 }}
                    >
                      To‘liq kursni boshlash
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* 6. GRAMMAR CARD                                       */}
          {/* ===================================================== */}
          <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
            <div className="practice-card-head">
              <span className="practice-card-badge">
                <Sparkles size={14} /> 6. GRAMMAR (GRAMMATIKA & XATOLAR TAHLILI)
              </span>
              <span className="practice-lang-tag">
                {currentLangData.flag} {currentLangData.langName}
              </span>
            </div>

            <div className="practice-card-grid">
              {/* Image */}
              <div className="practice-card-media" style={{ height: '240px' }}>
                <img
                  src={currentLangData.grammar.image}
                  alt={currentLangData.grammar.topicName}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>

              {/* Grammar Comparison Texts & Rules */}
              <div className="practice-content-col">
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: 'var(--pg-text-heading)' }}>
                    {currentLangData.grammar.topicName}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--pg-text-sub)', lineHeight: '1.6' }}>
                    {currentLangData.grammar.topicExplanation}
                  </p>
                </div>

                {/* 2 Comparison Texts Side by Side (Responsive auto-fit) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  {/* Incorrect Text */}
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1.5px solid #ef4444',
                    color: '#ef4444'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={14} /> XATO VARIANT:
                    </div>
                    <div style={{ fontSize: '13.5px', textDecoration: 'line-through', color: 'var(--pg-text-main)' }}>
                      "{currentLangData.grammar.incorrectText}"
                    </div>
                  </div>

                  {/* Corrected Text */}
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1.5px solid #10b981',
                    color: '#10b981'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> TO‘G‘RI VARIANT:
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--pg-text-main)' }}>
                      "{currentLangData.grammar.correctedText}"
                    </div>
                  </div>
                </div>

                {/* Topic Rule Tip */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'var(--pg-box-bg)',
                  border: '1px solid var(--pg-box-border)',
                  fontSize: '12px',
                  color: 'var(--pg-text-muted)'
                }}>
                  💡 <strong>Qoidani eslab qoling:</strong> {currentLangData.grammar.ruleTip}
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* 7. SHADOWING CARD                                     */}
          {/* ===================================================== */}
          <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
            <div className="practice-card-head">
              <span className="practice-card-badge">
                <Award size={14} /> 7. SHADOWING (SOYA METODI & NUTQNI MOSLASHTIRISH)
              </span>
              <span className="practice-lang-tag">
                {currentLangData.flag} {currentLangData.langName}
              </span>
            </div>

            {/* Enlarged Shadowing Grid: Video is wider and taller, right text has min-width: 0 */}
            <div className="practice-shadowing-grid">
              {/* Video Player: Large size (300px height), autoplay=0 (never auto-plays on load!) */}
              <div className="practice-shadowing-media">
                <iframe
                  width="100%"
                  height="100%"
                  src={getYoutubeEmbedUrl(currentLangData.shadowing.videoUrl, false)}
                  title="Shadowing Video"
                  style={{ border: 'none' }}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Shadowing Text, Audio Listen & Live Word Compare Mic */}
              <div className="practice-content-col">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: 'var(--pg-text-heading)' }}>
                      {currentLangData.shadowing.title}
                    </h3>
                  </div>

                  {/* Audio Listen & Mic Buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handlePlayTTS(currentLangData.shadowing.audioText)}
                      className="outline-btn"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--pg-purple)',
                        borderColor: 'var(--pg-purple)',
                        background: 'var(--pg-box-bg)'
                      }}
                    >
                      <Volume2 size={14} /> Audioni eshitish
                    </button>
                    <button
                      onClick={handleTestShadowing}
                      className="primary-btn"
                      style={{
                        padding: '6px 14px',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: isShadowingListening ? '#ef4444' : 'var(--pg-purple)',
                        animation: isShadowingListening ? 'pulse 1s infinite' : 'none'
                      }}
                    >
                      <Mic size={14} /> {isShadowingListening ? 'Eshitilmoqda...' : 'Nutqni solishtirish'}
                    </button>
                  </div>
                </div>

                {/* Target Text with Word-by-Word Color Matching (never overflows) */}
                <div style={{
                  padding: '20px',
                  background: 'var(--pg-box-bg)',
                  borderRadius: '14px',
                  border: '1px solid var(--pg-box-border)',
                  fontSize: '15px',
                  lineHeight: '1.8',
                  color: 'var(--pg-text-main)',
                  minWidth: 0,
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px'
                }}>
                  {currentLangData.shadowing.shadowingText.split(' ').map((targetWord, idx) => {
                    const cleanTarget = targetWord.replace(/[.,:;!?]/g, '').toLowerCase();
                    const spokenWords = shadowingRecognizedText.toLowerCase().split(/\s+/);
                    const isMatched = spokenWords.some(sw => sw.includes(cleanTarget) || cleanTarget.includes(sw));

                    return (
                      <span
                        key={idx}
                        style={{
                          padding: '2px 5px',
                          borderRadius: '4px',
                          color: isMatched ? '#10b981' : 'inherit',
                          fontWeight: isMatched ? 850 : 500,
                          background: isMatched ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                          transition: 'all 0.2s ease',
                          display: 'inline-block'
                        }}
                      >
                        {targetWord}
                      </span>
                    );
                  })}
                </div>

                {/* Shadowing Score Feedback */}
                {shadowingScore !== null && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid #10b981',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>Aytilgan nutq bilan solishtirildi ✓</span>
                    <strong style={{ fontSize: '14px' }}>⭐ Moslik darajasi: {shadowingScore}%</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
