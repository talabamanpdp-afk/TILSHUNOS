// Google Gemini AI Service for TILŞUNOS Platform
// Provides Real-time AI evaluation for Writing (Essays & Letters), Speaking, Shadowing, and Interactive AI Tutor

export interface GeminiAiConfig {
  apiKey: string;
  model: 'gemini-2.0-flash' | 'gemini-1.5-flash' | 'gemini-1.5-pro' | string;
  enabled: boolean;
  temperature?: number;
}

export const DEFAULT_AI_CONFIG: GeminiAiConfig = {
  apiKey: '',
  model: 'gemini-2.0-flash',
  enabled: true,
  temperature: 0.2
};

const STORAGE_KEY = 'tilshunos_ai_config';

/**
 * Retrieves AI config by checking:
 * 1. Dedicated localStorage key ('tilshunos_ai_config')
 * 2. Supabase CMS cache ('tilshunos_cms_data' -> trialTests.aiConfig)
 * 3. Vite environment variable (VITE_GEMINI_API_KEY)
 */
export function getStoredAiConfig(): GeminiAiConfig {
  if (typeof window === 'undefined') return DEFAULT_AI_CONFIG;

  let config: GeminiAiConfig = { ...DEFAULT_AI_CONFIG };

  // 1. Try dedicated storage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      config = { ...config, ...parsed };
    }
  } catch {}

  // 2. Fallback to CMS cached config if apiKey not yet set
  if (!config.apiKey) {
    try {
      const cmsRaw = localStorage.getItem('tilshunos_cms_data');
      if (cmsRaw) {
        const cms = JSON.parse(cmsRaw);
        if (cms?.trialTests?.aiConfig?.apiKey) {
          config = { ...config, ...cms.trialTests.aiConfig };
        }
      }
    } catch {}
  }

  // 3. Fallback to env var if available
  if (!config.apiKey && typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) {
    config.apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  }

  return config;
}

/**
 * Saves AI config to localStorage and syncs with CMS cache
 */
export function saveStoredAiConfig(cfg: Partial<GeminiAiConfig>): GeminiAiConfig {
  const current = getStoredAiConfig();
  const updated: GeminiAiConfig = { ...current, ...cfg };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Also sync into tilshunos_cms_data if present
      const cmsRaw = localStorage.getItem('tilshunos_cms_data');
      if (cmsRaw) {
        const cms = JSON.parse(cmsRaw);
        if (!cms.trialTests) cms.trialTests = {};
        cms.trialTests.aiConfig = updated;
        localStorage.setItem('tilshunos_cms_data', JSON.stringify(cms));
      }
    } catch (e) {
      console.warn('Failed to save AI config to localStorage:', e);
    }
  }
  return updated;
}

/**
 * Syncs CMS AI config into localStorage when loaded from Supabase
 */
export function syncAiConfigFromCms(cmsAiConfig?: Partial<GeminiAiConfig>) {
  if (!cmsAiConfig?.apiKey) return;
  const current = getStoredAiConfig();
  if (!current.apiKey || current.apiKey !== cmsAiConfig.apiKey) {
    saveStoredAiConfig({ ...current, ...cmsAiConfig });
  }
}

export interface WritingCorrection {
  issue: string;
  originalSnippet?: string;
  correction: string;
  advice: string;
}

export interface WritingEvaluationResult {
  cefrScore: string; // e.g. "B2 (Upper-Intermediate)"
  overallScore: number; // 0-100
  grammarScore: number; // 0-100
  lexicalScore: number; // 0-100
  coherenceScore: number; // 0-100
  taskAchievementScore: number; // 0-100
  corrections: WritingCorrection[];
  positivePoints: string[];
  recommendations: string[];
  isLiveAi: boolean;
  providerModel?: string;
  genreMismatch?: boolean;
}

export interface SpeakingEvaluationResult {
  score: number; // 0-100
  cefrLevel: string; // "A1", "A2", "B1", "B2", "C1", "C2" or "Aniqlanmadi"
  fluencyScore: number; // 0-100
  vocabularyScore: number; // 0-100
  grammarScore: number; // 0-100
  pronunciationFeedback: string;
  feedback: string;
  improvements: string[];
  isLiveAi: boolean;
  isSilence?: boolean;
  providerModel?: string;
}

export interface ShadowingEvaluationResult {
  score: number; // 0-100 similarity
  accuracyScore: number; // 0-100 phonetic & lexical
  fluencyScore: number; // 0-100 cadence
  feedback: string;
  pronunciationAdvice: string;
  omittedWords?: string[];
  isSilence?: boolean;
  isLiveAi: boolean;
  providerModel?: string;
}

/**
 * Tests connection with Google Gemini API
 */
