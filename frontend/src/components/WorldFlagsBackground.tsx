import React, { useMemo } from 'react';

export interface WorldFlagItem {
  id: number;
  code: string;
  flag: string;
  name: string;
  greeting: string;
  lang: string;
  x: number;       // 0 - 98%
  y: number;       // 0 - 96%
  size: number;    // 18 - 42px
  duration: number;// 12 - 32s
  delay: number;   // 0 - 15s
  opacity: number; // 0.18 - 0.65
  tier: 1 | 2 | 3; // 1 = deep small, 2 = mid, 3 = hero prominent
  animType: 'float-up' | 'float-wave' | 'float-drift' | 'float-orbit';
}

// 100 TA MASHHUR DUNYO DAVLATLARI VA BAYROQLARI RO'YXATI
export const ALL_100_FLAGS: Omit<WorldFlagItem, 'x' | 'y' | 'size' | 'duration' | 'delay' | 'opacity' | 'tier' | 'animType'>[] = [
  { id: 1,  code: 'uz', flag: '🇺🇿', name: 'O‘zbekiston', greeting: 'Assalomu alaykum!', lang: 'O‘zbek tili' },
  { id: 2,  code: 'gb', flag: '🇬🇧', name: 'Buyuk Britaniya', greeting: 'Hello! Welcome', lang: 'English' },
  { id: 3,  code: 'us', flag: '🇺🇸', name: 'AQSH', greeting: 'Howdy! Hi there', lang: 'English (US)' },
  { id: 4,  code: 'de', flag: '🇩🇪', name: 'Germaniya', greeting: 'Guten Tag!', lang: 'Deutsch' },
  { id: 5,  code: 'fr', flag: '🇫🇷', name: 'Fransiya', greeting: 'Bonjour! Salut', lang: 'Français' },
  { id: 6,  code: 'es', flag: '🇪🇸', name: 'Ispaniya', greeting: '¡Hola! ¿Qué tal?', lang: 'Español' },
  { id: 7,  code: 'it', flag: '🇮🇹', name: 'Italiya', greeting: 'Ciao! Buongiorno', lang: 'Italiano' },
  { id: 8,  code: 'tr', flag: '🇹🇷', name: 'Turkiya', greeting: 'Merhaba! Hoş geldiniz', lang: 'Türkçe' },
  { id: 9,  code: 'ru', flag: '🇷🇺', name: 'Rossiya', greeting: 'Здравствуйте! Привет', lang: 'Русский' },
  { id: 10, code: 'cn', flag: '🇨🇳', name: 'Xitoy', greeting: 'Nǐ hǎo! (你好)', lang: '中文 (Pudonghua)' },
  { id: 11, code: 'jp', flag: '🇯🇵', name: 'Yaponiya', greeting: 'Konnichiwa (こんにちは)', lang: '日本語 (Nihongo)' },
  { id: 12, code: 'kr', flag: '🇰🇷', name: 'Janubiy Koreya', greeting: 'Annyeong (안녕하세요)', lang: '한국어 (Hanguk)' },
  { id: 13, code: 'sa', flag: '🇸🇦', name: 'Saudiya Arabistoni', greeting: 'Marhaban (مرحباً)', lang: 'العربية (Fusha)' },
  { id: 14, code: 'ae', flag: '🇦🇪', name: 'BAA (Dubay)', greeting: 'Ahlan wa Sahlan', lang: 'العربية' },
  { id: 15, code: 'eg', flag: '🇪🇬', name: 'Misr', greeting: 'Salam alaykum', lang: 'العربية' },
  { id: 16, code: 'ca', flag: '🇨🇦', name: 'Kanada', greeting: 'Hello & Bienvenue', lang: 'English / Français' },
  { id: 17, code: 'au', flag: '🇦🇺', name: 'Avstraliya', greeting: 'G\'day mate!', lang: 'English' },
  { id: 18, code: 'br', flag: '🇧🇷', name: 'Braziliya', greeting: 'Olá! Bem-vindo', lang: 'Português' },
  { id: 19, code: 'mx', flag: '🇲🇽', name: 'Meksika', greeting: '¡Hola amigo!', lang: 'Español' },
  { id: 20, code: 'in', flag: '🇮🇳', name: 'Hindiston', greeting: 'Namaste (नमस्ते)', lang: 'Hindi / English' },
  { id: 21, code: 'kz', flag: '🇰🇿', name: 'Qozog‘iston', greeting: 'Sälemetsiz be! (Сәлем)', lang: 'Qazaqsha' },
  { id: 22, code: 'az', flag: '🇦🇿', name: 'Ozarbayjon', greeting: 'Salam! Xoş gəlmisiniz', lang: 'Azərbaycan' },
  { id: 23, code: 'kg', flag: '🇰🇬', name: 'Qirg‘iziston', greeting: 'Salamatsyzby! (Салам)', lang: 'Qyrgyzcha' },
  { id: 24, code: 'tj', flag: '🇹🇯', name: 'Tojikiston', greeting: 'Salom! Xush omaded', lang: 'Tojiki' },
  { id: 25, code: 'tm', flag: '🇹🇲', name: 'Turkmaniston', greeting: 'Salam! Hoş geldiňiz', lang: 'Türkmençe' },
  { id: 26, code: 'ch', flag: '🇨🇭', name: 'Shveysariya', greeting: 'Grüezi / Bonjour', lang: 'Deutsch / Français' },
  { id: 27, code: 'nl', flag: '🇳🇱', name: 'Niderlandiya', greeting: 'Hallo! Welkom', lang: 'Nederlands' },
  { id: 28, code: 'se', flag: '🇸🇪', name: 'Shvetsiya', greeting: 'Hej! Välkommen', lang: 'Svenska' },
  { id: 29, code: 'no', flag: '🇳🇴', name: 'Norvegiya', greeting: 'Hei! Velkommen', lang: 'Norsk' },
  { id: 30, code: 'dk', flag: '🇩🇰', name: 'Daniya', greeting: 'Hej! Velkommen', lang: 'Dansk' },
  { id: 31, code: 'fi', flag: '🇫🇮', name: 'Finlandiya', greeting: 'Hei! Tervetuloa', lang: 'Suomi' },
  { id: 32, code: 'pl', flag: '🇵🇱', name: 'Polsha', greeting: 'Cześć! Witaj', lang: 'Polski' },
  { id: 33, code: 'pt', flag: '🇵🇹', name: 'Portugaliya', greeting: 'Olá! Bem-vindo', lang: 'Português' },
  { id: 34, code: 'gr', flag: '🇬🇷', name: 'Gretsiya', greeting: 'Geia sou! (Γεια σου)', lang: 'Ellinika' },
  { id: 35, code: 'ie', flag: '🇮🇪', name: 'Irlandiya', greeting: 'Dia dhuit! (Fáilte)', lang: 'Gaeilge / English' },
  { id: 36, code: 'at', flag: '🇦🇹', name: 'Avstriya', greeting: 'Servus! Grüß Gott', lang: 'Deutsch' },
  { id: 37, code: 'be', flag: '🇧🇪', name: 'Belgiya', greeting: 'Bonjour / Hallo', lang: 'Français / Nederlands' },
  { id: 38, code: 'nz', flag: '🇳🇿', name: 'Yangi Zelandiya', greeting: 'Kia Ora! Hello', lang: 'Maori / English' },
  { id: 39, code: 'sg', flag: '🇸🇬', name: 'Singapur', greeting: 'Hello! Ni Hao', lang: 'English / Malay' },
  { id: 40, code: 'my', flag: '🇲🇾', name: 'Malayziya', greeting: 'Selamat datang!', lang: 'Bahasa Melayu' },
  { id: 41, code: 'id', flag: '🇮🇩', name: 'Indoneziya', greeting: 'Halo! Selamat datang', lang: 'Bahasa Indonesia' },
  { id: 42, code: 'th', flag: '🇹🇭', name: 'Tailand', greeting: 'Sawatdee (สวัสดี)', lang: 'Thai' },
  { id: 43, code: 'vn', flag: '🇻🇳', name: 'Vyetnam', greeting: 'Xin chào!', lang: 'Tiếng Việt' },
  { id: 44, code: 'ph', flag: '🇵🇭', name: 'Filippin', greeting: 'Kumusta ka!', lang: 'Filipino / Tagalog' },
  { id: 45, code: 'pk', flag: '🇵🇰', name: 'Pokiston', greeting: 'Salam! (سلام)', lang: 'Urdu / English' },
  { id: 46, code: 'ir', flag: '🇮🇷', name: 'Eron', greeting: 'Dorood! (درود)', lang: 'Farsi' },
  { id: 47, code: 'qa', flag: '🇶🇦', name: 'Qatar', greeting: 'Marhaban bikum', lang: 'العربية' },
  { id: 48, code: 'kw', flag: '🇰🇼', name: 'Quvayt', greeting: 'Hala wallah', lang: 'العربية' },
  { id: 49, code: 'om', flag: '🇴🇲', name: 'Ummon', greeting: 'Ahlan bik', lang: 'العربية' },
  { id: 50, code: 'jo', flag: '🇯🇴', name: 'Iordaniya', greeting: 'Marhaba!', lang: 'العربية' },
  { id: 51, code: 'ps', flag: '🇵🇸', name: 'Falastin', greeting: 'Salam! Ahlan', lang: 'العربية' },
  { id: 52, code: 'ge', flag: '🇬🇪', name: 'Gurjiston', greeting: 'Gamarjoba! (გამარჯობა)', lang: 'Kartuli' },
  { id: 53, code: 'am', flag: '🇦🇲', name: 'Armaniston', greeting: 'Barev dzez! (Բարև)', lang: 'Hayeren' },
  { id: 54, code: 'ua', flag: '🇺🇦', name: 'Ukraina', greeting: 'Pryvit! (Привіт)', lang: 'Ukrainska' },
  { id: 55, code: 'by', flag: '🇧🇾', name: 'Belarus', greeting: 'Pryvitannie! (Прывітанне)', lang: 'Belaruskaya' },
  { id: 56, code: 'md', flag: '🇲🇩', name: 'Moldova', greeting: 'Salut! Bine ați venit', lang: 'Română' },
  { id: 57, code: 'ro', flag: '🇷🇴', name: 'Ruminiya', greeting: 'Bună ziua!', lang: 'Română' },
  { id: 58, code: 'bg', flag: '🇧🇬', name: 'Bolgariya', greeting: 'Zdravey! (Здравей)', lang: 'Bulgarski' },
  { id: 59, code: 'hu', flag: '🇭🇺', name: 'Vengriya', greeting: 'Szia! Üdvözöljük', lang: 'Magyar' },
  { id: 60, code: 'cz', flag: '🇨🇿', name: 'Chexiya', greeting: 'Ahoj! Dobrý den', lang: 'Čeština' },
  { id: 61, code: 'sk', flag: '🇸🇰', name: 'Slovakiya', greeting: 'Dobrý deň! Ahoj', lang: 'Slovenčina' },
  { id: 62, code: 'hr', flag: '🇭🇷', name: 'Xorvatiya', greeting: 'Bok! Dobrodošli', lang: 'Hrvatski' },
  { id: 63, code: 'rs', flag: '🇷🇸', name: 'Serbiya', greeting: 'Zdravo! Dobro došli', lang: 'Srpski' },
  { id: 64, code: 'ba', flag: '🇧🇦', name: 'Bosniya', greeting: 'Zdravo! Merhaba', lang: 'Bosanski' },
  { id: 65, code: 'me', flag: '🇲🇪', name: 'Chernogoriya', greeting: 'Zdravo!', lang: 'Crnogorski' },
  { id: 66, code: 'al', flag: '🇦🇱', name: 'Albaniya', greeting: 'Përshëndetje!', lang: 'Shqip' },
  { id: 67, code: 'mk', flag: '🇲🇰', name: 'Shimoliy Makedoniya', greeting: 'Zdravo! (Здраво)', lang: 'Makedonski' },
  { id: 68, code: 'si', flag: '🇸🇮', name: 'Sloveniya', greeting: 'Živjo! Dober dan', lang: 'Slovenščina' },
  { id: 69, code: 'lt', flag: '🇱🇹', name: 'Litva', greeting: 'Labas! Sveiki', lang: 'Lietuvių' },
  { id: 70, code: 'lv', flag: '🇱🇻', name: 'Latviya', greeting: 'Sveiki! Labdien', lang: 'Latviešu' },
  { id: 71, code: 'ee', flag: '🇪🇪', name: 'Estoniya', greeting: 'Tere! Tere tulemast', lang: 'Eesti' },
  { id: 72, code: 'is', flag: '🇮🇸', name: 'Islandiya', greeting: 'Halló! Velkomin', lang: 'Íslenska' },
  { id: 73, code: 'mt', flag: '🇲🇹', name: 'Malta', greeting: 'Bonġu! Merħba', lang: 'Malti' },
  { id: 74, code: 'cy', flag: '🇨🇾', name: 'Kipr', greeting: 'Geia sas! Merhaba', lang: 'Ellinika / Türkçe' },
  { id: 75, code: 'lu', flag: '🇱🇺', name: 'Lyuksemburg', greeting: 'Moien! Wëllkomm', lang: 'Lëtzebuergesch' },
  { id: 76, code: 'mc', flag: '🇲🇨', name: 'Monako', greeting: 'Bonjour! Bienvenue', lang: 'Français' },
  { id: 77, code: 'ar', flag: '🇦🇷', name: 'Argentina', greeting: '¡Hola! Che', lang: 'Español' },
  { id: 78, code: 'cl', flag: '🇨🇱', name: 'Chili', greeting: '¡Hola! Buenas', lang: 'Español' },
  { id: 79, code: 'co', flag: '🇨🇴', name: 'Kolumbiya', greeting: '¡Hola! Bienvenidos', lang: 'Español' },
  { id: 80, code: 'pe', flag: '🇵🇪', name: 'Peru', greeting: '¡Hola! ¿Qué tal?', lang: 'Español' },
  { id: 81, code: 'uy', flag: '🇺🇾', name: 'Urugvay', greeting: '¡Hola! Buen día', lang: 'Español' },
  { id: 82, code: 've', flag: '🇻🇪', name: 'Venesuela', greeting: '¡Hola! Saludos', lang: 'Español' },
  { id: 83, code: 'ec', flag: '🇪🇨', name: 'Ekvador', greeting: '¡Hola! Bienvenidos', lang: 'Español' },
  { id: 84, code: 'ma', flag: '🇲🇦', name: 'Marokash', greeting: 'Marhaban / Salam', lang: 'العربية / Français' },
  { id: 85, code: 'dz', flag: '🇩🇿', name: 'Jazoir', greeting: 'Salam alaykum', lang: 'العربية' },
  { id: 86, code: 'tn', flag: '🇹🇳', name: 'Tunis', greeting: 'Aslama! Marhaban', lang: 'العربية' },
  { id: 87, code: 'za', flag: '🇿🇦', name: 'Janubiy Afrika', greeting: 'Sawubona! Hello', lang: 'Zulu / English' },
  { id: 88, code: 'ng', flag: '🇳🇬', name: 'Nigeriya', greeting: 'Bawo! How far', lang: 'Yoruba / English' },
  { id: 89, code: 'ke', flag: '🇰🇪', name: 'Keniya', greeting: 'Jambo! Habari', lang: 'Swahili / English' },
  { id: 90, code: 'gh', flag: '🇬🇭', name: 'Gana', greeting: 'Akwaaba! Welcome', lang: 'English / Twi' },
  { id: 91, code: 'et', flag: '🇪🇹', name: 'Efiopiya', greeting: 'Selam! (ሰላም)', lang: 'Amharic' },
  { id: 92, code: 'tz', flag: '🇹🇿', name: 'Tanzaniya', greeting: 'Jambo! Karibu', lang: 'Swahili' },
  { id: 93, code: 'ug', flag: '🇺🇬', name: 'Uganda', greeting: 'Oli otya! Welcome', lang: 'Luganda / English' },
  { id: 94, code: 'cu', flag: '🇨🇺', name: 'Kuba', greeting: '¡Hola! Bienvenidos', lang: 'Español' },
  { id: 95, code: 'jm', flag: '🇯🇲', name: 'Yamayka', greeting: 'Wah gwaan! Welcome', lang: 'English Patois' },
  { id: 96, code: 'mv', flag: '🇲🇻', name: 'Maldiv orollari', greeting: 'Kihineh! Maruhabaa', lang: 'Dhivehi' },
  { id: 97, code: 'lk', flag: '🇱🇰', name: 'Shri-Lanka', greeting: 'Ayubowan! (ආයුබෝවන්)', lang: 'Sinhala / Tamil' },
  { id: 98, code: 'bd', flag: '🇧🇩', name: 'Bangladesh', greeting: 'Nomoshkar! (নমস্কার)', lang: 'Bangla' },
  { id: 99, code: 'np', flag: '🇳🇵', name: 'Nepal', greeting: 'Namaste! (नमस्ते)', lang: 'Nepali' },
  { id: 100,code: 'mn', flag: '🇲🇳', name: 'Mongoliya', greeting: 'Sain baina uu! (Сайн байна уу)', lang: 'Mongol' },
];

