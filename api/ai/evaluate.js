// Vercel Serverless Function: Google Gemini AI Evaluation API
// Supports Writing Evaluation, Speaking Evaluation, AI Tutor, and Connection Testing

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (err) {
        body = {};
      }
    }
    body = body || {};

    const { action, payload, apiKey: clientApiKey, model: clientModel } = body;

    // Resolve API Key: client provided > process.env.GEMINI_API_KEY
    const apiKey = clientApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return res.status(400).json({
        error: 'Gemini API kaliti topilmadi. Iltimos, Admin panelda API kalitingizni kiriting yoki server muhitiga GEMINI_API_KEY o\'zgaruvchisini qo\'shing.'
      });
    }

    const model = clientModel?.trim() || 'gemini-2.0-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    // 1. TEST CONNECTION
    if (action === 'test-connection') {
      const startTime = Date.now();
      const testPrompt = {
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Salom! Faqat bir dona so\'z bilan javob ber: "OK".' }]
          }
        ]
      };

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPrompt)
      });

      const latencyMs = Date.now() - startTime;
      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({
          success: false,
          error: `Gemini API xatosi (${response.status}): ${errText}`
        });
      }

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';

      return res.status(200).json({
        success: true,
        model,
        latencyMs,
        message: 'Google Gemini API bilan aloqa muvaffaqiyatli o\'rnatildi!',
        sampleResponse: reply
      });
    }

    // 2. WRITING EVALUATION
    if (action === 'evaluate-writing') {
      const {
        text,
        topicTitle = 'Writing Task',
        topicPrompt = '',
        taskType = 'essay', // 'essay' or 'letter'
        minWords = 120,
        targetLanguage = 'en',
        lang = 'uz'
      } = payload || {};

      if (!text || text.trim().length < 10) {
        return res.status(400).json({ error: 'Tekşiriş uçun matn juda qisqa.' });
      }

      const systemInstruction = `Siz xalqaro darajadagi tajribali til imtihonçisisiz (CEFR & IELTS Writing baholovçisi).
Vazifangiz: Talabaning ${taskType === 'essay' ? 'inşosi (Essay)' : 'xati (Letter)'} matnini xolis, professional va o'ta aniq tahlil qiliş.
Mavzu: "${topicTitle}".
Topşiriq yöriqnomasi: "${topicPrompt}".
Kutilgan minimal sözlar: ${minWords}.
O'rganilayotgan til kodi: "${targetLanguage}".
Tahlil tili: O'zbek tili (qat'iy isloh qilingan lotin alifbosi: 'Ş ş', 'Ç ç', 'Ğ ğ', 'Ö ö' harflaridan foydalaning, heç qaçon 'sh', 'ch', 'o\'', 'g\'' yozmang!).

QAT'IY QOIDA - JANR VA FORMAT TEKŞIRUVI:
1. Agar topşiriq turi 'essay' (Inşo) bölsa va talaba matnida xat elementlari (masalan: "Dear...", "Yours sincerely", "Yours faithfully", "Best regards", "I am writing this letter...") mavjud bölsa, bu o'ta jiddiy xatodir! Bunday holatda "taskAchievementScore" balini 20-30 atrofida qilib keskin pasaytiring, umumiy ball (overallScore) 45 dan oşmasin va corrections röyxatida 1-örinda "Janr nomuvofiqligi (Genre Mismatch): Inşo örniga xat kiritilgan" deb körsating!
2. Agar topşiriq turi 'letter' (Xat) bölsa va talaba salomlaşiş ("Dear...") yoki xatni yakunlovçi imzo ("Yours sincerely", "Best regards") yozmagan bölsa, xat strukturasi buzilganligini qayd etib, ballni pasaytiring.
3. Matndagi har bir aniq orfografik, grammatik yoki uslubiy xatoni talaba matnining özidan iqtibos (originalSnippet) keltirgan holda tahlil qiling. Heç qaçon umumiy yoki shablon gaplarni takrorlamang!

Baholash mezonlari:
1. Task Achievement / Fulfillment (Mavzu va janr qançalik töliq yoritilgan, 0-100)
2. Coherence & Cohesion (Fikrlar ketma-ketligi, boğlovçilar, mantiq, 0-100)
3. Lexical Resource (Lug'at boyligi, akademik va tabiiy sözlar, 0-100)
4. Grammatical Range & Accuracy (Grammatik qoidalar, zamonlar, xatolarsizlik, 0-100)
5. Umumiy ball (Overall Score: 0-100) va CEFR darajasi (masalan: "A2 (Elementary)", "B1 (Intermediate)", "B2 (Upper-Intermediate)", "C1 (Advanced)", "C2 (Mastery)").

Muhim: Javobni FAQAT va FAQAT quyidagi JSON formatida qaytaring, boşqa heç qanday söz yoki markdown formati qöşmang:
{
  "cefrScore": "B2 (Upper-Intermediate)",
  "overallScore": 86,
  "grammarScore": 84,
  "lexicalScore": 88,
  "coherenceScore": 87,
  "taskAchievementScore": 85,
  "corrections": [
    {
      "issue": "Xato nomi (masalan: Noto'ğri zamon işlatilgan)",
      "originalSnippet": "talabaning matnidagi xato ibora",
      "correction": "to'ğrilangan variant",
      "advice": "Nega bu xato ekanligi va to'ğri qoidasi haqida sodda o'zbekça izoh (Ş, Ç, Ğ, Ö lotinida)"
    }
  ],
  "positivePoints": [
    "Talabaning yozuvidagi 2-3 ta kuçli jihat o'zbekça",
    "Mavzu rejasiga to'ğri amal qilinganligi haqida fikr"
  ],
  "recommendations": [
    "Keyingi safar natijani oşiriş uçun 2-3 ta aniq amaliy maslahat",
    "Qaysi boğlovçi yoki grammatik mavzuni takrorlaş kerakligi"
  ]
}`;

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\nTalaba topshirgan matn:\n"""\n${text}\n"""`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      };

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({
          error: `Gemini API Writing baholashda xatolik yuz berdi (${response.status}): ${errText}`
        });
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
      const cleanJson = cleanJsonString(rawText);
      const parsed = JSON.parse(cleanJson);

      return res.status(200).json({
        success: true,
        evaluation: parsed
      });
    }

    // 3. SPEAKING EVALUATION
    if (action === 'evaluate-speaking') {
      const {
        spokenText,
        question = '',
        part = 'part1', // 'part1' (savollar) or 'part2' (rasm tasvirlash)
        topicTitle = '',
        targetLanguage = 'en',
        lang = 'uz'
      } = payload || {};

      const cleanSpoken = (spokenText || '').trim();
      const wordsCount = cleanSpoken.split(/\s+/).filter(w => w.length > 1).length;

      // Silence or no speech guard: Do not give random high score for silence!
      if (!cleanSpoken || wordsCount < 2) {
        return res.status(200).json({
          success: true,
          evaluation: {
            score: 0,
            cefrLevel: 'Aniqlanmadi',
            fluencyScore: 0,
            vocabularyScore: 0,
            grammarScore: 0,
            pronunciationFeedback: 'Ovoz signali aniqlanmadi. Iltimos, mikrofoningiz yoqilganligini tekşiring va savolga ingliz tilida ovozli javob bering.',
            feedback: 'Nutq aniqlanmadi. Siz heç narsa gapirmadingiz yoki mikrofon ovozni yozib olmadi.',
            improvements: [
              'Mikrofon sozlamalari va brauzer audio ruxsatlarini tekşiring.',
              'Qayta urinib, savolga balandroq va ravon ovozda ingliz tilida javob berişga harakat qiling.'
            ],
            isSilence: true
          }
        });
      }

      const systemInstruction = `Siz xalqaro darajadagi malakali Speaking (Gapirish) imtihonchisisiz (CEFR & IELTS Speaking).
Vazifangiz: Talabaning ${part === 'part1' ? 'berilgan savolga og\'zaki javobini' : 'rasmni tasvirlab bergan javobini'} xolis va chuqur baholash.
${part === 'part1' ? `Berilgan savol: "${question}"` : `Tasvirlangan rasm mavzusi: "${topicTitle}". Savol yo'riqnomasi: "${question}"`}
O'rganilayotgan til kodi: "${targetLanguage}".
Tahlil tili: O'zbek tili (qat'iy isloh qilingan lotin alifbosi: 'Ş ş', 'Ç ç', 'Ğ ğ', 'Ö ö' harflaridan foydalaning, hech qachon 'sh', 'ch', 'o'', 'g'' yozmang!).