export async function testGeminiConnection(
  apiKey: string,
  model: string = 'gemini-2.0-flash'
): Promise<{ success: boolean; latencyMs?: number; message: string; sampleResponse?: string }> {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) {
    return { success: false, message: 'Iltimos, Google Gemini API kalitini kiriting.' };
  }

  const startTime = Date.now();

  // Try via serverless backend endpoint first
  try {
    const res = await fetch('/api/ai/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'test-connection',
        apiKey: trimmedKey,
        model
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        latencyMs: data.latencyMs || Date.now() - startTime,
        message: data.message || 'Gemini 2.0 API aloqasi muvaffaqiyatli!',
        sampleResponse: data.sampleResponse
      };
    }
  } catch {
    // fallback to direct client call
  }

  // Direct client call to Gemini REST API
  try {
    const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(trimmedKey)}`;
    const directRes = await fetch(directUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Salom! Faqat bir dona so\'z bilan javob ber: "OK".' }] }]
      })
    });

    const latencyMs = Date.now() - startTime;
    if (directRes.ok) {
      const directData = await directRes.json();
      const reply = directData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';
      return {
        success: true,
        latencyMs,
        message: `Google Gemini (${model}) aloqasi muvaffaqiyatli o‘rnatildi!`,
        sampleResponse: reply
      };
    } else {
      const err = await directRes.text();
      return {
        success: false,
        latencyMs,
        message: `Gemini API xatolik qaytardi (${directRes.status}): ${err.slice(0, 150)}`
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Aloqa xatosi: ${err.message || 'Serverga ulanib bo‘lmadi.'}`
    };
  }
}

/**
 * Real AI evaluation for Writing (Essays & Letters)
 * Features dynamic genre mismatch detection, exact student quote analysis, and strict CEFR grading.
 */
export async function evaluateWritingWithGemini(params: {
  text: string;
  topicTitle: string;
  topicPrompt?: string;
  taskType: 'essay' | 'letter';
  minWords?: number;
  targetLanguage?: string;
  lang?: string;
}): Promise<WritingEvaluationResult> {
  const config = getStoredAiConfig();
  const apiKey = config.apiKey.trim();
  const model = config.model || 'gemini-2.0-flash';

  const payload = {
    text: params.text,
    topicTitle: params.topicTitle,
    topicPrompt: params.topicPrompt || '',
    taskType: params.taskType,
    minWords: params.minWords || 120,
    targetLanguage: params.targetLanguage || 'en',
    lang: params.lang || 'uz'
  };

  // 1. Try serverless endpoint first
  try {
    const res = await fetch('/api/ai/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'evaluate-writing',
        payload,
        apiKey: apiKey || undefined,
        model
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.evaluation) {
        return {
          ...data.evaluation,
          isLiveAi: true,
          providerModel: `Google Gemini (${model})`
        };
      }
    }
  } catch {
    // serverless not available
  }

  // 2. Direct client call to Gemini REST API if apiKey exists
  if (apiKey) {
    try {
      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const prompt = `Siz xalqaro darajadagi tajribali til imtihonçisisiz (CEFR & IELTS Writing baholovçisi).
Vazifangiz: Talabaning ${params.taskType === 'essay' ? 'inşosi (Essay)' : 'xati (Letter)'} matnini xolis, professional va o'ta aniq tahlil qiliş.
Mavzu: "${params.topicTitle}".
Topşiriq yöriqnomasi: "${params.topicPrompt || ''}".
Kutilgan minimal sözlar: ${params.minWords || 120}.
O'rganilayotgan til kodi: "${params.targetLanguage || 'en'}".
Tahlil tili: O'zbek tili (qat'iy isloh qilingan lotin alifbosi: 'Ş ş', 'Ç ç', 'Ğ ğ', 'Ö ö' harflaridan foydalaning, heç qaçon 'sh', 'ch', 'o\'', 'g\'' yozmang!).

QAT'IY QOIDALAR - JANR VA MATN TEKŞIRUVI:
1. Agar topşiriq ${params.taskType === 'essay' ? 'Inşo (Essay)' : 'Xat (Letter)'} bölsa:
   - Agar inşoga xat kiritilgan bölsa ("Dear...", "Yours sincerely", "Yours faithfully", "Best regards" kabi salomlaşiş yoki yakunlovçi imzolar bölsa): bu o'ta jiddiy janr xatosidir! "taskAchievementScore" ni 20-30 dan oşirmang, umumiy ball 45 dan oşmasin va corrections röyxatida 1-örinda "Janr nomuvofiqligi (Genre Mismatch): Inşo örniga xat formati kiritilgan" deb aniq körsating!
   - Agar xat topshirig'ida salomlaşiş yoki imzo unutilgan bölsa, xat strukturasi buzilganligini ko'rsating.
2. Har bir aniq xatoni talaba matnidagi haqiqiy jumlani (originalSnippet) keltirgan holda körsating. Heç qaçon matnda yöq umumiy narsalarni to'qimang!

Baholash mezonlari:
1. Task Achievement / Fulfillment (Mavzu va janr qançalik to'liq yoritilgan, 0-100)
2. Coherence & Cohesion (Fikrlar ketma-ketligi, mantiq, 0-100)
3. Lexical Resource (Lug'at boyligi, 0-100)
4. Grammatical Range & Accuracy (Grammatik to'g'rilik, 0-100)
5. Umumiy ball (0-100) va CEFR darajasi (masalan: "A2 (Elementary)", "B1 (Intermediate)", "B2 (Upper-Intermediate)", "C1 (Advanced)").

Javobni FAQAT quyidagi JSON formatida qaytaring:
{
  "cefrScore": "B2 (Upper-Intermediate)",
  "overallScore": 86,
  "grammarScore": 84,
  "lexicalScore": 88,
  "coherenceScore": 87,
  "taskAchievementScore": 85,
  "corrections": [
    {
      "issue": "Xato nomi",
      "originalSnippet": "talaba matnidagi aniq jumla",
      "correction": "to'g'rilangan variant",
      "advice": "Tushunarli o'zbekcha izoh (Ş, Ç, Ğ, Ö lotinida)"
    }
  ],
  "positivePoints": [
    "Matndagi 2-3 ta kuchli tomon o'zbekcha"
  ],
  "recommendations": [
    "Natijani oshirish uchun 2-3 ta aniq amaliy maslahat"
  ]
}

Talaba topshirgan matn:
"""
${params.text}
"""`;

      const directRes = await fetch(directUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json'
          }
        })
      });

      if (directRes.ok) {
        const directData = await directRes.json();
        const raw = directData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
        const parsed = JSON.parse(cleanJsonString(raw));
        return {
          ...parsed,
          isLiveAi: true,
          providerModel: `Google Gemini (${model})`
        };
      }
    } catch (e) {
      console.error('Direct Gemini writing call failed:', e);
    }
  }

  // 3. Dynamic Heuristic Analysis (When offline or no API key is set)
  return analyzeWritingDynamically(params.text, params.taskType, params.topicTitle, params.minWords || 120);
}