// O'RTA FONDA UCHIB YURUVCHI EKSKLYUZIV DAVLATLAR KARTALARI (GLASS CARDS)
export interface CountryGlassCard {
  id: string;
  flag: string;
  country: string;
  nativeCountry: string;
  greeting: string;
  sub: string;
  badge: string;
  color: string;
  x: string;
  y: string;
  animSpeed: string;
}

export const FEATURED_COUNTRY_CARDS: CountryGlassCard[] = [
  {
    id: 'uz',
    flag: '🇺🇿',
    country: 'O‘zbekiston',
    nativeCountry: 'O‘zbekiston Respublikasi',
    greeting: 'Assalomu alaykum!',
    sub: 'Ona tili · Milliy ta‘lim ekotizimi',
    badge: 'Bosh vatan',
    color: '#0284c7',
    x: '3%',
    y: '18%',
    animSpeed: '7s'
  },
  {
    id: 'gb',
    flag: '🇬🇧',
    country: 'United Kingdom',
    nativeCountry: 'Great Britain',
    greeting: 'Hello! Welcome',
    sub: 'Oxford / Cambridge · CEFR A1-C2',
    badge: '1.5B+ so‘zlashuvchi',
    color: '#3b82f6',
    x: '76%',
    y: '12%',
    animSpeed: '8.5s'
  },
  {
    id: 'de',
    flag: '🇩🇪',
    country: 'Deutschland',
    nativeCountry: 'Germaniya',
    greeting: 'Guten Tag! Willkommen',
    sub: 'Goethe B2 · Texnika va Fan',
    badge: '120M+ so‘zlashuvchi',
    color: '#f59e0b',
    x: '2%',
    y: '58%',
    animSpeed: '9.5s'
  },
  {
    id: 'fr',
    flag: '🇫🇷',
    country: 'France',
    nativeCountry: 'Fransiya',
    greeting: 'Bonjour! Enchanté',
    sub: 'DELF / DALF · Madaniyat va San‘at',
    badge: 'Diplomatiya tili',
    color: '#ec4899',
    x: '80%',
    y: '68%',
    animSpeed: '8s'
  },
  {
    id: 'es',
    flag: '🇪🇸',
    country: 'España',
    nativeCountry: 'Ispaniya',
    greeting: '¡Hola! ¿Qué tal?',
    sub: 'DELE xalqaro · 20+ davlat tili',
    badge: '500M+ so‘zlashuvchi',
    color: '#ef4444',
    x: '9%',
    y: '82%',
    animSpeed: '9s'
  },
  {
    id: 'jp',
    flag: '🇯🇵',
    country: 'Nihon (日本)',
    nativeCountry: 'Yaponiya',
    greeting: 'Konnichiwa (こんにちは)',
    sub: 'JLPT N5-N1 · Texnologiya yetakchisi',
    badge: 'Kunchiqar yurt',
    color: '#8b5cf6',
    x: '64%',
    y: '84%',
    animSpeed: '10s'
  },
  {
    id: 'tr',
    flag: '🇹🇷',
    country: 'Türkiye',
    nativeCountry: 'Turkiya',
    greeting: 'Merhaba! Hoş geldiniz',
    sub: 'TÖMER xalqaro · Qardosh turkiy til',
    badge: '90M+ so‘zlashuvchi',
    color: '#f97316',
    x: '26%',
    y: '6%',
    animSpeed: '7.8s'
  },
  {
    id: 'kr',
    flag: '🇰🇷',
    country: 'Hanguk (한국)',
    nativeCountry: 'Janubiy Koreya',
    greeting: 'Annyeong (안녕하세요)',
    sub: 'TOPIK I-II · Global K-Tech',
    badge: 'K-Innovatsiya',
    color: '#10b981',
    x: '55%',
    y: '6%',
    animSpeed: '8.2s'
  },
  {
    id: 'sa',
    flag: '🇸🇦',
    country: 'Al-Mamlaka',
    nativeCountry: 'Saudiya Arabistoni',
    greeting: 'Marhaban! (مرحباً)',
    sub: 'Al-Fusha mumtoz arab tili',
    badge: 'Sharq durdonasi',
    color: '#14b8a6',
    x: '42%',
    y: '90%',
    animSpeed: '9.2s'
  }
];

