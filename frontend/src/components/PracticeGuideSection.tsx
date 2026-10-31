import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2, VolumeX, Mic, Play, Pause, RotateCcw, CheckCircle2, AlertCircle,
  Sparkles, BookOpen, PenLine, Headphones, MessageSquare, Award,
  ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, Trophy, Check, ArrowRight,
  Music, FastForward, Rewind, Copy, Globe, Shield, BarChart3, User, Cpu, Users
} from 'lucide-react';
import {
  playSpeech, stopSpeech, startListening,
  SupportedLang, isSpeechRecognitionSupported
} from '../utils/speech';
import {
  PracticeGuideConfig, LanguagePracticeGuide, DEFAULT_PRACTICE_GUIDE
} from '../data/practiceGuideData';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

interface PracticeGuideSectionProps {
  guideConfig?: PracticeGuideConfig;
  onBegin: (intent: 'login' | 'register' | 'trial') => void;
  dark?: boolean;
}

const SKILL_MODULES = [
  { id: 0, key: 'vocab', label: '1. Vocab', sub: 'Luğat boyligi', icon: BookOpen },
  { id: 1, key: 'writing', label: '2. Writing', sub: 'Rasmiy yoziş', icon: PenLine },
  { id: 2, key: 'reading', label: '3. Reading', sub: 'Matn öqiş & tahlil', icon: BookOpen },
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

  // Copy example phrase state
  const [copiedPhrase, setCopiedPhrase] = useState(false);
  const handleCopyExample = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedPhrase(true);
      setTimeout(() => setCopiedPhrase(false), 2000);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.72 },
        colors: ['#38bdf8', '#818cf8', '#c084fc', '#10b981', '#f59e0b']
      });
    } catch {}
  };

  // Render corner wave background SVG inside cards (Image 1 style)
  const renderCardCornerWave = () => (
    <>
      <div className="practice-card-corner-wave bottom-left" aria-hidden="true">
        <svg viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M-40 240C20 180 80 160 160 190C220 210 260 170 300 120C340 70 300 20 280 -20L-40 -20Z"
            fill="url(#cardCornerWaveGrad1)"
          />
          <defs>
            <linearGradient id="cardCornerWaveGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="practice-card-corner-wave bottom-right" aria-hidden="true">
        <svg viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M360 240C300 180 240 160 160 190C100 210 60 170 20 120C-20 70 20 20 40 -20L360 -20Z"
            fill="url(#cardCornerWaveGrad2)"
          />
          <defs>
            <linearGradient id="cardCornerWaveGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </>
  );

  // Render bottom card navigation dots (Matching image 1)
  const renderCardBottomNav = (slideIdx: number) => (
    <div className="practice-card-bottom-nav">
      <button
        onClick={handlePrevSlide}
        disabled={slideIdx === 0}
        className="practice-slider-circle-btn"
        title="Oldingi modul"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="practice-bottom-dots">
        {SKILL_MODULES.map((mod) => (
          <span
            key={mod.id}
            onClick={() => goToSlide(mod.id)}
            className={`practice-bottom-dot ${slideIdx === mod.id ? 'is-active' : ''}`}
            title={mod.label}
          />
        ))}
      </div>
      <button
        onClick={handleNextSlide}
        disabled={slideIdx === SKILL_MODULES.length - 1}
        className="practice-slider-circle-btn"
        title="Keyingi modul"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );

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
      alert('Brauzeringizda mikrofondan ovoz yozib oliş (Speech Recognition) qöllab-quvvatlanmaydi.');
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
        if (score >= 80) triggerConfetti();
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
      alert('Brauzeringizda mikrofondan ovoz yozib oliş qöllab-quvvatlanmaydi.');
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
        if (score >= 80) triggerConfetti();
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
      alert('Brauzeringizda mikrofondan ovoz yozib oliş qöllab-quvvatlanmaydi.');
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
      alert('Brauzeringizda nutqni soliştiriş qöllab-quvvatlanmaydi.');
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
        if (score >= 80) triggerConfetti();
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
        const originParam = typeof window !== 'undefined' && window.location.origin ? `&origin=${encodeURIComponent(window.location.origin)}` : '';
        return `https://www.youtube.com/embed/${videoId}?autoplay=${ap}&enablejsapi=1&rel=0&playsinline=1${originParam}`;
      }
    } catch {}
    return url;
  };

  return (
    <section id="preview" className={`welcome-preview-section ${isDarkMode ? 'dark-preview-section' : 'light-preview-section'}`}>
      {/* Dynamic Scoped Styles */}
      <style>{`
        /* ========================================================
           RESPONSIVE CONTAINER & SLIDER LAYOUT
           ======================================================== */
        .welcome-preview-section {
          background: linear-gradient(180deg, #060913 0%, #0a1022 50%, #060913 100%) !important;
          color: #ffffff !important;
          border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        .welcome-preview-section.light-preview-section {
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%) !important;
          color: #0f172a !important;
          border-top: 1px solid rgba(226, 232, 240, 0.9) !important;
          border-bottom: 1px solid rgba(226, 232, 240, 0.9) !important;
        }

        .welcome-preview-section.light-preview-section .practice-tab-pill {
          background: #ffffff !important;
          border: 1px solid rgba(226, 232, 240, 0.95) !important;
          color: #64748b !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }
        .welcome-preview-section.light-preview-section .practice-tab-pill:hover {
          color: #2563eb !important;
          border-color: rgba(37, 99, 235, 0.4) !important;
        }
        .welcome-preview-section.light-preview-section .practice-tab-pill.active {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          color: #ffffff !important;
          border-color: transparent !important;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35) !important;
        }

        .welcome-preview-section.light-preview-section .practice-skill-card {
          --pg-box-bg: rgba(255, 255, 255, 0.96);
          --pg-box-border: rgba(226, 232, 240, 0.95);
          --pg-text-main: #0f172a;
          --pg-text-heading: #0f172a;
          --pg-text-muted: #64748b;
          --pg-text-sub: #475569;
          --pg-badge-bg: rgba(37, 99, 235, 0.08);
          --pg-badge-color: #2563eb;
          --pg-purple: #7c3aed;
          --pg-green-text: #059669;

          background: linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.96) 100%) !important;
          border: 1.5px solid rgba(226, 232, 240, 0.95) !important;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.06), 0 0 40px rgba(37, 99, 235, 0.08) !important;
          color: #0f172a !important;
        }
        .welcome-preview-section.light-preview-section .practice-card-head {
          border-bottom-color: rgba(226, 232, 240, 0.9) !important;
        }
        .welcome-preview-section.light-preview-section .practice-head-badge {
          background: rgba(37, 99, 235, 0.08) !important;
          border-color: rgba(37, 99, 235, 0.25) !important;
          color: #2563eb !important;
        }
        .welcome-preview-section.light-preview-section .practice-lang-badge {
          background: rgba(241, 245, 249, 0.9) !important;
          border-color: rgba(226, 232, 240, 0.95) !important;
          color: #475569 !important;
        }
        .welcome-preview-section.light-preview-section .vocab-word-large {
          color: #0f172a !important;
        }
        .welcome-preview-section.light-preview-section .vocab-meaning-text {
          color: #059669 !important;
        }
        .welcome-preview-section.light-preview-section .vocab-example-box {
          background: rgba(248, 250, 252, 0.9) !important;
          border-color: rgba(226, 232, 240, 0.95) !important;
          color: #0f172a !important;
        }
        .welcome-preview-section.light-preview-section .vocab-example-box blockquote {
          color: #0f172a !important;
        }
        /* Card Bottom Navigation (Chevrons & Dots) in Light Mode */
        .welcome-preview-section.light-preview-section .practice-card-bottom-nav {
          border-top: 1.5px solid rgba(226, 232, 240, 0.9) !important;
          position: relative !important;
          z-index: 10 !important;
          margin-top: 28px !important;
          padding-top: 20px !important;
        }

        /* Subtle Light Mode Wave Tint (Prevents dark blob under pagination) */
        .welcome-preview-section.light-preview-section .practice-card-corner-wave {
          opacity: 0.1 !important;
          filter: saturate(0.6) !important;
        }

        /* High-contrast tactile circle buttons */
        .welcome-preview-section.light-preview-section .practice-slider-circle-btn {
          width: 36px !important;
          height: 36px !important;
          border-radius: 50% !important;
          background: #ffffff !important;
          border: 1.5px solid #cbd5e1 !important;
          color: #0f172a !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
          display: grid !important;
          place-items: center !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        .welcome-preview-section.light-preview-section .practice-slider-circle-btn svg {
          stroke: #0f172a !important;
          stroke-width: 2.4px !important;
        }
        .welcome-preview-section.light-preview-section .practice-slider-circle-btn:hover:not(:disabled) {
          background: #2563eb !important;
          border-color: #2563eb !important;
          color: #ffffff !important;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35) !important;
          transform: translateY(-1px) !important;
        }
        .welcome-preview-section.light-preview-section .practice-slider-circle-btn:hover:not(:disabled) svg {
          stroke: #ffffff !important;
        }
        .welcome-preview-section.light-preview-section .practice-slider-circle-btn:disabled {
          background: #f8fafc !important;
          border-color: #e2e8f0 !important;
          color: #cbd5e1 !important;
          opacity: 0.55 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }
        .welcome-preview-section.light-preview-section .practice-slider-circle-btn:disabled svg {
          stroke: #cbd5e1 !important;
        }

        /* Light mode pill capsule for all dots */
        .welcome-preview-section.light-preview-section .practice-bottom-dots {
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
          background: #f1f5f9 !important;
          padding: 7px 16px !important;
          border-radius: 9999px !important;
          border: 1.5px solid #e2e8f0 !important;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04) !important;
        }
        .welcome-preview-section.light-preview-section .practice-bottom-dot {
          width: 7px !important;
          height: 7px !important;
          border-radius: 50% !important;
          background: #94a3b8 !important;
          opacity: 0.7 !important;
          cursor: pointer !important;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .welcome-preview-section.light-preview-section .practice-bottom-dot:hover {
          background: #475569 !important;
          opacity: 1 !important;
          transform: scale(1.25) !important;
        }
        .welcome-preview-section.light-preview-section .practice-bottom-dot.is-active {
          width: 26px !important;
          height: 7px !important;
          border-radius: 9999px !important;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          opacity: 1 !important;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.45) !important;
        }

        /* AMALIY MODUL Card in Light Mode */
        .welcome-preview-section.light-preview-section .practice-amaliy-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.98) 100%) !important;
          border: 1.5px solid rgba(226, 232, 240, 0.95) !important;
          box-shadow: 0 16px 44px rgba(0, 0, 0, 0.06), 0 0 30px rgba(37, 99, 235, 0.06) !important;
        }
        .welcome-preview-section.light-preview-section .practice-amaliy-kicker {
          background: rgba(37, 99, 235, 0.08) !important;
          border-color: rgba(37, 99, 235, 0.25) !important;
          color: #2563eb !important;
        }
        .welcome-preview-section.light-preview-section .practice-amaliy-title {
          color: #0f172a !important;
        }
        .welcome-preview-section.light-preview-section .practice-amaliy-desc {
          color: #475569 !important;
        }
        .welcome-preview-section.light-preview-section .amaliy-calligraphy-text {
          color: #2563eb !important;
        }
        .welcome-preview-section.light-preview-section .amaliy-calligraphy-arrow path {
          stroke: #2563eb !important;
        }

        .welcome-preview-section.light-preview-section .practice-slide-nav {
          background: #ffffff !important;
          border-color: rgba(226, 232, 240, 0.95) !important;
          color: #475569 !important;
        }
        .welcome-preview-section.light-preview-section .practice-slide-nav:hover {
          background: #f1f5f9 !important;
          color: #0f172a !important;
        }
        .welcome-preview-section.light-preview-section .practice-slide-dot {
          background: rgba(203, 213, 225, 0.8) !important;
        }
        .welcome-preview-section.light-preview-section .practice-slide-dot.active {
          background: #2563eb !important;
        }
        .welcome-preview-section.light-preview-section .vocab-tag-pill {
          background: rgba(37, 99, 235, 0.08) !important;
          border-color: rgba(37, 99, 235, 0.25) !important;
          color: #2563eb !important;
        }
        .welcome-preview-section.light-preview-section .vocab-sound-btn {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
          color: #ffffff !important;
        }
        .welcome-preview-section.light-preview-section .vocab-mic-btn {
          background: rgba(241, 245, 249, 0.9) !important;
          border-color: rgba(226, 232, 240, 0.95) !important;
          color: #059669 !important;
        }

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
          background: rgba(15, 23, 42, 0.72) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #94a3b8 !important;
          font-size: 13.5px;
          font-weight: 750;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.22s ease;
          flex-shrink: 0;
        }
        .practice-tab-pill:hover {
          color: #ffffff !important;
          border-color: rgba(120, 105, 245, 0.4) !important;
          transform: translateY(-2px);
        }
        .practice-tab-active-indicator {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: linear-gradient(135deg, #7869f5 0%, #5b4bf0 100%) !important;
          box-shadow: 0 6px 20px rgba(120, 105, 245, 0.45);
          z-index: 0;
        }
        .practice-tab-pill.active {
          background: transparent !important;
          color: #ffffff !important;
          border-color: transparent !important;
          box-shadow: none !important;
          transform: translateY(-2px);
        }

        /* ========================================================
           CARD COMPONENT — MATCHING IMAGE 1 GLASSMORPHISM & GLOW
           ======================================================== */
        .practice-skill-card {
          --pg-box-bg: rgba(6, 11, 26, 0.88);
          --pg-box-border: rgba(59, 130, 246, 0.25);
          --pg-text-main: #f8fafc;
          --pg-text-heading: #ffffff;
          --pg-text-muted: #94a3b8;
          --pg-text-sub: #cbd5e1;
          --pg-badge-bg: rgba(59, 130, 246, 0.16);
          --pg-badge-color: #93c5fd;
          --pg-purple: #9387ff;
          --pg-green-text: #34d399;

          background: linear-gradient(135deg, rgba(13, 24, 60, 0.94) 0%, rgba(7, 14, 38, 0.97) 100%) !important;
          border: 1.5px solid rgba(59, 130, 246, 0.45) !important;
          border-radius: 26px !important;
          padding: 38px 44px !important;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.65), 0 0 45px rgba(37, 99, 235, 0.22) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          position: relative !important;
          overflow: hidden !important;
          color: #f8fafc !important;
          animation: slideFade 0.32s cubic-bezier(0.16, 1, 0.3, 1);
          touch-action: pan-y pinch-zoom;
          z-index: 1;
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

        /* SCOPED OVERRIDES: KEEP NEON GLOW AT ALL TIMES */
        .welcome-root.dark .practice-skill-card,
        html.dark .practice-skill-card,
        .practice-skill-card.dark-card,
        .practice-slider-wrapper.is-dark .practice-skill-card {
          background: linear-gradient(135deg, rgba(13, 24, 60, 0.94) 0%, rgba(7, 14, 38, 0.97) 100%) !important;
          border: 1.5px solid rgba(59, 130, 246, 0.45) !important;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.65), 0 0 45px rgba(37, 99, 235, 0.22) !important;
          color: #f8fafc !important;
        }

        .welcome-root.dark .practice-tab-pill,
        html.dark .practice-tab-pill,
        .practice-slider-wrapper.is-dark .practice-tab-pill {
          background: rgba(15, 23, 42, 0.75);
          border-color: rgba(255, 255, 255, 0.1);
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
           NEW MOCKUP STYLING: HEADER, CARDS, AMALIY MODUL & FEATURES
           ======================================================== */
        .practice-header-grid {
          display: grid;
          grid-template-columns: 180px 1fr 180px;
          align-items: center;
          justify-items: center;
          gap: 16px;
          margin-bottom: 26px;
          width: 100%;
        }
        .practice-3d-book-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        .practice-3d-book-svg {
          width: 150px;
          height: 130px;
          filter: drop-shadow(0 14px 28px rgba(59, 130, 246, 0.45));
          animation: floatBook 4s ease-in-out infinite alternate;
        }
        @keyframes floatBook {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-8px) rotate(-2deg); }
        }

        .practice-header-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 680px;
          width: 100%;
        }
        .practice-kicker-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 16px;
          border-radius: 9999px;
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(96, 165, 250, 0.35);
          color: #93c5fd;
          font-size: 11.5px;
          font-weight: 850;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 12px;
          box-shadow: 0 0 16px rgba(59, 130, 246, 0.2);
        }
        .practice-kicker-pill svg {
          color: #60a5fa;
        }
        .practice-gradient-text {
          background: linear-gradient(135deg, #38bdf8 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .practice-gradient-text-alt {
          background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .practice-header-calligraphy {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          position: relative;
          padding-top: 10px;
        }
        .practice-calligraphy-text,
        .amaliy-calligraphy-text,
        .feat-calligraphy-text {
          font-family: 'Caveat', 'Comic Sans MS', 'Patrick Hand', cursive, sans-serif;
          font-size: 17px;
          color: #cbd5e1;
          font-weight: 700;
          letter-spacing: 0.2px;
          line-height: 1.25;
        }
        .practice-curved-arrow-top {
          margin-top: 6px;
          margin-right: 18px;
          filter: drop-shadow(0 2px 6px rgba(129, 140, 248, 0.4));
        }

        /* Slide 0: Vocab Card New Elements */
        .practice-photo-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          background: rgba(10, 16, 32, 0.88);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          z-index: 2;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        }
        .practice-tag-new {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 9999px;
          background: rgba(99, 102, 241, 0.18);
          border: 1px solid rgba(129, 140, 248, 0.32);
          color: #a5b4fc;
          font-size: 11.5px;
          font-weight: 800;
          margin-bottom: 8px;
          width: fit-content;
        }
        .practice-word-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }
        .practice-word-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .practice-word-title {
          margin: 0;
          font-size: clamp(28px, 3.2vw, 40px);
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.5px;
        }
        .practice-word-speaker-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.35);
          color: #60a5fa;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .practice-word-speaker-btn:hover {
          background: rgba(59, 130, 246, 0.3);
          transform: scale(1.08);
        }
        .practice-dual-action-btns {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .practice-action-btn-listen {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 20px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(37, 99, 235, 0.8), 0 4px 14px rgba(37, 99, 235, 0.5);
          transition: all 0.2s;
        }
        .practice-action-btn-listen:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 26px rgba(37, 99, 235, 0.95), 0 6px 18px rgba(37, 99, 235, 0.6);
        }
        .practice-action-btn-test {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 20px;
          border-radius: 9999px;
          background: rgba(20, 184, 166, 0.14);
          border: 1.5px solid rgba(45, 212, 191, 0.75);
          color: #2dd4bf;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 0 16px rgba(45, 212, 191, 0.45);
          transition: all 0.2s;
        }
        .practice-action-btn-test:hover,
        .practice-action-btn-test.is-active {
          background: rgba(20, 184, 166, 0.28);
          border-color: #2dd4bf;
          box-shadow: 0 0 22px rgba(45, 212, 191, 0.65);
          transform: translateY(-2px);
        }
        .practice-action-btn-purple {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 20px;
          border-radius: 9999px;
          background: rgba(168, 85, 247, 0.14);
          border: 1.5px solid rgba(168, 85, 247, 0.65);
          color: #c084fc;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 0 16px rgba(168, 85, 247, 0.35);
          transition: all 0.2s;
        }
        .practice-action-btn-purple:hover {
          background: rgba(168, 85, 247, 0.28);
          border-color: #c084fc;
          box-shadow: 0 0 22px rgba(168, 85, 247, 0.55);
          transform: translateY(-2px);
        }
        .practice-action-btn-green {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 20px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          box-shadow: 0 0 18px rgba(16, 185, 129, 0.6), 0 4px 14px rgba(16, 185, 129, 0.4);
          transition: all 0.2s;
        }
        .practice-action-btn-green:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 24px rgba(16, 185, 129, 0.8);
        }
        .practice-card-corner-wave {
          position: absolute;
          pointer-events: none;
          z-index: 0;
          opacity: 0.85;
        }
        .practice-card-corner-wave.bottom-left {
          bottom: -20px;
          left: -20px;
          width: 340px;
          height: 250px;
        }
        .practice-card-corner-wave.bottom-right {
          bottom: -30px;
          right: -30px;
          width: 320px;
          height: 230px;
        }
        .practice-card-corner-wave svg {
          width: 100%;
          height: 100%;
        }
        .practice-ambient-blob-left {
          position: absolute;
          top: 15%;
          left: -80px;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.32) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }
        .practice-ambient-blob-right {
          position: absolute;
          top: 35%;
          right: -80px;
          width: 440px;
          height: 440px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.28) 0%, rgba(59, 130, 246, 0.12) 50%, transparent 70%);
          filter: blur(65px);
          pointer-events: none;
          z-index: 0;
        }
        .practice-phonetic-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .practice-phonetic-text {
          font-size: 14.5px;
          color: #94a3b8;
          font-weight: 600;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .practice-pos-badge {
          padding: 2px 9px;
          border-radius: 6px;
          background: rgba(59, 130, 246, 0.18);
          border: 1px solid rgba(96, 165, 250, 0.3);
          color: #93c5fd;
          font-size: 11px;
          font-weight: 750;
        }
        .practice-trans-green {
          font-size: 17.5px;
          font-weight: 850;
          color: #34d399;
          margin-bottom: 8px;
          line-height: 1.4;
          filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.35));
        }
        .practice-explanation-text {
          margin: 0 0 16px;
          font-size: 14.5px;
          color: #94a3b8;
          line-height: 1.65;
        }
        .practice-example-box {
          padding: 16px 20px;
          border-radius: 16px;
          background: rgba(4, 8, 20, 0.9) !important;
          border: 1px solid rgba(59, 130, 246, 0.25) !important;
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.5) !important;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .practice-example-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .practice-example-label {
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.8px;
          color: #64748b;
          text-transform: uppercase;
        }
        .practice-copy-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: grid;
          place-items: center;
          transition: color 0.2s;
        }
        .practice-copy-btn:hover {
          color: #ffffff;
        }
        .practice-example-sentence {
          font-size: 15px;
          font-style: italic;
          color: #f1f5f9;
          line-height: 1.6;
        }
        .practice-card-bottom-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-top: 26px;
          padding-top: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          z-index: 10;
        }
        .practice-slider-circle-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(255, 255, 255, 0.16);
          color: #f8fafc;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .practice-slider-circle-btn:hover:not(:disabled) {
          background: #6366f1;
          border-color: #6366f1;
          color: #ffffff;
          box-shadow: 0 0 16px rgba(99, 102, 241, 0.5);
          transform: translateY(-1px);
        }
        .practice-slider-circle-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .practice-bottom-dots {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.65);
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .practice-bottom-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .practice-bottom-dot:hover {
          background: rgba(255, 255, 255, 0.7);
          transform: scale(1.2);
        }
        .practice-bottom-dot.is-active {
          width: 24px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.7);
        }

        /* Slide Navigation Bar (Above AMALIY MODUL) */
        .practice-slide-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin: 18px 0;
        }
        .nav-bar-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .nav-bar-btn.prev {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
        }
        .nav-bar-btn.prev:hover:not(:disabled) {
          background: rgba(30, 41, 59, 0.9);
          color: #ffffff;
        }
        .nav-bar-btn.prev:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .nav-bar-btn.next {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #ffffff;
          box-shadow: 0 4px 18px rgba(99, 102, 241, 0.4);
        }
        .nav-bar-btn.next:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(99, 102, 241, 0.55);
        }
        .nav-bar-capsule-progress {
          flex: 1;
          max-width: 440px;
          height: 36px;
          border-radius: 9999px;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
        }
        .capsule-active-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
          opacity: 0.35;
          border-radius: 9999px;
          transition: width 0.3s ease;
        }
        .capsule-dots {
          display: flex;
          align-items: center;
          gap: 7px;
          z-index: 1;
        }
        .capsule-mini-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.25s;
        }
        .capsule-mini-dot.active {
          background: #ffffff;
          box-shadow: 0 0 6px #818cf8;
        }
        .capsule-counter-text {
          font-size: 12.5px;
          font-weight: 850;
          color: #a5b4fc;
          z-index: 1;
        }

        /* AMALIY MODUL Card (Featured banner) */
        .practice-amaliy-card {
          display: grid;
          grid-template-columns: minmax(280px, 340px) 1fr minmax(200px, 240px);
          gap: 28px;
          align-items: center;
          padding: 34px 40px;
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 27, 75, 0.4) 100%);
          border: 1.5px solid rgba(99, 102, 241, 0.25);
          box-shadow: 0 16px 44px rgba(0, 0, 0, 0.4);
          position: relative;
          overflow: hidden;
        }
        .practice-amaliy-left {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .amaliy-calligraphy-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }
        .amaliy-calligraphy-arrow {
          filter: drop-shadow(0 2px 6px rgba(129, 140, 248, 0.4));
        }
        .practice-amaliy-media {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          height: 200px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .practice-amaliy-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .amaliy-group-badge {
          position: absolute;
          bottom: 10px;
          left: 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          background: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
        }
        .practice-amaliy-center {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .practice-amaliy-kicker {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 12px;
          border-radius: 9999px;
          background: rgba(99, 102, 241, 0.16);
          border: 1px solid rgba(129, 140, 248, 0.3);
          color: #a5b4fc;
          font-size: 11.5px;
          font-weight: 850;
          letter-spacing: 0.6px;
          width: fit-content;
        }
        .practice-amaliy-title {
          margin: 0;
          font-size: clamp(24px, 2.5vw, 32px);
          font-weight: 900;
          color: #ffffff;
          line-height: 1.25;
        }
        .practice-amaliy-desc {
          margin: 0;
          font-size: 14.5px;
          color: #94a3b8;
          line-height: 1.65;
          max-width: 520px;
        }
        .practice-amaliy-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 26px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
          width: fit-content;
          transition: all 0.22s;
          margin-top: 6px;
        }
        .practice-amaliy-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(124, 58, 237, 0.55);
        }
        .cta-play-circle {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: grid;
          place-items: center;
        }
        .practice-amaliy-art-right {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .amaliy-3d-laptop-svg {
          width: 210px;
          height: 170px;
          filter: drop-shadow(0 14px 28px rgba(99, 102, 241, 0.4));
        }

        /* 4 Bottom Feature Pills Row */
        .practice-features-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 24px;
        }
        .practice-features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          flex: 1;
          min-width: 0;
        }
        .practice-feature-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 16px;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.2s, border-color 0.2s;
        }
        .practice-feature-card:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.3);
          background: rgba(15, 23, 42, 0.85);
        }
        .practice-feat-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: #818cf8;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .practice-feat-text {
          min-width: 0;
        }
        .practice-feat-title {
          margin: 0;
          font-size: 13.5px;
          font-weight: 800;
          color: #f8fafc;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .practice-feat-sub {
          margin: 2px 0 0;
          font-size: 11.5px;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .practice-features-calligraphy {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .feat-calligraphy-arrow {
          filter: drop-shadow(0 2px 6px rgba(129, 140, 248, 0.4));
        }

        /* ========================================================
           RESPONSIVE BREAKPOINTS (DESKTOP / TABLET / MOBILE)
           ======================================================== */
        @media (max-width: 1024px) {
          .practice-header-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .practice-3d-book-wrap,
          .practice-header-calligraphy {
            display: none;
          }
          .practice-amaliy-card {
            grid-template-columns: 1fr;
            gap: 22px;
            padding: 26px 20px;
          }
          .practice-amaliy-art-right {
            display: none;
          }
          .practice-features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 860px) {
          /* Tabs bar horizontal scroll on tablet/mobile */
          .practice-tabs-bar {
            justify-content: flex-start;
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
        }

        @media (max-width: 640px) {
          .practice-features-grid {
            grid-template-columns: 1fr;
          }
          .practice-features-calligraphy {
            display: none;
          }
          .practice-slide-nav-bar {
            flex-direction: column;
            width: 100%;
            gap: 12px;
          }
          .nav-bar-btn {
            width: 100%;
            justify-content: center;
          }
          .nav-bar-capsule-progress {
            width: 100%;
            max-width: 100%;
            order: -1;
          }
          .practice-word-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .practice-dual-action-btns {
            width: 100%;
            justify-content: flex-start;
          }
          .amaliy-calligraphy-wrap {
            display: none;
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


      <div className="section-container" style={{ position: 'relative' }}>
        {/* Ambient Cosmic Glowing Blobs */}
        <div className="practice-ambient-blob-left" aria-hidden="true" />
        <div className="practice-ambient-blob-right" aria-hidden="true" />

        {/* Header Grid: Left 3D Book SVG | Center Kicker, Title, Selects | Right Handwritten Calligraphy */}
        <div className="practice-header-grid scroll-reveal">
          {/* Left: 3D Blue Book Artwork with Orbital Ring */}
          <div className="practice-3d-book-wrap">
            <svg className="practice-3d-book-svg" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Orbital Ring behind */}
              <ellipse cx="80" cy="72" rx="72" ry="24" transform="rotate(-15 80 72)" stroke="url(#ringGrad)" strokeWidth="2.5" opacity="0.8" />
              
              {/* Book Pages bottom edge */}
              <path d="M42 85L80 108L122 84L86 64Z" fill="#e2e8f0" filter="drop-shadow(0 6px 14px rgba(0,0,0,0.4))" />
              <path d="M42 88L80 111L122 87L122 84L80 108L42 85Z" fill="#cbd5e1" />
              <path d="M42 91L80 114L122 90L122 87L80 111L42 88Z" fill="#94a3b8" />

              {/* 3D Book Cover */}
              <path d="M38 78L80 104L125 78L84 54Z" fill="url(#bookCoverGrad)" filter="drop-shadow(0 12px 24px rgba(59,130,246,0.35))" />
              <path d="M38 82L80 108L84 104L38 78Z" fill="#1d4ed8" />
              <path d="M80 108L125 82L125 78L80 104Z" fill="#1e40af" />

              {/* Spine accent */}
              <path d="M37 78L40 82L81 107L80 104Z" fill="#60a5fa" opacity="0.6" />

              {/* Book "Aa" lettermark */}
              <text
                x="80"
                y="86"
                fill="#ffffff"
                fontSize="28"
                fontWeight="900"
                fontFamily="sans-serif"
                textAnchor="middle"
                transform="rotate(-8 80 86) skewX(-12)"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
              >
                Aa
              </text>

              {/* Orbital Ring front */}
              <path d="M12 85C25 102 85 106 142 75" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" filter="drop-shadow(0 0 6px #38bdf8)" />

              {/* Sparkles */}
              <path d="M138 25L140 31L146 33L140 35L138 41L136 35L130 33L136 31Z" fill="#c084fc" filter="drop-shadow(0 0 4px #c084fc)" />
              <path d="M22 42L24 47L29 49L24 51L22 56L20 51L15 49L20 47Z" fill="#38bdf8" filter="drop-shadow(0 0 4px #38bdf8)" />
              <circle cx="145" cy="65" r="2" fill="#fff" opacity="0.8" />
              <circle cx="28" cy="78" r="1.5" fill="#38bdf8" opacity="0.8" />

              <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="bookCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Center: Kicker Pill, Heading, Subtitle & Dropdowns */}
          <div className="practice-header-center">
            <div className="practice-kicker-pill">
              <Sparkles size={13} />
              <span>{config.kicker || "QISQACHA"}</span>
            </div>
            
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 850,
              letterSpacing: '-1px',
              margin: '6px 0 12px',
              color: '#ffffff'
            }}>
              Qisqacha ko‘zdan <span className="practice-gradient-text">kechiring</span>
            </h2>

            <p style={{
              maxWidth: '640px',
              margin: '0 auto 20px',
              fontSize: '15px',
              color: '#94a3b8',
              lineHeight: '1.6'
            }}>
              {config.subtitle || "Til ko‘nikmalari haqida qanday shug‘ullanishni ko‘zdan kechirib chiqing!"}
            </p>

            {/* Action Row: Language Select & Skill Module Select (Yonma-yon) */}
            <div className="practice-selects-row" style={{ marginBottom: 0 }}>
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
                    border: '1.5px solid rgba(99, 102, 241, 0.4)',
                    background: 'rgba(15, 23, 42, 0.85)',
                    color: '#f8fafc',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                  }}
                >
                  <option value="en">🇬🇧 GB English</option>
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
                  color: '#9387ff',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <ChevronDown size={18} strokeWidth={2.5} />
                </div>
              </div>

              {/* 2. Skill Module Select Dropdown */}
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
                    border: '1.5px solid rgba(99, 102, 241, 0.4)',
                    background: 'rgba(15, 23, 42, 0.85)',
                    color: '#f8fafc',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
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
                  color: '#9387ff',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <ChevronDown size={18} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Handwritten Calligraphy Note + Curved Arrow */}
          <div className="practice-header-calligraphy">
            <span className="practice-calligraphy-text">
              Yangi so‘zlar —<br />katta imkoniyatlar! ✨
            </span>
            <svg className="practice-curved-arrow-top" width="46" height="42" viewBox="0 0 46 42" fill="none">
              <path d="M6 6C20 4 36 12 38 32M38 32L30 28M38 32L42 22" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
                  style={{ position: 'relative' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePracticeTabPill"
                      className="practice-tab-active-indicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon size={16} style={{ position: 'relative', zIndex: 1 }} />
                  <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ===================================================== */}
          {/* SLIDE 0: VOCABULARY CARD (MATCHING REFERENCE MOCKUP) */}
          {/* ===================================================== */}
          {currentSlide === 0 && (
            <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
              {renderCardCornerWave()}

              <div className="practice-card-head">
                <span className="practice-card-badge">
                  <BookOpen size={15} /> 1. VOCABULARY (LUG‘AT & SO‘Z BOYLIGI)
                </span>
                <span className="practice-lang-tag">
                  <Globe size={13} /> {currentLangData.flag} {currentLangData.langName}
                </span>
              </div>

              <div className="practice-card-grid">
                {/* Media Image with 12 / 50 badge */}
                <div className="practice-card-media" style={{ position: 'relative' }}>
                  <img
                    src={currentLangData.vocab.image}
                    alt={currentLangData.vocab.word}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="practice-photo-badge">
                    <BookOpen size={13} />
                    <span>12 / 50</span>
                  </div>
                </div>

                {/* Vocab Details & Controls */}
                <div className="practice-content-col">
                  {/* Yangi so'z Tag */}
                  <div className="practice-tag-new">
                    <Sparkles size={12} />
                    <span>Yangi so‘z</span>
                  </div>

                  {/* Word title + Audio/Mic Action Buttons */}
                  <div className="practice-word-row">
                    <div className="practice-word-title-wrap">
                      <h3 className="practice-word-title">
                        {currentLangData.vocab.word}
                      </h3>
                      <button
                        onClick={() => handlePlayTTS(currentLangData.vocab.word)}
                        className="practice-word-speaker-btn"
                        title="So‘z talaffuzini tinglash"
                      >
                        {activeSpeakingText === currentLangData.vocab.word ? <VolumeX size={17} /> : <Volume2 size={17} />}
                      </button>
                    </div>

                    {/* Dual Action Buttons: Tinglash (Blue) & Sinash (Teal) */}
                    <div className="practice-dual-action-btns">
                      <button
                        onClick={() => handlePlayTTS(currentLangData.vocab.word)}
                        className="practice-action-btn-listen"
                        title="Talaffuzni tinglash"
                      >
                        <Volume2 size={15} />
                        <span>Tinglash</span>
                      </button>
                      <button
                        onClick={handleTestVocabWord}
                        className={`practice-action-btn-test ${isListeningVocabWord ? 'is-active' : ''}`}
                        title="Talaffuzingizni mikrofonda sinash"
                      >
                        <Mic size={15} />
                        <span>{isListeningVocabWord ? 'Eshitilmoqda...' : 'Sinash'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Phonetic & Part of speech */}
                  <div className="practice-phonetic-row">
                    <span className="practice-phonetic-text">
                      {currentLangData.vocab.phonetic || "/,pɜ:sə'vɪə/"}
                    </span>
                    <span className="practice-pos-badge">
                      {currentLangData.vocab.partOfSpeech || "Fe'l"}
                    </span>
                  </div>

                  {/* Translation & Definition */}
                  <div>
                    <div className="practice-trans-green">
                      {currentLangData.vocab.translation}
                    </div>
                    <p className="practice-explanation-text">
                      {currentLangData.vocab.explanation}
                    </p>
                  </div>

                  {/* Example Phrase Card with Copy Icon */}
                  <div className="practice-example-box">
                    <div className="practice-example-head">
                      <span className="practice-example-label">
                        NAMUNA GAP (EXAMPLE PHRASE):
                      </span>
                      <button
                        onClick={() => handleCopyExample(currentLangData.vocab.examplePhrase)}
                        className="practice-copy-btn"
                        title={copiedPhrase ? "Nusxa olindi!" : "Gapdan nusxa olish"}
                      >
                        {copiedPhrase ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div className="practice-example-sentence">
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

              {/* Bottom Card Dots & Pagination */}
              {renderCardBottomNav(0)}
            </div>
          )}

          {/* ===================================================== */}
          {/* SLIDE 1: WRITING CARD                                 */}
          {/* ===================================================== */}
          {currentSlide === 1 && (
            <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
              {renderCardCornerWave()}

              <div className="practice-card-head">
                <span className="practice-card-badge">
                  <PenLine size={15} /> 2. WRITING (AKADEMIK & RASMIY YOZISH)
                </span>
                <span className="practice-lang-tag">
                  <Globe size={13} /> {currentLangData.flag} {currentLangData.langName}
                </span>
              </div>

              <div className="practice-card-grid">
                {/* Media Image with badge */}
                <div className="practice-card-media" style={{ position: 'relative' }}>
                  <img
                    src={currentLangData.writing.image}
                    alt={currentLangData.writing.letterTitle}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="practice-photo-badge">
                    <PenLine size={13} />
                    <span>1 / 1 Formal Letter</span>
                  </div>
                </div>

                {/* Letter Content & Actions */}
                <div className="practice-content-col">
                  {/* Tag */}
                  <div className="practice-tag-new">
                    <Sparkles size={12} />
                    <span>Akademik yozuv</span>
                  </div>

                  {/* Title + Dual Action Buttons */}
                  <div className="practice-word-row">
                    <div className="practice-word-title-wrap">
                      <h3 className="practice-word-title" style={{ fontSize: 'clamp(20px, 2.2vw, 26px)' }}>
                        {currentLangData.writing.letterTitle}
                      </h3>
                    </div>

                    <div className="practice-dual-action-btns">
                      <button
                        onClick={() => handlePlayTTS(currentLangData.writing.letterContent)}
                        className="practice-action-btn-listen"
                        title="Xatni audio orqali tinglash"
                      >
                        {activeSpeakingText === currentLangData.writing.letterContent ? <VolumeX size={15} /> : <Volume2 size={15} />}
                        <span>{activeSpeakingText === currentLangData.writing.letterContent ? "To'xtatish" : "Tinglash"}</span>
                      </button>
                      <button
                        onClick={() => setShowLetterTranslation(!showLetterTranslation)}
                        className="practice-action-btn-purple"
                        title="Tarjimani ko'rish yoki yashirish"
                      >
                        {showLetterTranslation ? <EyeOff size={15} /> : <Eye size={15} />}
                        <span>{showLetterTranslation ? 'Yashirish' : 'Tarjima'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Translation & Subtitle */}
                  <div>
                    <div className="practice-trans-green">
                      Rasmiy biznes va akademik xat namunasi
                    </div>
                    <p className="practice-explanation-text">
                      Matn strukturasini va formal iboralarni o‘rganing.
                    </p>
                  </div>

                  {/* Letter Text Box */}
                  <div className="practice-example-box">
                    <div className="practice-example-head">
                      <span className="practice-example-label">
                        RASMIY XAT MATNI (LETTER CONTENT):
                      </span>
                      <button
                        onClick={() => handleCopyExample(currentLangData.writing.letterContent)}
                        className="practice-copy-btn"
                        title={copiedPhrase ? "Nusxa olindi!" : "Xatdan nusxa olish"}
                      >
                        {copiedPhrase ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div style={{
                      fontSize: '14.5px',
                      lineHeight: '1.75',
                      whiteSpace: 'pre-line',
                      color: '#f1f5f9',
                      maxHeight: '220px',
                      overflowY: 'auto',
                      paddingRight: '6px'
                    }}>
                      {currentLangData.writing.letterContent}
                    </div>
                  </div>

                  {/* Translation Box (Collapsible) */}
                  {showLetterTranslation && (
                    <div className="practice-example-box" style={{
                      border: '1px solid rgba(168, 85, 247, 0.45) !important',
                      background: 'rgba(20, 10, 40, 0.88) !important',
                      boxShadow: '0 0 16px rgba(168, 85, 247, 0.25) !important'
                    }}>
                      <span style={{ color: '#c084fc', fontSize: '11px', fontWeight: 850, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                        🇺🇿 O‘zbekcha tarjimasi:
                      </span>
                      <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#cbd5e1', whiteSpace: 'pre-line' }}>
                        {currentLangData.writing.letterTranslation}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Dots & Pagination */}
              {renderCardBottomNav(1)}
            </div>
          )}

          {/* ===================================================== */}
          {/* SLIDE 2: READING CARD                                 */}
          {/* ===================================================== */}
          {currentSlide === 2 && (
            <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
              {renderCardCornerWave()}

              <div className="practice-card-head">
                <span className="practice-card-badge">
                  <BookOpen size={15} /> 3. READING (MATN O‘QISH & TAHLIL)
                </span>
                <span className="practice-lang-tag">
                  <Globe size={13} /> {currentLangData.flag} {currentLangData.langName}
                </span>
              </div>

              <div className="practice-card-grid">
                {/* Media Image with badge */}
                <div className="practice-card-media" style={{ position: 'relative' }}>
                  <img
                    src={currentLangData.reading.image}
                    alt={currentLangData.reading.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="practice-photo-badge">
                    <BookOpen size={13} />
                    <span>2 Min Read</span>
                  </div>
                </div>

                {/* Reading Content & Questions */}
                <div className="practice-content-col">
                  {/* Tag */}
                  <div className="practice-tag-new">
                    <Sparkles size={12} />
                    <span>O‘qish va tahlil</span>
                  </div>

                  {/* Title + Action */}
                  <div className="practice-word-row">
                    <div className="practice-word-title-wrap">
                      <h3 className="practice-word-title" style={{ fontSize: 'clamp(20px, 2.2vw, 26px)' }}>
                        {currentLangData.reading.title}
                      </h3>
                    </div>

                    <div className="practice-dual-action-btns">
                      <button
                        onClick={() => setShowReadingAnswers(!showReadingAnswers)}
                        className="practice-action-btn-purple"
                        title="Savollar javobini ko‘rish yoki yashirish"
                      >
                        {showReadingAnswers ? <EyeOff size={15} /> : <Eye size={15} />}
                        <span>{showReadingAnswers ? 'Javoblarni yashirish' : 'Javoblarni ko‘rish'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div>
                    <div className="practice-trans-green">
                      Matnni tahlil qiling va so‘z boyligingizni oshiring
                    </div>
                    <p className="practice-explanation-text">
                      Qalin (bold) so‘zlar kontekstdagi asosiy leksik iboralardir.
                    </p>
                  </div>

                  {/* Reading Text Container with HTML bold tags in dark glass box */}
                  <div className="practice-example-box">
                    <div className="practice-example-head">
                      <span className="practice-example-label">
                        MATN PARCHASI (READING PASSAGE):
                      </span>
                    </div>
                    <div
                      className="reading-content-box"
                      style={{
                        fontSize: '15px',
                        lineHeight: '1.85',
                        color: '#f1f5f9',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        paddingRight: '6px'
                      }}
                      dangerouslySetInnerHTML={{ __html: currentLangData.reading.readingText }}
                    />
                  </div>

                  {/* Comprehension Questions */}
                  <div className="practice-example-box">
                    <div className="practice-example-head">
                      <span className="practice-example-label">
                        SAVOLLAR VA TO‘G‘RI JAVOBLAR:
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {currentLangData.reading.questions.map((q, idx) => (
                        <div key={idx} style={{ fontSize: '14px', lineHeight: '1.6', color: '#cbd5e1' }}>
                          <div><b>{idx + 1}.</b> {q.question}</div>
                          {showReadingAnswers && (
                            <div style={{ marginTop: '4px', color: '#34d399', fontWeight: 800, fontSize: '13.5px', filter: 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.4))' }}>
                              ✓ To‘g‘ri javob: {q.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Dots & Pagination */}
              {renderCardBottomNav(2)}
            </div>
          )}

          {/* ===================================================== */}
          {/* SLIDE 3: LISTENING CARD WITH MODERN MUSIC PLAYER     */}
          {/* ===================================================== */}
          {currentSlide === 3 && (
            <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
              {renderCardCornerWave()}

              <div className="practice-card-head">
                <span className="practice-card-badge">
                  <Headphones size={15} /> 4. LISTENING (AUDIO TINGLASH & GAP-FILL)
                </span>
                <span className="practice-lang-tag">
                  <Globe size={13} /> {currentLangData.flag} {currentLangData.langName}
                </span>
              </div>

              <div className="practice-card-grid">
                {/* Left Side: Modern Music Player */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="listening-music-player">
                    {/* Top Bar: Cover Art, Metadata, Equalizer */}
                    <div className="music-player-top">
                      <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
                        <img
                          src={currentLangData.listening.image}
                          alt="Album Cover"
                          className="music-cover-art"
                          style={{ width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </div>
                      <div className="music-meta">
                        <div className="music-meta-title">{currentLangData.listening.title}</div>
                        <div className="music-meta-artist">
                          TILŞUNOS Audio · {currentLangData.langName} Listening
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
                      <button
                        onClick={() => handleSeek(musicCurrentTime - 5)}
                        className="music-seek-btn"
                        title="5 soniya orqaga (-5s)"
                      >
                        <RotateCcw size={14} /> -5s
                      </button>

                      <button
                        onClick={toggleMusicPlayer}
                        className="music-play-btn"
                        title={musicPlaying ? "Pauza" : "Tinglash"}
                      >
                        {musicPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: '3px' }} />}
                      </button>

                      <button
                        onClick={() => handleSeek(musicCurrentTime + 5)}
                        className="music-seek-btn"
                        title="5 soniya oldinga (+5s)"
                      >
                        +5s <FastForward size={14} />
                      </button>

                      <button
                        onClick={handleToggleSpeed}
                        className="music-speed-btn"
                        title="Ijro tezligi: 1x, 1.25x, 1.5x, 2x, 0.75x"
                      >
                        ⚡ {playbackSpeed}x
                      </button>
                    </div>

                    {/* Real YouTube Audio Iframe */}
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
                  {/* Tag */}
                  <div className="practice-tag-new">
                    <Sparkles size={12} />
                    <span>Audio tahlil</span>
                  </div>

                  {/* Title Row + Check Button */}
                  <div className="practice-word-row">
                    <div className="practice-word-title-wrap">
                      <h3 className="practice-word-title" style={{ fontSize: 'clamp(20px, 2.2vw, 26px)' }}>
                        {currentLangData.listening.title}
                      </h3>
                    </div>

                    <div className="practice-dual-action-btns">
                      <button
                        onClick={() => setShowListeningAnswers(!showListeningAnswers)}
                        className="practice-action-btn-green"
                        title="Javoblarni tekshirish"
                      >
                        <CheckCircle2 size={15} />
                        <span>{showListeningAnswers ? 'Yashirish' : 'Tekshirish'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div>
                    <div className="practice-trans-green">
                      Audioni tinglang va bo‘sh joylarni to‘ldiring
                    </div>
                    <p className="practice-explanation-text">
                      Tabiiy suhbat tempiga e’tibor bering va kalit so‘zlarni aniqlang.
                    </p>
                  </div>

                  {/* Gap Fill Text Box */}
                  <div className="practice-example-box">
                    <div className="practice-example-head">
                      <span className="practice-example-label">
                        AUDIO DIALOG VA GAP-FILL TOPSHIRIG‘I:
                      </span>
                    </div>

                    <div style={{
                      fontSize: '15.5px',
                      lineHeight: '2.1',
                      color: '#f1f5f9'
                    }}>
                      {currentLangData.listening.textWithGaps.split(/\[\s*______\s*\]|\[\s*[^\]]+\s*\]/).map((part, index, arr) => (
                        <React.Fragment key={index}>
                          {part}
                          {index < arr.length - 1 && (
                            <span style={{
                              display: 'inline-block',
                              padding: showListeningAnswers ? '2px 10px' : '2px 14px',
                              margin: '0 4px',
                              borderRadius: '8px',
                              border: showListeningAnswers ? '1.5px solid #10b981' : '1.5px dashed #818cf8',
                              background: showListeningAnswers ? 'rgba(16, 185, 129, 0.18)' : 'rgba(99, 102, 241, 0.15)',
                              color: showListeningAnswers ? '#34d399' : '#a5b4fc',
                              fontWeight: 800,
                              fontSize: '13.5px',
                              boxShadow: showListeningAnswers ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none',
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
                  </div>
                </div>
              </div>

              {/* Bottom Card Dots & Pagination */}
              {renderCardBottomNav(3)}
            </div>
          )}

          {/* ===================================================== */}
          {/* SLIDE 4: SPEAKING CARD                                */}
          {/* ===================================================== */}
          {currentSlide === 4 && (
            <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
              {renderCardCornerWave()}

              <div className="practice-card-head">
                <span className="practice-card-badge">
                  <MessageSquare size={15} /> 5. SPEAKING (JONLI INTERVYU & NUTQ)
                </span>
                <span className="practice-lang-tag">
                  <Globe size={13} /> {currentLangData.flag} {currentLangData.langName}
                </span>
              </div>

              <div className="practice-card-grid">
                {/* Media Image & Progress */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="practice-card-media" style={{ position: 'relative', height: '260px' }}>
                    <img
                      src={currentLangData.speaking.image}
                      alt={currentLangData.speaking.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="practice-photo-badge">
                      <MessageSquare size={13} />
                      <span>1 / 3 Intervyu</span>
                    </div>
                  </div>

                  <div className="practice-example-box">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 850, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                        Javob berilgan savollar:
                      </span>
                      <strong style={{ fontSize: '13px', color: '#93c5fd' }}>
                        {answeredQuestionsCount} / {totalQuestionsCount}
                      </strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', borderRadius: '5px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(answeredQuestionsCount / (totalQuestionsCount || 1)) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Questions List & Score Button */}
                <div className="practice-content-col">
                  {/* Tag */}
                  <div className="practice-tag-new">
                    <Sparkles size={12} />
                    <span>Jonli intervyu</span>
                  </div>

                  {/* Title Row */}
                  <div className="practice-word-row">
                    <div className="practice-word-title-wrap">
                      <h3 className="practice-word-title" style={{ fontSize: 'clamp(20px, 2.2vw, 26px)' }}>
                        {currentLangData.speaking.title}
                      </h3>
                    </div>

                    {isAllSpeakingAnswered && (
                      <div className="practice-dual-action-btns">
                        <button
                          onClick={() => setShowTotalSpeakingScore(!showTotalSpeakingScore)}
                          className="practice-action-btn-green"
                          title="Umumiy ballni köriş"
                        >
                          <Trophy size={15} />
                          <span>{showTotalSpeakingScore ? 'Yaşiriş' : 'Natija'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Subtitle */}
                  <div>
                    <div className="practice-trans-green">
                      Intervyu savollariga mikrofonda erkin javob bering
                    </div>
                    <p className="practice-explanation-text">
                      Har bir savolni eşiting va mikrofonga aniq talaffuz bilan javob bering.
                    </p>
                  </div>

                  {/* Question items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {currentLangData.speaking.questions.map((q) => {
                      const scoreObj = speakingScores[q.id];
                      const isRecordingThis = activeListeningQuestionId === q.id;

                      return (
                        <div key={q.id} className="practice-example-box">
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '15px', fontWeight: 750, color: '#f1f5f9', lineHeight: '1.45' }}>
                                {q.id}. {q.question}
                              </div>
                              {q.hint && (
                                <span style={{ fontSize: '12.5px', color: '#94a3b8', display: 'block', marginTop: '5px' }}>
                                  💡 Maslahat: {q.hint}
                                </span>
                              )}
                            </div>

                            {/* Mic Answer Button */}
                            <button
                              onClick={() => handleTestSpeakingQuestion(q.id, q.question)}
                              className={`practice-action-btn-test ${isRecordingThis ? 'is-active' : ''}`}
                              title="Mikrofon orqali javob beriş"
                              style={{ flexShrink: 0 }}
                            >
                              <Mic size={14} />
                              <span>{isRecordingThis ? 'Eşityapman...' : scoreObj ? 'Qayta sinaş' : 'Javob beriş'}</span>
                            </button>
                          </div>

                          {/* Question Score Feedback */}
                          {scoreObj && (
                            <div style={{
                              padding: '10px 14px',
                              borderRadius: '10px',
                              background: 'rgba(16, 185, 129, 0.14)',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              color: '#34d399',
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <span>Nutq tahlili qabul qilindi ✓</span>
                              <strong style={{ fontWeight: 800 }}>⭐ Natija: {scoreObj.score} ball</strong>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Final Score Reveal Card */}
                  {showTotalSpeakingScore && isAllSpeakingAnswered && (
                    <div className="practice-example-box" style={{
                      background: 'rgba(6, 25, 20, 0.9) !important',
                      border: '1.5px solid rgba(16, 185, 129, 0.75) !important',
                      boxShadow: '0 0 24px rgba(16, 185, 129, 0.3) !important',
                      marginTop: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                            🎉 SPEAKING MUVAFFAQIYATLI YAKUNLANDI!
                          </span>
                          <h4 style={{ margin: '6px 0', fontSize: '20px', fontWeight: 850, color: '#ffffff' }}>
                            Örtaça natijangiz: {averageSpeakingScore} / 100 ball
                          </h4>
                          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                            Nutqiy ravonlik va intonatsiyangiz a’lo darajada baholandi.
                          </p>
                        </div>
                        <button
                          onClick={() => onBegin('register')}
                          className="practice-action-btn-green"
                          style={{ padding: '10px 20px', fontSize: '13.5px' }}
                        >
                          Töliq kursni boşlaş
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Dots & Pagination */}
              {renderCardBottomNav(4)}
            </div>
          )}

          {/* ===================================================== */}
          {/* SLIDE 5: GRAMMAR CARD                                 */}
          {/* ===================================================== */}
          {currentSlide === 5 && (
            <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
              {renderCardCornerWave()}

              <div className="practice-card-head">
                <span className="practice-card-badge">
                  <Sparkles size={15} /> 6. GRAMMAR (GRAMMATIKA & XATOLAR TAHLILI)
                </span>
                <span className="practice-lang-tag">
                  <Globe size={13} /> {currentLangData.flag} {currentLangData.langName}
                </span>
              </div>

              <div className="practice-card-grid">
                {/* Media Image with badge */}
                <div className="practice-card-media" style={{ position: 'relative' }}>
                  <img
                    src={currentLangData.grammar.image}
                    alt={currentLangData.grammar.topicName}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="practice-photo-badge">
                    <Sparkles size={13} />
                    <span>Qoidalar tahlili</span>
                  </div>
                </div>

                {/* Grammar Comparison Texts & Rules */}
                <div className="practice-content-col">
                  {/* Tag */}
                  <div className="practice-tag-new">
                    <Sparkles size={12} />
                    <span>Grammatika qoidasi</span>
                  </div>

                  {/* Title Row */}
                  <div className="practice-word-row">
                    <div className="practice-word-title-wrap">
                      <h3 className="practice-word-title" style={{ fontSize: 'clamp(20px, 2.2vw, 26px)' }}>
                        {currentLangData.grammar.topicName}
                      </h3>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div>
                    <div className="practice-trans-green">
                      Eng köp uçraydigan nozik farqlar va xatolar
                    </div>
                    <p className="practice-explanation-text">
                      {currentLangData.grammar.topicExplanation}
                    </p>
                  </div>

                  {/* 2 Comparison Boxes Side by Side */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                    {/* Incorrect Text */}
                    <div style={{
                      padding: '18px 20px',
                      borderRadius: '16px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1.5px solid rgba(239, 68, 68, 0.65)',
                      boxShadow: '0 0 16px rgba(239, 68, 68, 0.25)',
                      color: '#f87171'
                    }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 850, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        <AlertCircle size={15} /> XATO VARIANT:
                      </div>
                      <div style={{ fontSize: '15px', textDecoration: 'line-through', color: '#fca5a5' }}>
                        "{currentLangData.grammar.incorrectText}"
                      </div>
                    </div>

                    {/* Corrected Text */}
                    <div style={{
                      padding: '18px 20px',
                      borderRadius: '16px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1.5px solid rgba(16, 185, 129, 0.75)',
                      boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)',
                      color: '#34d399'
                    }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 850, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        <CheckCircle2 size={15} /> TÖĞRI VARIANT:
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#ecfdf5' }}>
                        "{currentLangData.grammar.correctedText}"
                      </div>
                    </div>
                  </div>

                  {/* Topic Rule Tip */}
                  <div className="practice-example-box">
                    <div className="practice-example-head">
                      <span className="practice-example-label">💡 QOIDANI ESLAB QOLING:</span>
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#cbd5e1' }}>
                      {currentLangData.grammar.ruleTip}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Dots & Pagination */}
              {renderCardBottomNav(5)}
            </div>
          )}

          {/* ===================================================== */}
          {/* SLIDE 6: SHADOWING CARD (LARGE VIDEO, NO AUTOPLAY)     */}
          {/* ===================================================== */}
          {currentSlide === 6 && (
            <div className={`practice-skill-card ${isDarkMode ? 'dark-card' : ''}`}>
              {renderCardCornerWave()}

              <div className="practice-card-head">
                <span className="practice-card-badge">
                  <Award size={15} /> 7. SHADOWING (SOYA METODI & NUTQNI MOSLAŞTIRIŞ)
                </span>
                <span className="practice-lang-tag">
                  <Globe size={13} /> {currentLangData.flag} {currentLangData.langName}
                </span>
              </div>

              {/* Large Shadowing Grid */}
              <div className="practice-shadowing-grid">
                {/* Video Player: Large (330px height), autoplay=0 */}
                <div className="practice-shadowing-media" style={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1.5px solid rgba(59, 130, 246, 0.35)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
                }}>
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
                  {/* Tag */}
                  <div className="practice-tag-new">
                    <Sparkles size={12} />
                    <span>Soya metodi</span>
                  </div>

                  {/* Title Row + Action Buttons */}
                  <div className="practice-word-row">
                    <div className="practice-word-title-wrap">
                      <h3 className="practice-word-title" style={{ fontSize: 'clamp(20px, 2.2vw, 26px)' }}>
                        {currentLangData.shadowing.title}
                      </h3>
                    </div>

                    <div className="practice-dual-action-btns">
                      <button
                        onClick={() => handlePlayTTS(currentLangData.shadowing.audioText)}
                        className="practice-action-btn-listen"
                        title="Audioni eşitiş"
                      >
                        {activeSpeakingText === currentLangData.shadowing.audioText ? <VolumeX size={15} /> : <Volume2 size={15} />}
                        <span>{activeSpeakingText === currentLangData.shadowing.audioText ? "Töxtatiş" : "Tinglaş"}</span>
                      </button>
                      <button
                        onClick={handleTestShadowing}
                        className={`practice-action-btn-test ${isShadowingListening ? 'is-active' : ''}`}
                        title="Nutqni mikrofonda soliştiriş"
                      >
                        <Mic size={15} />
                        <span>{isShadowingListening ? 'Eşitilmoqda...' : 'Soliştiriş'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div>
                    <div className="practice-trans-green">
                      Sözlovçining intonatsiyasi va urğusiga taqlid qiling
                    </div>
                    <p className="practice-explanation-text">
                      Audioni eşiting va bir vaqtning özida uning ortidan takrorlang.
                    </p>
                  </div>

                  {/* Target Text with Word-by-Word Matching (never overflows) */}
                  <div className="practice-example-box">
                    <div className="practice-example-head">
                      <span className="practice-example-label">
                        SOYA METODI UÇUN MATN (TARGET SPEECH):
                      </span>
                    </div>

                    <div style={{
                      fontSize: '15.5px',
                      lineHeight: '1.9',
                      color: '#f1f5f9',
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
                              color: isMatched ? '#34d399' : 'inherit',
                              fontWeight: isMatched ? 850 : 500,
                              background: isMatched ? 'rgba(16, 185, 129, 0.22)' : 'transparent',
                              boxShadow: isMatched ? '0 0 8px rgba(16, 185, 129, 0.35)' : 'none',
                              transition: 'all 0.2s ease',
                              display: 'inline-block'
                            }}
                          >
                            {targetWord}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shadowing Score Feedback */}
                  {shadowingScore !== null && (
                    <div className="practice-example-box" style={{
                      background: 'rgba(6, 25, 20, 0.88) !important',
                      border: '1.5px solid rgba(16, 185, 129, 0.6) !important',
                      boxShadow: '0 0 16px rgba(16, 185, 129, 0.25) !important'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ color: '#34d399', fontWeight: 800, fontSize: '14px' }}>
                          ✓ Aytilgan nutq bilan soliştirildi
                        </span>
                        <strong style={{ fontSize: '15px', color: '#10b981', filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))' }}>
                          ⭐ Moslik darajasi: {shadowingScore}%
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Dots & Pagination */}
              {renderCardBottomNav(6)}
            </div>
          )}

          {/* ===================================================== */}
          {/* FEATURED BANNER: AMALIY MODUL (MATCHING IMAGE 2)      */}
          {/* ===================================================== */}
          <div className={`practice-amaliy-card ${isDarkMode ? 'dark-card' : ''}`}>
            {/* Left Column: Calligraphy Note & Student Learning Photo */}
            <div className="practice-amaliy-left">
              <div className="amaliy-calligraphy-wrap">
                <span className="amaliy-calligraphy-text">Birgalikda örganiş — osonroq!</span>
                <svg className="amaliy-calligraphy-arrow" width="34" height="26" viewBox="0 0 34 26" fill="none">
                  <path d="M4 4C14 2 26 8 28 20M28 20L22 17M28 20L31 13" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="practice-amaliy-media">
                <img
                  src={config.bottomBannerImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"}
                  alt={config.bottomBannerTitle || "Amaliy modul"}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="amaliy-group-badge">
                  <Users size={14} />
                  <span>4-8 kişilik guruh</span>
                </div>
              </div>
            </div>

            {/* Center Column: Badge, Title, Desc & Boshlash Button */}
            <div className="practice-amaliy-center">
              <div className="practice-amaliy-kicker">
                <Users size={14} />
                <span>{config.bottomBannerKicker || "AMALIY MODUL"}</span>
              </div>

              <h3 className="practice-amaliy-title">
                Özingizni amalda <span className="practice-gradient-text-alt">sinab köring</span>
              </h3>

              <p className="practice-amaliy-desc">
                {config.bottomBannerDesc || "7 ta könikma moduli böyiça töliq interaktiv maşqlar, AI repetitor va şaxsiy testlarni boşlang."}
              </p>

              <div>
                <button
                  id="try-yourself-btn"
                  onClick={() => onBegin('trial')}
                  className="practice-amaliy-cta-btn"
                >
                  <span className="cta-play-circle">
                    <Play size={13} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
                  </span>
                  <span>{config.bottomBannerBtnText || "Boşlaş"}</span>
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>

            {/* Right Column: 3D Laptop with Graduation Cap, AI Cube & Books */}
            <div className="practice-amaliy-art-right">
              <svg className="amaliy-3d-laptop-svg" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background Glow */}
                <circle cx="110" cy="90" r="75" fill="url(#laptopGlow)" opacity="0.38" />
                
                {/* Stack of books beneath laptop */}
                <path d="M125 155L190 145L200 155L135 165Z" fill="#1e293b" />
                <path d="M135 165L200 155L200 162L135 172Z" fill="#3b82f6" />
                <path d="M125 145L185 136L195 145L135 154Z" fill="#6366f1" />
                
                {/* Laptop base */}
                <path d="M45 145L175 145L195 162L25 162Z" fill="url(#laptopBaseGrad)" filter="drop-shadow(0 10px 18px rgba(0,0,0,0.5))" />
                <rect x="95" y="148" width="30" height="4" rx="2" fill="#94a3b8" />
                
                {/* Laptop screen body */}
                <rect x="52" y="55" width="116" height="85" rx="8" transform="skewX(-6)" fill="#0f172a" stroke="#3b82f6" strokeWidth="2.5" />
                {/* Screen display */}
                <rect x="57" y="60" width="104" height="73" rx="5" transform="skewX(-6)" fill="url(#screenGrad)" />
                
                {/* Code / interface lines on screen */}
                <line x1="68" y1="74" x2="110" y2="74" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="68" y1="84" x2="135" y2="84" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
                <line x1="68" y1="94" x2="120" y2="94" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                <line x1="68" y1="104" x2="140" y2="104" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
                <circle cx="140" cy="74" r="5" fill="#34d399" />
                
                {/* Floating Chat Bubble */}
                <g filter="drop-shadow(0 4px 10px rgba(0,0,0,0.3))">
                  <rect x="150" y="80" width="36" height="24" rx="8" fill="#3b82f6" />
                  <circle cx="160" cy="92" r="2" fill="#fff" />
                  <circle cx="168" cy="92" r="2" fill="#fff" />
                  <circle cx="176" cy="92" r="2" fill="#fff" />
                </g>
                
                {/* Graduation Cap (Mortarboard) */}
                <g transform="translate(100, 22) rotate(-8)">
                  <polygon points="35,0 70,12 35,24 0,12" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
                  <polygon points="35,0 70,12 35,24 0,12" fill="url(#capGrad)" />
                  <path d="M15 17L15 26C15 32 55 32 55 26L55 17" fill="#1e1b4b" stroke="#4338ca" strokeWidth="1" />
                  {/* Tassel */}
                  <circle cx="35" cy="12" r="2.5" fill="#fbbf24" />
                  <path d="M35 12C38 18 48 22 50 30" stroke="#fbbf24" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  <rect x="48" y="30" width="4" height="6" rx="1" fill="#fbbf24" />
                </g>

                {/* Floating 3D "AI" Cube */}
                <g transform="translate(20, 95)" filter="drop-shadow(0 6px 14px rgba(59,130,246,0.4))">
                  {/* Cube top */}
                  <polygon points="20,0 35,8 20,16 5,8" fill="#60a5fa" />
                  {/* Cube left */}
                  <polygon points="5,8 20,16 20,34 5,26" fill="#2563eb" />
                  {/* Cube right */}
                  <polygon points="20,16 35,8 35,26 20,34" fill="#1d4ed8" />
                  {/* AI text on cube */}
                  <text x="13" y="26" fill="#ffffff" fontSize="11" fontWeight="800" fontFamily="sans-serif">AI</text>
                </g>

                {/* Sparkles */}
                <path d="M190 40L193 48L201 51L193 54L190 62L187 54L179 51L187 48Z" fill="#38bdf8" />
                <path d="M40 45L42 50L47 52L42 54L40 59L38 54L33 52L38 50Z" fill="#c084fc" />

                <defs>
                  <radialGradient id="laptopGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="laptopBaseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="50%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0b132b" />
                    <stop offset="100%" stopColor="#1e1b4b" />
                  </linearGradient>
                  <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4338ca" />
                    <stop offset="100%" stopColor="#1e1b4b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* ===================================================== */}
          {/* 4 FEATURE PILLS ROW (MATCHING IMAGE 2 BOTTOM ROW)     */}
          {/* ===================================================== */}
          <div className="practice-features-wrapper">
            <div className="practice-features-grid">
              {/* Feature 1 */}
              <div className="practice-feature-card">
                <div className="practice-feat-icon-badge">
                  <User size={18} />
                </div>
                <div className="practice-feat-text">
                  <h4 className="practice-feat-title">Interaktiv maşqlar</h4>
                  <p className="practice-feat-sub">Nazariya + amaliyot</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="practice-feature-card">
                <div className="practice-feat-icon-badge">
                  <Cpu size={18} />
                </div>
                <div className="practice-feat-text">
                  <h4 className="practice-feat-title">AI repetitor</h4>
                  <p className="practice-feat-sub">Har doim yoningizda</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="practice-feature-card">
                <div className="practice-feat-icon-badge">
                  <Shield size={18} />
                </div>
                <div className="practice-feat-text">
                  <h4 className="practice-feat-title">Şaxsiy testlar</h4>
                  <p className="practice-feat-sub">Bilimingizni tekşiring</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="practice-feature-card">
                <div className="practice-feat-icon-badge">
                  <BarChart3 size={18} />
                </div>
                <div className="practice-feat-text">
                  <h4 className="practice-feat-title">Progress kuzatuvi</h4>
                  <p className="practice-feat-sub">Natijangizni köring</p>
                </div>
              </div>
            </div>

            {/* Calligraphy Note on Right */}
            <div className="practice-features-calligraphy">
              <span className="feat-calligraphy-text">
                Yangi bilimlar —<br />yangi imkoniyatlar! ✨
              </span>
              <svg className="feat-calligraphy-arrow" width="34" height="26" viewBox="0 0 34 26" fill="none">
                <path d="M4 4C12 2 24 6 26 18M26 18L20 15M26 18L29 11" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