Baholash mezonlari:
1. Fluency & Coherence (Gapirish ravonligi va mantiq, 0-100)
2. Lexical Resource (Mavzuga oid so'z boyligi, 0-100)
3. Grammatical Range & Accuracy (Grammatik to'g'rilik, 0-100)
4. Umumiy ball (0-100) va CEFR darajasi (A1, A2, B1, B2, C1, C2)
5. Talaffuz va nutq sur'ati bo'yicha maslahat (Pronunciation feedback)
6. Qisqa va foydali xulosa (Feedback) hamda rivojlanish uchun 2-3 ta aniq tavsiya (Improvements).

Muhim: Javobni FAQAT va FAQAT quyidagi JSON formatida qaytaring:
{
  "score": 85,
  "cefrLevel": "B2",
  "fluencyScore": 84,
  "vocabularyScore": 88,
  "grammarScore": 83,
  "pronunciationFeedback": "Nutq sur'ati va urg'ular bo'yicha o'zbekcha aniq maslahat (Ş, Ç, Ğ, Ö harflarida)",
  "feedback": "Javobning qisqacha xolis xulosasi va bahosi",
  "improvements": [
    "Talaffuz yoki grammatikani yaxshilash uchun 1-maslahat",
    "Lug'at boyligini kengaytirish uchun 2-maslahat"
  ]
}`;

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\nTalaba nutqining matni (Speech transcript):\n"""\n${cleanSpoken}\n"""`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json'
        }
      };

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({
          error: `Gemini API Speaking baholashda xatolik yuz berdi (${response.status}): ${errText}`
        });
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
      const cleanJson = cleanJsonString(rawText);
      const parsed = JSON.parse(cleanJson);

      return res.status(200).json({
        success: true,
        evaluation: parsed
      });
    }

    // 4. SHADOWING EVALUATION
    if (action === 'evaluate-shadowing') {
      const {
        referenceText = '',
        spokenText = '',
        targetLanguage = 'en',
        lang = 'uz'
      } = payload || {};

      const cleanSpoken = (spokenText || '').trim();
      const spokenWords = cleanSpoken.split(/\s+/).filter(w => w.length > 0);

      if (!cleanSpoken || spokenWords.length === 0) {
        return res.status(200).json({
          success: true,
          evaluation: {
            score: 0,
            accuracyScore: 0,
            fluencyScore: 0,
            pronunciationScore: 0,
            feedback: 'Ovoz aniqlanmadi. Siz heç narsa gapirmadingiz yoki audio qabul qilinmadi.',
            pronunciationAdvice: 'Iltimos, audio jumlani diqqat bilan tinglab, uni mikrofonga qayta ovoz chiqarib takrorlang.',
            matchedWordsCount: 0,
            totalWordsCount: referenceText.split(/\s+/).filter(Boolean).length,
            isSilence: true
          }
        });
      }

      const systemInstruction = `Siz xalqaro darajadagi fonetika va talaffuz bo'yicha repetitorsiz (Shadowing va Nutq tahlili bo'yicha mutaxassis).
Vazifangiz: Talabaning namunaviy audio matnga taqlid qilib (Shadowing metodi) aytgan nutqini berilgan asl matn bilan solishtirish va talaffuz aniqligini baholash.
Asl namunaviy matn (Reference text): "${referenceText}".
Talaba aytgan nutq transkripsiyasi (Spoken transcript): "${cleanSpoken}".
Tahlil tili: O'zbek tili (qat'iy isloh qilingan lotin alifbosi: 'Ş ş', 'Ç ç', 'Ğ ğ', 'Ö ö' harflaridan foydalaning, hech qachon 'sh', 'ch', 'o'', 'g'' yozmang!).

Baholash mezonlari:
1. score (0-100): Asl matn bilan moslik darajasi (so'zlar to'g'ri aytilganligi).
2. accuracyScore (0-100): Fonetik va leksik aniqlik.
3. fluencyScore (0-100): Nutq sur'ati va ravonligi.
4. feedback: Qisqa va rag'batlantiruvchi xulosa (Ş, Ç, Ğ, Ö lotinida).
5. pronunciationAdvice: Urg'u, intonatsiya va qaysi so'zlarni qayta mashq qilish kerakligi haqida amaliy maslahat.
6. omittedWords: Tushirib qoldirilgan yoki noto'g'ri talaffuz qilingan so'zlar ro'yxati.

Muhim: Javobni FAQAT quyidagi JSON formatida qaytaring:
{
  "score": 88,
  "accuracyScore": 86,
  "fluencyScore": 90,
  "feedback": "Juda yaxshi natija! Talaffuz sur'ati va intonatsiya namunaga ancha yaqin.",
  "pronunciationAdvice": "Urg'uni to'g'ri qo'yishga va so'zlar orasidagi bog'lanishga (linking sounds) e'tibor qarating.",
  "omittedWords": []
}`;

      const requestBody = {
        contents: [{ role: 'user', parts: [{ text: systemInstruction }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1000, responseMimeType: 'application/json' }
      };

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({
          error: `Gemini API Shadowing baholashda xatolik yuz berdi (${response.status}): ${errText}`
        });
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
      const cleanJson = cleanJsonString(rawText);
      const parsed = JSON.parse(cleanJson);

      return res.status(200).json({
        success: true,
        evaluation: parsed
      });
    }

    // 5. ASK TUTOR / EXPLAIN
    if (action === 'ask-tutor') {`;

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\nTalaba nutqining matni (Speech transcript):\n"""\n${spokenText}\n"""`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json'
        }
      };

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({
          error: `Gemini API Speaking baholashda xatolik yuz berdi (${response.status}): ${errText}`
        });
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
      const cleanJson = cleanJsonString(rawText);
      const parsed = JSON.parse(cleanJson);

      return res.status(200).json({
        success: true,
        evaluation: parsed
      });
    }

    // 4. ASK TUTOR / EXPLAIN
    if (action === 'ask-tutor') {
      const { prompt, context = '' } = payload || {};
      if (!prompt) {
        return res.status(400).json({ error: 'Savol matni kiritilmagan.' });
      }

      const tutorPrompt = `Siz "TILŞUNOS" platformasining aqlli til o'rganish repetitorisiz.
O'quvchiga samimiy, tushunarli va qiziqarli qilib tushuntiring.
Yozuvda qat'iy isloh qilingan o'zbek lotin imlosidan foydalaning ('Ş ş', 'Ç ç', 'Ğ ğ', 'Ö ö').
${context ? `Kontekst: ${context}\n` : ''}
Foydalanuvchi savoli: ${prompt}`;

      const requestBody = {
        contents: [{ role: 'user', parts: [{ text: tutorPrompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 1200 }
      };

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: `Gemini xatosi: ${errText}` });
      }

      const data = await response.json();
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      return res.status(200).json({
        success: true,
        answer
      });
    }

    return res.status(400).json({ error: `Noma'lum harakat: "${action}"` });
  } catch (error) {
    console.error('Gemini API Handler Error:', error);
    return res.status(500).json({
      error: error.message || 'Serverda ichki xatolik yuz berdi.'
    });
  }
}

// Clean markdown fences like ```json ... ``` if model returned them
function cleanJsonString(str) {
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