/**
 * Intelligent Dynamic Heuristic Analyzer for Writing
 * Inspects real user text for genre mismatch, actual errors, word length, and cohesion.
 */
function analyzeWritingDynamically(
  text: string,
  taskType: 'essay' | 'letter',
  topicTitle: string,
  minWords: number
): WritingEvaluationResult {
  const clean = text.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Detect Letter Patterns in Essay (Genre Mismatch)
  const hasLetterGreeting = /^(dear\s|hi\s|hello\s|to\s+whom\s+it\s+may\s+concern)/i.test(clean) ||
    /(\n|^)\s*(dear\s+[a-z]+|dear\s+sir|dear\s+madam|dear\s+mr|dear\s+mrs)/i.test(clean);
  const hasLetterSignoff = /(yours\s+sincerely|yours\s+faithfully|best\s+regards|warm\s+regards|with\s+love|sincerely,)/i.test(clean);
  const mentionsLetter = /i\s+am\s+writing\s+this\s+letter/i.test(clean);

  const isLetterInEssay = taskType === 'essay' && (hasLetterGreeting || hasLetterSignoff || mentionsLetter);
  const isMissingLetterStructure = taskType === 'letter' && (!hasLetterGreeting || !hasLetterSignoff);

  // 2. Scan text for genuine issues
  const corrections: WritingCorrection[] = [];

  if (isLetterInEssay) {
    let snippet = 'Dear... / Yours sincerely...';
    const matchGreeting = clean.match(/^(dear\s+[^\n,]+)/i);
    const matchSignoff = clean.match(/(yours\s+sincerely[^\n]*|best\s+regards[^\n]*|sincerely[^\n]*)/i);
    if (matchGreeting) snippet = matchGreeting[0];
    else if (matchSignoff) snippet = matchSignoff[0];

    corrections.push({
      issue: 'Janr nomuvofiqligi (Genre Mismatch)',
      originalSnippet: snippet,
      correction: 'Akademik insho (Introduction, Body Paragraphs, Conclusion)',
      advice: 'Siz Insho (Essay) topshirig‘iga Xat (Letter) formatidagi matn kiritgansiz! Inshoda "Dear...", "Yours sincerely" kabi murojaat va imzolar ishlatilmaydi. Insho kirish (fikr tezisi), 2 ta asosiy dalillar qismi va umumlashtiruvchi xulosadan iborat bo‘lishi shart.'
    });
  }

  if (isMissingLetterStructure) {
    corrections.push({
      issue: 'Xat strukturasi to‘liq emas (Letter Format Incomplete)',
      originalSnippet: words.slice(0, 4).join(' '),
      correction: 'Dear Sir/Madam / Dear [Name] ... Yours sincerely',
      advice: 'Xat (Letter) yozishda rasmiy/do‘stona salomlashish ("Dear ...") va xat yakunida mos imzo ("Yours sincerely" yoki "Best regards") bo‘lishi talab etiladi.'
    });
  }

  // Scan for lowercase "i"
  const lowercaseIMatch = clean.match(/\b(i)\b(?!\.)/);
  if (lowercaseIMatch) {
    corrections.push({
      issue: 'Katta harf qoidasi (Capitalization of "I")',
      originalSnippet: '... i ...',
      correction: 'I (Katta "I" harfi)',
      advice: 'Ingliz tilida birinchi shaxs olmoshi "I" (men) gapning istalgan joyida doimo katta harf bilan yoziladi.'
    });
  }

  // Scan for missing apostrophes in contractions
  const contractionMatch = clean.match(/\b(dont|cant|wont|isnt|arent|didnt|couldnt|havent)\b/i);
  if (contractionMatch) {
    const raw = contractionMatch[0];
    const fixed = raw.toLowerCase() === 'dont' ? "don't" :
      raw.toLowerCase() === 'cant' ? "can't" :
      raw.toLowerCase() === 'wont' ? "won't" :
      raw.toLowerCase() === 'isnt' ? "isn't" : `${raw.slice(0, -2)}'t`;

    corrections.push({
      issue: 'Apostrof tushirib qoldirilgan (Contraction punctuation)',
      originalSnippet: raw,
      correction: fixed,
      advice: `Qisqartma fe’llarda inkor qo‘shimchasini tutuq belgisi (apostrof) bilan yozish lozim: "${fixed}". Akademik inshoda esa qisqartirmasdan to‘liq yozish tavsiya etiladi.`
    });
  }

  // Scan for informal spoken words in essays
  if (taskType === 'essay') {
    const informalMatch = clean.match(/\b(gonna|wanna|kinda|cuz|yeah|dunno)\b/i);
    if (informalMatch) {
      corrections.push({
        issue: 'So‘zlashuv uslubi (Informal Spoken Words in Essay)',
        originalSnippet: informalMatch[0],
        correction: informalMatch[0].toLowerCase() === 'gonna' ? 'going to' : 'want to',
        advice: 'Insho (Essay) rasmiy akademik yozuv turidir. So‘zlashuvga oid norasmiy so‘zlar o‘rniga to‘liq akademik shakllardan foydalaning.'
      });
    }
  }

  // If no specific errors found, scan for repetitive simple connectors
  if (corrections.length === 0) {
    const simpleAndSo = clean.match(/\b(and|but|so)\b/gi);
    if (simpleAndSo && simpleAndSo.length > 5) {
      corrections.push({
        issue: 'Bog‘lovchilar xilma-xilligi (Linking Devices Variety)',
        originalSnippet: 'and, but, so (takroriy qo‘llangan)',
        correction: 'Furthermore, However, Consequently, In addition',
        advice: 'Matnda sodda bog‘lovchilar tez-tez takrorlangan. Fikrlar mantiqiy bog‘lanishini kuchaytirish uchun akademik bog‘lovchilardan kengroq foydalaning.'
      });
    }
  }

  // 3. Dynamic Score Calculation
  let taskScore = 82;
  let overallScore = 80;
  let grammarScore = 82;
  let lexicalScore = 80;
  let coherenceScore = 80;

  if (isLetterInEssay) {
    taskScore = 28;
    overallScore = 42;
    coherenceScore = 55;
    grammarScore = Math.min(85, Math.max(60, Math.round(75 + (wordCount / minWords) * 10)));
    lexicalScore = 68;
  } else {
    // Length penalty/bonus
    const lengthRatio = wordCount / minWords;
    if (lengthRatio < 0.8) {
      taskScore = Math.max(45, Math.round(70 * lengthRatio));
      overallScore = Math.max(50, Math.round(72 * lengthRatio));
    } else if (lengthRatio >= 1.0) {
      taskScore = Math.min(94, Math.round(82 + (lengthRatio - 1) * 10));
      overallScore = Math.min(92, Math.round(80 + (lengthRatio - 1) * 8));
    }
    grammarScore = Math.max(60, 84 - corrections.length * 4);
    lexicalScore = Math.min(90, Math.max(68, 76 + Math.round(wordCount / 25)));
    coherenceScore = Math.min(92, Math.max(65, 78 + (clean.includes('\n\n') ? 6 : -4)));
  }

  const cefrScore = overallScore >= 88 ? 'C1 (Advanced)' :
    overallScore >= 75 ? 'B2 (Upper-Intermediate)' :
    overallScore >= 60 ? 'B1 (Intermediate)' : 'A2 (Elementary)';

  const positivePoints = isLetterInEssay
    ? [
        `Kiritilgan matn hajmi: ${wordCount} ta so‘z (hajm talabiga mos).`,
        'Gap tuzilishi va fikrlarning umumiy ketma-ketligi ravon shakllantirilgan.'
      ]
    : [
        `Mavzu talabi: ${wordCount} ta so‘z yozildi (Minimal talab: ${minWords} ta so‘z).`,
        'Xatboshilar va fikrlar mantiqiy reja asosida bayon qilingan.',
        'Mavzu mohiyati qamrab olingan va fikr ifodalashga harakat qilingan.'
      ];

  const recommendations = isLetterInEssay
    ? [
        '⚠️ Insho topshirig‘iga xat shaklidagi matn kiritmang. "Dear..." va "Yours sincerely" imzolarini olib tashlang.',
        'Inshoni 4 ta asosiy xatboshiga ajrating: 1) Kirish, 2) Birinchi dalil, 3) Ikkinchi dalil, 4) Xulosa.',
        '💡 Eslatma: To‘liq va jonli Google Gemini 2.0 AI tekshiruvini yoqish uchun yuqoridagi API kalit maydoniga kalitingizni kiriting.'
      ]
    : [
        'Murakkab ergashtiruvchi bog‘lovchilar (Although, Whereas, In spite of) orqali gaplarni boyiting.',
        'Har bir asosiy argumentni hayotiy misol yoki dalillar bilan tasdiqlang.',
        '💡 Eslatma: To‘liq va jonli Google Gemini 2.0 AI tekshiruvini yoqish uchun yuqoridagi API kalit maydoniga kalitingizni kiriting.'
      ];

  return {
    cefrScore,
    overallScore,
    grammarScore,
    lexicalScore,
    coherenceScore,
    taskAchievementScore: taskScore,
    corrections,
    positivePoints,
    recommendations,
    isLiveAi: false,
    genreMismatch: isLetterInEssay,
    providerModel: 'Evristik Matn Analizatori'
  };
}

