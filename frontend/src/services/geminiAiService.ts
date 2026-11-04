// Google Gemini AI Service for TILŞUNOS Platform
// Provides Real-time AI evaluation for Writing (Essays & Letters) and Speaking (Q&A & Image Description)

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

export function getStoredAiConfig(): GeminiAiConfig {
  if (typeof window === 'undefined') return DEFAULT_AI_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_AI_CONFIG, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_AI_CONFIG;
}

export function saveStoredAiConfig(cfg: Partial<GeminiAiConfig>): GeminiAiConfig {
  const current = getStoredAiConfig();
  const updated: GeminiAiConfig = { ...current, ...cfg };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save AI config to localStorage:', e);
    }
  }
  return updated;
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
}

export interface SpeakingEvaluationResult {
  score: number; // 0-100
  cefrLevel: string; // "A1", "A2", "B1", "B2", "C1", "C2"
  fluencyScore: number; // 0-100
  vocabularyScore: number; // 0-100
  grammarScore: number; // 0-100
  pronunciationFeedback: string;
  feedback: string;
  improvements: string[];
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
    // If serverless is not reachable (e.g. running vite preview/static), fallback to direct client call
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
      const prompt = `Siz xalqaro darajadagi tajribali til imtihonchisisiz (CEFR & IELTS Writing baholovchisi).
Vazifangiz: Talabaning ${params.taskType === 'essay' ? 'inshosi (Essay)' : 'xati (Letter)'} matnini xolis, professional va o'ta aniq tahlil qilish.
Mavzu: "${params.topicTitle}".
Topshiriq yo'riqnomasi: "${params.topicPrompt || ''}".
Kutilgan minimal so'zlar: ${params.minWords || 120}.
O'rganilayotgan til kodi: "${params.targetLanguage || 'en'}".
Tahlil tili: O'zbek tili (qat'iy isloh qilingan lotin alifbosi: 'Ş ş', 'Ç ç', 'Ğ ğ', 'Ö ö' harflaridan foydalaning, hech qachon 'sh', 'ch', 'o'', 'g'' yozmang!).

Baholash mezonlari:
1. Task Achievement / Fulfillment (0-100)
2. Coherence & Cohesion (0-100)
3. Lexical Resource (0-100)
4. Grammatical Range & Accuracy (0-100)
5. Umumiy ball (0-100) va CEFR darajasi (masalan: "B2 (Upper-Intermediate)").

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
      "issue": "Xato turi (masalan: Noto'g'ri zamon ishlatilgan)",
      "originalSnippet": "talabaning matnidagi xato jumla",
      "correction": "to'g'rilangan jumla",
      "advice": "Tushunarli o'zbekcha izoh (Ş, Ç, Ğ, Ö lotinida)"
    }
  ],
  "positivePoints": [
    "Matndagi 2-3 ta kuchli tomonlar o'zbekcha"
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

  // 3. Smart Heuristic Fallback (When no API key is configured or offline)
  const wordCount = params.text.trim().split(/\s+/).filter(Boolean).length;
  const targetMin = params.minWords || 120;
  const ratio = Math.min(1.2, wordCount / targetMin);
  const baseScore = Math.min(95, Math.max(68, Math.round(78 * ratio + Math.random() * 6)));

  return {
    cefrScore: baseScore >= 88 ? 'C1 (Advanced)' : baseScore >= 78 ? 'B2 (Upper-Intermediate)' : 'B1 (Intermediate)',
    overallScore: baseScore,
    grammarScore: Math.min(96, baseScore + 2),
    lexicalScore: Math.max(65, baseScore - 3),
    coherenceScore: baseScore,
    taskAchievementScore: wordCount >= targetMin ? Math.min(94, baseScore + 4) : Math.max(60, baseScore - 12),
    corrections: [
      {
        issue: 'Boğlovçilar boyligi (Linking words)',
        originalSnippet: 'and... but... so...',
        correction: 'Furthermore, In contrast, Consequently, However',
        advice: 'Matnni akademik darajaga olib chiqiş uçun sodda bog‘lovçilar o‘rniga murakkabroq vositalardan kengroq foydalaning.'
      },
      {
        issue: 'Akademik leksika va kollokatsiyalar',
        originalSnippet: 'good impact / big problem',
        correction: 'significant influence / pressing challenge',
        advice: 'Oddiy sifatlar o‘rniga kontekstga mos ilg‘or akademik sinonimlarni qo‘llang.'
      }
    ],
    positivePoints: [
      'Fikrlar mantiqiy reja va xatboshilar böyicha aniq tizimlashtirilgan.',
      'Kirish, asosiy dalillar va yakuniy xulosa strukturasiga amal qilingan.',
      'Mavzu mohiyati tushunilgan va talab etilgan yo‘nalishda bayon etilgan.'
    ],
    recommendations: [
      'Murakkab ergaş gaplarda zamonlar moslaşuvi (Sequence of Tenses) qoidalariga yanada e’tibor bering.',
      'Har bir asosiy fikrni hayotiy misol yoki dalil bilan mustahkamlash insho nufuzini oşiradi.',
      '💡 Eslatma: Haqiqiy Google Gemini 2.0 AI jonli tekshiruvini faollashtirish uchun Admin panelda API kalitingizni kiriting.'
    ],
    isLiveAi: false,
    providerModel: 'Aqlli Evristik Tahlilchi (Simulyatsiya)'
  };
}

/**
 * Real AI evaluation for Speaking (Q&A & Image Description)
 */
export async function evaluateSpeakingWithGemini(params: {
  spokenText: string;
  question: string;
  part: 'part1' | 'part2';
  topicTitle?: string;
  targetLanguage?: string;
  lang?: string;
}): Promise<SpeakingEvaluationResult> {
  const config = getStoredAiConfig();
  const apiKey = config.apiKey.trim();
  const model = config.model || 'gemini-2.0-flash';

  const payload = {
    spokenText: params.spokenText,
    question: params.question,
    part: params.part,
    topicTitle: params.topicTitle || '',
    targetLanguage: params.targetLanguage || 'en',
    lang: params.lang || 'uz'
  };

  // 1. Try serverless endpoint first
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
    // serverless not available
  }

  // 2. Direct client call to Gemini REST API if apiKey exists
  if (apiKey) {
    try {
      const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const prompt = `Siz xalqaro darajadagi malakali Speaking (Gapirish) imtihonchisisiz (CEFR & IELTS Speaking).
Vazifangiz: Talabaning ${params.part === 'part1' ? 'berilgan savolga og\'zaki javobini' : 'rasmni tasvirlab bergan javobini'} xolis va chuqur baholash.
${params.part === 'part1' ? `Berilgan savol: "${params.question}"` : `Tasvirlangan rasm mavzusi: "${params.topicTitle || ''}". Yo'riqnoma: "${params.question}"`}
O'rganilayotgan til kodi: "${params.targetLanguage || 'en'}".
Tahlil tili: O'zbek tili (qat'iy isloh qilingan lotin alifbosi: 'Ş ş', 'Ç ç', 'Ğ ğ', 'Ö ö' harflaridan foydalaning, hech qachon 'sh', 'ch', 'o'', 'g'' yozmang!).

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
  "pronunciationFeedback": "Talaffuz, intonatsiya va pauzalar haqida o'zbekcha professional maslahat (Ş, Ç, Ğ, Ö harflarida)",
  "feedback": "Javobning qisqacha xolis xulosasi",
  "improvements": [
    "Talaffuz yoki ravonlikni oshirish uchun 1-maslahat",
    "Lug'at boyligini kengaytirish uchun 2-maslahat"
  ]
}

