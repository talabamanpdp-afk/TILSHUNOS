// Multilingual Speech Synthesis & Recognition Utility
// Supports English, German, Turkish, Russian, and more with 0 server/database storage

export type SupportedLang = 'en' | 'de' | 'tr' | 'ru' | 'uz';

export const LANG_CODES: Record<SupportedLang, string> = {
  en: 'en-US',
  de: 'de-DE',
  tr: 'tr-TR',
  ru: 'ru-RU',
  uz: 'uz-UZ'
};

export const LANG_LABELS: Record<SupportedLang, { name: string; flag: string; nativeName: string }> = {
  en: { name: 'Ingliz tili', flag: '🇬🇧', nativeName: 'English' },
  de: { name: 'Nemis tili', flag: '🇩🇪', nativeName: 'Deutsch' },
  tr: { name: 'Turk tili', flag: '🇹🇷', nativeName: 'Türkçe' },
  ru: { name: 'Rus tili', flag: '🇷🇺', nativeName: 'Русский' },
  uz: { name: 'O‘zbek tili', flag: '🇺🇿', nativeName: 'O‘zbek' }
};

// Cached voices
let availableVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    try {
      availableVoices = window.speechSynthesis.getVoices();
    } catch {
      availableVoices = [];
    }
  };

  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export interface PlaySpeechOptions {
  lang?: SupportedLang | string;
  rate?: number; // 0.1 to 10 (normal is 0.9-1.0, slow is 0.65)
  pitch?: number; // 0 to 2 (normal is 1.0)
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Speaks text using browser-native Text-To-Speech (0 server storage, 0 cost).
 * Supports English, German, Turkish, Russian, etc.
 */
export function playSpeech(text: string, options: PlaySpeechOptions = {}): () => void {
  if (!isSpeechSynthesisSupported()) {
    console.warn('SpeechSynthesis is not supported on this browser.');
    options.onError?.('Ushbu brauzerda ovozli o‘qish qo‘llab-quvvatlanmaydi.');
    return () => {};
  }

  try {
    // Cancel any speech in progress
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    const rawLang = options.lang || 'en';
    const langCode = (LANG_CODES as any)[rawLang] || rawLang || 'en-US';

    utter.lang = langCode;
    utter.rate = options.rate !== undefined ? options.rate : 0.9;
    utter.pitch = options.pitch !== undefined ? options.pitch : 1.0;

    // Pick best matching voice
    if (availableVoices.length === 0) {
      availableVoices = window.speechSynthesis.getVoices();
    }

    if (availableVoices.length > 0) {
      const prefix = langCode.slice(0, 2).toLowerCase();
      const matchingVoices = availableVoices.filter(v => 
        v.lang.toLowerCase().startsWith(prefix) || v.lang.toLowerCase().replace('_', '-').includes(langCode.toLowerCase())
      );

      if (matchingVoices.length > 0) {
        // Prioritize natural / Google / Apple / Microsoft voices
        const naturalVoice = matchingVoices.find(v => 
          /natural|google|neural|siri|premium|online/i.test(v.name)
        );
        utter.voice = naturalVoice || matchingVoices[0];
      }
    }

    utter.onstart = () => {
      options.onStart?.();
    };

    utter.onend = () => {
      options.onEnd?.();
    };

    utter.onerror = (e) => {
      options.onEnd?.();
      options.onError?.(e);
    };

    window.speechSynthesis.speak(utter);

    return () => {
      window.speechSynthesis.cancel();
    };
  } catch (err) {
    options.onError?.(err);
    return () => {};
  }
}

export function stopSpeech(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Calculates string similarity ratio (0 to 100%)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF]/g, '').trim();
  const a = clean(str1);
  const b = clean(str2);

  if (!a || !b) return 0;
  if (a === b) return 100;

  // Simple Levenshtein distance
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  const similarity = Math.max(0, Math.round(((maxLen - distance) / maxLen) * 100));

  // If one string contains the other, give a boost
  if (a.includes(b) || b.includes(a)) {
    return Math.max(similarity, 85);
  }

  return similarity;
}

export interface PronunciationResult {
  transcript: string;
  score: number;
  confidence: number;
  passed: boolean;
  feedback: string;
}

export interface StartListeningOptions {
  lang?: SupportedLang | string;
  targetWord?: string;
  expectedWord?: string;
  onInterim?: (text: string) => void;
  onPartial?: (text: string) => void;
  onResult: (res: PronunciationResult) => void;
  onError?: (errMessage: any) => void;
  onEnd?: () => void;
}

/**
 * Uses browser-native Speech Recognition (0 server storage) to assess user pronunciation.
 */
export function startListening(options: StartListeningOptions): () => void {
  const targetText = options.targetWord || options.expectedWord || '';

  if (!isSpeechRecognitionSupported()) {
    options.onError?.('Uşbu brauzerda ovozni aniqlaş (SpeechRecognition) qöllab-quvvatlanmaydi.');
    options.onEnd?.();
    return () => {};
  }

  try {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();

    const rawLang = options.lang || 'en';
    const langCode = (LANG_CODES as any)[rawLang] || rawLang || 'en-US';

    recognition.lang = langCode;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    let finalTranscript = '';
    let hasReturned = false;

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript = event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        options.onInterim?.(interim);
        options.onPartial?.(interim);
      }

      const textToScore = finalTranscript || interim;
      if (textToScore) {
        const score = calculateSimilarity(textToScore, targetText);
        let feedback = '';
        if (score >= 90) {
          feedback = 'A‘lo darajada! Mukammal talaffuz! 🎯';
        } else if (score >= 75) {
          feedback = 'Yaxşi natija! Juda yaqin! 👍';
        } else if (score >= 50) {
          feedback = 'Yomon emas, yana bir bor urinib körong! 🔄';
        } else {
          feedback = 'Qaytadan aniqroq aytib köring! 🎙️';
        }

        if (finalTranscript && !hasReturned) {
          hasReturned = true;
          options.onResult({
            transcript: finalTranscript,
            score,
            confidence: Math.round(score) / 100,
            passed: score >= 75,
            feedback
          });
        }
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error === 'no-speech') {
        options.onError?.('Ovoz eşitilmadi. Qaytadan urinib köring.');
      } else if (e.error === 'not-allowed') {
        options.onError?.('Mikrofon ruxsati berilmadi.');
      } else {
        options.onError?.(`Xatolik: ${e.error}`);
      }
    };

    recognition.onend = () => {
      if (!hasReturned && finalTranscript) {
        hasReturned = true;
        const score = calculateSimilarity(finalTranscript, targetText);
        options.onResult({
          transcript: finalTranscript,
          score,
          confidence: Math.round(score) / 100,
          passed: score >= 75,
          feedback: score >= 75 ? 'Ajoyib natija! 🎯' : 'Qaytadan urinib köring! 🔄'
        });
      }
      options.onEnd?.();
    };

    recognition.start();

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  } catch (err: any) {
    options.onError?.(err?.message || 'Ovoz tanişni boşlaşda xatolik yuz berdi');
    options.onEnd?.();
    return () => {};
  }
}

