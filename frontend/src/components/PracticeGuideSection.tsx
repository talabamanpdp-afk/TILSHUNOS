import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2, VolumeX, Mic, Play, Pause, RotateCcw, CheckCircle2, AlertCircle,
  Sparkles, BookOpen, PenLine, Headphones, MessageSquare, Award,
  ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, Trophy, Check, ArrowRight,
  Music, FastForward, Rewind, Copy, Globe, Shield, BarChart3, User, Cpu, Users,
  Lock, Unlock, Timer, Clock, Maximize2, ChevronsRight, ChevronsLeft, Languages
} from 'lucide-react';
import {
  playSpeech, stopSpeech, startListening, calculateSimilarity,
  SupportedLang, isSpeechRecognitionSupported
} from '../utils/speech';
import {
  PracticeGuideConfig, LanguagePracticeGuide, DEFAULT_PRACTICE_GUIDE
} from '../data/practiceGuideData';
import {
  evaluateSpeakingWithGemini, evaluateShadowingWithGemini
} from '../services/geminiAiService';
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
  const [vocabWordRecognized, setVocabWordRecognized] = useState<string>('');
  const [vocabWordFeedback, setVocabWordFeedback] = useState<string | null>(null);
  const [vocabInterim, setVocabInterim] = useState<string>('');
  const [isListeningVocabWord, setIsListeningVocabWord] = useState(false);

  // Writing card states
  const [showLetterTranslation, setShowLetterTranslation] = useState(false);

  // Reading card states with Timer
  const readingDuration = (guideConfig as any)?.readingDuration || 60;
  const [readingStarted, setReadingStarted] = useState(false);
  const [readingTimer, setReadingTimer] = useState<number>(readingDuration);
  const [readingTimerRunning, setReadingTimerRunning] = useState(false);
  const [showReadingAnswers, setShowReadingAnswers] = useState(false);

  // Listening card states: Dedicated Music Player (NO video shown!) + Timer
  const listeningDuration = (guideConfig as any)?.listeningDuration || 60;
  const [listeningStarted, setListeningStarted] = useState(false);
  const [listeningTimer, setListeningTimer] = useState<number>(listeningDuration);
  const [listeningTimerRunning, setListeningTimerRunning] = useState(false);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0); // in seconds
  const [musicDuration, setMusicDuration] = useState<number>(145); // default duration
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showListeningAnswers, setShowListeningAnswers] = useState(false);

  // Speaking card states
  const [speakingScores, setSpeakingScores] = useState<Record<number, {
    score: number;
    text: string;
    cefrLevel?: string;
    feedback?: string;
    mistakes?: string[];
    alternativePhrasing?: string;
    improvements?: string[];
    pronunciationFeedback?: string;
    isLiveAi?: boolean;
  }>>({});
  const [speakingAiLoading, setSpeakingAiLoading] = useState<Record<number, boolean>>({});
  const [speakingInterim, setSpeakingInterim] = useState<string>('');
  const [activeListeningQuestionId, setActiveListeningQuestionId] = useState<number | null>(null);
  const [showTotalSpeakingScore, setShowTotalSpeakingScore] = useState(false);
  const [activeSpeakingQIndex, setActiveSpeakingQIndex] = useState<number>(0);

  // Shadowing card states (Segmented Stepper + Custom Player + Resizer)
  const [activeShadowingIndex, setActiveShadowingIndex] = useState<number>(0);
  const [shadowingPartScores, setShadowingPartScores] = useState<Record<number, {
    score: number;
    text: string;
    advice?: string;
    omittedWords?: string[];
    isLiveAi?: boolean;
  }>>({});
  const [isShadowingListening, setIsShadowingListening] = useState(false);
  const [shadowingInterim, setShadowingInterim] = useState<string>('');
  const [shadowingPlayerWidth, setShadowingPlayerWidth] = useState<number>(38); // 32% to 50%
  const isDraggingResize = useRef(false);
  const shadowingGridRef = useRef<HTMLDivElement | null>(null);

  // Custom Video Player states
  const shadowingVideoRef = useRef<HTMLIFrameElement | null>(null);
  const [shadowingVideoPlaying, setShadowingVideoPlaying] = useState<boolean>(false);
  const [shadowingVideoCurrentTime, setShadowingVideoCurrentTime] = useState<number>(0);
  const [shadowingVideoDuration, setShadowingVideoDuration] = useState<number>(90);
  const [shadowingVideoSpeed, setShadowingVideoSpeed] = useState<number>(1);
  const [shadowingVideoMuted, setShadowingVideoMuted] = useState<boolean>(false);

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
    setVocabInterim('');
    setActiveListeningQuestionId(null);
    setSpeakingInterim('');
    setIsShadowingListening(false);
    setShadowingInterim('');
    try {
      if (shadowingVideoRef.current && shadowingVideoRef.current.contentWindow) {
        shadowingVideoRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        );
      }
    } catch {}
    setShadowingVideoPlaying(false);
  };

  useEffect(() => {
    stopAllAudio();
    setVocabWordScore(null);
    setVocabWordRecognized('');
    setVocabWordFeedback(null);
    setVocabInterim('');
    setShowLetterTranslation(false);
    setReadingStarted(false);
    setReadingTimer(readingDuration);
    setReadingTimerRunning(false);
    setShowReadingAnswers(false);
    setListeningStarted(false);
    setListeningTimer(listeningDuration);
    setListeningTimerRunning(false);
    setShowListeningAnswers(false);
    setSpeakingScores({});
    setSpeakingAiLoading({});
    setSpeakingInterim('');
    setShowTotalSpeakingScore(false);
    setActiveSpeakingQIndex(0);
    setActiveShadowingIndex(0);
    setShadowingPartScores({});
    setShadowingInterim('');
    setShadowingVideoPlaying(false);
    setShadowingVideoCurrentTime(0);
    setMusicCurrentTime(0);
  }, [selectedLang]);

  // Reading countdown timer loop
  useEffect(() => {
    let timer: any;
    if (readingTimerRunning && readingTimer > 0) {
      timer = setInterval(() => {
        setReadingTimer((prev) => {
          if (prev <= 1) {
            setReadingTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [readingTimerRunning, readingTimer]);

  // Listening countdown timer loop
  useEffect(() => {
    let timer: any;
    if (listeningTimerRunning && listeningTimer > 0) {
      timer = setInterval(() => {
        setListeningTimer((prev) => {
          if (prev <= 1) {
            setListeningTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [listeningTimerRunning, listeningTimer]);

  const handleStartReading = () => {
    setReadingStarted(true);
    setReadingTimer(readingDuration);
    setReadingTimerRunning(true);
    setShowReadingAnswers(false);
  };

  const handleStartListening = () => {
    setListeningStarted(true);
    setListeningTimer(listeningDuration);
    setListeningTimerRunning(true);
    setShowListeningAnswers(false);
  };

  // Clean audio on slide change
  const goToSlide = (index: number) => {
    if (index === currentSlide) return;
    stopAllAudio();
    if (index === 4) setActiveSpeakingQIndex(0);
    if (index === 6) setActiveShadowingIndex(0);
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

  // Custom Video Player command sender
  const postVideoCommand = (func: string, args: any[] = []) => {
    try {
      if (shadowingVideoRef.current && shadowingVideoRef.current.contentWindow) {
        shadowingVideoRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      }
    } catch {}
  };

  const toggleVideoPlayback = () => {
    if (shadowingVideoPlaying) {
      postVideoCommand('pauseVideo');
      setShadowingVideoPlaying(false);
    } else {
      stopSpeech();
      postYTCommand('pauseVideo');
      postVideoCommand('playVideo');
      setShadowingVideoPlaying(true);
    }
  };

  const handleVideoSeek = (targetSecs: number) => {
    const clamped = Math.max(0, Math.min(shadowingVideoDuration || 90, targetSecs));
    setShadowingVideoCurrentTime(clamped);
    postVideoCommand('seekTo', [clamped, true]);
    if (!shadowingVideoPlaying) {
      postVideoCommand('playVideo');
      setShadowingVideoPlaying(true);
    }
  };

  const handleToggleVideoSpeed = () => {
    const speeds = [1, 1.25, 1.5, 0.75];
    const nextIdx = (speeds.indexOf(shadowingVideoSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setShadowingVideoSpeed(newSpeed);
    postVideoCommand('setPlaybackRate', [newSpeed]);
  };

  const handleToggleVideoMute = () => {
    if (shadowingVideoMuted) {
      postVideoCommand('unMute');
      setShadowingVideoMuted(false);
    } else {
      postVideoCommand('mute');
      setShadowingVideoMuted(true);
    }
  };

  // Video playback time tracker
  useEffect(() => {
    let interval: any;
    if (shadowingVideoPlaying) {
      interval = setInterval(() => {
        setShadowingVideoCurrentTime((prev) => {
          if (prev >= (shadowingVideoDuration || 90)) {
            setShadowingVideoPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / shadowingVideoSpeed);
    }
    return () => clearInterval(interval);
  }, [shadowingVideoPlaying, shadowingVideoSpeed, shadowingVideoDuration]);

  // Video player resizer (Desktop/Laptop: 30% to 50%)
  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingResize.current = true;
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingResize.current || !shadowingGridRef.current) return;
      const rect = shadowingGridRef.current.getBoundingClientRect();
      const relativeX = moveEvent.clientX - rect.left;
      const percent = Math.min(50, Math.max(30, (relativeX / rect.width) * 100));
      setShadowingPlayerWidth(Math.round(percent));
    };
    const onMouseUp = () => {
      isDraggingResize.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleToggleExpand = () => {
    setShadowingPlayerWidth((prev) => (prev >= 47 ? 36 : 50));
  };

  // Extract YouTube ID
  const getYoutubeVideoId = (url: string) => {
    if (!url) return '1La4QzGeaaQ';
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return match[2];
      }
    } catch {}
    return '1La4QzGeaaQ';
  };

  // Get shadowing segments for current language
  const getShadowingSegments = (): string[] => {
    const data = currentLangData?.shadowing;
    if (data?.segments && data.segments.length > 0) return data.segments;
    if (data?.shadowingText) {
      const parts = data.shadowingText
        .split(/([,;:.]\s+)/)
        .reduce((acc: string[], curr: string, i: number) => {
          if (i % 2 === 0) acc.push(curr);
          else if (acc.length) acc[acc.length - 1] += curr.trim();
          return acc;
        }, [])
        .filter((p) => p.trim().length > 0);
      return parts.length >= 2 ? parts : [data.shadowingText];
    }
    return ["Success is not final,", "failure is not fatal:", "it is the courage to continue that counts."];
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

  // Vocab Word Mic Test (Real speech comparison)
  const handleTestVocabWord = () => {
    if (isListeningVocabWord) {
      setIsListeningVocabWord(false);
      setVocabInterim('');
      return;
    }
    if (!isSpeechRecognitionSupported()) {
      alert('Brauzeringizda mikrofondan ovoz yozib oliş (Speech Recognition) qöllab-quvvatlanmaydi.');
      return;
    }
    setIsListeningVocabWord(true);
    setVocabWordScore(null);
    setVocabWordRecognized('');
    setVocabWordFeedback(null);
    setVocabInterim('');

    startListening({
      lang: selectedLang as SupportedLang,
      expectedWord: currentLangData.vocab.word,
      onInterim: (text) => {
        setVocabInterim(text);
      },
      onResult: (res) => {
        setIsListeningVocabWord(false);
        setVocabInterim('');
        const cleanSpoken = (res.transcript || '').trim();
        setVocabWordRecognized(cleanSpoken);

        if (!cleanSpoken) {
          setVocabWordScore(0);
          setVocabWordFeedback("Ovoz aniqlanmadi. Qaytadan balandroq va aniqroq ayting! 🎙️");
          return;
        }

        // Calculate actual similarity (0 to 100) using Levenshtein distance
        const rawScore = calculateSimilarity(cleanSpoken, currentLangData.vocab.word);
        setVocabWordScore(rawScore);

        if (rawScore >= 80) {
          setVocabWordFeedback("A'lo darajadagi to'g'ri talaffuz! 🎯");
          triggerConfetti();
        } else if (rawScore >= 50) {
          setVocabWordFeedback("Yaxshi urinish, lekin so‘z oxiri yoki urg‘usiga e'tibor bering! 👍");
        } else {
          setVocabWordFeedback(`Umuman boshqa so‘z yoki noaniq tovush aytildi. Kutilgan so‘z: "${currentLangData.vocab.word}" 🔄`);
        }
      },
      onError: () => {
        setIsListeningVocabWord(false);
        setVocabInterim('');
      },
      onEnd: () => {
        setIsListeningVocabWord(false);
        setVocabInterim('');
      }
    });
  };

  // Speaking Question Mic Test with Real AI and Streaming Transcript
  const handleTestSpeakingQuestion = (questionId: number, questionText: string) => {
    if (activeListeningQuestionId === questionId) {
      setActiveListeningQuestionId(null);
      setSpeakingInterim('');
      return;
    }
    if (!isSpeechRecognitionSupported()) {
      alert('Brauzeringizda mikrofondan ovoz yozib oliş qöllab-quvvatlanmaydi.');
      return;
    }
    setActiveListeningQuestionId(questionId);
    setSpeakingInterim('');

    startListening({
      lang: selectedLang as SupportedLang,
      expectedWord: questionText,
      onInterim: (interim) => {
        setSpeakingInterim(interim);
      },
      onResult: (res) => {
        setActiveListeningQuestionId(null);
        setSpeakingInterim('');
        const clean = (res.transcript || '').trim();
        const words = clean.split(/\s+/).filter(w => w.length > 1);

        // Silence guard: Do NOT assign scores if user did not speak!
        if (!clean || words.length < 2) {
          setSpeakingScores((prev) => ({
            ...prev,
            [questionId]: {
              score: 0,
              text: '⚠️ Ovoz aniqlanmadi (Nutq yo‘q)',
              feedback: 'Nutq aniqlanmadi. Iltimos, mikrofonga aniq ovozda to‘liq gap bilan javob bering.',
              mistakes: ['Hech qanday so‘z eshitilmadi. Mikrofon sozlamalarini va ruxsatini tekshiring.']
            }
          }));
          return;
        }

        // Set AI loading indicator
        setSpeakingAiLoading((prev) => ({ ...prev, [questionId]: true }));

        // Live AI or Dynamic Evaluation
        evaluateSpeakingWithGemini({
          spokenText: clean,
          question: questionText,
          part: 'part1',
          targetLanguage: selectedLang,
          lang: 'uz'
        }).then(aiRes => {
          setSpeakingAiLoading((prev) => ({ ...prev, [questionId]: false }));
          setSpeakingScores((prev) => ({
            ...prev,
            [questionId]: {
              score: aiRes.score,
              text: clean,
              cefrLevel: aiRes.cefrLevel,
              feedback: aiRes.feedback,
              mistakes: aiRes.mistakes,
              alternativePhrasing: aiRes.alternativePhrasing,
              improvements: aiRes.improvements,
              pronunciationFeedback: aiRes.pronunciationFeedback,
              isLiveAi: aiRes.isLiveAi
            }
          }));
          if (aiRes.score >= 80) triggerConfetti();
        }).catch(() => {
          setSpeakingAiLoading((prev) => ({ ...prev, [questionId]: false }));
          const score = Math.max(60, Math.min(94, Math.round(55 + words.length * 5)));
          setSpeakingScores((prev) => ({
            ...prev,
            [questionId]: {
              score,
              text: clean,
              cefrLevel: score >= 85 ? 'C1' : score >= 75 ? 'B2' : 'B1',
              feedback: 'Nutq qabul qilindi. Fikr bildirishga intilish yaxshi.',
              mistakes: ['Murakkab grammatik strukturalar yetarli emas.'],
              alternativePhrasing: `Regarding this topic, I would emphasize that regular practice and immersion are essential keys to success.`
            }
          }));
        });
      },
      onError: () => {
        setActiveListeningQuestionId(null);
        setSpeakingInterim('');
      },
      onEnd: () => {
        setActiveListeningQuestionId(null);
        setSpeakingInterim('');
      }
    });
  };

  // Shadowing Segment Mic Test with Streaming Transcript and Intelligent Comparison
  const handleTestShadowingSegment = (partIdx: number, targetSegmentText: string) => {
    if (isShadowingListening) {
      setIsShadowingListening(false);
      setShadowingInterim('');
      return;
    }
    if (!isSpeechRecognitionSupported()) {
      alert('Brauzeringizda mikrofondan ovoz yozib oliş qöllab-quvvatlanmaydi.');
      return;
    }
    setIsShadowingListening(true);
    setShadowingInterim('');

    startListening({
      lang: selectedLang as SupportedLang,
      expectedWord: targetSegmentText,
      onInterim: (interim) => {
        setShadowingInterim(interim);
      },
      onResult: (res) => {
        setIsShadowingListening(false);
        setShadowingInterim('');
        const cleanSpoken = (res.transcript || '').trim();

        if (!cleanSpoken) {
          setShadowingPartScores((prev) => ({
            ...prev,
            [partIdx]: {
              score: 0,
              text: '⚠️ Ovoz aniqlanmadi (Nutq yo‘q)',
              advice: 'Nutq aniqlanmadi. Iltimos, mikrofonga yaqinroq va balandroq talaffuz bilan qaytadan ayting.',
              omittedWords: targetSegmentText.split(/\s+/).filter(Boolean)
            }
          }));
          return;
        }

        evaluateShadowingWithGemini({
          spokenText: cleanSpoken,
          referenceText: targetSegmentText,
          targetLanguage: selectedLang,
          lang: 'uz'
        }).then((aiRes) => {
          setShadowingPartScores((prev) => ({
            ...prev,
            [partIdx]: {
              score: aiRes.score || aiRes.accuracyScore || 0,
              text: cleanSpoken,
              advice: aiRes.pronunciationAdvice || aiRes.feedback || 'Intonatsiya va so‘zlar ketma-ketligi mos keldi.',
              omittedWords: aiRes.omittedWords || [],
              isLiveAi: aiRes.isLiveAi
            }
          }));
          if ((aiRes.score || 0) >= 80) triggerConfetti();
        }).catch(() => {
          const rawScore = calculateSimilarity(cleanSpoken, targetSegmentText);
          const targetWords = targetSegmentText.toLowerCase().replace(/[.,:;!?]/g, '').split(/\s+/).filter(Boolean);
          const spokenWords = cleanSpoken.toLowerCase().replace(/[.,:;!?]/g, '').split(/\s+/).filter(Boolean);
          const omitted = targetWords.filter((tw) => !spokenWords.some((sw) => sw.includes(tw) || tw.includes(sw)));

          setShadowingPartScores((prev) => ({
            ...prev,
            [partIdx]: {
              score: rawScore,
              text: cleanSpoken,
              advice: rawScore >= 75
                ? 'A’lo darajadagi intonatsiya va to‘g‘ri urg‘u! 🎯'
                : 'Ushbu qismdagi kalit so‘zlarning urg‘usi va ritmiga ko‘proq e’tibor bering.',
              omittedWords: omitted,
              isLiveAi: false
            }
          }));
          if (rawScore >= 80) triggerConfetti();
        });
      },
      onError: () => {
        setIsShadowingListening(false);
        setShadowingInterim('');
      },
      onEnd: () => {
        setIsShadowingListening(false);
        setShadowingInterim('');
      }
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

        /* Skill Navigation Bar (Top Pills - Desktop only) */
        .practice-tabs-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          overflow-x: auto;
          padding: 8px 4px 18px;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        @media (min-width: 861px) {
          .practice-select-box.module-select-box {
            display: none !important;
          }
          .practice-tabs-bar {
            display: flex !important;
          }
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
          transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
          flex-shrink: 0;
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          isolation: isolate;
        }
        .practice-tab-pill:hover {
          color: #ffffff !important;
          border-color: rgba(120, 105, 245, 0.4) !important;
        }
        .practice-tab-active-indicator {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          z-index: 0;
          pointer-events: none;
        }
        .practice-tab-pill.active {
          background: transparent !important;
          color: #ffffff !important;
          border-color: transparent !important;
          box-shadow: none !important;
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
          padding: 28px 36px 20px !important;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.65), 0 0 45px rgba(37, 99, 235, 0.22) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          position: relative !important;
          overflow: hidden !important;
          color: #f8fafc !important;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          touch-action: pan-y pinch-zoom;
          z-index: 1;

          /* Unified Fixed Height on Laptop / Desktop: 580px rock-solid across all 7 slides */
          height: 580px !important;
          min-height: 580px !important;
          max-height: 580px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          box-sizing: border-box !important;
        }

        .practice-skill-card.slide-anim-next {
          animation: slideFadeNext 0.32s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .practice-skill-card.slide-anim-prev {
          animation: slideFadePrev 0.32s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideFadeNext {
          from {
            opacity: 0;
            transform: translate3d(20px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes slideFadePrev {
          from {
            opacity: 0;
            transform: translate3d(-20px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
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
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1.5px solid var(--pg-box-border);
          flex-shrink: 0;
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

        /* Large 2-column Grid for Cards on Desktop: Fits neatly without stretching */
        .practice-card-grid,
        .practice-shadowing-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 28px;
          align-items: stretch;
          flex: 1;
          min-height: 0;
          height: 100%;
          position: relative;
          z-index: 1;
        }

        .practice-card-media {
          border-radius: 20px;
          overflow: hidden;
          height: 100%;
          min-height: 240px;
          max-height: 420px;
          background: var(--pg-box-bg);
          border: 1px solid var(--pg-box-border);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          position: relative;
        }
        .practice-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Shadowing Player Wrapper with Resizer */
        .practice-shadowing-wrapper {
          position: relative;
          height: 100%;
          min-height: 260px;
          max-height: 420px;
          display: flex;
        }

        .shadowing-resize-handle {
          position: absolute;
          right: -16px;
          top: 0;
          bottom: 0;
          width: 32px;
          z-index: 25;
          cursor: col-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
        }
        .shadowing-resize-line {
          position: absolute;
          width: 2px;
          top: 20px;
          bottom: 20px;
          left: 15px;
          background: rgba(255, 255, 255, 0.18);
          border-radius: 9999px;
          transition: background 0.2s ease, box-shadow 0.2s ease;
        }
        .shadowing-resize-handle:hover .shadowing-resize-line {
          background: #38bdf8;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.8);
        }
        .shadowing-resize-btn {
          position: relative;
          z-index: 2;
          width: 26px;
          height: 26px;
          border-radius: 9999px;
          background: #0f172a;
          border: 1.5px solid #38bdf8;
          color: #38bdf8;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }
        .shadowing-resize-btn:hover {
          transform: scale(1.15);
          background: #38bdf8;
          color: #0f172a;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
        }

        /* Custom Branded Shadowing Video Player */
        .custom-video-player {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
          background: #030712;
          border: 1.5px solid rgba(59, 130, 246, 0.35);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .custom-video-iframe-wrap {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        .custom-video-top-bar {
          position: relative;
          z-index: 5;
          padding: 12px 14px;
          background: linear-gradient(180deg, rgba(3, 7, 18, 0.88) 0%, rgba(3, 7, 18, 0.5) 65%, transparent 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          pointer-events: none;
        }
        .custom-video-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 9999px;
          background: rgba(30, 58, 138, 0.6);
          border: 1px solid rgba(96, 165, 250, 0.4);
          color: #93c5fd;
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .custom-video-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background: #ef4444;
          box-shadow: 0 0 8px #ef4444;
          animation: pulse 1.8s infinite;
        }
        .custom-video-title-pill {
          font-size: 12px;
          color: #e2e8f0;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 160px;
        }
        .custom-video-center-play {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 6;
          width: 62px;
          height: 62px;
          border-radius: 9999px;
          background: rgba(37, 99, 235, 0.92);
          border: 2px solid rgba(255, 255, 255, 0.45);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .custom-video-center-play:hover {
          transform: translate(-50%, -50%) scale(1.1);
          background: #2563eb;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.55);
        }
        .custom-video-bottom-bar {
          position: relative;
          z-index: 5;
          padding: 8px 12px 10px;
          background: linear-gradient(0deg, rgba(3, 7, 18, 0.95) 0%, rgba(3, 7, 18, 0.75) 60%, transparent 100%);
          display: flex;
          flex-direction: column;
          gap: 6px;
          backdrop-filter: blur(8px);
        }
        .custom-video-progress {
          width: 100%;
          height: 6px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.18);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .custom-video-progress:hover {
          height: 8px;
        }
        .custom-video-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #38bdf8 100%);
          border-radius: 4px;
          box-shadow: none;
          transition: width 0.1s linear;
        }
        .custom-video-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .custom-video-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 5px 8px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #e2e8f0;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .custom-video-btn:hover {
          background: rgba(59, 130, 246, 0.25);
          border-color: rgba(59, 130, 246, 0.5);
          color: #93c5fd;
        }
        .custom-video-time {
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }

        /* Shadowing Video Player */
        .practice-shadowing-media {
          border-radius: 20px;
          overflow: hidden;
          height: 100%;
          min-height: 240px;
          max-height: 420px;
          background: #000;
          border: 1px solid var(--pg-box-border);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          position: relative;
        }

        /* Content Column with smooth custom scrolling if content is long */
        .practice-content-col {
          min-width: 0;
          max-width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
          word-break: break-word;
          overflow-wrap: break-word;
          flex: 1;
          min-height: 0;
          height: 100%;
          max-height: 100% !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          padding-right: 8px !important;
          scrollbar-width: thin !important;
          scrollbar-color: #6366f1 rgba(15, 23, 42, 0.4) !important;
          overscroll-behavior-y: contain;
          -webkit-overflow-scrolling: touch;
        }
        .practice-content-col::-webkit-scrollbar {
          width: 6px;
        }
        .practice-content-col::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 9999px;
        }
        .practice-content-col::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 9999px;
        }
        .practice-content-col::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #818cf8 0%, #a78bfa 100%);
        }

        /* Grammar comparison boxes row */
        .practice-grammar-boxes-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 16px;
        }
        .practice-grammar-box {
          padding: 18px 20px;
          border-radius: 16px;
          transition: all 0.2s ease;
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
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        .practice-select-box {
          position: relative;
          min-width: 190px;
          flex: 1;
          max-width: 260px;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        .practice-select-input {
          width: 100%;
          padding: 12px 36px 12px 14px;
          border-radius: 12px;
          border: 1.5px solid rgba(99, 102, 241, 0.45) !important;
          background: #0f172a !important;
          color: #f8fafc !important;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          outline: none !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45) !important;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease !important;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        .practice-select-input:hover,
        .practice-select-input:focus {
          border-color: rgba(129, 140, 248, 0.85) !important;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35) !important;
        }
        .practice-select-input option {
          background: #0b1120 !important;
          color: #f8fafc !important;
        }
        .practice-select-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #9387ff;
          display: flex;
          align-items: center;
          transition: color 0.2s ease;
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
          animation: floatBook 4s ease-in-out infinite alternate;
        }
        @keyframes floatBook {
          0% { transform: translate3d(0, 0px, 0) rotate(0deg); }
          100% { transform: translate3d(0, -8px, 0) rotate(-2deg); }
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
          flex-wrap: wrap;
          flex-shrink: 0;
        }
        .practice-action-btn-listen {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 8px 18px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          border: 1px solid rgba(255, 255, 255, 0.18);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
          transition: all 0.2s ease;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          min-width: 102px;
          box-sizing: border-box;
          text-align: center;
        }
        .practice-action-btn-listen:hover {
          transform: translateY(-1px);
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
        }
        .practice-action-btn-test {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 8px 18px;
          border-radius: 9999px;
          background: rgba(20, 184, 166, 0.16);
          border: 1.5px solid rgba(45, 212, 191, 0.65);
          color: #2dd4bf;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
          transition: all 0.2s ease;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          min-width: 102px;
          box-sizing: border-box;
          text-align: center;
        }
        .practice-action-btn-test:hover,
        .practice-action-btn-test.is-active {
          background: rgba(20, 184, 166, 0.28);
          border-color: #2dd4bf;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.28);
          transform: translateY(-1px);
        }
        .practice-action-btn-purple {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 8px 18px;
          border-radius: 9999px;
          background: rgba(168, 85, 247, 0.16);
          border: 1.5px solid rgba(168, 85, 247, 0.55);
          color: #c084fc;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
          transition: all 0.2s ease;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          min-width: 102px;
          box-sizing: border-box;
          text-align: center;
        }
        .practice-action-btn-purple:hover {
          background: rgba(168, 85, 247, 0.28);
          border-color: #c084fc;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.28);
          transform: translateY(-1px);
        }
        .practice-action-btn-green {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 8px 18px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          border: 1px solid rgba(255, 255, 255, 0.18);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
          transition: all 0.2s ease;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
          min-width: 102px;
          box-sizing: border-box;
          text-align: center;
        }
        .practice-action-btn-green:hover {
          transform: translateY(-1px);
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
        }
        .practice-timer-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.15);
          border: 1.5px solid rgba(245, 158, 11, 0.55);
          color: #fbbf24;
          font-size: 12.5px;
          font-weight: 850;
          letter-spacing: 0.5px;
          box-shadow: none;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
        }
        .practice-timer-pill.is-done {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.55);
          color: #34d399;
          box-shadow: none;
        }
        .practice-action-btn-locked {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 8px 18px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1.5px dashed rgba(255, 255, 255, 0.22);
          color: #94a3b8;
          font-size: 13px;
          font-weight: 800;
          cursor: not-allowed;
          opacity: 0.75;
          white-space: nowrap !important;
          flex-shrink: 0 !important;
        }
        .listening-audio-tip-box {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .listening-tip-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 850;
          color: #93c5fd;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .listening-tip-text {
          font-size: 11.5px;
          line-height: 1.5;
          color: #cbd5e1;
          margin: 0;
        }

        /* Speaking Stepper Box (Single question view for ultra compactness) */
        .practice-speaking-stepper-box {
          border-radius: 18px;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .practice-speaking-stepper-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          gap: 8px;
          flex-wrap: wrap;
        }
        .practice-speaking-stepper-label {
          font-size: 11px;
          font-weight: 850;
          color: #9387ff;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }
        .practice-speaking-stepper-controls {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .practice-speaking-nav-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #f8fafc;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .practice-speaking-nav-btn:hover:not(:disabled) {
          background: #6366f1;
          border-color: #6366f1;
        }
        .practice-speaking-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .practice-speaking-step-num {
          font-size: 12px;
          font-weight: 800;
          color: #93c5fd;
          padding: 0 4px;
        }
        .practice-speaking-next-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 9999px;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #a5b4fc;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .practice-speaking-next-btn:hover {
          background: rgba(99, 102, 241, 0.3);
          color: #ffffff;
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
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          z-index: 10;
          flex-shrink: 0;
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
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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
          box-shadow: none;
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
          box-shadow: none;
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
          /* Mobile: Hide horizontal pill tabs completely, skills are chosen via select only! */
          .practice-tabs-bar {
            display: none !important;
          }
          .practice-selects-row {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            max-width: 100% !important;
            margin-bottom: 14px !important;
          }
          .practice-select-box {
            min-width: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .practice-select-box.module-select-box {
            display: block !important;
          }
          .practice-select-input {
            padding: 10px 28px 10px 10px !important;
            font-size: 12px !important;
            border-radius: 10px !important;
          }
          .practice-select-icon {
            right: 8px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            pointer-events: none !important;
            width: 16px !important;
            height: 16px !important;
          }
          .practice-tab-pill {
            display: none !important;
          }
          .practice-skill-card {
            height: clamp(520px, 78vh, 580px) !important;
            min-height: 520px !important;
            max-height: 580px !important;
            padding: 14px 14px 10px !important;
            border-radius: 18px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
          }
          .practice-card-head {
            margin-bottom: 8px !important;
            padding-bottom: 6px !important;
            gap: 6px !important;
            flex-shrink: 0 !important;
          }
          .practice-card-badge {
            font-size: 10.5px !important;
            padding: 4px 10px !important;
            gap: 5px !important;
          }
          .practice-lang-tag {
            font-size: 10px !important;
            padding: 3px 8px !important;
          }
          .practice-card-grid,
          .practice-shadowing-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
            flex: 1 !important;
            min-height: 0 !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            -webkit-overflow-scrolling: touch !important;
            overscroll-behavior-y: contain !important;
            touch-action: pan-y !important;
            scrollbar-width: thin !important;
            scrollbar-color: #6366f1 rgba(15, 23, 42, 0.4) !important;
            padding-right: 4px !important;
          }
          .practice-card-grid::-webkit-scrollbar,
          .practice-shadowing-grid::-webkit-scrollbar {
            width: 5px !important;
            display: block !important;
          }
          .practice-card-grid::-webkit-scrollbar-track,
          .practice-shadowing-grid::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.35) !important;
            border-radius: 9999px !important;
          }
          .practice-card-grid::-webkit-scrollbar-thumb,
          .practice-shadowing-grid::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%) !important;
            border-radius: 9999px !important;
          }
          .practice-speaking-progress-desktop-only {
            display: none !important;
          }
          .practice-speaking-left-col {
            gap: 0 !important;
            flex-shrink: 0 !important;
          }
          .practice-speaking-left-col .practice-card-media {
            height: 95px !important;
            min-height: 95px !important;
            max-height: 95px !important;
            flex-shrink: 0 !important;
          }
          .practice-card-media {
            height: 95px !important;
            min-height: 95px !important;
            max-height: 95px !important;
            border-radius: 12px !important;
            flex-shrink: 0 !important;
          }
          .shadowing-resize-handle {
            display: none !important;
          }
          .practice-shadowing-wrapper {
            min-height: 160px !important;
            max-height: 180px !important;
            height: 170px !important;
            flex-shrink: 0 !important;
          }
          .practice-shadowing-media {
            height: 160px !important;
            min-height: 160px !important;
            max-height: 180px !important;
            border-radius: 14px !important;
            flex-shrink: 0 !important;
          }
          .listening-music-player {
            padding: 12px 14px !important;
            gap: 8px !important;
            border-radius: 14px !important;
          }
          .music-player-top {
            gap: 10px !important;
          }
          .music-cover-art {
            width: 44px !important;
            height: 44px !important;
            border-radius: 10px !important;
          }
          .music-meta-title {
            font-size: 13.5px !important;
          }
          .music-play-btn {
            width: 40px !important;
            height: 40px !important;
          }
          .practice-content-col {
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            overflow-y: visible !important;
            flex: none !important;
            flex-shrink: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
            padding-right: 0 !important;
            padding-bottom: 24px !important;
          }
          .practice-word-title {
            font-size: 17px !important;
          }
          .practice-tag-new {
            padding: 2px 8px !important;
            font-size: 10px !important;
          }
          .practice-trans-green {
            font-size: 12.5px !important;
          }
          .practice-explanation-text {
            font-size: 11px !important;
            line-height: 1.4 !important;
          }
          .practice-example-box {
            padding: 8px 10px !important;
            border-radius: 10px !important;
            font-size: 12.5px !important;
          }
          .practice-speaking-stepper-box {
            padding: 10px 12px !important;
            border-radius: 12px !important;
            gap: 8px !important;
          }
          .practice-grammar-boxes-row {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .practice-grammar-box {
            padding: 10px 12px !important;
            border-radius: 12px !important;
          }
          .practice-card-bottom-nav {
            margin-top: 6px !important;
            padding-top: 6px !important;
            flex-shrink: 0 !important;
          }
        }

        .practice-speaking-q-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }
        @media (max-width: 640px) {
          .practice-speaking-q-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .practice-speaking-q-row .practice-action-btn-test {
            align-self: flex-start !important;
            width: 100% !important;
            justify-content: center !important;
          }
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
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .practice-dual-action-btns {
            width: 100% !important;
            justify-content: flex-start !important;
            gap: 6px !important;
          }
          .practice-action-btn-listen,
          .practice-action-btn-test,
          .practice-action-btn-purple,
          .practice-action-btn-green {
            padding: 7px 13px !important;
            font-size: 12px !important;
            min-width: 96px !important;
            gap: 5px !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            box-sizing: border-box !important;
            text-align: center !important;
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
            top: 50% !important;
            transform: translateY(-50%) !important;
            pointer-events: none !important;
            width: 16px !important;
            height: 16px !important;
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
              <path d="M42 85L80 108L122 84L86 64Z" fill="#e2e8f0"  />
              <path d="M42 88L80 111L122 87L122 84L80 108L42 85Z" fill="#cbd5e1" />
              <path d="M42 91L80 114L122 90L122 87L80 111L42 88Z" fill="#94a3b8" />

              {/* 3D Book Cover */}
              <path d="M38 78L80 104L125 78L84 54Z" fill="url(#bookCoverGrad)"  />
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
                
              >
                Aa
              </text>

              {/* Orbital Ring front */}
              <path d="M12 85C25 102 85 106 142 75" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round"  />

              {/* Sparkles */}
              <path d="M138 25L140 31L146 33L140 35L138 41L136 35L130 33L136 31Z" fill="#c084fc"  />
              <path d="M22 42L24 47L29 49L24 51L22 56L20 51L15 49L20 47Z" fill="#38bdf8"  />
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
                >
                  <option value="en">🇬🇧 GB English</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="tr">🇹🇷 Türkçe</option>
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="uz">🇺🇿 O‘zbek</option>
                </select>
                <div className="practice-select-icon">
                  <ChevronDown size={18} strokeWidth={2.5} />
                </div>
              </div>

              {/* 2. Skill Module Select Dropdown (Mobile-only: Desktop uses the horizontal pills below) */}
              <div className="practice-select-box module-select-box">
                <select
                  id="practice-module-select"
                  className="practice-select-input"
                  value={currentSlide}
                  onChange={(e) => goToSlide(Number(e.target.value))}
                >
                  {SKILL_MODULES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label} ({m.sub.split(' ')[0]})
                    </option>
                  ))}
                </select>
                <div className="practice-select-icon">
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
          className={`practice-slider-wrapper scroll-reveal ${isDarkMode ? 'is-dark' : ''}`}
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
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
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
            <div data-lenis-prevent="true" className={`practice-skill-card slide-anim-${slideDirection} ${isDarkMode ? 'dark-card' : ''}`}>
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

                  {/* Word title + Audio icon + Sinash button right beside it */}
                  <div className="practice-word-row">
                    <div className="practice-word-title-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                      <button
                        onClick={handleTestVocabWord}
                        className={`practice-action-btn-test ${isListeningVocabWord ? 'is-active' : ''}`}
                        title="So‘z talaffuzini mikrofonda sinash"
                      >
                        <Mic size={15} />
                        <span>{isListeningVocabWord ? 'Eşitilmoqda...' : 'Sinash'}</span>
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

                  {/* Example Phrase Card with Gapni Tinglash & Copy Icon */}
                  <div className="practice-example-box">
                    <div className="practice-example-head">
                      <span className="practice-example-label">
                        NAMUNA GAP (EXAMPLE PHRASE):
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handlePlayTTS(currentLangData.vocab.examplePhrase)}
                          className="practice-action-btn-listen"
                          style={{ padding: '5px 12px', fontSize: '12px', minWidth: 'auto' }}
                          title="Namuna gapni tinglash"
                        >
                          {activeSpeakingText === currentLangData.vocab.examplePhrase ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          <span>{activeSpeakingText === currentLangData.vocab.examplePhrase ? "To'xtatish" : "Gapni tinglash"}</span>
                        </button>
                        <button
                          onClick={() => handleCopyExample(currentLangData.vocab.examplePhrase)}
                          className="practice-copy-btn"
                          title={copiedPhrase ? "Nusxa olindi!" : "Gapdan nusxa olish"}
                        >
                          {copiedPhrase ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="practice-example-sentence">
                      "{currentLangData.vocab.examplePhrase}"
                    </div>

                    {/* Live interim while recording word */}
                    {isListeningVocabWord && vocabInterim && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px dashed #38bdf8',
                        color: '#38bdf8',
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Mic size={14} className="animate-pulse" />
                        <span>Eşitilmoqda: <strong>"{vocabInterim}"</strong></span>
                      </div>
                    )}

                    {/* Word Pronunciation Accuracy Result */}
                    {vocabWordScore !== null && (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: vocabWordScore >= 80 ? 'rgba(16, 185, 129, 0.12)' : vocabWordScore >= 50 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        border: `1.5px solid ${vocabWordScore >= 80 ? 'rgba(16, 185, 129, 0.6)' : vocabWordScore >= 50 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(239, 68, 68, 0.6)'}`,
                        boxShadow: `0 0 16px ${vocabWordScore >= 80 ? 'rgba(16, 185, 129, 0.2)' : vocabWordScore >= 50 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 850,
                            textTransform: 'uppercase',
                            letterSpacing: '0.6px',
                            color: vocabWordScore >= 80 ? '#34d399' : vocabWordScore >= 50 ? '#fbbf24' : '#f87171'
                          }}>
                            {vocabWordScore >= 80 ? '✓ TÖĞRI TALAFFUZ' : vocabWordScore >= 50 ? '⚠️ YAŞIRIŞ / YAQIN' : '✗ NOTÖĞRI TALAFFUZ'}
                          </span>
                          <strong style={{
                            fontSize: '13.5px',
                            fontWeight: 850,
                            color: vocabWordScore >= 80 ? '#34d399' : vocabWordScore >= 50 ? '#fbbf24' : '#f87171'
                          }}>
                            🎯 Aniqlik bali: {vocabWordScore}%
                          </strong>
                        </div>

                        {vocabWordRecognized && (
                          <div style={{ fontSize: '13px', color: '#f1f5f9' }}>
                            <span style={{ color: '#94a3b8' }}>Siz aytgan so‘z:</span> <strong>"{vocabWordRecognized}"</strong>
                            {vocabWordScore < 80 && (
                              <span style={{ color: '#94a3b8', marginLeft: '8px' }}>(Kutilgan: <strong>"{currentLangData.vocab.word}"</strong>)</span>
                            )}
                          </div>
                        )}

                        {vocabWordFeedback && (
                          <div style={{ fontSize: '12px', color: '#cbd5e1', fontStyle: 'italic' }}>
                            {vocabWordFeedback}
                          </div>
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
            <div data-lenis-prevent="true" className={`practice-skill-card slide-anim-${slideDirection} ${isDarkMode ? 'dark-card' : ''}`}>
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

                  {/* Title */}
                  <div className="practice-word-row">
                    <div className="practice-word-title-wrap">
                      <h3 className="practice-word-title" style={{ fontSize: 'clamp(20px, 2.2vw, 26px)' }}>
                        {currentLangData.writing.letterTitle}
                      </h3>
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

                  {/* Dual Action Buttons directly above the letter box */}
                  <div className="practice-dual-action-btns" style={{ marginTop: '14px', marginBottom: '10px' }}>
                    <button
                      onClick={() => handlePlayTTS(showLetterTranslation ? currentLangData.writing.letterTranslation : currentLangData.writing.letterContent)}
                      className="practice-action-btn-listen"
                      title={showLetterTranslation ? "Tarjimani audio orqali tinglash" : "Xatni audio orqali tinglash"}
                    >
                      {activeSpeakingText === (showLetterTranslation ? currentLangData.writing.letterTranslation : currentLangData.writing.letterContent) ? <VolumeX size={15} /> : <Volume2 size={15} />}
                      <span>{activeSpeakingText === (showLetterTranslation ? currentLangData.writing.letterTranslation : currentLangData.writing.letterContent) ? "To'xtatish" : "Tinglash"}</span>
                    </button>
                    <button
                      onClick={() => setShowLetterTranslation(!showLetterTranslation)}
                      className="practice-action-btn-purple"
                      title={showLetterTranslation ? "Inglizcha asl matnga qaytish" : "O‘zbekcha tarjimani ko‘rish"}
                    >
                      <Languages size={15} />
                      <span>{showLetterTranslation ? 'Asl matn' : 'Tarjima'}</span>
                    </button>
                  </div>

                  {/* Letter Text Box (Swaps dynamically in-place between original and translation) */}
                  <div className="practice-example-box" style={{
                    borderColor: showLetterTranslation ? 'rgba(168, 85, 247, 0.45)' : undefined,
                    boxShadow: showLetterTranslation ? '0 0 18px rgba(168, 85, 247, 0.2)' : undefined,
                    transition: 'border-color 0.25s ease, box-shadow 0.25s ease'
                  }}>
                    <div className="practice-example-head">
                      <span className="practice-example-label" style={{ color: showLetterTranslation ? '#c084fc' : undefined }}>
                        {showLetterTranslation ? '🇺🇿 O‘ZBEKCHA TARJIMASI (TARJIMA MATNI):' : 'RASMIY XAT MATNI (LETTER CONTENT):'}
                      </span>
                      <button
                        onClick={() => handleCopyExample(showLetterTranslation ? currentLangData.writing.letterTranslation : currentLangData.writing.letterContent)}
                        className="practice-copy-btn"
                        title={copiedPhrase ? "Nusxa olindi!" : "Matndan nusxa olish"}
                      >
                        {copiedPhrase ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div style={{
                      fontSize: '14.5px',
                      lineHeight: '1.75',
                      whiteSpace: 'pre-line',
                      color: showLetterTranslation ? '#f3e8ff' : '#f1f5f9',
                      transition: 'color 0.2s ease'
                    }}>
                      {showLetterTranslation ? currentLangData.writing.letterTranslation : currentLangData.writing.letterContent}
                    </div>
                  </div>
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
            <div data-lenis-prevent="true" className={`practice-skill-card slide-anim-${slideDirection} ${isDarkMode ? 'dark-card' : ''}`}>
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

                    <div className="practice-dual-action-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {!readingStarted ? (
                        <button
                          onClick={handleStartReading}
                          className="practice-action-btn-listen"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)'
                          }}
                          title="O‘qish vaqtini boshlash"
                        >
                          <Play size={15} fill="currentColor" />
                          <span>Boshlash</span>
                        </button>
                      ) : readingTimer > 0 ? (
                        <button
                          disabled
                          className="practice-action-btn-purple"
                          style={{
                            opacity: 0.7,
                            cursor: 'not-allowed',
                            background: 'rgba(30, 41, 59, 0.8)',
                            borderColor: 'rgba(148, 163, 184, 0.3)',
                            color: '#94a3b8'
                          }}
                          title="Vaqt tugamaguncha javoblar qulflangan"
                        >
                          <Lock size={14} />
                          <span>Qulflangan ({formatTime(readingTimer)})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowReadingAnswers(!showReadingAnswers)}
                          className="practice-action-btn-green"
                          title="Savollar javobini ko‘rish yoki yashirish"
                        >
                          {showReadingAnswers ? <EyeOff size={15} /> : <Unlock size={15} />}
                          <span>{showReadingAnswers ? 'Javoblarni yashirish' : 'Javoblarni ko‘rish'}</span>
                        </button>
                      )}

                      {readingStarted && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '12px',
                          background: readingTimer === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          border: `1px solid ${readingTimer === 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`,
                          color: readingTimer === 0 ? '#34d399' : '#38bdf8',
                          fontSize: '12.5px',
                          fontWeight: 800
                        }}>
                          <Timer size={14} className={readingTimerRunning ? 'animate-pulse' : ''} />
                          <span>{readingTimer === 0 ? '00:00 ✓ Yakunlandi' : `⏱️ ${formatTime(readingTimer)}`}</span>
                        </div>
                      )}
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
                        color: '#f1f5f9'
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
            <div data-lenis-prevent="true" className={`practice-skill-card slide-anim-${slideDirection} ${isDarkMode ? 'dark-card' : ''}`}>
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
                {/* Left Side: Modern Music Player & Strategy Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
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

                  {/* Listening Comprehension Strategy Card (Fills lower empty space) */}
                  <div style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px' }}>💡</span>
                      <strong style={{ fontSize: '12.5px', color: '#38bdf8', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                        Tinglab tushunish bo‘yicha maslahat:
                      </strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.55' }}>
                      Audioda urg‘u berilgan kalit so‘zlarga diqqat qarating. Bo‘sh joylardagi kontekstni oldindan taxmin qilish tushunishni 40% ga oshiradi.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px', fontSize: '11px', color: '#94a3b8' }}>
                      <span>🎧 Tavsiya: 1.0x temp</span>
                      <span>🔄 2 marta eshitish mumkin</span>
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

                    <div className="practice-dual-action-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {!listeningStarted ? (
                        <button
                          onClick={handleStartListening}
                          className="practice-action-btn-listen"
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)'
                          }}
                          title="Listening testini boshlash"
                        >
                          <Play size={15} fill="currentColor" />
                          <span>Boshlash</span>
                        </button>
                      ) : listeningTimer > 0 ? (
                        <button
                          disabled
                          className="practice-action-btn-purple"
                          style={{
                            opacity: 0.7,
                            cursor: 'not-allowed',
                            background: 'rgba(30, 41, 59, 0.8)',
                            borderColor: 'rgba(148, 163, 184, 0.3)',
                            color: '#94a3b8'
                          }}
                          title="Vaqt tugamaguncha javoblar qulflangan"
                        >
                          <Lock size={14} />
                          <span>Qulflangan ({formatTime(listeningTimer)})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowListeningAnswers(!showListeningAnswers)}
                          className="practice-action-btn-green"
                          title="Javoblarni tekshirish yoki yashirish"
                        >
                          {showListeningAnswers ? <EyeOff size={15} /> : <Unlock size={15} />}
                          <span>{showListeningAnswers ? 'Yashirish' : 'Tekşiriş'}</span>
                        </button>
                      )}

                      {listeningStarted && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '12px',
                          background: listeningTimer === 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          border: `1px solid ${listeningTimer === 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`,
                          color: listeningTimer === 0 ? '#34d399' : '#38bdf8',
                          fontSize: '12.5px',
                          fontWeight: 800
                        }}>
                          <Timer size={14} className={listeningTimerRunning ? 'animate-pulse' : ''} />
                          <span>{listeningTimer === 0 ? '00:00 ✓ Yakunlandi' : `⏱️ ${formatTime(listeningTimer)}`}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div>
                    <div className="practice-trans-green">
                      Audioni tinglang va böş joylarni töldiring
                    </div>
                    <p className="practice-explanation-text">
                      Tabiiy suhbat tempiga e’tibor bering va kalit sözlarni aniqlang.
                    </p>
                  </div>

                  {/* Gap Fill Text Box */}
                  <div className="practice-example-box">
                    <div className="practice-example-head">
                      <span className="practice-example-label">
                        AUDIO DIALOG VA GAP-FILL TOPŞIRIĞI:
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
                                ? (currentLangData.listening.gapsAnswers[index] || 'töğri javob')
                                : `[ ${index + 1}-böş joy ]`}
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
            <div data-lenis-prevent="true" className={`practice-skill-card slide-anim-${slideDirection} ${isDarkMode ? 'dark-card' : ''}`}>
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
                <div className="practice-speaking-left-col" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="practice-card-media" style={{ position: 'relative' }}>
                    <img
                      src={currentLangData.speaking.image}
                      alt={currentLangData.speaking.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="practice-photo-badge">
                      <MessageSquare size={13} />
                      <span>{answeredQuestionsCount} / {totalQuestionsCount} Intervyu</span>
                    </div>
                  </div>

                  <div className="practice-example-box practice-speaking-progress-desktop-only" style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 850, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                        Javob berilgan savollar:
                      </span>
                      <strong style={{ fontSize: '12.5px', color: '#93c5fd' }}>
                        {answeredQuestionsCount} / {totalQuestionsCount}
                      </strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', borderRadius: '5px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
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

                  {/* Single Question Stepper Box (Ixcham 1-savol rejimi) */}
                  {(() => {
                    const qList = currentLangData.speaking.questions || [];
                    const qIndex = Math.min(activeSpeakingQIndex, Math.max(0, qList.length - 1));
                    const q = qList[qIndex];
                    if (!q) return null;
                    const scoreObj = speakingScores[q.id];
                    const isRecordingThis = activeListeningQuestionId === q.id;

                    return (
                      <div className="practice-speaking-stepper-box">
                        {/* Stepper Header: Savol 1 / 3 with Next / Prev */}
                        <div className="practice-speaking-stepper-head">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="practice-speaking-stepper-label">
                              {qIndex + 1}-SAVOL ({qList.length} TADAN):
                            </span>
                            {/* Dots for questions */}
                            <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                              {qList.map((item, idx) => (
                                <span
                                  key={item.id}
                                  onClick={() => setActiveSpeakingQIndex(idx)}
                                  style={{
                                    width: idx === qIndex ? '16px' : '6px',
                                    height: '6px',
                                    borderRadius: '9999px',
                                    background: idx === qIndex ? '#38bdf8' : speakingScores[item.id] ? '#10b981' : 'rgba(255,255,255,0.25)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                  title={`${idx + 1}-savol`}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="practice-speaking-stepper-controls">
                            <button
                              onClick={() => setActiveSpeakingQIndex((prev) => Math.max(0, prev - 1))}
                              disabled={qIndex === 0}
                              className="practice-speaking-nav-btn"
                              title="Oldingi savol"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <span className="practice-speaking-step-num">
                              {qIndex + 1} / {qList.length}
                            </span>
                            <button
                              onClick={() => setActiveSpeakingQIndex((prev) => Math.min(qList.length - 1, prev + 1))}
                              disabled={qIndex === qList.length - 1}
                              className="practice-speaking-nav-btn"
                              title="Keyingi savol"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Active Question Content */}
                        <div className="practice-speaking-active-q-wrap">
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', lineHeight: '1.45' }}>
                            {q.id}. {q.question}
                          </div>
                          {q.hint && (
                            <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                              💡 Maslahat: {q.hint}
                            </span>
                          )}
                        </div>

                        {/* Mic Answer Button & Next Question Button */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleTestSpeakingQuestion(q.id, q.question)}
                            className={`practice-action-btn-test ${isRecordingThis ? 'is-active' : ''}`}
                            title="Mikrofon orqali javob beriş"
                          >
                            <Mic size={14} />
                            <span>{isRecordingThis ? 'Eşityapman...' : scoreObj ? 'Qayta sinaş' : 'Javob beriş'}</span>
                          </button>

                          {qIndex < qList.length - 1 && (
                            <button
                              onClick={() => setActiveSpeakingQIndex((prev) => Math.min(qList.length - 1, prev + 1))}
                              className="practice-speaking-next-btn"
                              title="Keyingi savolga ötiş"
                            >
                              <span>Keyingi savol</span>
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </div>

                        {/* Live streaming interim during speech */}
                        {isRecordingThis && speakingInterim && (
                          <div style={{
                            marginTop: '10px',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1.5px dashed rgba(56, 189, 248, 0.5)',
                            color: '#38bdf8',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <Mic size={14} className="animate-pulse" />
                            <span>🎙️ Eşitilmoqda: <strong>"{speakingInterim}"</strong></span>
                          </div>
                        )}

                        {/* AI Loading indicator */}
                        {speakingAiLoading[q.id] && (
                          <div style={{
                            marginTop: '10px',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            background: 'rgba(168, 85, 247, 0.12)',
                            border: '1px solid rgba(168, 85, 247, 0.4)',
                            color: '#c084fc',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <Sparkles size={15} className="animate-spin" />
                            <span>🤖 Google Gemini AI nutqni chuqur tahlil qilmoqda...</span>
                          </div>
                        )}

                        {/* Comprehensive AI Evaluation Card */}
                        {scoreObj && !isRecordingThis && !speakingAiLoading[q.id] && (
                          <div style={{
                            marginTop: '12px',
                            padding: '12px 16px',
                            borderRadius: '14px',
                            background: scoreObj.score >= 80 ? 'rgba(6, 30, 22, 0.88)' : scoreObj.score >= 50 ? 'rgba(30, 22, 10, 0.88)' : 'rgba(35, 10, 15, 0.88)',
                            border: `1.5px solid ${scoreObj.score >= 80 ? 'rgba(16, 185, 129, 0.6)' : scoreObj.score >= 50 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(239, 68, 68, 0.6)'}`,
                            boxShadow: `0 0 20px ${scoreObj.score >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            {/* Score & CEFR Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: scoreObj.score >= 80 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                                  color: scoreObj.score >= 80 ? '#34d399' : '#fbbf24',
                                  fontSize: '11px',
                                  fontWeight: 850,
                                  textTransform: 'uppercase'
                                }}>
                                  ⭐ Ball: {scoreObj.score}% {scoreObj.cefrLevel ? `(${scoreObj.cefrLevel})` : ''}
                                </span>
                                {scoreObj.isLiveAi && (
                                  <span style={{ fontSize: '10.5px', color: '#38bdf8', fontWeight: 700 }}>
                                    ✨ Gemini 2.0 AI
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                Nutq qabul qilindi ✓
                              </span>
                            </div>

                            {/* Recognized Transcript */}
                            {scoreObj.text && (
                              <div style={{ fontSize: '13px', color: '#f1f5f9', background: 'rgba(0,0,0,0.25)', padding: '6px 10px', borderRadius: '8px' }}>
                                <span style={{ color: '#94a3b8' }}>🗣️ Sizning javobingiz:</span> <em>"{scoreObj.text}"</em>
                              </div>
                            )}

                            {/* Identified Mistakes / Deficiencies */}
                            {scoreObj.mistakes && scoreObj.mistakes.length > 0 && (
                              <div style={{ fontSize: '12px', color: '#fca5a5' }}>
                                <strong>⚠️ Aniqlangan xatoliklar:</strong>
                                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                  {scoreObj.mistakes.map((m, mIdx) => (
                                    <li key={mIdx}>{m}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Alternative Academic Phrasing */}
                            {scoreObj.alternativePhrasing && (
                              <div style={{ fontSize: '12px', color: '#86efac', background: 'rgba(16, 185, 129, 0.08)', padding: '6px 10px', borderRadius: '8px' }}>
                                <strong style={{ color: '#34d399' }}>💡 Muqobil variant (Alternative Phrasing):</strong>
                                <div style={{ marginTop: '2px', fontStyle: 'italic', color: '#e2e8f0' }}>
                                  "{scoreObj.alternativePhrasing}"
                                </div>
                              </div>
                            )}

                            {/* AI Advice & Guidance */}
                            {scoreObj.feedback && (
                              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                                <strong>🤖 AI maslahati:</strong> {scoreObj.feedback}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

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
            <div data-lenis-prevent="true" className={`practice-skill-card slide-anim-${slideDirection} ${isDarkMode ? 'dark-card' : ''}`}>
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
                  <div className="practice-grammar-boxes-row">
                    {/* Incorrect Text */}
                    <div className="practice-grammar-box" style={{
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
                    <div className="practice-grammar-box" style={{
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
          {/* SLIDE 6: SHADOWING CARD (CUSTOM PLAYER + RESIZE + STEP) */}
          {/* ===================================================== */}
          {currentSlide === 6 && (() => {
            const segments = getShadowingSegments();
            const safeIdx = Math.min(activeShadowingIndex, Math.max(0, segments.length - 1));
            const currentSegment = segments[safeIdx] || '';
            const partScore = shadowingPartScores[safeIdx];
            const isRecordingThisSegment = isShadowingListening;
            const answeredCount = Object.keys(shadowingPartScores).length;
            const isAllPartsEvaluated = segments.length > 0 && answeredCount >= segments.length;
            const avgScore = answeredCount > 0
              ? Math.round(Object.values(shadowingPartScores).reduce((acc, curr) => acc + curr.score, 0) / answeredCount)
              : 0;

            return (
              <div data-lenis-prevent="true" className={`practice-skill-card slide-anim-${slideDirection} ${isDarkMode ? 'dark-card' : ''}`}>
                {renderCardCornerWave()}

                <div className="practice-card-head">
                  <span className="practice-card-badge">
                    <Award size={15} /> 7. SHADOWING (SOYA METODI & NUTQNI MOSLAŞTIRIŞ)
                  </span>
                  <span className="practice-lang-tag">
                    <Globe size={13} /> {currentLangData.flag} {currentLangData.langName}
                  </span>
                </div>

                {/* Resizable Shadowing Grid (Desktop: variable player width up to 50%) */}
                <div
                  ref={shadowingGridRef}
                  className="practice-shadowing-grid"
                  style={{
                    gridTemplateColumns: `${shadowingPlayerWidth}% 1fr`
                  }}
                >
                  {/* Left Column: Custom Branded Video Player with Expand Handle */}
                  <div className="practice-shadowing-wrapper">
                    {/* Custom Video Player */}
                    <div className="custom-video-player">
                      {/* Hidden Iframe behind with controls=0 */}
                      <div className="custom-video-iframe-wrap">
                        <iframe
                          ref={shadowingVideoRef}
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${getYoutubeVideoId(currentLangData.shadowing.videoUrl)}?enablejsapi=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1&playsinline=1&fs=0`}
                          title="Shadowing Custom Video Player"
                          style={{ border: 'none', width: '100%', height: '100%' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                        />
                      </div>

                      {/* Sleek Custom Top Bar */}
                      <div className="custom-video-top-bar">
                        <div className="custom-video-badge">
                          <span className="custom-video-live-dot" />
                          <span>TILŞUNOS HD PLAYER</span>
                        </div>
                        <div className="custom-video-title-pill" title={currentLangData.shadowing.title}>
                          {currentLangData.shadowing.title}
                        </div>
                      </div>

                      {/* Big Glowing Center Play Button */}
                      {!shadowingVideoPlaying && (
                        <button
                          onClick={toggleVideoPlayback}
                          className="custom-video-center-play"
                          title="Videoni ijro etish"
                        >
                          <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />
                        </button>
                      )}

                      {/* Custom Sleek Bottom Controls Bar */}
                      <div className="custom-video-bottom-bar">
                        {/* Progress Scrubber */}
                        <div
                          className="custom-video-progress"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                            const targetSecs = Math.round(clickPos * (shadowingVideoDuration || 90));
                            handleVideoSeek(targetSecs);
                          }}
                          title="Videoni kerakli vaqtiga o‘tkazish"
                        >
                          <div
                            className="custom-video-progress-fill"
                            style={{ width: `${Math.min(100, (shadowingVideoCurrentTime / (shadowingVideoDuration || 90)) * 100).toFixed(2)}%` }}
                          />
                        </div>

                        {/* Controls Row */}
                        <div className="custom-video-controls">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={toggleVideoPlayback}
                              className="custom-video-btn"
                              title={shadowingVideoPlaying ? "Pauza" : "Tinglash va ko‘rish"}
                            >
                              {shadowingVideoPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                            </button>

                            <button
                              onClick={() => handleVideoSeek(shadowingVideoCurrentTime - 5)}
                              className="custom-video-btn"
                              title="5 soniya orqaga (-5s)"
                            >
                              <RotateCcw size={11} /> -5s
                            </button>

                            <button
                              onClick={() => handleVideoSeek(shadowingVideoCurrentTime + 5)}
                              className="custom-video-btn"
                              title="5 soniya oldinga (+5s)"
                            >
                              +5s <FastForward size={11} />
                            </button>

                            <span className="custom-video-time">
                              {formatTime(shadowingVideoCurrentTime)} / {formatTime(shadowingVideoDuration || 90)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={handleToggleVideoSpeed}
                              className="custom-video-btn"
                              title="Ijro tezligi: 1x, 1.25x, 1.5x, 0.75x"
                            >
                              ⚡ {shadowingVideoSpeed}x
                            </button>

                            <button
                              onClick={handleToggleVideoMute}
                              className="custom-video-btn"
                              title={shadowingVideoMuted ? "Ovozni yoqish" : "Ovozni o‘chirish"}
                            >
                              {shadowingVideoMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resize Handle (Desktop/Laptop: Drag or Click to expand up to 50%) */}
                    <div
                      className="shadowing-resize-handle"
                      onMouseDown={handleStartResize}
                      title="Pleyer kengligini yonga tortib o‘zgartiring yoki bosing"
                    >
                      <div className="shadowing-resize-line" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleExpand();
                        }}
                        className="shadowing-resize-btn"
                        title={shadowingPlayerWidth >= 47 ? "Pleyerni asl o‘lchamiga qaytarish" : "Pleyerni 50% ga kengaytirish"}
                      >
                        {shadowingPlayerWidth >= 47 ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Segmented Shadowing Stepper & Real-time Comparison */}
                  <div className="practice-content-col">
                    {/* Tag */}
                    <div className="practice-tag-new">
                      <Sparkles size={12} />
                      <span>Soya metodi (Segment Stepper)</span>
                    </div>

                    {/* Title Row */}
                    <div className="practice-word-row">
                      <div className="practice-word-title-wrap">
                        <h3 className="practice-word-title" style={{ fontSize: 'clamp(20px, 2.2vw, 26px)' }}>
                          {currentLangData.shadowing.title}
                        </h3>
                      </div>

                      {isAllPartsEvaluated && (
                        <div className="practice-dual-action-btns">
                          <span style={{
                            padding: '6px 14px',
                            borderRadius: '9999px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid #10b981',
                            color: '#34d399',
                            fontSize: '12px',
                            fontWeight: 850
                          }}>
                            ⭐ O‘rtacha: {avgScore}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Subtitle */}
                    <div>
                      <div className="practice-trans-green">
                        Sözlovçining intonatsiyasi va urğusiga taqlid qiling
                      </div>
                      <p className="practice-explanation-text">
                        Matn bir nechta qismlarga ajratilgan. Har bir qismni alohida tinglang, takrorlang va solishtiring.
                      </p>
                    </div>

                    {/* Shadowing Segment Stepper Box */}
                    <div className="practice-speaking-stepper-box">
                      {/* Stepper Header: Qism 1 / 3 with Next / Prev */}
                      <div className="practice-speaking-stepper-head">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="practice-speaking-stepper-label">
                            {safeIdx + 1}-QISM ({segments.length} TADAN):
                          </span>
                          {/* Progress dots for parts */}
                          <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                            {segments.map((_, idx) => (
                              <span
                                key={idx}
                                onClick={() => setActiveShadowingIndex(idx)}
                                style={{
                                  width: idx === safeIdx ? '16px' : '6px',
                                  height: '6px',
                                  borderRadius: '9999px',
                                  background: idx === safeIdx ? '#38bdf8' : shadowingPartScores[idx] ? '#10b981' : 'rgba(255,255,255,0.25)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                                title={`${idx + 1}-qism`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="practice-speaking-stepper-controls">
                          <button
                            onClick={() => setActiveShadowingIndex((prev) => Math.max(0, prev - 1))}
                            disabled={safeIdx === 0}
                            className="practice-speaking-nav-btn"
                            title="Oldingi qism"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="practice-speaking-step-num">
                            {safeIdx + 1} / {segments.length}
                          </span>
                          <button
                            onClick={() => setActiveShadowingIndex((prev) => Math.min(segments.length - 1, prev + 1))}
                            disabled={safeIdx === segments.length - 1}
                            className="practice-speaking-nav-btn"
                            title="Keyingi qism"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Active Segment Speech Box with Word-by-Word Matching */}
                      <div className="practice-example-box" style={{
                        marginTop: '8px',
                        border: '1.5px solid rgba(56, 189, 248, 0.35)',
                        background: 'rgba(15, 23, 42, 0.72)'
                      }}>
                        <div className="practice-example-head">
                          <span className="practice-example-label" style={{ color: '#38bdf8' }}>
                            SOYA METODI UÇUN MATN ({safeIdx + 1}-QISM):
                          </span>
                        </div>

                        <div style={{
                          fontSize: '16px',
                          lineHeight: '1.9',
                          color: '#f1f5f9',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px'
                        }}>
                          {currentSegment.split(/\s+/).map((targetWord, idx) => {
                            const cleanTarget = targetWord.replace(/[.,:;!?]/g, '').toLowerCase();
                            const spokenWords = (partScore?.text || '').toLowerCase().split(/\s+/);
                            const isMatched = spokenWords.some((sw) => sw.includes(cleanTarget) || cleanTarget.includes(sw));
                            const hasSpoken = !!partScore && partScore.score > 0;

                            return (
                              <span
                                key={idx}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  color: hasSpoken ? (isMatched ? '#34d399' : '#f87171') : '#f8fafc',
                                  fontWeight: 800,
                                  background: hasSpoken
                                    ? (isMatched ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.18)')
                                    : 'rgba(255, 255, 255, 0.05)',
                                  border: hasSpoken
                                    ? (isMatched ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(239, 68, 68, 0.4)')
                                    : '1px solid rgba(255, 255, 255, 0.08)',
                                  boxShadow: hasSpoken && isMatched ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none',
                                  transition: 'all 0.25s ease',
                                  display: 'inline-block'
                                }}
                              >
                                {targetWord}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action Row: Tinglash & Solishtirish & Next */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handlePlayTTS(currentSegment)}
                            className="practice-action-btn-listen"
                            title="Ushbu qismni tinglash"
                          >
                            {activeSpeakingText === currentSegment ? <VolumeX size={15} /> : <Volume2 size={15} />}
                            <span>{activeSpeakingText === currentSegment ? "To'xtatish" : "Tinglash"}</span>
                          </button>

                          <button
                            onClick={() => handleTestShadowingSegment(safeIdx, currentSegment)}
                            className={`practice-action-btn-test ${isRecordingThisSegment ? 'is-active' : ''}`}
                            title="Ushbu qismni mikrofonda solishtirish"
                          >
                            <Mic size={15} />
                            <span>{isRecordingThisSegment ? 'Eşitilmoqda...' : partScore ? 'Qayta solishtirish' : 'Solishtirish'}</span>
                          </button>
                        </div>

                        {safeIdx < segments.length - 1 && (
                          <button
                            onClick={() => setActiveShadowingIndex((prev) => Math.min(segments.length - 1, prev + 1))}
                            className="practice-speaking-next-btn"
                            title="Keyingi qismga o‘tish"
                          >
                            <span>Keyingi qism</span>
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>

                      {/* Live Interim Streaming Transcript */}
                      {isRecordingThisSegment && shadowingInterim && (
                        <div style={{
                          marginTop: '10px',
                          padding: '9px 13px',
                          borderRadius: '10px',
                          background: 'rgba(56, 189, 248, 0.12)',
                          border: '1px dashed #38bdf8',
                          color: '#38bdf8',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Mic size={14} className="animate-pulse" />
                          <span>Eşitilmoqda: <strong>"{shadowingInterim}"</strong></span>
                        </div>
                      )}

                      {/* Evaluated Part Result Card */}
                      {partScore && (
                        <div style={{
                          marginTop: '10px',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          background: partScore.score >= 80 ? 'rgba(16, 185, 129, 0.1)' : partScore.score >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          border: `1.5px solid ${partScore.score >= 80 ? 'rgba(16, 185, 129, 0.5)' : partScore.score >= 50 ? 'rgba(245, 158, 11, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                          boxShadow: `0 0 16px ${partScore.score >= 80 ? 'rgba(16, 185, 129, 0.2)' : partScore.score >= 50 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 850,
                              textTransform: 'uppercase',
                              letterSpacing: '0.6px',
                              color: partScore.score >= 80 ? '#34d399' : partScore.score >= 50 ? '#fbbf24' : '#f87171'
                            }}>
                              {partScore.score >= 80 ? '✓ TÖĞRI MOSLASHTIRILDI' : partScore.score >= 50 ? '⚠️ YAŞIRIŞ / YAQIN' : '✗ TALAFUZDA XATOLIKLAR'}
                            </span>
                            <strong style={{
                              fontSize: '13.5px',
                              fontWeight: 850,
                              color: partScore.score >= 80 ? '#34d399' : partScore.score >= 50 ? '#fbbf24' : '#f87171'
                            }}>
                              ⭐ Moslik darajasi: {partScore.score}%
                            </strong>
                          </div>

                          <div style={{ fontSize: '13px', color: '#f1f5f9' }}>
                            <span style={{ color: '#94a3b8' }}>🗣️ Siz aytgan matn:</span> <strong>"{partScore.text}"</strong>
                          </div>

                          {partScore.omittedWords && partScore.omittedWords.length > 0 && partScore.score > 0 && (
                            <div style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              fontSize: '12px',
                              color: '#fca5a5'
                            }}>
                              <strong style={{ color: '#ef4444', display: 'block', marginBottom: '2px' }}>
                                ⚠️ Noaniq yoki tushirib qoldirilgan so‘zlar:
                              </strong>
                              <span>{partScore.omittedWords.slice(0, 4).join(', ')}</span>
                            </div>
                          )}

                          {partScore.advice && (
                            <div style={{ fontSize: '12px', color: '#cbd5e1', fontStyle: 'italic' }}>
                              💡 AI repetitor tavsiyasi: {partScore.advice}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* All Segments Completed Celebration */}
                    {isAllPartsEvaluated && (
                      <div className="practice-example-box" style={{
                        background: 'rgba(6, 25, 20, 0.92) !important',
                        border: '1.5px solid rgba(16, 185, 129, 0.75) !important',
                        boxShadow: '0 0 24px rgba(16, 185, 129, 0.3) !important',
                        marginTop: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: 850, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                              🎉 BARCHA QISMLAR MUVAFFAQIYATLI YAKUNLANDI!
                            </span>
                            <h4 style={{ margin: '4px 0', fontSize: '18px', fontWeight: 850, color: '#ffffff' }}>
                              O‘rtacha moslik darajangiz: {avgScore}%
                            </h4>
                            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                              Soya metodi orqali gap intonatsiyasi va urg‘usini muvaffaqiyatli o‘zlashtirdingiz.
                            </p>
                          </div>
                          <button
                            onClick={() => onBegin('register')}
                            className="practice-action-btn-green"
                            style={{ padding: '8px 16px', fontSize: '13px' }}
                          >
                            To‘liq kursni boshlash
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Card Dots & Pagination */}
                {renderCardBottomNav(6)}
              </div>
            );
          })()}

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