Talaba nutqining transkripsiyasi:
"""
${params.spokenText}
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

  // 3. Heuristic Fallback
  const len = params.spokenText.trim().split(/\s+/).length;
  const score = Math.max(72, Math.min(94, Math.round(75 + len * 0.8)));

  return {
    score,
    cefrLevel: score >= 88 ? 'C1' : score >= 80 ? 'B2' : 'B1',
    fluencyScore: Math.min(96, score + 2),
    vocabularyScore: Math.max(70, score - 2),
    grammarScore: score,
    pronunciationFeedback: 'Tabiiy intonatsiya va fonetik talaffuz me’yorlariga amal qilindi. Ovoz sur’atidagi pauzalarni kamaytirish tavsiya etiladi.',
    feedback: score >= 85
      ? 'Ajoyib ravonlik, berilgan topshiriqqa to‘liq javob va o‘rinli qo‘llangan leksika!'
      : 'Yaxshi muloqot, biroq fikrni kengroq yoritish va qo‘shma gaplardan faolroq foydalanish tavsiya etiladi.',
    improvements: [
      'Nutq boshlanishida ikkilanishlarni qisqartirish uchun qolip iboralardan (filler phrases) to‘g‘ri foydalaning.',
      'Yangi so‘zlarni gap kontekstida ovoz chiqarib takrorlash intonatsiyani mustahkamlaydi.'
    ],
    isLiveAi: false,
    providerModel: 'Aqlli Evristik Tahlilchi (Simulyatsiya)'
  };
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