/**
 * Real AI evaluation for Speaking (Q&A & Image Description)
 * Includes immediate silence / no-speech detection guard!
 */
export async function evaluateSpeakingWithGemini(params: {
  spokenText: string;
  question: string;
  part: 'part1' | 'part2';
  topicTitle?: string;
  targetLanguage?: string;
  lang?: string;
}): Promise<SpeakingEvaluationResult> {
  const cleanSpoken = (params.spokenText || '').trim();
  const words = cleanSpoken.split(/\s+/).filter(w => w.length > 1 &&
    !w.startsWith('Audioni') && !w.startsWith('Javob') && !w.startsWith('Rasm') && !w.startsWith('Tasvir'));

  // 1. SILENCE GUARD: If user said nothing or only audio stub, abort with 0 score!
  if (!cleanSpoken || words.length < 2) {
    return {
      score: 0,
      cefrLevel: 'Aniqlanmadi',
      fluencyScore: 0,
      vocabularyScore: 0,
      grammarScore: 0,
      pronunciationFeedback: 'Ovoz signali aniqlanmadi. Iltimos, mikrofoningiz yoqilganligini tekşiring va savolga ingliz tilida ovozli javob bering.',
      feedback: 'Nutq aniqlanmadi. Siz heç narsa gapirmadingiz yoki mikrofon ovozni qabul qilmadi.',
      improvements: [
        'Mikrofon sozlamalari va brauzer audio ruxsatini tekşiring.',
        'Savolga balandroq va ravon ovozda ingliz tilida javob berişga harakat qiling.'
      ],
      isLiveAi: false,
      isSilence: true,
      providerModel: 'Nutq Detektori'
    };
  }

  const config = getStoredAiConfig();
  const apiKey = config.apiKey.trim();
  const model = config.model || 'gemini-2.0-flash';

  const payload = {
    spokenText: cleanSpoken,
    question: params.question,
    part: params.part,
    topicTitle: params.topicTitle || '',
    targetLanguage: params.targetLanguage || 'en',
    lang: params.lang || 'uz'
  };

  // 2. Try serverless backend
  try {
    const res = await fetch('/api/ai/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'evaluate-speaking',
        payload,
        apiKey: apiKey || undefined,
        model
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.evaluation) {
        return {
          ...data.evaluation,
          isLiveAi: true,
          providerModel: `Google Gemini (${model})`
        };
      }
    }
  } catch {
    // fallback
  }

  // 3. Direct client call to Gemini REST API if apiKey exists
  if (apiKey) {
    try {
      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const prompt = `Siz xalqaro darajadagi malakali Speaking (Gapirish) imtihonçisisiz (CEFR & IELTS Speaking).
Vazifangiz: Talabaning ${params.part === 'part1' ? 'berilgan savolga og\'zaki javobini' : 'rasmni tasvirlab bergan javobini'} xolis va chuqur baholash.
${params.part === 'part1' ? `Berilgan savol: "${params.question}"` : `Tasvirlangan rasm mavzusi: "${params.topicTitle || ''}". Savol: "${params.question}"`}
O'rganilayotgan til kodi: "${params.targetLanguage || 'en'}".
Tahlil tili: O'zbek tili (qat'iy isloh qilingan lotin alifbosi: 'Ş ş', 'Ç ç', 'Ğ ğ', 'Ö ö' harflaridan foydalaning, heç qaçon 'sh', 'ch', 'o\'', 'g\'' yozmang!).

Baholash mezonlari:
1. Fluency & Coherence (0-100)
2. Lexical Resource (0-100)
3. Grammatical Range & Accuracy (0-100)
4. Umumiy ball (0-100) va CEFR darajasi (A1, A2, B1, B2, C1, C2)
5. Talaffuz va sur'at tavsiyasi (Pronunciation feedback)
6. Xulosa va 2 ta amaliy maslahat.

Javobni FAQAT quyidagi JSON formatida qaytaring:
{
  "score": 85,
  "cefrLevel": "B2",
  "fluencyScore": 84,
  "vocabularyScore": 88,
  "grammarScore": 83,
  "pronunciationFeedback": "Talaffuz va urg'u bo'yicha maslahat (Ş, Ç, Ğ, Ö harflarida)",
  "feedback": "Javobning qisqacha xolis xulosasi",
  "improvements": [
    "1-maslahat",
    "2-maslahat"
  ]
}

Talaba nutqining transkripsiyasi:
"""
${cleanSpoken}
"""`;

      const directRes = await fetch(directUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1500,
            responseMimeType: 'application/json'
          }
        })
      });

      if (directRes.ok) {
        const directData = await directRes.json();
        const raw = directData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
        const parsed = JSON.parse(cleanJsonString(raw));
        return {
          ...parsed,
          isLiveAi: true,
          providerModel: `Google Gemini (${model})`
        };
      }
    } catch (e) {
      console.error('Direct Gemini speaking call failed:', e);
    }
  }

  // 4. Dynamic Heuristic Speaking Evaluation
  const wordCount = words.length;
  const score = Math.max(50, Math.min(94, Math.round(62 + wordCount * 2.2)));
  const cefrLevel = score >= 88 ? 'C1' : score >= 78 ? 'B2' : score >= 65 ? 'B1' : 'A2';

  return {
    score,
    cefrLevel,
    fluencyScore: Math.min(95, score + 2),
    vocabularyScore: Math.max(60, score - 3),
    grammarScore: score,
    pronunciationFeedback: 'Ovoz intonatsiyasi va urg‘ular tushunarli. So‘zlar orasidagi to‘xtalishlarni qisqartirish orqali nutq ravonligini oshiring.',
    feedback: `Nutq qabul qilindi (${wordCount} ta so‘z). Fikr bildirishga intilish yaxshi, nutq sur’atini barqaror saqlang.`,
    improvements: [
      'Nutq boshida o‘ylanishlarni kamaytirish uchun "Well...", "In my view..." kabi kirish iboralaridan foydalaning.',
      'Yangi so‘zlarni gap kontekstida ovoz chiqarib qaytarish talaffuzni mustahkamlaydi.'
    ],
    isLiveAi: false,
    providerModel: 'Evristik Nutq Analizatori'
  };
}

