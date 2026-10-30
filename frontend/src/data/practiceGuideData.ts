// Multi-language practice guide data model & default content for 7 skills
export interface VocabCardData {
  image: string;
  word: string;
  translation: string;
  explanation: string;
  examplePhrase: string;
}

export interface WritingCardData {
  image: string;
  letterTitle: string;
  letterContent: string;
  letterTranslation: string;
}

export interface ReadingCardData {
  image: string;
  title: string;
  readingText: string; // contains <b>...</b> for bold keywords
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export interface ListeningCardData {
  image: string;
  title: string;
  textWithGaps: string; // e.g. "Fluency is achieved through consistent [practice] and real [communication]."
  gapsAnswers: string[]; // ["practice", "communication"]
  youtubeAudioUrl: string;
}

export interface SpeakingQuestion {
  id: number;
  question: string;
  hint?: string;
  expectedKeywords?: string[];
}

export interface SpeakingCardData {
  image: string;
  title: string;
  questions: SpeakingQuestion[];
}

export interface GrammarCardData {
  image: string;
  topicName: string;
  topicExplanation: string;
  incorrectText: string;
  correctedText: string;
  ruleTip: string;
}

export interface ShadowingCardData {
  videoUrl: string;
  title: string;
  shadowingText: string;
  audioText: string;
}

export interface LanguagePracticeGuide {
  langCode: string;
  langName: string;
  flag: string;
  vocab: VocabCardData;
  writing: WritingCardData;
  reading: ReadingCardData;
  listening: ListeningCardData;
  speaking: SpeakingCardData;
  grammar: GrammarCardData;
  shadowing: ShadowingCardData;
}

export interface PracticeGuideConfig {
  kicker: string;
  title: string;
  subtitle: string;
  ctaButtonText: string;
  languages: Record<string, LanguagePracticeGuide>;
}

export const DEFAULT_PRACTICE_GUIDE: PracticeGuideConfig = {
  kicker: "AMALIY QO‘LLANMA",
  title: "Amaliy qo‘llanma",
  subtitle: "O‘rganmoqchi bo‘lgan tilingizni tanlang va har bir ko‘nikma moduli bo‘yicha interaktiv mashqlarni bajaring.",
  ctaButtonText: "O‘zingizni sinab ko‘ring",
  languages: {
    en: {
      langCode: "en",
      langName: "English",
      flag: "🇬🇧",
      vocab: {
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
        word: "Persevere",
        translation: "Matonat bilan davom etmoq, taslim bo‘lmaslik",
        explanation: "Qiyinchiliklar yoki tushkunliklarga qaramay, o‘z maqsad sari to‘xtovsiz intilish va qat’iyat ko‘rsatish.",
        examplePhrase: "If you persevere with daily speaking practice, natural fluency will follow."
      },
      writing: {
        image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
        letterTitle: "Formal Academic Inquiry (Rasmiy Xat)",
        letterContent: "Dear Admissions Committee,\n\nI am writing to express my enthusiastic interest in the International Language Immersion Program for the upcoming semester. Having studied languages independently for three years, I have developed a strong foundation and a passion for cross-cultural dialogue.\n\nI look forward to the possibility of contributing to your vibrant academic community.\n\nSincerely,\nAkmal Rahimov",
        letterTranslation: "Hurmatli Qabul Komissiyasi,\n\nMen kelgusi semestr uchun mo‘ljallangan Xalqaro Til Dasturiga bo‘lgan qizg‘in qiziqishimni bildirish uchun ushbu xatni yozyapman. Uch yil davomida tillarni mustaqil o‘rganib, madaniyatlararo muloqotga bo‘lgan katta ishtiyoqimni shakllantirdim.\n\nSizning intiluvchan akademik jamoangizga o‘z hissamni qo‘shishdan g‘oyat mamnun bo‘lardim.\n\nHurmat bilan,\nAkmal Rahimov"
      },
      reading: {
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
        title: "The Architecture of Language Learning",
        readingText: "The human brain possesses an extraordinary capacity called <b>neuroplasticity</b>. When you acquire a new language, your brain constructs fresh <b>neural pathways</b> that enhance overall memory and cognitive flexibility. Daily consistent reading of authentic articles creates strong <b>contextual associations</b>, allowing you to comprehend complex idioms effortlessly without translating word for word.",
        questions: [
          {
            question: "1. Miyaning yangi til o‘rganganda o‘zgaruvchanlik qobiliyati nima deb ataladi?",
            answer: "Neuroplasticity (Neyroplastiklik)"
          },
          {
            question: "2. Muntazam o‘qish matn ichidagi qanday bog‘lanishlarni mustahkamlaydi?",
            answer: "Kontekstual assotsiatsiyalar (Contextual associations)"
          }
        ]
      },
      listening: {
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
        title: "The Secrets of Native Fluency",
        textWithGaps: "True language fluency is not about memorizing isolated grammar rules; it is about active [communication] and building meaningful [connections] with people around the world.",
        gapsAnswers: ["communication", "connections"],
        youtubeAudioUrl: "https://www.youtube.com/watch?v=0hK2f3VfP0U"
      },
      speaking: {
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
        title: "Conversational Interview (3 ta savol)",
        questions: [
          {
            id: 1,
            question: "Why do you want to master this foreign language?",
            hint: "Masalan: karyera, sayohat yoki shaxsiy o‘sish haqida ayting",
            expectedKeywords: ["career", "future", "opportunity", "study", "travel", "learn"]
          },
          {
            id: 2,
            question: "Describe your favorite hobby and explain why it inspires you.",
            hint: "Sevimli mashg‘ulotingiz va nima uchun sizga yoqishini tushuntiring",
            expectedKeywords: ["hobby", "enjoy", "reading", "sports", "music", "time"]
          },
          {
            id: 3,
            question: "What is your daily study routine for improving speaking?",
            hint: "Har kungi mashqlaringiz va nutqiy amaliyotingizni tasvirlang",
            expectedKeywords: ["daily", "practice", "routine", "listen", "speak", "habit"]
          }
        ]
      },
      grammar: {
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
        topicName: "Present Perfect vs. Past Simple (Aniq Vaqt va Natija)",
        topicExplanation: "Agar harakat o‘tgan zamonda aniq vaqtda (yesterday, in 2022) sodir bo‘lgan bo‘lsa Past Simple, agar harakatning natijasi hozirgi vaqtga bog‘liq bo‘lib, vaqti noma’lum bo‘lsa Present Perfect (have/has + V3) ishlatiladi.",
        incorrectText: "I have seen that movie yesterday with my friends.",
        correctedText: "I saw that movie yesterday with my friends.",
        ruleTip: "'Yesterday', 'last night', 'ago' kabi aniq o‘tgan vaqt ko‘rsatkichlari bilan Present Perfect aslo ishlatilmaydi!"
      },
      shadowing: {
        videoUrl: "https://www.youtube.com/watch?v=1La4QzGeaaQ",
        title: "Winston Churchill — The Power of Courage",
        shadowingText: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        audioText: "Success is not final, failure is not fatal: it is the courage to continue that counts."
      }
    },
    de: {
      langCode: "de",
      langName: "Deutsch",
      flag: "🇩🇪",
      vocab: {
        image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80",
        word: "Zuverlässig",
        translation: "Ishonchli, qat’iyatli, va’daga sodiq",
        explanation: "Har qanday vaziyatda ham o‘z so‘zida turadigan va mas’uliyatni to‘liq his qiladigan shaxsga nisbatan aytiladi.",
        examplePhrase: "Ein zuverlässiger Partner ist das beste Fundament für jeden gemeinsamen Erfolg."
      },
      writing: {
        image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
        letterTitle: "Bewerbungsschreiben (Rasmiy Ariza)",
        letterContent: "Sehr geehrte Damen und Herren,\n\nmit großem Interesse bewerbe ich mich um die Teilnahme an Ihrem Sprachkurs in Berlin. Ich lerne seit zwei Jahren Deutsch und möchte meine Sprachkenntnisse gezielt vertiefen.\n\nIch freue mich über eine positive Rückmeldung.\n\nMit freundlichen Grüßen,\nAkmal Rahimov",
        letterTranslation: "Hurmatli xonimlar va janoblar,\n\nKatta qiziqish bilan Berlin shahridagi til kursingizda ishtirok etish uchun ariza topshirmoqdaman. Ikki yildan beri nemis tilini o‘rganib kelyapman va bilimlarimni yanada chuqurlashtirmoqchiman.\n\nIjobiy javobingizni kutib qolaman.\n\nHurmat bilan,\nAkmal Rahimov"
      },
      reading: {
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
        title: "Die Kunst des täglichen Lernens",
        readingText: "Regelmäßiges Üben ist der wichtigste Schlüssel zur <b>Sprachbeherrschung</b>. Schon fünfzehn Minuten pro Tag stärken das <b>Langzeitgedächtnis</b> und fördern die sprachliche <b>Kreativität</b> im Alltag.",
        questions: [
          {
            question: "1. Har kungi o‘rganish xotiraning qaysi qismini kuchaytiradi?",
            answer: "Das Langzeitgedächtnis (Uzoq muddatli xotira)"
          },
          {
            question: "2. Tilni o‘zlashtirish kaliti nima?",
            answer: "Regelmäßiges Üben (Muntazam mashq qilish)"
          }
        ]
      },
      listening: {
        image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=800&q=80",
        title: "Hörverständnis: Dialog im Café",
        textWithGaps: "Guten Tag! Ich hätte gerne einen [Kaffee] mit Milch und ein frisches [Croissant], bitte.",
        gapsAnswers: ["Kaffee", "Croissant"],
        youtubeAudioUrl: "https://www.youtube.com/watch?v=4-rbg4K3q2k"
      },
      speaking: {
        image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80",
        title: "Mündliche Prüfung (Nemis tili 3 ta savol)",
        questions: [
          {
            id: 1,
            question: "Warum lernen Sie die deutsche Sprache?",
            hint: "Karyera yoki Germaniyada ta’lim olish haqida gapiring",
            expectedKeywords: ["deutsch", "studium", "beruf", "deutschland", "lernen"]
          },
          {
            id: 2,
            question: "Was machen Sie gerne in Ihrer Freizeit?",
            hint: "Bo‘sh vaqtingizda sevadigan mashg‘ulotingiz",
            expectedKeywords: ["freizeit", "sport", "lesen", "musik", "gerne"]
          },
          {
            id: 3,
            question: "Beschreiben Sie Ihre Heimatstadt in wenigen Sätzen.",
            hint: "Tug‘ilib o‘sgan shahringiz haqida qisqacha tavsif",
            expectedKeywords: ["stadt", "schön", "menschen", "leben", "kultur"]
          }
        ]
      },
      grammar: {
        image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
        topicName: "Dativ vs. Akkusativ (Wo? va Wohin?)",
        topicExplanation: "Harakat yo‘nalishi (Wohin? - qayerga?) so‘ralganda Akkusativ, joylashuv (Wo? - qayerda?) so‘ralganda esa Dativ qo‘llaniladi.",
        incorrectText: "Ich lege das Buch auf dem Tisch.",
        correctedText: "Ich lege das Buch auf den Tisch.",
        ruleTip: "'Legen' fe’li harakat bildiradi (Wohin?), shuning uchun 'auf den Tisch' (Akkusativ) bo‘lishi shart!"
      },
      shadowing: {
        videoUrl: "https://www.youtube.com/watch?v=1La4QzGeaaQ",
        title: "Johann Wolfgang von Goethe — Zitat",
        shadowingText: "Es ist nicht genug zu wissen, man muss auch anwenden; es ist nicht genug zu wollen, man muss auch tun.",
        audioText: "Es ist nicht genug zu wissen, man muss auch anwenden; es ist nicht genug zu wollen, man muss auch tun."
      }
    },
    tr: {
      langCode: "tr",
      langName: "Türkçe",
      flag: "🇹🇷",
      vocab: {
        image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
        word: "Kararlılık",
        translation: "Qat’iyatlilik, sobitqadamlik, sabot",
        explanation: "Belgilangan katta maqsad yo‘lida to‘siqlarga qaramay to‘xtamasdan harakat qilish fazilati.",
        examplePhrase: "Büyük hedeflere ancak sarsılmaz bir kararlılık ve disiplinle ulaşılabilir."
      },
      writing: {
        image: "https://images.unsplash.com/photo-1507842229450-799042609a69?auto=format&fit=crop&w=800&q=80",
        letterTitle: "Resmi Başvuru Mektubu",
        letterContent: "Sayın Yetkili,\n\nÜniversitenizin Türkçe yaz okulu programına katılmak için başvuruda bulunuyorum. Türk kültürüne ve diline büyük bir merak duyuyorum.\n\nBaşvurumu değerlendirmenizi saygılarımla rica ederim.\n\nAkmal Rahimov",
        letterTranslation: "Hurmatli Mas’ul Xodim,\n\nUniversitetingizning Turk tili yozgi maktab dasturida ishtirok etish uchun ariza topshirmoqdaman. Turk madaniyati va tiliga katta qiziqish bilan qarayman.\n\nArizamni ko‘rib chiqishingizni hurmat bilan so‘rayman.\n\nAkmal Rahimov"
      },
      reading: {
        image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=800&q=80",
        title: "İstanbul’un Büyülü Tarihi",
        readingText: "İstanbul, Doğu ile Batı’nın kucaklaştığı eşsiz bir <b>kültür</b> başkentidir. Boğaz’ın serin suları ve tarihi <b>mimari</b> eserler, kente gelen her ziyaretçide unutulmaz bir <b>hayranlık</b> uyandırır.",
        questions: [
          {
            question: "1. Istanbul qanday ikki madaniyatni birlashtiradi?",
            answer: "Doğu ile Batı (Sharq va G‘arb)"
          },
          {
            question: "2. Shahar tashrif buyuruvchilarda nimani uyg‘otadi?",
            answer: "Unutulmaz bir hayranlık (Unutilmas hayrat)"
          }
        ]
      },
      listening: {
        image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
        title: "Türkçe Dinleme: Çay Kültürü",
        textWithGaps: "Türkiye’de sıcak bir bardak [çay], samimi bir sohbetin ve [misafirperverlik] geleneğinin en güzel sembolüdür.",
        gapsAnswers: ["çay", "misafirperverlik"],
        youtubeAudioUrl: "https://www.youtube.com/watch?v=0hK2f3VfP0U"
      },
      speaking: {
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
        title: "Türkçe Konuşma Testi (3 ta savol)",
        questions: [
          {
            id: 1,
            question: "Türkçe öğrenmeye nasıl karar verdiniz?",
            hint: "Nima sababdan turk tilini tanlaganingizni tushuntiring",
            expectedKeywords: ["türkçe", "türkiye", "dizi", "kültür", "sevmek"]
          },
          {
            id: 2,
            question: "En sevdiğiniz Türk yemeği nedir ve nasıl yapılır?",
            hint: "Sevimli turk taomingiz haqida gapiring",
            expectedKeywords: ["yemek", "lezzetli", "kebap", "tatlı", "güzel"]
          },
          {
            id: 3,
            question: "Gelecekte Türkiye’de nereyi ziyaret etmek istersiniz?",
            hint: "Sayr qilmoqchi bo‘lgan shahringiz yoki joyingiz",
            expectedKeywords: ["istanbul", "antalya", "gezmek", "tarihi", "şehir"]
          }
        ]
      },
      grammar: {
        image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
        topicName: "Şimdiki Zaman vs. Geniş Zaman (-iyor vs. -r)",
        topicExplanation: "Hozir ayni paytda sodir bo‘layotgan ish-harakat uchun '-iyor', odatiy har doim takrorlanadigan ishlar uchun '-r / -ar / -er' qo‘shimchasi ishlatiladi.",
        incorrectText: "Ben her sabah saat yedide uyanıyorum.",
        correctedText: "Ben her sabah saat yedide uyanırım.",
        ruleTip: "'Her sabah' muntazam takrorlanuvchi harakat bo‘lgani uchun Geniş Zaman (-r) ishlatilishi to‘g‘riroq!"
      },
      shadowing: {
        videoUrl: "https://www.youtube.com/watch?v=1La4QzGeaaQ",
        title: "Mevlana Celaleddin Rumi — Özlü Söz",
        shadowingText: "Dünle beraber gitti cancağızım, ne kadar söz varsa düne ait. Şimdi yeni şeyler söylemek lazım.",
        audioText: "Dünle beraber gitti cancağızım, ne kadar söz varsa düne ait. Şimdi yeni şeyler söylemek lazım."
      }
    },
    ru: {
      langCode: "ru",
      langName: "Русский",
      flag: "🇷🇺",
      vocab: {
        image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
        word: "Вдохновение",
        translation: "Ilhom, qalb jo‘shqinligi, ruhiy ko‘tarinkilik",
        explanation: "Yangi g‘oyalar va ijodiy yutuqlarga yetaklovchi eng kuchli ruhiy turtki.",
        examplePhrase: "Искреннее вдохновение рождается в процессе ежедневного усердного труда."
      },
      writing: {
        image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
        letterTitle: "Деловое Письмо (Rasmiy Xat)",
        letterContent: "Уважаемые коллеги,\n\nОбращаюсь к вам с целью предложить сотрудничество в сфере онлайн-образования. Наша платформа Tilshunos успешно внедряет современные методики интерактивного изучения языков.\n\nБудем рады обсудить детали при личной встрече.\n\nС уважением,\nАкмаль Рахимов",
        letterTranslation: "Hurmatli hamkasblar,\n\nOnlayn ta’lim sohasida hamkorlik taklif qilish maqsadida sizlarga murojaat qilmoqdaman. Bizning Tilshunos platformamiz tillarni interaktiv o‘rganishning zamonaviy usullarini muvaffaqiyatli joriy etmoqda.\n\nTafsilotlarni uchrashuvda muhokama qilishdan mamnun bo‘lamiz.\n\nHurmat bilan,\nAkmal Rahimov"
      },
      reading: {
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
        title: "Сила литературного слова",
        readingText: "Чтение классических произведений обогащает <b>словарный запас</b> и развивает глубокое <b>критическое мышление</b>. Погружаясь в аутентичные тексты, читатель открывает для себя тончайшие <b>стилистические оттенки</b> живого языка.",
        questions: [
          {
            question: "1. Badiiy kitoblarni o‘qish nimani boyitadi?",
            answer: "Словарный запас (So‘z boyligini)"
          },
          {
            question: "2. Qanday fikrlash qobiliyati rivojlanadi?",
            answer: "Критическое мышление (Tanqidiy fikrlash)"
          }
        ]
      },
      listening: {
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
        title: "Аудирование: Искусство общения",
        textWithGaps: "Секрет успешного изучения языка заключается в постоянной [практике] и искреннем [желании] открывать новое.",
        gapsAnswers: ["практике", "желании"],
        youtubeAudioUrl: "https://www.youtube.com/watch?v=0hK2f3VfP0U"
      },
      speaking: {
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
        title: "Разговорный тест (3 ta savol)",
        questions: [
          {
            id: 1,
            question: "Каковы ваши главные цели в изучении русского языка?",
            hint: "Kelajakdagi rejalaringiz va maqsadingiz",
            expectedKeywords: ["цель", "работа", "учеба", "язык", "говорить"]
          },
          {
            id: 2,
            question: "Какую последнюю книгу вы прочитали и чем она запомнилась?",
            hint: "Oxirgi o‘qigan kitobingiz va taassurotlaringiz",
            expectedKeywords: ["книга", "автор", "сюжет", "интересно", "герой"]
          },
          {
            id: 3,
            question: "Как вы преодолеваете языковой барьер при общении?",
            hint: "Qo‘rquvni yengish va erkin gapirish uslubingiz",
            expectedKeywords: ["барьер", "практика", "ошибки", "смело", "общение"]
          }
        ]
      },
      grammar: {
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
        topicName: "Падежи: Винительный vs. Предложный (Куда? va Где?)",
        topicExplanation: "Harakat yo‘nalishini ifodalovchi 'Куда?' savoliga Винительный падеж (в/на + существительное), o‘rnashgan joyni ifodalovchi 'Где?' savoliga esa Предложный падеж javob bo‘ladi.",
        incorrectText: "Я иду в школе каждый день.",
        correctedText: "Я иду в школу каждый день.",
        ruleTip: "'Куда?' savoliga javob bo‘lgani uchun 'в школу' (Винительный падеж) shakli qo‘llanilishi shart!"
      },
      shadowing: {
        videoUrl: "https://www.youtube.com/watch?v=1La4QzGeaaQ",
        title: "Лев Толстой — Мысль о совершенствовании",
        shadowingText: "Чтобы жить честно, надо рваться, путаться, биться, ошибаться, начинать и бросать, и вечно бороться и лишаться.",
        audioText: "Чтобы жить честно, надо рваться, путаться, биться, ошибаться, начинать и бросать, и вечно бороться и лишаться."
      }
    },
    uz: {
      langCode: "uz",
      langName: "O‘zbek",
      flag: "🇺🇿",
      vocab: {
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
        word: "Barkamol",
        translation: "Har tomonlama yetuk, mukammal, barkamol shaxs",
        explanation: "Jismoniy va ma’naviy jihatdan to‘liq shakllangan, yuksak fazilatlarga ega inson.",
        examplePhrase: "Barkamol avlod mustaqil yurtimizning ertangi kuni va eng buyuk tayanchidir."
      },
      writing: {
        image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
        letterTitle: "Tavsiyanoma va Rasmiy Murojaat",
        letterContent: "Hurmatli Kengash A’zolari,\n\nUshbu xat orqali tilshunoslik sohasidagi yangi raqamli innovatsiyalarni qo‘llab-quvvatlashingizni so‘rab murojaat qilmoqdamiz. Maqsadimiz — milliy ta’lim standartlarini jahon darajasiga olib chiqishdir.\n\nE’tiboringiz uchun chuqur minnatdorlik bildiramiz.\n\nHurmat bilan,\nAkmal Rahimov",
        letterTranslation: "Hurmatli Kengash A’zolari,\n\nUshbu xat orqali tilshunoslik sohasidagi yangi raqamli innovatsiyalarni qo‘llab-quvvatlashingizni so‘rab murojaat qilmoqdamiz. Maqsadimiz — milliy ta’lim standartlarini jahon darajasiga olib chiqishdir.\n\nE’tiboringiz uchun chuqur minnatdorlik bildiramiz.\n\nHurmat bilan,\nAkmal Rahimov"
      },
      reading: {
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
        title: "Ona tilimiz — faxrimiz",
        readingText: "Ona tili millatning eng bebaho <b>ma’naviy xazinasi</b> hisoblanadi. Tili yashagan millatning o‘zligi, or-nomusi va <b>tarixiy merosi</b> asrlar osha mangu bardavom bo‘ladi. Har bir avlod o‘z tilining <b>sofligini</b> asrashi muqaddas burchdir.",
        questions: [
          {
            question: "1. Ona tili millatning qanday boyligi hisoblanadi?",
            answer: "Bebaho ma’naviy xazinasi"
          },
          {
            question: "2. Tili yashagan millatning nimalari asrlar osha bardavom bo‘ladi?",
            answer: "O‘zligi, or-nomusi va tarixiy merosi"
          }
        ]
      },
      listening: {
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
        title: "Tinglab tushunish: Ma’naviyat sarchashmasi",
        textWithGaps: "Ilm olish yo‘lidagi har bir qadam insonni [kamolotga] va yuksak [muvaffaqiyatga] yetaklaydi.",
        gapsAnswers: ["kamolotga", "muvaffaqiyatga"],
        youtubeAudioUrl: "https://www.youtube.com/watch?v=0hK2f3VfP0U"
      },
      speaking: {
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
        title: "Nutqiy muloqot mashqi (3 ta savol)",
        questions: [
          {
            id: 1,
            question: "Til o‘rganish sizning hayotingizda qanday yangi eshiklarni ochmoqda?",
            hint: "O‘z tajribangiz va kelajakdagi orzularingiz haqida ayting",
            expectedKeywords: ["til", "hayot", "maqsad", "kelajak", "ilm"]
          },
          {
            id: 2,
            question: "Kitob mutolaasi inson tafakkurini qanday kengaytiradi?",
            hint: "Kitobning fikrlash doirasiga ta’siri haqida so‘zlang",
            expectedKeywords: ["kitob", "fikr", "bilim", "tafakkur", "foyda"]
          },
          {
            id: 3,
            question: "Chet tilida ravon so‘zlashish uchun eng muhim maslahatingiz nima?",
            hint: "Boshlovchilar uchun o‘z maslahatlaringizni bering",
            expectedKeywords: ["mashq", "har kuni", "gapirish", "qo‘rqmaslik", "sabot"]
          }
        ]
      },
      grammar: {
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
        topicName: "Egalik va Kelishik qo‘shimchalarining to‘g‘ri qo‘llanilishi",
        topicExplanation: "Egalik qo‘shimchalari (-im, -ing, -i) shaxs va buyum o‘rtasidagi bog‘lanishni, tushum kelishigi esa harakat o‘tgan vositasiz to‘ldiruvchini ifodalaydi.",
        incorrectText: "Men o‘z kitob oldim.",
        correctedText: "Men o‘z kitobimni oldim.",
        ruleTip: "'O‘z' so‘zidan keyin kelgan otga egalik (-im) va tushum kelishigi (-ni) qo‘shilishi shart!"
      },
      shadowing: {
        videoUrl: "https://www.youtube.com/watch?v=1La4QzGeaaQ",
        title: "Alisher Navoiy — Hikmatli Bayt",
        shadowingText: "Olam ahli bilingizkim, ish emas dushmanlig‘, yor o‘ling bir-biringizg‘akim, erur yorlig‘.",
        audioText: "Olam ahli bilingizkim, ish emas dushmanlig‘, yor o‘ling bir-biringizg‘akim, erur yorlig‘."
      }
    }
  }
};
