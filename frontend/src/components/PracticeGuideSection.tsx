import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2, VolumeX, Mic, Play, Pause, RotateCcw, CheckCircle2, AlertCircle,
  Sparkles, BookOpen, PenLine, Headphones, MessageSquare, Award,
  ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, Trophy, Check, ArrowRight,
  Music, FastForward, Rewind
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

const SKILL_MODULES = [
  { id: 0, key: 'vocab', label: '1. Vocab', sub: 'Lug‘at boyligi', icon: BookOpen },
  { id: 1, key: 'writing', label: '2. Writing', sub: 'Rasmiy yozish', icon: PenLine },
  { id: 2, key: 'reading', label: '3. Reading', sub: 'Matn o‘qish & tahlil', icon: BookOpen },
  { id: 3, key: 'listening', label: '4. Listening', sub: 'Audio & Gap-fill', icon: Headphones },
  { id: 4, key: 'speaking', label: '5. Speaking', sub: 'Jonli intervyu', icon: MessageSquare },
  { id: 5, key: 'grammar', label: '6. Grammar', sub: 'Grammatika & tahlil', icon: Sparkles },
  { id: 6, key: 'shadowing', label: '7. Shadowing', sub: 'Soya metodi', icon: Award },
];

export function PracticeGuideSection({ guideConfig, onBegin, dark }: PracticeGuideSectionProps) {
  const config = guideConfig || DEFAULT_PRACTICE_GUIDE;
  const [selectedLang, setSelectedLang] = useState<string>('en');

  // Slide state: 0 to 6 (user controls manually, NO auto-sliding!)
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');

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

  // Listening card states: Dedicated Music Player (NO video shown!)
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0); // in seconds
  const [musicDuration, setMusicDuration] = useState<number>(145); // default duration
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showListeningAnswers, setShowListeningAnswers] = useState(false);

  // Speaking card states
  const [speakingScores, setSpeakingScores] = useState<Record<number, { score: number; text: string }>>({});
  const [activeListeningQuestionId, setActiveListeningQuestionId] = useState<number | null>(null);
  const [showTotalSpeakingScore, setShowTotalSpeakingScore] = useState(false);

  // Shadowing card states
  const [isShadowingListening, setIsShadowingListening] = useState(false);
  const [shadowingRecognizedText, setShadowingRecognizedText] = useState('');
  const [shadowingScore, setShadowingScore] = useState<number | null>(null);

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Send postMessage command to YouTube iframe
  const postYTCommand = (func: string, args: any[] = []) => {
    try {
      if (ytIframeRef.current && ytIframeRef.current.contentWindow) {
        ytIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      }
    } catch {}
  };

  // Stop active speech and audio when changing language or slide
  const stopAllAudio = () => {
    stopSpeech();
    setActiveSpeakingText(null);
    postYTCommand('pauseVideo');
    setMusicPlaying(false);
    setIsListeningVocabWord(false);
    setIsListeningVocabPhrase(false);
    setActiveListeningQuestionId(null);
    setIsShadowingListening(false);
  };

  useEffect(() => {
    stopAllAudio();
    setVocabWordScore(null);
    setVocabPhraseScore(null);
    setShowLetterTranslation(false);
    setShowReadingAnswers(false);
    setShowListeningAnswers(false);
    setSpeakingScores({});
    setShowTotalSpeakingScore(false);
    setShadowingRecognizedText('');
    setShadowingScore(null);
    setMusicCurrentTime(0);
  }, [selectedLang]);

  // Clean audio on slide change
  const goToSlide = (index: number) => {
    if (index === currentSlide) return;
    stopAllAudio();
    setSlideDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
  };

  const handleNextSlide = () => {
    if (currentSlide < SKILL_MODULES.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      onBegin('register');
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  // Touch Swipe Handlers for Mobile (No auto slide, pure swipe!)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    // Minimum swipe threshold 45px and predominantly horizontal
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      if (diffX > 0) {
        // Swiped Left -> Next Card
        handleNextSlide();
      } else {
        // Swiped Right -> Previous Card
        handlePrevSlide();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Music Player Timer Loop for Listening Card
  useEffect(() => {
    let timer: any;
    if (musicPlaying) {
      timer = setInterval(() => {
        setMusicCurrentTime((prev) => {
          if (prev >= musicDuration) {
            setMusicPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [musicPlaying, playbackSpeed]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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

  // Toggle Listening Music Player (Strictly controls YouTube audio, NEVER reads text via TTS)
  const toggleMusicPlayer = () => {
    stopSpeech(); // Stop any other speech
    if (musicPlaying) {
      postYTCommand('pauseVideo');
      setMusicPlaying(false);
    } else {
      postYTCommand('playVideo');
      setMusicPlaying(true);
    }
  };

  // Seek audio to specific seconds (-5s, +5s, or clicking timeline)
  const handleSeek = (targetSecs: number) => {
    const maxDur = musicDuration > 0 ? musicDuration : 145;
    const clamped = Math.max(0, Math.min(maxDur, targetSecs));
    setMusicCurrentTime(clamped);
    postYTCommand('seekTo', [clamped, true]);
    if (!musicPlaying) {
      postYTCommand('playVideo');
      setMusicPlaying(true);
    }
  };

  // Change playback speed: 1.0x -> 1.25x -> 1.5x -> 2.0x -> 0.75x
  const SPEED_OPTIONS = [1.0, 1.25, 1.5, 2.0, 0.75];
  const handleToggleSpeed = () => {
    const nextIdx = (SPEED_OPTIONS.indexOf(playbackSpeed) + 1) % SPEED_OPTIONS.length;
    const newSpeed = SPEED_OPTIONS[nextIdx];
    setPlaybackSpeed(newSpeed);
    postYTCommand('setPlaybackRate', [newSpeed]);
  };

  // Real-time synchronization with YouTube IFrame Player
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            setMusicCurrentTime(Math.floor(data.info.currentTime));
          }
          if (typeof data.info.duration === 'number' && data.info.duration > 0) {
            setMusicDuration(Math.floor(data.info.duration));
          }
          if (typeof data.info.playerState === 'number') {
            // 1 = playing, 2 = paused, 0 = ended
            if (data.info.playerState === 1) {
              setMusicPlaying(true);
            } else if (data.info.playerState === 2 || data.info.playerState === 0) {
              setMusicPlaying(false);
            }
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleIframeLoad = () => {
    try {
      if (ytIframeRef.current && ytIframeRef.current.contentWindow) {
        ytIframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
      }
    } catch {}
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
      onError: () => setIsListeningVocabWord(false),
      onEnd: () => setIsListeningVocabWord(false)
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
      onError: () => setIsListeningVocabPhrase(false),
      onEnd: () => setIsListeningVocabPhrase(false)
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
        setSpeakingScores((prev) => ({
          ...prev,
          [questionId]: {
            score: calcScore,
            text: res.transcript || 'Javob muvaffaqiyatli qabul qilindi'
          }
        }));
      },
      onError: () => setActiveListeningQuestionId(null),
      onEnd: () => setActiveListeningQuestionId(null)
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
      onError: () => setIsShadowingListening(false),
      onEnd: () => setIsShadowingListening(false)
    });
  };

  // Speaking check: Are all questions answered?
  const totalQuestionsCount = (currentLangData.speaking?.questions || []).length;
  const answeredQuestionsCount = Object.keys(speakingScores).length;
  const isAllSpeakingAnswered = totalQuestionsCount > 0 && answeredQuestionsCount >= totalQuestionsCount;

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
      {/* Dynamic Scoped Styles */}
      <style>{`
        /* ========================================================
           RESPONSIVE CONTAINER & SLIDER LAYOUT
           ======================================================== */
        .practice-slider-wrapper {
          max-width: 1180px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Skill Navigation Bar (Top Pills) */
        .practice-tabs-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          overflow-x: auto;
          padding: 8px 4px 18px;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .practice-tabs-bar::-webkit-scrollbar {
          display: none;
        }
        .practice-tab-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 18px;
          border-radius: 14px;
          background: var(--pg-box-bg, #f8fafc);
          border: 1px solid var(--pg-box-border, rgba(0, 0, 0, 0.08));
          color: var(--pg-text-muted, #64748b);
          font-size: 13.5px;
          font-weight: 750;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.22s ease;
          flex-shrink: 0;
        }
        .practice-tab-pill:hover {
          color: var(--pg-purple, #7869f5);
          transform: translateY(-2px);
        }
        .practice-tab-pill.active {
          background: linear-gradient(135deg, #7869f5 0%, #5b4bf0 100%);
          color: #ffffff !important;
          border-color: transparent;
          box-shadow: 0 6px 20px rgba(120, 105, 245, 0.35);
          transform: translateY(-2px);
        }

        /* ========================================================
           CARD COMPONENT — DESKTOP ENLARGED (KOMPYUTER UCHUN KATTA)
           ======================================================== */
        .practice-skill-card {
          --pg-card-bg: #ffffff;
          --pg-card-border: rgba(0, 0, 0, 0.08);
          --pg-card-shadow: 0 16px 48px rgba(0, 0, 0, 0.05);
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
          border: 1.5px solid var(--pg-card-border);
          border-radius: 28px;
          padding: 42px 48px;
          box-shadow: var(--pg-card-shadow);
          position: relative;
          overflow: hidden;
          color: var(--pg-text-main);
          animation: slideFade 0.32s cubic-bezier(0.16, 1, 0.3, 1);
          touch-action: pan-y pinch-zoom;
        }

        @keyframes slideFade {
          from {
            opacity: 0;
            transform: translateX(${slideDirection === 'next' ? '20px' : '-20px'});
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* DARK THEME SCOPED OVERRIDES */
        .welcome-root.dark .practice-skill-card,
        html.dark .practice-skill-card,
        .practice-skill-card.dark-card,
        .practice-slider-wrapper.is-dark .practice-skill-card {
          --pg-card-bg: #14243a !important;
          --pg-card-border: rgba(255, 255, 255, 0.11) !important;
          --pg-card-shadow: 0 18px 52px rgba(0, 0, 0, 0.45) !important;
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

        .welcome-root.dark .practice-tab-pill,
        html.dark .practice-tab-pill,
        .practice-slider-wrapper.is-dark .practice-tab-pill {
          background: #14243a;
          border-color: rgba(255, 255, 255, 0.09);
          color: #94a3b8;
        }

        .practice-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 28px;
          padding-bottom: 18px;
          border-bottom: 1.5px solid var(--pg-box-border);
        }
        .practice-card-badge {
          padding: 7px 16px;
          border-radius: 10px;
          background: var(--pg-badge-bg);
          color: var(--pg-badge-color);
          font-size: 12.5px;
          font-weight: 850;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .practice-lang-tag {
          padding: 6px 14px;
          border-radius: 9px;
          background: var(--pg-box-bg);
          border: 1px solid var(--pg-box-border);
          font-size: 12px;
          font-weight: 750;
          color: var(--pg-text-muted);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        /* Large 2-column Grid for Cards on Desktop */
        .practice-card-grid {
          display: grid;
          grid-template-columns: minmax(320px, 400px) 1fr;
          gap: 36px;
          align-items: start;
        }

        /* Large Shadowing Grid for Card 7 */
        .practice-shadowing-grid {
          display: grid;
          grid-template-columns: minmax(380px, 480px) 1fr;
          gap: 36px;
          align-items: start;
        }

        .practice-card-media {
          border-radius: 20px;
          overflow: hidden;
          height: 310px;
          background: var(--pg-box-bg);
          border: 1px solid var(--pg-box-border);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }
        .practice-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Shadowing Video Player */
        .practice-shadowing-media {
          border-radius: 20px;
          overflow: hidden;
          height: 330px;
          background: #000;
          border: 1px solid var(--pg-box-border);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          position: relative;
        }

        /* Robust Content Column that NEVER overflows */
        .practice-content-col {
          min-width: 0;
          max-width: 100%;
          display: flex;
          flex-direction: column;
          gap: 18px;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        /* Reading content highlight */
        .reading-content-box b,
        .reading-content-box strong {
          color: #7869f5;
          font-weight: 850;
        }
        .welcome-root.dark .reading-content-box b,
        html.dark .reading-content-box b,
        .is-dark .reading-content-box b {
          color: #a5b4fc !important;
          background: rgba(147, 135, 255, 0.15);
          padding: 1px 4px;
          border-radius: 4px;
        }

        /* ========================================================
           MODERN MUSIC PLAYER FOR YOUTUBE AUDIO (VIDEO KO'RINMAYDI)
           ======================================================== */
        .listening-music-player {
          border-radius: 22px;
          background: var(--pg-box-bg);
          border: 1.5px solid var(--pg-box-border);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
          position: relative;
        }

        .music-player-top {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .music-cover-art {
          width: 64px;
          height: 64px;
          border-radius: 14px;
          object-fit: cover;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
        }
        .music-meta {
          flex: 1;
          min-width: 0;
        }
        .music-meta-title {
          font-size: 15px;
          font-weight: 800;
          color: var(--pg-text-heading);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .music-meta-artist {
          font-size: 12px;
          color: var(--pg-text-muted);
          margin-top: 3px;
        }

        /* Equalizer Animation Bars */
        .music-equalizer {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 24px;
          padding-right: 4px;
        }
        .equalizer-bar {
          width: 3.5px;
          background: var(--pg-purple);
          border-radius: 3px;
          height: 6px;
          transition: height 0.2s ease;
        }
        .equalizer-bar.playing:nth-child(1) { animation: eqBounce 0.8s infinite 0.1s alternate; }
        .equalizer-bar.playing:nth-child(2) { animation: eqBounce 0.8s infinite 0.3s alternate; }
        .equalizer-bar.playing:nth-child(3) { animation: eqBounce 0.8s infinite 0.2s alternate; }
        .equalizer-bar.playing:nth-child(4) { animation: eqBounce 0.8s infinite 0.4s alternate; }

        @keyframes eqBounce {
          0% { height: 6px; }
          100% { height: 24px; }
        }

        /* Scrubber / Progress Bar */
        .music-progress-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .music-progress-bar {
          width: 100%;
          height: 7px;
          border-radius: 6px;
          background: var(--pg-box-border);
          position: relative;
          cursor: pointer;
          overflow: hidden;
        }
        .music-progress-fill {
          height: 100%;
          border-radius: 6px;
          background: linear-gradient(90deg, #7869f5 0%, #34d399 100%);
          transition: width 0.2s linear;
        }
        .music-time-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 700;
          color: var(--pg-text-muted);
        }

        /* Controls Row */
        .music-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
        }
        .music-play-btn {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7869f5 0%, #5b4bf0 100%);
          color: #ffffff;
          border: none;
          display: grid;
          place-items: center;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(120, 105, 245, 0.4);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .music-play-btn:hover {
          transform: scale(1.06);
          box-shadow: 0 8px 24px rgba(120, 105, 245, 0.5);
        }
        .music-speed-btn,
        .music-seek-btn {
          padding: 8px 12px;
          border-radius: 9px;
          background: var(--pg-card-bg);
          border: 1px solid var(--pg-box-border);
          color: var(--pg-text-main);
          font-size: 11.5px;
          font-weight: 750;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        /* ========================================================
           BOTTOM SLIDE NAVIGATION CONTROLS (OLDINGI / KEYINGI)
           ======================================================== */
        .practice-slide-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-radius: 18px;
          background: var(--pg-card-bg, #ffffff);
          border: 1px solid var(--pg-card-border, rgba(0, 0, 0, 0.08));
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
          gap: 14px;
          flex-wrap: wrap;
        }
        .welcome-root.dark .practice-slide-nav,
        html.dark .practice-slide-nav,
        .practice-slider-wrapper.is-dark .practice-slide-nav {
          background: #14243a !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
        }
        .slide-nav-btn {
          padding: 11px 20px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 750;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          border: none;
        }
        .slide-nav-btn.prev {
          background: var(--pg-box-bg, #f1f5f9);
          border: 1px solid var(--pg-box-border, rgba(0, 0, 0, 0.1));
          color: var(--pg-text-main, #1e293b);
        }
        .slide-nav-btn.prev:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .slide-nav-btn.next {
          background: linear-gradient(135deg, #7869f5 0%, #5b4bf0 100%);
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(120, 105, 245, 0.35);
        }
        .slide-nav-btn.next:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(120, 105, 245, 0.45);
        }

        /* Slide Step Dots */
        .slide-indicators {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .slide-dot {
          width: 9px;
          height: 9px;
          border-radius: 5px;
          background: var(--pg-box-border, rgba(0, 0, 0, 0.15));
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .slide-dot.active {
          width: 26px;
          background: var(--pg-purple, #7869f5);
        }
        .slide-counter-badge {
          font-size: 12px;
          font-weight: 800;
          color: var(--pg-purple, #7869f5);
          margin-left: 8px;
        }

        /* Dual Dropdowns Row (Til tanlash & Modul tanlash yonma-yon) */
        .practice-selects-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 26px;
          width: 100%;
        }
        .practice-select-box {
          position: relative;
          min-width: 190px;
          flex: 1;
          max-width: 260px;
        }

        /* Bottom CTA Banner (Amaliy qo'llanma bo'limi) */
        .practice-bottom-cta-banner {
          margin-top: 32px;
          padding: 28px 36px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(120, 105, 245, 0.12) 0%, rgba(91, 75, 240, 0.05) 100%);
          border: 1.5px solid rgba(120, 105, 245, 0.25);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          box-shadow: 0 10px 32px rgba(120, 105, 245, 0.08);
        }
        .welcome-root.dark .practice-bottom-cta-banner,
        html.dark .practice-bottom-cta-banner {
          background: linear-gradient(135deg, rgba(120, 105, 245, 0.18) 0%, rgba(20, 36, 58, 0.85) 100%) !important;
          border-color: rgba(147, 135, 255, 0.28) !important;
        }
        .practice-cta-content {
          flex: 1;
          min-width: 260px;
        }
        .practice-cta-kicker {
          font-size: 11.5px;
          font-weight: 850;
          color: var(--pg-purple);
          letter-spacing: 1px;
          text-transform: uppercase;
          display: block;
          margin-bottom: 6px;
        }
        .practice-cta-heading {
          margin: 0 0 6px;
          font-size: clamp(20px, 2.2vw, 25px);
          font-weight: 850;
          color: var(--pg-text-heading);
        }
        .practice-cta-desc {
          margin: 0;
          font-size: 14px;
          color: var(--pg-text-muted);
          line-height: 1.6;
        }
        .practice-cta-action-btn {
          padding: 13px 26px;
          border-radius: 14px;
          font-size: 14.5px;
          font-weight: 800;
          background: linear-gradient(135deg, #7869f5 0%, #5b4bf0 100%);
          color: #fff;
          box-shadow: 0 8px 24px rgba(120, 105, 245, 0.38);
          display: inline-flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
          transition: all 0.25s ease;
          border: none;
          flex-shrink: 0;
        }
        .practice-cta-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(120, 105, 245, 0.5);
        }

        /* ========================================================
           MOBILE RESPONSIVENESS (< 860px & < 600px)
           ======================================================== */
        @media (max-width: 860px) {
          /* Hide desktop pills bar on mobile — mobile uses the side-by-side select dropdown! */
          .practice-tabs-bar {
            display: none !important;
          }
          .practice-skill-card {
            padding: 22px 16px;
            border-radius: 20px;
          }
          .practice-card-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .practice-shadowing-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .practice-card-media {
            height: 200px !important;
          }
          .practice-shadowing-media {
            height: 220px;
          }
          .practice-slide-nav {
            padding: 12px 14px;
            justify-content: center;
          }
          .slide-nav-btn {
            flex: 1;
            justify-content: center;
            padding: 10px 14px;
            font-size: 12.5px;
          }
          .slide-indicators {
            order: -1;
            width: 100%;
            justify-content: center;
            margin-bottom: 6px;
          }
        }

        @media (max-width: 600px) {
          /* Side-by-side 2-column selects on mobile */
          .practice-selects-row {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            max-width: 100% !important;
          }
          .practice-select-box {
            min-width: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .practice-select-input {
            padding: 10px 28px 10px 10px !important;
            font-size: 12px !important;
            border-radius: 10px !important;
          }
          .practice-select-icon {
            right: 8px !important;
            width: 15px !important;
            height: 15px !important;
          }

          /* Music Player 100% mobile responsive */
          .listening-music-player {
            padding: 14px 14px !important;
            border-radius: 18px !important;
            gap: 12px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          .music-cover-art {
            width: 46px !important;
            height: 46px !important;
            border-radius: 10px !important;
          }
          .music-meta-title {
            font-size: 13px !important;
          }
          .music-meta-artist {
            font-size: 10.5px !important;
          }
          .music-equalizer {
            height: 18px !important;
            gap: 2.5px !important;
          }
          .equalizer-bar {
            width: 2.5px !important;
          }
          .music-controls-row {
            padding-top: 2px !important;
            gap: 6px !important;
          }
          .music-play-btn {
            width: 44px !important;
            height: 44px !important;
          }
          .music-seek-btn {
            padding: 6px 8px !important;
            font-size: 11px !important;
          }
          .music-speed-btn {
            padding: 6px 8px !important;
            font-size: 11px !important;
          }
          .music-time-row {
            font-size: 10.5px !important;
          }

          /* Bottom CTA Banner on mobile */
          .practice-bottom-cta-banner {
            padding: 20px 16px !important;
            border-radius: 18px !important;
            text-align: center !important;
            justify-content: center !important;
          }
          .practice-cta-content {
            min-width: 0 !important;
          }
          .practice-cta-action-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 12px 18px !important;
            font-size: 14px !important;
          }
        }
      `}</style>


      <div className="section-container">
        {/* Header with Title and Language + Skill Module Selects */}
        <div className="section-header scroll-reveal">
          <span className="section-kicker" style={{ color: isDarkMode ? '#a5b4fc' : '#7869f5' }}>
            {config.kicker || "QISQACHA KO‘ZDAN KECHIRISH"}
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 850,
            letterSpacing: '-1px',
            margin: '10px 0 14px',
            color: isDarkMode ? '#ffffff' : '#0f172a'
          }}>
            {config.title || "Qisqacha ko‘zdan kechirish"}
          </h2>
          <p style={{
            maxWidth: '640px',
            margin: '0 auto 24px',
            fontSize: '15px',
            color: isDarkMode ? '#94a3b8' : '#64748b',
            lineHeight: '1.7'
          }}>
            {config.subtitle || "O‘rganmoqchi bo‘lgan tilingiz va ko‘nikma modulini tanlang, har bir dars turini qisqacha ko‘rib chiqing."}
          </p>

          {/* Action Row: Language Select & Skill Module Select (Yonma-yon) */}
          <div className="practice-selects-row">
            {/* 1. Language Select Dropdown */}
            <div className="practice-select-box">
              <select
                id="practice-lang-select"
                className="practice-select-input"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 36px 12px 14px',
                  borderRadius: '12px',
                  border: isDarkMode ? '1.5px solid #9387ff' : '1.5px solid #7869f5',
                  background: isDarkMode ? '#14243a' : '#ffffff',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 14px rgba(120, 105, 245, 0.15)'
                }}
              >
                <option value="en">🇬🇧 English</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="ru">🇷🇺 Русский</option>
                <option value="uz">🇺🇿 O‘zbek</option>
              </select>
              <div className="practice-select-icon" style={{
                position: 'absolute',
                right: '12px',
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

            {/* 2. Skill Module Select Dropdown (Mobile uchun chiroyli select til tanlash bilan yonma-yon) */}
            <div className="practice-select-box">
              <select
                id="practice-module-select"
                className="practice-select-input"
                value={currentSlide}
                onChange={(e) => goToSlide(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px 36px 12px 14px',
                  borderRadius: '12px',
                  border: isDarkMode ? '1.5px solid #9387ff' : '1.5px solid #7869f5',
                  background: isDarkMode ? '#14243a' : '#ffffff',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 14px rgba(120, 105, 245, 0.15)'
                }}
              >
                {SKILL_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} ({m.sub.split(' ')[0]})
                  </option>
                ))}
              </select>
              <div className="practice-select-icon" style={{
                position: 'absolute',
                right: '12px',
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
          </div>
        </div>

        {/* ======================================================== */}
        {/* SLIDE WRAPPER (TOUCH SWIPEABLE FOR MOBILE, BIG FOR DESKTOP) */}
        {/* ======================================================== */}
        <div
          className={`practice-slider-wrapper ${isDarkMode ? 'is-dark' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Skill Navigation Tabs (Click to jump to any module) */}
          <div className="practice-tabs-bar">
            {SKILL_MODULES.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentSlide === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => goToSlide(tab.id)}
                  className={`practice-tab-pill ${isActive ? 'active' : ''}`}
                  title={tab.sub}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ===================================================== */}
          {/* SLIDE 0: VOCABULARY CARD                              */}
          {/* ===================================================== */}
          {currentSlide === 0 && (
            <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
              <div className="practice-card-head">
                <span className="practice-card-badge">
                  <BookOpen size={15} /> 1. VOCABULARY (LUG‘AT & SO‘Z BOYLIGI)
                </span>
                <span className="practice-lang-tag">
                  {currentLangData.flag} {currentLangData.langName}
                </span>
              </div>

              <div className="practice-card-grid">
                {/* Media Image */}
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
                    <h3 style={{ margin: 0, fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 850, color: 'var(--pg-text-heading)' }}>
                      {currentLangData.vocab.word}
                    </h3>

                    {/* Word Audio & Mic Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={() => handlePlayTTS(currentLangData.vocab.word)}
                        title="So‘z talaffuzini tinglash"
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          border: '1px solid var(--pg-box-border)',
                          background: activeSpeakingText === currentLangData.vocab.word ? 'var(--pg-purple)' : 'var(--pg-box-bg)',
                          color: activeSpeakingText === currentLangData.vocab.word ? '#fff' : 'var(--pg-purple)',
                          display: 'grid',
                          placeItems: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        {activeSpeakingText === currentLangData.vocab.word ? <VolumeX size={19} /> : <Volume2 size={19} />}
                      </button>
                      <button
                        onClick={handleTestVocabWord}
                        title="So‘zni o‘zingiz aytib ko‘ring (Mikrofon)"
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          border: '1px solid var(--pg-box-border)',
                          background: isListeningVocabWord ? '#ef4444' : 'var(--pg-box-bg)',
                          color: isListeningVocabWord ? '#fff' : '#10b981',
                          display: 'grid',
                          placeItems: 'center',
                          cursor: 'pointer',
                          animation: isListeningVocabWord ? 'pulse 1s infinite' : 'none'
                        }}
                      >
                        <Mic size={19} />
                      </button>
                    </div>
                  </div>

                  {/* Translation & Definition */}
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 750, color: 'var(--pg-green-text)', marginBottom: '6px' }}>
                      {currentLangData.vocab.translation}
                    </div>
                    <p style={{ margin: 0, fontSize: '15px', color: 'var(--pg-text-muted)', lineHeight: '1.7' }}>
                      {currentLangData.vocab.explanation}
                    </p>
                  </div>

                  {/* Example Phrase Card */}
                  <div style={{
                    padding: '18px',
                    background: 'var(--pg-box-bg)',
                    borderRadius: '16px',
                    border: '1px solid var(--pg-box-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pg-text-muted)', textTransform: 'uppercase' }}>
                        Namuna gap (Example Phrase):
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handlePlayTTS(currentLangData.vocab.examplePhrase)}
                          title="Gapni tinglash"
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--pg-box-border)',
                            background: 'var(--pg-card-bg)',
                            color: 'var(--pg-purple)',
                            fontSize: '12px',
                            fontWeight: 750,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Volume2 size={14} /> Tinglash
                        </button>
                        <button
                          onClick={handleTestVocabPhrase}
                          title="Gapni o‘qib aytib ko‘ring"
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--pg-box-border)',
                            background: isListeningVocabPhrase ? '#ef4444' : 'var(--pg-card-bg)',
                            color: isListeningVocabPhrase ? '#fff' : '#10b981',
                            fontSize: '12px',
                            fontWeight: 750,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Mic size={14} /> {isListeningVocabPhrase ? 'Eshitilmoqda...' : 'Sinash'}
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '15.5px', fontStyle: 'italic', color: 'var(--pg-text-main)', lineHeight: '1.6' }}>
                      "{currentLangData.vocab.examplePhrase}"
                    </div>

                    {/* Word & Phrase Scores Feedback */}
                    {(vocabWordScore !== null || vocabPhraseScore !== null) && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {vocabWordScore !== null && (
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            padding: '4px 11px',
                            borderRadius: '7px',
                            background: vocabWordScore >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: vocabWordScore >= 80 ? '#10b981' : '#f59e0b'
                          }}>
                            🎯 So‘z talaffuz bali: {vocabWordScore}%
                          </span>
                        )}
                        {vocabPhraseScore !== null && (
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            padding: '4px 11px',
                            borderRadius: '7px',
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
          )}

          {/* ===================================================== */}
          {/* SLIDE 1: WRITING CARD                                 */}
          {/* ===================================================== */}
          {currentSlide === 1 && (
            <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
              <div className="practice-card-head">
                <span className="practice-card-badge">
                  <PenLine size={15} /> 2. WRITING (AKADEMIK & RASMIY YOZISH)
                </span>
                <span className="practice-lang-tag">
                  {currentLangData.flag} {currentLangData.langName}
                </span>
              </div>

              <div className="practice-card-grid">
                {/* Media Image */}
                <div className="practice-card-media" style={{ height: '320px' }}>
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
                    <h3 style={{ margin: 0, fontSize: 'clamp(22px, 2.3vw, 28px)', fontWeight: 800, color: 'var(--pg-text-heading)' }}>
                      {currentLangData.writing.letterTitle}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handlePlayTTS(currentLangData.writing.letterContent)}
                        className="outline-btn"
                        style={{
                          padding: '8px 14px',
                          fontSize: '12.5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'var(--pg-purple)',
                          borderColor: 'var(--pg-purple)',
                          background: 'var(--pg-box-bg)'
                        }}
                      >
                        <Volume2 size={15} /> Xatni tinglash
                      </button>
                      <button
                        onClick={() => setShowLetterTranslation(!showLetterTranslation)}
                        className="outline-btn"
                        style={{
                          padding: '8px 14px',
                          fontSize: '12.5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'var(--pg-text-main)',
                          borderColor: 'var(--pg-box-border)',
                          background: 'var(--pg-box-bg)'
                        }}
                      >
                        {showLetterTranslation ? <EyeOff size={15} /> : <Eye size={15} />}
                        {showLetterTranslation ? 'Tarjimani yashirish' : 'Tarjimani ko‘rish'}
                      </button>
                    </div>
                  </div>

                  {/* Letter Text Box */}
                  <div style={{
                    padding: '22px',
                    background: 'var(--pg-box-bg)',
                    borderRadius: '16px',
                    border: '1px solid var(--pg-box-border)',
                    fontSize: '15px',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-line',
                    color: 'var(--pg-text-main)',
                    maxHeight: '260px',
                    overflowY: 'auto'
                  }}>
                    {currentLangData.writing.letterContent}
                  </div>

                  {/* Translation Box (Collapsible) */}
                  {showLetterTranslation && (
                    <div style={{
                      padding: '18px',
                      background: isDarkMode ? 'rgba(120, 105, 245, 0.12)' : 'rgba(120, 105, 245, 0.08)',
                      borderRadius: '14px',
                      border: '1px solid rgba(120, 105, 245, 0.28)',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      color: 'var(--pg-text-main)',
                      whiteSpace: 'pre-line'
                    }}>
                      <strong style={{ color: 'var(--pg-purple)', display: 'block', marginBottom: '6px', fontSize: '11.5px', textTransform: 'uppercase' }}>
                        🇺🇿 O‘zbekcha tarjimasi:
                      </strong>
                      {currentLangData.writing.letterTranslation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* SLIDE 2: READING CARD                                 */}
          {/* ===================================================== */}
          {currentSlide === 2 && (
            <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
              <div className="practice-card-head">
                <span className="practice-card-badge">
                  <BookOpen size={15} /> 3. READING (MATN O‘QISH & TAHLIL)
                </span>
                <span className="practice-lang-tag">
                  {currentLangData.flag} {currentLangData.langName}
                </span>
              </div>

              <div className="practice-card-grid">
                {/* Media Image */}
                <div className="practice-card-media" style={{ height: '300px' }}>
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
                    <h3 style={{ margin: '0 0 6px', fontSize: 'clamp(22px, 2.3vw, 28px)', fontWeight: 800, color: 'var(--pg-text-heading)' }}>
                      {currentLangData.reading.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--pg-text-muted)' }}>
                      Matnni diqqat bilan o‘qing. <b>Qalin (bold)</b> so‘zlar asosiy leksik tayanchlardir.
                    </p>
                  </div>

                  {/* Reading Text Container with HTML bold tags */}
                  <div
                    className="reading-content-box"
                    style={{
                      padding: '22px',
                      background: 'var(--pg-box-bg)',
                      borderRadius: '16px',
                      border: '1px solid var(--pg-box-border)',
                      fontSize: '16px',
                      lineHeight: '1.9',
                      color: 'var(--pg-text-main)'
                    }}
                    dangerouslySetInnerHTML={{ __html: currentLangData.reading.readingText }}
                  />

                  {/* Comprehension Questions */}
                  <div style={{
                    padding: '18px',
                    background: 'var(--pg-box-bg)',
                    borderRadius: '14px',
                    border: '1px solid var(--pg-box-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 850, color: 'var(--pg-purple)', textTransform: 'uppercase' }}>
                        Savollar va to‘g‘ri javoblar:
                      </span>
                      <button
                        onClick={() => setShowReadingAnswers(!showReadingAnswers)}
                        className="outline-btn"
                        style={{
                          padding: '5px 12px',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'var(--pg-card-bg)',
                          borderColor: 'var(--pg-box-border)',
                          color: 'var(--pg-text-main)'
                        }}
                      >
                        {showReadingAnswers ? <EyeOff size={13} /> : <Eye size={13} />}
                        {showReadingAnswers ? 'Javoblarni yashirish' : 'Javoblarni ko‘rish'}
                      </button>
                    </div>

                    {currentLangData.reading.questions.map((q, idx) => (
                      <div key={idx} style={{ fontSize: '14px', lineHeight: '1.65', color: 'var(--pg-text-main)' }}>
                        <div>{q.question}</div>
                        {showReadingAnswers && (
                          <div style={{ marginTop: '3px', color: 'var(--pg-green-text)', fontWeight: 750, fontSize: '13.5px' }}>
                            (To‘g‘ri javob: {q.answer})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* SLIDE 3: LISTENING CARD WITH MODERN MUSIC PLAYER     */}
          {/* (YOUTUBE VIDEO KO'RINMAYDI — MUSIQA PLAYER KO'RINISHI) */}
          {/* ===================================================== */}
          {currentSlide === 3 && (
            <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
              <div className="practice-card-head">
                <span className="practice-card-badge">
                  <Headphones size={15} /> 4. LISTENING (AUDIO TINGLASH & GAP-FILL)
                </span>
                <span className="practice-lang-tag">
                  {currentLangData.flag} {currentLangData.langName}
                </span>
              </div>

              <div className="practice-card-grid">
                {/* Left Side: Modern Music Player (NO video shown!) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="listening-music-player">
                    {/* Top Bar: Cover Art, Metadata, Equalizer */}
                    <div className="music-player-top">
                      <img
                        src={currentLangData.listening.image}
                        alt="Album Cover"
                        className="music-cover-art"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="music-meta">
                        <div className="music-meta-title">{currentLangData.listening.title}</div>
                        <div className="music-meta-artist">
                          TILSHUNOS Audio · {currentLangData.langName} Listening
                        </div>
                      </div>

                      {/* Dancing Equalizer Sound Wave Bars */}
                      <div className="music-equalizer">
                        <div className={`equalizer-bar ${musicPlaying ? 'playing' : ''}`} />
                        <div className={`equalizer-bar ${musicPlaying ? 'playing' : ''}`} />
                        <div className={`equalizer-bar ${musicPlaying ? 'playing' : ''}`} />
                        <div className={`equalizer-bar ${musicPlaying ? 'playing' : ''}`} />
                      </div>
                    </div>

                    {/* Timeline & Scrubber Progress */}
                    <div className="music-progress-wrap">
                      <div
                        className="music-progress-bar"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                          const targetSecs = Math.round(clickPos * (musicDuration || 145));
                          handleSeek(targetSecs);
                        }}
                        title="Audioni istalgan joyidan boshlab qo‘yish"
                      >
                        <div
                          className="music-progress-fill"
                          style={{ width: `${Math.min(100, (musicCurrentTime / (musicDuration || 145)) * 100).toFixed(2)}%` }}
                        />
                      </div>
                      <div className="music-time-row">
                        <span>{formatTime(musicCurrentTime)}</span>
                        <span>{formatTime(musicDuration)}</span>
                      </div>
                    </div>

                    {/* Music Player Controls */}
                    <div className="music-controls-row">
                      {/* Rewind 5s */}
                      <button
                        onClick={() => handleSeek(musicCurrentTime - 5)}
                        className="music-seek-btn"
                        title="5 soniya orqaga (-5s)"
                      >
                        <RotateCcw size={14} /> -5s
                      </button>

                      {/* Main Big Circular Play / Pause Button */}
                      <button
                        onClick={toggleMusicPlayer}
                        className="music-play-btn"
                        title={musicPlaying ? "Pauza" : "Tinglash"}
                      >
                        {musicPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: '3px' }} />}
                      </button>

                      {/* Forward 5s */}
                      <button
                        onClick={() => handleSeek(musicCurrentTime + 5)}
                        className="music-seek-btn"
                        title="5 soniya oldinga (+5s)"
                      >
                        +5s <FastForward size={14} />
                      </button>

                      {/* Speed Toggle (1.0x, 1.25x, 1.5x, 2.0x, 0.75x) */}
                      <button
                        onClick={handleToggleSpeed}
                        className="music-speed-btn"
                        title="Ijro tezligi: 1x, 1.25x, 1.5x, 2x, 0.75x"
                      >
                        ⚡ {playbackSpeed}x
                      </button>
                    </div>

                    {/* Real YouTube Audio Iframe: Fully loaded, 100% invisible to user behind music player */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0.001,
                      pointerEvents: 'none',
                      zIndex: -1,
                      overflow: 'hidden',
                      borderRadius: '22px'
                    }}>
                      <iframe
                        ref={ytIframeRef}
                        onLoad={handleIframeLoad}
                        width="100%"
                        height="100%"
                        src={getYoutubeEmbedUrl(currentLangData.listening.youtubeAudioUrl, false)}
                        title="Listening YouTube Audio Stream"
                        style={{ border: 'none', width: '100%', height: '100%' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side: Gap-Fill Text and Check Button */}
                <div className="practice-content-col">
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: 'clamp(22px, 2.3vw, 28px)', fontWeight: 800, color: 'var(--pg-text-heading)' }}>
                      {currentLangData.listening.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--pg-text-muted)' }}>
                      Musiqa pleyeridan audioni tinglang va bo‘sh joylarga tushishi kerak bo‘lgan so‘zlarni aniqlang.
                    </p>
                  </div>

                  {/* Gap Fill Text Box */}
                  <div style={{
                    padding: '24px',
                    background: 'var(--pg-box-bg)',
                    borderRadius: '18px',
                    border: '1px solid var(--pg-box-border)',
                    fontSize: '16.5px',
                    lineHeight: '2.3',
                    color: 'var(--pg-text-main)'
                  }}>
                    {currentLangData.listening.textWithGaps.split(/\[\s*______\s*\]|\[\s*[^\]]+\s*\]/).map((part, index, arr) => (
                      <React.Fragment key={index}>
                        {part}
                        {index < arr.length - 1 && (
                          <span style={{
                            display: 'inline-block',
                            padding: showListeningAnswers ? '3px 12px' : '3px 20px',
                            margin: '0 6px',
                            borderRadius: '9px',
                            border: showListeningAnswers ? '1.5px solid #10b981' : '1.5px dashed var(--pg-purple)',
                            background: showListeningAnswers ? 'rgba(16, 185, 129, 0.15)' : 'rgba(120, 105, 245, 0.1)',
                            color: showListeningAnswers ? '#10b981' : 'var(--pg-purple)',
                            fontWeight: 800,
                            fontSize: '14px',
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
                        padding: '12px 22px',
                        fontSize: '14px',
                        fontWeight: 800,
                        background: showListeningAnswers ? '#10b981' : 'var(--pg-purple)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <CheckCircle2 size={17} />
                      <span>{showListeningAnswers ? 'Javoblarni yashirish' : 'Javoblarni tekshirish'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* SLIDE 4: SPEAKING CARD                                */}
          {/* ===================================================== */}
          {currentSlide === 4 && (
            <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
              <div className="practice-card-head">
                <span className="practice-card-badge">
                  <MessageSquare size={15} /> 5. SPEAKING (JONLI INTERVYU & NUTQ)
                </span>
                <span className="practice-lang-tag">
                  {currentLangData.flag} {currentLangData.langName}
                </span>
              </div>

              <div className="practice-card-grid">
                {/* Media Image & Progress */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="practice-card-media" style={{ height: '260px' }}>
                    <img
                      src={currentLangData.speaking.image}
                      alt={currentLangData.speaking.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>

                  <div style={{
                    padding: '16px',
                    background: 'var(--pg-box-bg)',
                    borderRadius: '14px',
                    border: '1px solid var(--pg-box-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--pg-text-muted)', textTransform: 'uppercase' }}>
                        Javob berilgan savollar:
                      </span>
                      <strong style={{ fontSize: '13px', color: 'var(--pg-purple)' }}>
                        {answeredQuestionsCount} / {totalQuestionsCount}
                      </strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', borderRadius: '5px', background: 'var(--pg-box-border)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(answeredQuestionsCount / (totalQuestionsCount || 1)) * 100}%`,
                        height: '100%',
                        background: 'var(--pg-purple)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Questions List & Score Button */}
                <div className="practice-content-col">
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: 'clamp(22px, 2.3vw, 28px)', fontWeight: 800, color: 'var(--pg-text-heading)' }}>
                      {currentLangData.speaking.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--pg-text-muted)' }}>
                      Har bir savolni o‘qing va "Javob berish" mikrofon tugmasi orqali erkin javob bering.
                    </p>
                  </div>

                  {/* Question items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {currentLangData.speaking.questions.map((q) => {
                      const scoreObj = speakingScores[q.id];
                      const isRecordingThis = activeListeningQuestionId === q.id;

                      return (
                        <div
                          key={q.id}
                          style={{
                            padding: '18px',
                            background: 'var(--pg-box-bg)',
                            borderRadius: '16px',
                            border: '1px solid var(--pg-box-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '15px', fontWeight: 750, color: 'var(--pg-text-main)', lineHeight: '1.45' }}>
                                {q.id}. {q.question}
                              </div>
                              {q.hint && (
                                <span style={{ fontSize: '12.5px', color: 'var(--pg-text-muted)', display: 'block', marginTop: '5px' }}>
                                  💡 Maslahat: {q.hint}
                                </span>
                              )}
                            </div>

                            {/* Mic Answer Button */}
                            <button
                              onClick={() => handleTestSpeakingQuestion(q.id, q.question)}
                              className="primary-btn"
                              style={{
                                padding: '9px 16px',
                                fontSize: '12.5px',
                                fontWeight: 750,
                                background: isRecordingThis ? '#ef4444' : scoreObj ? '#10b981' : 'var(--pg-purple)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                animation: isRecordingThis ? 'pulse 1s infinite' : 'none',
                                flexShrink: 0
                              }}
                            >
                              <Mic size={15} />
                              <span>{isRecordingThis ? 'Eshityapman...' : scoreObj ? 'Qayta topshirish' : 'Javob berish'}</span>
                            </button>
                          </div>

                          {/* Question Score Feedback */}
                          {scoreObj && (
                            <div style={{
                              padding: '10px 14px',
                              borderRadius: '10px',
                              background: 'rgba(16, 185, 129, 0.12)',
                              color: '#10b981',
                              fontSize: '13px',
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
                          padding: '14px 26px',
                          fontSize: '15px',
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 18px rgba(16, 185, 129, 0.35)'
                        }}
                      >
                        <Trophy size={18} />
                        <span>Umumiy ballni ko‘rish</span>
                      </button>
                    </div>
                  )}

                  {/* Final Score Reveal Modal/Card */}
                  {showTotalSpeakingScore && isAllSpeakingAnswered && (
                    <div style={{
                      padding: '24px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(5, 150, 105, 0.06))',
                      border: '2px solid #10b981',
                      marginTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                          🎉 SPEAKING MUVAFFAQIYATLI YAKUNLANDI!
                        </span>
                        <h4 style={{ margin: '6px 0', fontSize: '20px', fontWeight: 850, color: 'var(--pg-text-heading)' }}>
                          O‘rtacha natijangiz: {averageSpeakingScore} / 100 ball
                        </h4>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--pg-text-muted)' }}>
                          Nutqiy ravonlik va intonatsiyangiz a’lo darajada baholandi.
                        </p>
                      </div>
                      <button
                        onClick={() => onBegin('register')}
                        className="primary-btn"
                        style={{ padding: '10px 18px', fontSize: '13px', fontWeight: 700 }}
                      >
                        To‘liq kursni boshlash
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* SLIDE 5: GRAMMAR CARD                                 */}
          {/* ===================================================== */}
          {currentSlide === 5 && (
            <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
              <div className="practice-card-head">
                <span className="practice-card-badge">
                  <Sparkles size={15} /> 6. GRAMMAR (GRAMMATIKA & XATOLAR TAHLILI)
                </span>
                <span className="practice-lang-tag">
                  {currentLangData.flag} {currentLangData.langName}
                </span>
              </div>

              <div className="practice-card-grid">
                {/* Media Image */}
                <div className="practice-card-media" style={{ height: '300px' }}>
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
                    <h3 style={{ margin: '0 0 6px', fontSize: 'clamp(22px, 2.3vw, 28px)', fontWeight: 800, color: 'var(--pg-text-heading)' }}>
                      {currentLangData.grammar.topicName}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14.5px', color: 'var(--pg-text-sub)', lineHeight: '1.7' }}>
                      {currentLangData.grammar.topicExplanation}
                    </p>
                  </div>

                  {/* 2 Comparison Boxes Side by Side */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                    {/* Incorrect Text */}
                    <div style={{
                      padding: '18px',
                      borderRadius: '14px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1.5px solid #ef4444',
                      color: '#ef4444'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <AlertCircle size={15} /> XATO VARIANT:
                      </div>
                      <div style={{ fontSize: '14.5px', textDecoration: 'line-through', color: 'var(--pg-text-main)' }}>
                        "{currentLangData.grammar.incorrectText}"
                      </div>
                    </div>

                    {/* Corrected Text */}
                    <div style={{
                      padding: '18px',
                      borderRadius: '14px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1.5px solid #10b981',
                      color: '#10b981'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CheckCircle2 size={15} /> TO‘G‘RI VARIANT:
                      </div>
                      <div style={{ fontSize: '14.5px', fontWeight: 750, color: 'var(--pg-text-main)' }}>
                        "{currentLangData.grammar.correctedText}"
                      </div>
                    </div>
                  </div>

                  {/* Topic Rule Tip */}
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'var(--pg-box-bg)',
                    border: '1px solid var(--pg-box-border)',
                    fontSize: '13.5px',
                    color: 'var(--pg-text-muted)'
                  }}>
                    💡 <strong>Qoidani eslab qoling:</strong> {currentLangData.grammar.ruleTip}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* SLIDE 6: SHADOWING CARD (LARGE VIDEO, NO AUTOPLAY)     */}
          {/* ===================================================== */}
          {currentSlide === 6 && (
            <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
              <div className="practice-card-head">
                <span className="practice-card-badge">
                  <Award size={15} /> 7. SHADOWING (SOYA METODI & NUTQNI MOSLASHTIRISH)
                </span>
                <span className="practice-lang-tag">
                  {currentLangData.flag} {currentLangData.langName}
                </span>
              </div>

              {/* Large Shadowing Grid */}
              <div className="practice-shadowing-grid">
                {/* Video Player: Large (330px height), autoplay=0 */}
                <div className="practice-shadowing-media">
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYoutubeEmbedUrl(currentLangData.shadowing.videoUrl, false)}
                    title="Shadowing Video"
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Shadowing Text & Live Compare Mic */}
                <div className="practice-content-col">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: 'clamp(20px, 2.2vw, 26px)', fontWeight: 800, color: 'var(--pg-text-heading)' }}>
                        {currentLangData.shadowing.title}
                      </h3>
                    </div>

                    {/* Audio Listen & Mic Buttons */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handlePlayTTS(currentLangData.shadowing.audioText)}
                        className="outline-btn"
                        style={{
                          padding: '7px 14px',
                          fontSize: '12.5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'var(--pg-purple)',
                          borderColor: 'var(--pg-purple)',
                          background: 'var(--pg-box-bg)'
                        }}
                      >
                        <Volume2 size={15} /> Audioni eshitish
                      </button>
                      <button
                        onClick={handleTestShadowing}
                        className="primary-btn"
                        style={{
                          padding: '7px 16px',
                          fontSize: '12.5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: isShadowingListening ? '#ef4444' : 'var(--pg-purple)',
                          animation: isShadowingListening ? 'pulse 1s infinite' : 'none'
                        }}
                      >
                        <Mic size={15} /> {isShadowingListening ? 'Eshitilmoqda...' : 'Nutqni solishtirish'}
                      </button>
                    </div>
                  </div>

                  {/* Target Text with Word-by-Word Matching (never overflows) */}
                  <div style={{
                    padding: '22px',
                    background: 'var(--pg-box-bg)',
                    borderRadius: '16px',
                    border: '1px solid var(--pg-box-border)',
                    fontSize: '16.5px',
                    lineHeight: '1.85',
                    color: 'var(--pg-text-main)',
                    minWidth: 0,
                    maxWidth: '100%',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '5px'
                  }}>
                    {currentLangData.shadowing.shadowingText.split(' ').map((targetWord, idx) => {
                      const cleanTarget = targetWord.replace(/[.,:;!?]/g, '').toLowerCase();
                      const spokenWords = shadowingRecognizedText.toLowerCase().split(/\s+/);
                      const isMatched = spokenWords.some((sw) => sw.includes(cleanTarget) || cleanTarget.includes(sw));

                      return (
                        <span
                          key={idx}
                          style={{
                            padding: '2px 6px',
                            borderRadius: '5px',
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
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid #10b981',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>Aytilgan nutq bilan solishtirildi ✓</span>
                      <strong style={{ fontSize: '15px' }}>⭐ Moslik darajasi: {shadowingScore}%</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* SLIDE NAVIGATION CONTROLS (OLDINGI / KEYINGI / DOTS) */}
          {/* ===================================================== */}
          <div className="practice-slide-nav">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              className="slide-nav-btn prev"
            >
              <ChevronLeft size={18} />
              <span>Oldingi modul</span>
            </button>

            {/* Dot Indicators */}
            <div className="slide-indicators">
              {SKILL_MODULES.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => goToSlide(mod.id)}
                  className={`slide-dot ${currentSlide === mod.id ? 'active' : ''}`}
                  title={mod.label}
                />
              ))}
              <span className="slide-counter-badge">
                {currentSlide + 1} / {SKILL_MODULES.length}
              </span>
            </div>

            <button
              onClick={handleNextSlide}
              className="slide-nav-btn next"
            >
              <span>{currentSlide === SKILL_MODULES.length - 1 ? 'Ro‘yxatdan o‘tish' : 'Keyingi modul'}</span>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* ===================================================== */}
          {/* BOTTOM CARD: AMALIY QO'LLANMA (ADMIN SOZLAYDI & RASM BILAN) */}
          {/* ===================================================== */}
          <div className={`practice-skill-card practice-bottom-card ${isDarkMode ? 'dark-card' : ''}`}>
            <div className="practice-card-grid">
              {/* Media Image: Admin yuklagan rasm */}
              <div className="practice-card-media" style={{ height: '280px' }}>
                <img
                  src={config.bottomBannerImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"}
                  alt={config.bottomBannerTitle || "Amaliy qo‘llanma"}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>

              {/* Content Column: Kicker, Title, Description & Action Button */}
              <div className="practice-content-col" style={{ justifyContent: 'center' }}>
                <div>
                  <span className="practice-card-badge" style={{ marginBottom: '12px' }}>
                    <Sparkles size={14} /> {config.bottomBannerKicker || "AMALIY QO‘LLANMA"}
                  </span>
                  <h3 style={{ margin: '4px 0 10px', fontSize: 'clamp(24px, 2.5vw, 32px)', fontWeight: 850, color: 'var(--pg-text-heading)' }}>
                    {config.bottomBannerTitle || "O‘zingizni amalda sinab ko‘ring"}
                  </h3>
                  <p style={{ margin: '0 0 22px', fontSize: '15px', color: 'var(--pg-text-muted)', lineHeight: '1.7' }}>
                    {config.bottomBannerDesc || "7 ta ko‘nikma moduli bo‘yicha to‘liq interaktiv mashqlar, AI repetitor va shaxsiy testlarni boshlang."}
                  </p>
                </div>

                <div>
                  <button
                    id="try-yourself-btn"
                    onClick={() => onBegin('register')}
                    className="primary-btn practice-cta-action-btn"
                    style={{
                      padding: '14px 28px',
                      borderRadius: '14px',
                      fontSize: '15px',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #7869f5 0%, #5b4bf0 100%)',
                      color: '#fff',
                      boxShadow: '0 8px 24px rgba(120, 105, 245, 0.4)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '9px',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      border: 'none'
                    }}
                  >
                    <Sparkles size={18} />
                    <span>{config.bottomBannerBtnText || config.ctaButtonText || "O‘zingizni sinab ko‘ring"}</span>
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