/**
 * Real AI evaluation for Shadowing (Comparing spoken text against reference audio sentence)
 */
export async function evaluateShadowingWithGemini(params: {
  referenceText: string;
  spokenText: string;
  targetLanguage?: string;
  lang?: string;
}): Promise<ShadowingEvaluationResult> {
  const cleanSpoken = (params.spokenText || '').trim();
  const cleanRef = (params.referenceText || '').trim();

  // Silence Guard
  if (!cleanSpoken || cleanSpoken.split(/\s+/).filter(Boolean).length === 0) {
    return {
      score: 0,
      accuracyScore: 0,
      fluencyScore: 0,
      feedback: 'Ovoz aniqlanmadi. Siz heç narsa gapirmadingiz yoki audio qabul qilinmadi.',
      pronunciationAdvice: 'Iltimos, namunaviy audio jumlani tinglab, mikrofonga qayta ovoz chiqarib takrorlang.',
      omittedWords: cleanRef.split(/\s+/).filter(Boolean),
      isSilence: true,
      isLiveAi: false,
      providerModel: 'Nutq Detektori'
    };
  }

  const config = getStoredAiConfig();
  const apiKey = config.apiKey.trim();
  const model = config.model || 'gemini-2.0-flash';

  const payload = {
    referenceText: cleanRef,
    spokenText: cleanSpoken,
    targetLanguage: params.targetLanguage || 'en',
    lang: params.lang || 'uz'
  };

  // 1. Try serverless endpoint
  try {
    const res = await fetch('/api/ai/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'evaluate-shadowing',
        payload,
        apiKey: apiKey || undefined,
        model
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.evaluation) {
        return {
          ...data.evaluation,
          isLiveAi: true,
          providerModel: `Google Gemini (${model})`
        };
      }
    }
  } catch {
    // fallback
  }

  // 2. Direct client call to Gemini REST API if apiKey exists
  if (apiKey) {
    try {
      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const prompt = `Siz xalqaro darajadagi fonetika va talaffuz bo'yicha repetitorsiz (Shadowing va Nutq tahlili bo'yicha mutaxassis).
Vazifangiz: Talabaning namunaviy audio matnga taqlid qilib (Shadowing metodi) aytgan nutqini berilgan asl matn bilan solishtirish va talaffuz aniqligini baholash.
Asl namunaviy matn (Reference text): "${cleanRef}".
Talaba aytgan nutq transkripsiyasi (Spoken transcript): "${cleanSpoken}".
Tahlil tili: O'zbek tili (qat'iy isloh qilingan lotin alifbosi: 'Ş ş', 'Ç ç', 'Ğ ğ', 'Ö ö' harflaridan foydalaning, hech qachon 'sh', 'ch', 'o'', 'g'' yozmang!).

Baholash mezonlari:
1. score (0-100): Asl matn bilan moslik darajasi.
2. accuracyScore (0-100): Fonetik va leksik aniqlik.
3. fluencyScore (0-100): Nutq sur'ati va intonatsiya.
4. feedback: Qisqa va rag'batlantiruvchi xulosa (Ş, Ç, Ğ, Ö lotinida).
5. pronunciationAdvice: Urg'u, intonatsiya va qaysi so'zlarni qayta mashq qilish kerakligi haqida amaliy maslahat.
6. omittedWords: Tushirib qoldirilgan yoki noaniq aytilgan so'zlar ro'yxati.

Javobni FAQAT quyidagi JSON formatida qaytaring:
{
  "score": 88,
  "accuracyScore": 86,
  "fluencyScore": 90,
  "feedback": "Juda yaxshi natija! Talaffuz sur'ati va intonatsiya namunaga yaqin.",
  "pronunciationAdvice": "Urg'uni to'g'ri qo'yishga va so'zlar orasidagi bog'lanishga (linking sounds) e'tibor qarating.",
  "omittedWords": []
}`;

      const directRes = await fetch(directUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000,
            responseMimeType: 'application/json'
          }
        })
      });

      if (directRes.ok) {
        const directData = await directRes.json();
        const raw = directData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
        const parsed = JSON.parse(cleanJsonString(raw));
        return {
          ...parsed,
          isLiveAi: true,
          providerModel: `Google Gemini (${model})`
        };
      }
    } catch (e) {
      console.error('Direct Gemini shadowing call failed:', e);
    }
  }

  // 3. Dynamic Levenshtein / Word Comparison Fallback
  const refWords = cleanRef.toLowerCase().replace(/[.,:;!?]/g, '').split(/\s+/).filter(Boolean);
  const spokenWords = cleanSpoken.toLowerCase().replace(/[.,:;!?]/g, '').split(/\s+/).filter(Boolean);

  let matched = 0;
  const omitted: string[] = [];

  for (const rw of refWords) {
    if (spokenWords.some(sw => sw === rw || sw.includes(rw) || rw.includes(sw))) {
      matched++;
    } else {
      omitted.push(rw);
    }
  }

  const matchRatio = refWords.length > 0 ? matched / refWords.length : 0;
  const score = Math.round(matchRatio * 100);

  return {
    score,
    accuracyScore: Math.min(100, Math.round(score * 0.95 + 5)),
    fluencyScore: Math.min(100, Math.round(score * 0.9 + 10)),
    feedback: score >= 80
      ? 'Ajoyib natija! Namunaviy nutq bilan moslik yuqori darajada.'
      : score >= 50
      ? 'Yaxshi urinish, biroq ayrim so‘zlar tushirib qoldirildi yoki noaniq talaffuz qilindi.'
      : 'Moslik darajasi past. Namunani yana 1-2 marta tinglab, qayta takrorlang.',
    pronunciationAdvice: omitted.length > 0
      ? `Quyidagi so‘zlar talaffuziga alohida e’tibor bering: "${omitted.slice(0, 3).join(', ')}".`
      : 'Barcha so‘zlar to‘g‘ri ifodalandi. Urg‘u va ritmni audio bilan sinxronlashtirishda davom eting.',
    omittedWords: omitted,
    isSilence: false,
    isLiveAi: false,
    providerModel: 'Evristik Fonetik Taqqoslagich'
  };
}

