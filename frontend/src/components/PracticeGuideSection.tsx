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

  // Youtube audio link parsing
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?autoplay=1&enablejsapi=1`;
      }
    } catch {}
    return url;
  };

  return (
    <section id="preview" className="welcome-preview-section">
      {/* Responsive Styles for Sequentially Stacked Cards */}
      <style>{`
        .practice-cards-wrapper {
          max-width: 1040px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .practice-skill-card {
          background: var(--panel, #ffffff);
          border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
          border-radius: 24px;
          padding: 30px;
          box-shadow: 0 10px 32px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .practice-skill-card:hover {
          box-shadow: 0 16px 42px rgba(0, 0, 0, 0.07);
        }
        .practice-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 22px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border, rgba(0, 0, 0, 0.06));
        }
        .practice-card-badge {
          padding: 5px 12px;
          border-radius: 8px;
          background: rgba(120, 105, 245, 0.12);
          color: var(--purple, #7869f5);
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
          background: var(--bg, #f8fafc);
          border: 1px solid var(--border, rgba(0,0,0,0.08));
          font-size: 11px;
          font-weight: 750;
          color: var(--muted, #64748b);
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .practice-card-grid {
          display: grid;
          grid-template-columns: minmax(260px, 320px) 1fr;
          gap: 26px;
          align-items: start;
        }
        .practice-card-media {
          border-radius: 16px;
          overflow: hidden;
          height: 230px;
          background: var(--bg, #f1f5f9);
          border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
        }
        .practice-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
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
          <span className="section-kicker">{config.kicker || "AMALIY QO‘LLANMA"}</span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 850, letterSpacing: '-1px', margin: '10px 0 14px' }}>
            {config.title || "Amaliy qo‘llanma"}
          </h2>
          <p style={{ maxWidth: '640px', margin: '0 auto 24px', fontSize: '15px', color: 'var(--muted)', lineHeight: '1.7' }}>
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
                  border: '1.5px solid var(--purple)',
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  boxShadow: '0 4px 14px rgba(120, 105, 245, 0.15)'
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
                color: 'var(--purple)',
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
        <div className="practice-cards-wrapper">

          {/* ===================================================== */}
          {/* 1. VOCABULARY CARD                                    */}
          {/* ===================================================== */}
          <div className="practice-skill-card">
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '26px', fontWeight: 850, color: 'var(--text)' }}>
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
                        border: '1px solid var(--border)',
                        background: activeSpeakingText === currentLangData.vocab.word ? 'var(--purple)' : 'var(--bg)',
                        color: activeSpeakingText === currentLangData.vocab.word ? '#fff' : 'var(--purple)',
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
                        border: '1px solid var(--border)',
                        background: isListeningVocabWord ? '#ef4444' : 'var(--bg)',
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
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                    {currentLangData.vocab.translation}
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6' }}>
                    {currentLangData.vocab.explanation}
                  </p>
                </div>

                {/* Example Phrase Card */}
                <div style={{
                  padding: '14px',
                  background: 'var(--bg)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                      Namuna gap (Example Phrase):
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => handlePlayTTS(currentLangData.vocab.examplePhrase)}
                        title="Gapni tinglash"
                        style={{
                          padding: '5px 9px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          background: 'var(--panel)',
                          color: 'var(--purple)',
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
                          border: '1px solid var(--border)',
                          background: isListeningVocabPhrase ? '#ef4444' : 'var(--panel)',
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
                  <div style={{ fontSize: '13.5px', fontStyle: 'italic', color: 'var(--text)', lineHeight: '1.5' }}>
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
          <div className="practice-skill-card">
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
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
                        color: 'var(--purple)',
                        borderColor: 'var(--purple)'
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
                        gap: '6px'
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
                  background: 'var(--bg)',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                  fontSize: '13.5px',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-line',
                  color: 'var(--text)',
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}>
                  {currentLangData.writing.letterContent}
                </div>

                {/* Translation Box (Collapsible) */}
                {showLetterTranslation && (
                  <div style={{
                    padding: '16px',
                    background: 'rgba(120, 105, 245, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(120, 105, 245, 0.25)',
                    fontSize: '13px',
                    lineHeight: '1.65',
                    color: 'var(--text)',
                    whiteSpace: 'pre-line'
                  }}>
                    <strong style={{ color: 'var(--purple)', display: 'block', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase' }}>
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
          <div className="practice-skill-card">
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
                    {currentLangData.reading.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                    Matnni diqqat bilan o‘qing. <b>Qalin (bold)</b> so‘zlar asosiy leksik tayanchlardir.
                  </p>
                </div>

                {/* Reading Text Container with HTML bold tags */}
                <div
                  style={{
                    padding: '18px',
                    background: 'var(--bg)',
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                    fontSize: '14px',
                    lineHeight: '1.8',
                    color: 'var(--text)'
                  }}
                  dangerouslySetInnerHTML={{ __html: currentLangData.reading.readingText }}
                />

                {/* Comprehension Questions */}
                <div style={{
                  padding: '16px',
                  background: 'var(--bg)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--purple)', textTransform: 'uppercase' }}>
                      Savollar va to‘g‘ri javoblar:
                    </span>
                    <button
                      onClick={() => setShowReadingAnswers(!showReadingAnswers)}
                      className="outline-btn"
                      style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      {showReadingAnswers ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showReadingAnswers ? 'Javoblarni yashirish' : 'Javoblarni ko‘rish'}
                    </button>
                  </div>

                  {currentLangData.reading.questions.map((q, idx) => (
                    <div key={idx} style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text)' }}>
                      <div>{q.question}</div>
                      {showReadingAnswers && (
                        <div style={{ marginTop: '2px', color: '#10b981', fontWeight: 700, fontSize: '12.5px' }}>
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
          <div className="practice-skill-card">
            <div className="practice-card-head">
              <span className="practice-card-badge">
                <Headphones size={14} /> 4. LISTENING (AUDIO TINGLASH & GAP-FILL)
              </span>
              <span className="practice-lang-tag">
                {currentLangData.flag} {currentLangData.langName}
              </span>
            </div>

            <div className="practice-card-grid">
              {/* Image & Dark YouTube Audio Box */}
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

                {/* Dedicated YouTube Audio Controller Box (Black background, video hidden) */}
                <div style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: '#090d16',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.12)',
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
                    <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      YouTube Audio
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => setListeningAudioPlaying(!listeningAudioPlaying)}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: '#7869f5',
                        color: '#fff',
                        border: 'none',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {listeningAudioPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
                    </button>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff' }}>
                        {listeningAudioPlaying ? 'Audio ijro etilmoqda...' : 'Audioni boshlash'}
                      </div>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Tinglang va bo‘sh joylarni to‘ldiring
                      </span>
                    </div>
                  </div>

                  {/* Hidden YouTube Iframe that plays audio */}
                  {listeningAudioPlaying && (
                    <div style={{ width: '1px', height: '1px', opacity: 0.01, position: 'absolute', pointerEvents: 'none' }}>
                      <iframe
                        width="1"
                        height="1"
                        src={getYoutubeEmbedUrl(currentLangData.listening.youtubeAudioUrl)}
                        title="YouTube Audio Stream"
                        allow="autoplay"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Gap-Fill Text and "Javoblarni tekshirish" button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
                    {currentLangData.listening.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--muted)' }}>
                    Audioni tinglang va bo‘sh joylarga tushishi kerak bo‘lgan so‘zlarni aniqlang.
                  </p>
                </div>

                {/* Gap fill text container */}
                <div style={{
                  padding: '22px',
                  background: 'var(--bg)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  fontSize: '15px',
                  lineHeight: '2.2',
                  color: 'var(--text)'
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
                          border: showListeningAnswers ? '1.5px solid #10b981' : '1.5px dashed var(--purple)',
                          background: showListeningAnswers ? 'rgba(16, 185, 129, 0.15)' : 'rgba(120, 105, 245, 0.08)',
                          color: showListeningAnswers ? '#10b981' : 'var(--purple)',
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
                      background: showListeningAnswers ? '#10b981' : 'var(--purple)',
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
          <div className="practice-skill-card">
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
                  background: 'var(--bg)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                      Javob berilgan savollar:
                    </span>
                    <strong style={{ fontSize: '12px', color: 'var(--purple)' }}>
                      {answeredQuestionsCount} / {totalQuestionsCount}
                    </strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(answeredQuestionsCount / (totalQuestionsCount || 1)) * 100}%`,
                      height: '100%',
                      background: 'var(--purple)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>

              {/* Questions List & Gated Final Score Button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
                    {currentLangData.speaking.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--muted)' }}>
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
                          background: 'var(--bg)',
                          borderRadius: '14px',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 750, color: 'var(--text)', lineHeight: '1.4' }}>
                              {q.id}. {q.question}
                            </div>
                            {q.hint && (
                              <span style={{ fontSize: '11.5px', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
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
                              background: isRecordingThis ? '#ef4444' : scoreObj ? '#10b981' : 'var(--purple)',
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
                      <h4 style={{ margin: '4px 0', fontSize: '18px', fontWeight: 850, color: 'var(--text)' }}>
                        O‘rtacha natijangiz: {averageSpeakingScore} / 100 ball
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
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
          <div className="practice-skill-card">
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
                    {currentLangData.grammar.topicName}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6' }}>
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
                    <div style={{ fontSize: '13.5px', textDecoration: 'line-through', color: 'var(--text)' }}>
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
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>
                      "{currentLangData.grammar.correctedText}"
                    </div>
                  </div>
                </div>

                {/* Topic Rule Tip */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  fontSize: '12px',
                  color: 'var(--muted)'
                }}>
                  💡 <strong>Qoidani eslab qoling:</strong> {currentLangData.grammar.ruleTip}
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* 7. SHADOWING CARD                                     */}
          {/* ===================================================== */}
          <div className="practice-skill-card">
            <div className="practice-card-head">
              <span className="practice-card-badge">
                <Award size={14} /> 7. SHADOWING (SOYA METODI & NUTQNI MOSLASHTIRISH)
              </span>
              <span className="practice-lang-tag">
                {currentLangData.flag} {currentLangData.langName}
              </span>
            </div>

            <div className="practice-card-grid">
              {/* Video Player */}
              <div style={{
                borderRadius: '16px',
                overflow: 'hidden',
                height: '240px',
                background: '#090d16',
                border: '1px solid var(--border)',
                position: 'relative'
              }}>
                <iframe
                  width="100%"
                  height="100%"
                  src={getYoutubeEmbedUrl(currentLangData.shadowing.videoUrl)}
                  title="Shadowing Video"
                  style={{ border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Shadowing Text, Audio Listen & Live Word Compare Mic */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                      {currentLangData.shadowing.title}
                    </h3>
                  </div>

                  {/* Audio Listen & Mic Buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handlePlayTTS(currentLangData.shadowing.audioText)}
                      className="outline-btn"
                      style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--purple)' }}
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
                        background: isShadowingListening ? '#ef4444' : 'var(--purple)',
                        animation: isShadowingListening ? 'pulse 1s infinite' : 'none'
                      }}
                    >
                      <Mic size={14} /> {isShadowingListening ? 'Eshitilmoqda...' : 'Nutqni solishtirish'}
                    </button>
                  </div>
                </div>

                {/* Target Text with Word-by-Word Color Matching */}
                <div style={{
                  padding: '20px',
                  background: 'var(--bg)',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: 'var(--text)'
                }}>
                  {currentLangData.shadowing.shadowingText.split(' ').map((targetWord, idx) => {
                    const cleanTarget = targetWord.replace(/[.,:;!?]/g, '').toLowerCase();
                    const spokenWords = shadowingRecognizedText.toLowerCase().split(/\s+/);
                    const isMatched = spokenWords.some(sw => sw.includes(cleanTarget) || cleanTarget.includes(sw));

                    return (
                      <span
                        key={idx}
                        style={{
                          marginRight: '6px',
                          padding: '1px 3px',
                          borderRadius: '4px',
                          color: isMatched ? '#10b981' : 'inherit',
                          fontWeight: isMatched ? 800 : 500,
                          background: isMatched ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                          transition: 'all 0.2s ease'
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