export function WorldFlagsBackground({ dark = true }: { dark?: boolean }) {
  // Deterministic distributed flags coordinates across the screen
  const flagsData: WorldFlagItem[] = useMemo(() => {
    const animTypes: WorldFlagItem['animType'][] = ['float-up', 'float-wave', 'float-drift', 'float-orbit'];

    return ALL_100_FLAGS.map((f, i) => {
      // Stratified grid distribution so all 100 flags spread evenly across the canvas
      const col = i % 10;
      const row = Math.floor(i / 10);

      // Pseudo-random deterministic offsets
      const seedX = ((i * 37 + 13) % 91);
      const seedY = ((i * 43 + 29) % 91);
      const sizeSeed = (i * 19) % 24; // 0..23
      const durSeed = (i * 17) % 18;  // 0..17
      const delaySeed = (i * 11) % 14;

      const x = Math.min(96, Math.max(2, (col * 10) + (seedX % 9) - 4));
      const y = Math.min(94, Math.max(3, (row * 9.5) + (seedY % 8) - 3));

      // Tier: 1 (deep small), 2 (mid), 3 (hero accent)
      const tier: 1 | 2 | 3 = (i % 5 === 0) ? 3 : (i % 2 === 0 ? 2 : 1);
      const size = tier === 3 ? 34 + (sizeSeed % 8) : (tier === 2 ? 24 + (sizeSeed % 6) : 17 + (sizeSeed % 5));
      const duration = 14 + durSeed;
      const delay = (delaySeed * 0.9);
      const opacity = dark
        ? (tier === 3 ? 0.42 : tier === 2 ? 0.28 : 0.16)
        : (tier === 3 ? 0.35 : tier === 2 ? 0.22 : 0.12);

      const animType = animTypes[i % animTypes.length];

      return {
        ...f,
        x,
        y,
        size,
        duration,
        delay,
        opacity,
        tier,
        animType
      };
    });
  }, [dark]);

  return (
    <div className={`world-flags-bg-root ${dark ? 'is-dark' : 'is-light'}`} aria-hidden="true">
      {/* 1. Global Ambient Mesh Glows */}
      <div className="world-flags-ambient-mesh">
        <div className="ambient-orb orb-primary" />
        <div className="ambient-orb orb-secondary" />
        <div className="ambient-orb orb-tertiary" />
      </div>

      {/* 2. 100 Famous Floating Flags Cloud */}
      <div className="world-flags-cloud">
        {flagsData.map((item) => (
          <div
            key={item.id}
            className={`flag-floating-particle tier-${item.tier} anim-${item.animType}`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: `${item.size}px`,
              opacity: item.opacity,
              animationDuration: `${item.duration}s`,
              animationDelay: `-${item.delay}s`,
            }}
            title={`${item.flag} ${item.name} — "${item.greeting}"`}
          >
            <span className="flag-glyph">{item.flag}</span>
            {item.tier === 3 && (
              <span className="flag-particle-tip">
                {item.name}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 3. Sleek Floating Country Glass Cards (Davlatlar kartalari) */}
      <div className="world-country-cards-layer">
        {FEATURED_COUNTRY_CARDS.map((card) => (
          <div
            key={card.id}
            className="world-glass-country-card"
            style={{
              left: card.x,
              top: card.y,
              animationDuration: card.animSpeed,
              ['--card-accent' as any]: card.color
            }}
          >
            <div className="card-glass-glow" />
            <div className="card-glass-content">
              <div className="card-top-row">
                <span className="card-flag-badge">{card.flag}</span>
                <div className="card-country-meta">
                  <strong className="card-country-name">{card.country}</strong>
                  <span className="card-native-name">{card.nativeCountry}</span>
                </div>
                <span className="card-pill-tag">{card.badge}</span>
              </div>

              <div className="card-greeting-quote">
                <span className="quote-mark">“</span>
                <span className="quote-text">{card.greeting}</span>
                <span className="quote-mark">”</span>
              </div>

              <div className="card-footer-sub">
                <span className="sub-dot" />
                <span className="sub-text">{card.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Ambient Horizontal Country Marquee Ribbon (Pastki orqa fon oqimi) */}
      <div className="world-marquee-drift">
        <div className="marquee-drift-track track-forward">
          {[...ALL_100_FLAGS.slice(0, 20), ...ALL_100_FLAGS.slice(0, 20)].map((f, idx) => (
            <div key={`m1-${f.id}-${idx}`} className="marquee-country-pill">
              <span className="m-flag">{f.flag}</span>
              <span className="m-name">{f.name}</span>
              <span className="m-greeting">«{f.greeting}»</span>
            </div>
          ))}
        </div>
      </div>

      {/* Component Scoped CSS Styles */}
      <style>{`
        /* ROOT WRAPPER — GPU ACCELERATED LAYER */
        .world-flags-bg-root {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
          user-select: none;
          contain: layout style paint;
        }

        /* Ambient glowing color orbs */
        .world-flags-ambient-mesh {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .ambient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.16;
          mix-blend-mode: screen;
          pointer-events: none;
          transform: translateZ(0);
        }
        .is-light .ambient-orb {
          mix-blend-mode: multiply;
          opacity: 0.08;
          filter: blur(70px);
        }
        .orb-primary {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #7869f5 0%, #3b82f6 70%, transparent 100%);
          top: -150px;
          right: -100px;
          animation: orbDrift1 22s ease-in-out infinite alternate;
        }
        .orb-secondary {
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, #0ea5e9 0%, #10b981 70%, transparent 100%);
          bottom: 5%;
          left: -120px;
          animation: orbDrift2 26s ease-in-out infinite alternate;
        }
        .orb-tertiary {
          width: 440px;
          height: 440px;
          background: radial-gradient(circle, #ec4899 0%, #8b5cf6 70%, transparent 100%);
          top: 38%;
          left: 45%;
          animation: orbDrift3 28s ease-in-out infinite alternate;
        }

        @keyframes orbDrift1 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          100% { transform: translate3d(-100px, 80px, 0) scale(1.18); }
        }
        @keyframes orbDrift2 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          100% { transform: translate3d(120px, -70px, 0) scale(1.15); }
        }
        @keyframes orbDrift3 {
          0% { transform: translate3d(0, 0, 0) scale(0.95); }
          100% { transform: translate3d(-80px, 90px, 0) scale(1.12); }
        }

        /* 100 FLOATING FLAGS CLOUD */
        .world-flags-cloud {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .flag-floating-particle {
          position: absolute;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          will-change: transform, opacity;
          cursor: default;
          pointer-events: auto;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
          transform: translate3d(0, 0, 0);
          filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.15));
        }
        .flag-floating-particle:hover {
          opacity: 1 !important;
          transform: scale(1.35) translateY(-6px) !important;
          z-index: 40 !important;
        }
        .flag-glyph {
          display: inline-block;
          line-height: 1;
          filter: saturate(1.2);
        }
        .flag-particle-tip {
          position: absolute;
          top: 100%;
          margin-top: 4px;
          white-space: nowrap;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
          background: rgba(15, 23, 42, 0.85);
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.15);
          opacity: 0;
          transform: translateY(4px);
          transition: all 0.2s ease;
          pointer-events: none;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
        }
        .flag-floating-particle:hover .flag-particle-tip {
          opacity: 1;
          transform: translateY(0);
        }
        .is-light .flag-particle-tip {
          background: rgba(255, 255, 255, 0.95);
          color: #0f172a;
          border-color: rgba(0, 0, 0, 0.1);
        }

        /* Particle Motion Variants */
        .anim-float-up {
          animation: floatParticleUp ease-in-out infinite alternate;
        }
        .anim-float-wave {
          animation: floatParticleWave ease-in-out infinite alternate;
        }
        .anim-float-drift {
          animation: floatParticleDrift ease-in-out infinite alternate;
        }
        .anim-float-orbit {
          animation: floatParticleOrbit ease-in-out infinite alternate;
        }

        @keyframes floatParticleUp {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(14px, -28px, 0) rotate(6deg); }
          100% { transform: translate3d(-12px, -52px, 0) rotate(-6deg); }
        }
        @keyframes floatParticleWave {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(-24px, 18px, 0) rotate(-8deg); }
          100% { transform: translate3d(22px, -24px, 0) rotate(8deg); }
        }
        @keyframes floatParticleDrift {
          0% { transform: translate3d(0, 0, 0) rotate(-4deg); }
          50% { transform: translate3d(26px, 22px, 0) rotate(5deg); }
          100% { transform: translate3d(-18px, 44px, 0) rotate(-5deg); }
        }
        @keyframes floatParticleOrbit {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); }
          33% { transform: translate3d(18px, -18px, 0) rotate(7deg); }
          66% { transform: translate3d(-18px, -28px, 0) rotate(-7deg); }
          100% { transform: translate3d(0, 0, 0) rotate(0deg); }
        }

        /* 3. SLEEK GLASS COUNTRY CARDS (DAVLATLAR KARTALARI) */
        .world-country-cards-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .world-glass-country-card {
          position: absolute;
          width: 240px;
          border-radius: 18px;
          padding: 14px 16px;
          pointer-events: auto;
          cursor: pointer;
          background: rgba(20, 36, 58, 0.42);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          color: #f8fafc;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          animation: floatCardSlow ease-in-out infinite alternate;
          will-change: transform;
          transform: translate3d(0, 0, 0);
        }
        .is-light .world-glass-country-card {
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(120, 105, 245, 0.16);
          box-shadow: 0 16px 36px rgba(120, 105, 245, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9);
          color: #0f172a;
        }
        .world-glass-country-card:hover {
          transform: scale(1.08) translateY(-8px) !important;
          background: rgba(20, 36, 58, 0.85);
          border-color: var(--card-accent, #7869f5);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45), 0 0 24px var(--card-accent, #7869f5);
          z-index: 50 !important;
        }
        .is-light .world-glass-country-card:hover {
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 24px 48px rgba(120, 105, 245, 0.22), 0 0 20px rgba(120, 105, 245, 0.35);
        }

        .card-glass-glow {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: radial-gradient(circle at 10% 20%, var(--card-accent, #7869f5), transparent 70%);
          opacity: 0.15;
          pointer-events: none;
        }
        .card-glass-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .card-top-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .card-flag-badge {
          font-size: 26px;
          line-height: 1;
          filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
          flex-shrink: 0;
        }
        .card-country-meta {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .card-country-name {
          font-size: 13.5px;
          font-weight: 850;
          letter-spacing: -0.2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-native-name {
          font-size: 10.5px;
          color: rgba(255, 255, 255, 0.65);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .is-light .card-native-name {
          color: #64748b;
        }
        .card-pill-tag {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 3px 7px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.1);
          color: var(--card-accent, #7869f5);
          border: 1px solid rgba(255, 255, 255, 0.12);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .is-light .card-pill-tag {
          background: rgba(120, 105, 245, 0.1);
          border-color: rgba(120, 105, 245, 0.2);
        }

        .card-greeting-quote {
          display: flex;
          align-items: baseline;
          gap: 2px;
          font-size: 13px;
          font-weight: 750;
          color: var(--card-accent, #7869f5);
          font-style: italic;
        }
        .quote-mark {
          font-size: 15px;
          opacity: 0.7;
        }
        .quote-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-footer-sub {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          color: rgba(255, 255, 255, 0.6);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 6px;
        }
        .is-light .card-footer-sub {
          color: #64748b;
          border-top-color: rgba(0, 0, 0, 0.06);
        }
        .sub-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--card-accent, #7869f5);
          flex-shrink: 0;
        }
        .sub-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @keyframes floatCardSlow {
          0% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(0, -12px, 0) rotate(1.2deg); }
          100% { transform: translate3d(0, 10px, 0) rotate(-1deg); }
        }

        /* 4. MARQUEE DRIFT STREAM AT BOTTOM/BACKGROUND */
        .world-marquee-drift {
          position: absolute;
          bottom: 2%;
          left: 0;
          width: 100%;
          overflow: hidden;
          opacity: 0.45;
          pointer-events: none;
          mask-image: linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 15%, black 85%, transparent 100%);
        }
        .is-light .world-marquee-drift {
          opacity: 0.35;
        }
        .marquee-drift-track {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: marqueeDrift 55s linear infinite;
        }
        .marquee-country-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 30px;
          background: rgba(20, 36, 58, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px);
          font-size: 11.5px;
          color: #cbd5e1;
          white-space: nowrap;
        }
        .is-light .marquee-country-pill {
          background: rgba(255, 255, 255, 0.55);
          border-color: rgba(0, 0, 0, 0.06);
          color: #475569;
        }
        .m-flag {
          font-size: 16px;
        }
        .m-name {
          font-weight: 750;
        }
        .m-greeting {
          opacity: 0.65;
          font-style: italic;
          font-size: 11px;
        }

        @keyframes marqueeDrift {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }

        /* RESPONSIVE DISPLAY ON TABLET & MOBILE */
        @media (max-width: 1100px) {
          .world-glass-country-card {
            width: 210px;
            padding: 10px 12px;
          }
          .card-country-name {
            font-size: 12px;
          }
        }

        @media (max-width: 768px) {
          /* On mobile, keep the cards compact and hide outer cards so they never block touch targets */
          .world-glass-country-card {
            width: 175px;
            padding: 8px 10px;
            border-radius: 14px;
            opacity: 0.45;
          }
          .card-pill-tag,
          .card-footer-sub {
            display: none;
          }
          .card-country-name {
            font-size: 11px;
          }
          .card-flag-badge {
            font-size: 20px;
          }
          .card-greeting-quote {
            font-size: 11px;
          }
          /* Hide tier 1 small flags to conserve mobile GPU / battery */
          .flag-floating-particle.tier-1 {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