/**
 * Interactive Q&A with AI Tutor about the student's submission
 */
export async function askAiAboutSubmission(params: {
  text: string;
  question: string;
  topicTitle?: string;
  taskType?: string;
  lang?: string;
}): Promise<string> {
  const config = getStoredAiConfig();
  const apiKey = config.apiKey.trim();
  const model = config.model || 'gemini-2.0-flash';

  const tutorContext = `Talabaning yozgan matni:\n"""\n${params.text}\n"""\nMavzu: "${params.topicTitle || 'Yozma vazifa'}". Topshiriq turi: ${params.taskType || 'Writing'}.`;

  // 1. Try serverless backend
  try {
    const res = await fetch('/api/ai/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ask-tutor',
        payload: {
          prompt: params.question,
          context: tutorContext
        },
        apiKey: apiKey || undefined,
        model
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.answer) return data.answer;
    }
  } catch {
    // fallback
  }

  // 2. Direct client call to Gemini REST API if apiKey exists
  if (apiKey) {
    try {
      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const prompt = `Siz "TILŞUNOS" platformasining tajribali, do'stona va professional til repetitorisiz.
O'quvchi o'z inshosi yoki xati bo'yicha savol bermoqda. Unga samimiy, tushunarli, aniq misollar bilan o'zbek tilida (qat'iy isloh qilingan lotin alifbosi: 'Ş ş', 'Ç ç', 'Ğ ğ', 'Ö ö') javob bering.

${tutorContext}

O'quvchining savoli: "${params.question}"`;

      const directRes = await fetch(directUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1200
          }
        })
      });

      if (directRes.ok) {
        const directData = await directRes.json();
        return directData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Javob olindi.';
      }
    } catch (e) {
      console.error('Direct Gemini tutor call failed:', e);
    }
  }

  // 3. Smart offline tutor reply
  const q = params.question.toLowerCase();
  if (q.includes('band 8') || q.includes('ball') || q.includes('natija')) {
    return `Inshoni Band 8 darajasiga ko‘tarish uchun 3 ta asosiy qoidaga amal qiling:\n1. Mavzuni chuqur va aniq yoriting (har bir fikrga aniq hayotiy misol yoki sabab keltiring).\n2. Murakkab sintaktik tuzilmalardan (Inversion, Conditional sentences, Passive voice) tabiiy foydalaning.\n3. Oddiy so‘zlar o‘rniga aniq kollokatsiyalarni (masalan: "make a problem" emas, "exacerbate a challenge") qo‘llang.`;
  }
  if (q.includes('xato') || q.includes('kamchilik')) {
    return `Sizning yozishingizdagi asosiy e’tibor qaratilishi kerak bo‘lgan jihat — fikrlar ketma-ketligi va so‘zlarning kontekstga mosligidir. Har bir xatboshini bitta asosiy mavzu g‘oyasi bilan boshlang va uni ikkinchi darajali dalillar bilan rivojlantiring.`;
  }
  if (q.includes('kirish') || q.includes('introduction')) {
    return `A’lo darajadagi kirish (Introduction) 2 qismdan iborat bo‘lishi lozim:\n1. Paraphrase: Berilgan mavzu savolini o‘z so‘zlaringiz va sinonimlar bilan qayta bayon qiling.\n2. Thesis Statement: Inshoda qanday fikr ilgari surilishi haqida 1 ta aniq yakunlovchi jumla bering.`;
  }

  return `Savolingiz uchun rahmat! Yozma nutqingizda ravonlikni oshirish uchun mavzu doirasidagi asosiy fikrlarni 3 qismga (Kirish, Asosiy qism va Xulosa) ajratib, har birida kamida 2 tadan akademik bog‘lovchidan foydalanishni tavsiya qilaman. To‘liq jonli AI maslahatlari uchun yuqorida Gemini API kalitini kiriting.`;
}

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}
