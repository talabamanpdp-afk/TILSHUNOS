export interface WordQuizItem {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  image: string;
  category: string;
  options: string[]; // 4 options including correct one
  lang: string;
}

export interface SpeakingQuestion {
  id: number;
  question: string;
  translation: string;
  timeLimitSec: number; // 30s
  sampleAnswer?: string;
  hint?: string;
}

export interface SpeakingDescribeImage {
  id: string;
  title: string;
  descriptionHint: string;
  imageUrl: string;
  timeLimitSec: number; // 60s
  type: 'describe' | 'spot_difference';
  keyVocabulary: string[];
}

export interface ReadingQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
}

export interface ReadingGapFillBlank {
  id: number;
  label: string;
  correctWord: string;
  options: string[];
}

export interface ReadingTestItem {
  id: string;
  title: string;
  genre: string;
  level: string;
  type: 'comprehension' | 'gap_fill';
  text: string;
  questions?: ReadingQuestion[];
  blanks?: ReadingGapFillBlank[];
}

export interface ListeningGapBlank {
  id: number;
  blankNumber: number;
  correctWord: string;
  options: string[];
  hint?: string;
}

export interface ListeningTestItem {
  id: string;
  title: string;
  youtubeUrl?: string; // YouTube video URL or ID (e.g. https://www.youtube.com/watch?v=...)
  audioUrl?: string;
  narrationScript: string;
  totalDurationSec: number;
  blanks: ListeningGapBlank[];
}

export interface WritingTestItem {
  id: string;
  topicTitle: string;
  genre: string;
  minWords: number; // 150
  promptDescription: string;
  bulletPoints: string[];
  sampleBand8Text?: string;
}

export interface WritingEssayItem {
  id: string;
  topicTitle: string;
  genre: string; // e.g. "Argumentative Essay", "Opinion Essay", "Problem-Solution"
  minWords: number; // 150
  promptDescription: string;
  bulletPoints: string[];
  sampleBand8Text?: string;
}

export interface WritingLetterItem {
  id: string;
  topicTitle: string;
  letterType: 'formal' | 'informal' | 'semi-formal';
  minWords: number; // 120
  promptDescription: string;
  bulletPoints: string[];
  sampleBand8Text?: string;
}

export interface GrammarQuestion {
  id: number;
  sentence: string;
  highlightedOptions: string[]; // e.g. ["She don't", "have", "enough money", "to buy"]
  errorIndex: number; // which highlighted option has the error
  correctCorrection: string; // "She doesn't"
  explanation: string;
}

export interface GrammarTestItem {
  id: string;
  title: string;
  level: string;
  passage: string;
  questions: GrammarQuestion[];
}

export interface GrammarTopicItem {
  id: string;
  title: string;
  level: string;
  explanationGuide: string; // 3-minute simple explanation with formulas, rules, and examples
  readTimeMin: number; // default 3
  questions: GrammarQuestion[];
}

export interface TrialTestsConfig {
  wordPool: WordQuizItem[];
  speaking: {
    part1Questions: SpeakingQuestion[];
    part2Images: SpeakingDescribeImage[];
  };
  reading: ReadingTestItem[];
  listening: ListeningTestItem;
  writing: WritingTestItem;
  writingPool?: {
    essayTopics: WritingEssayItem[];
    letterTopics: WritingLetterItem[];
  };
  grammar: GrammarTestItem;
  grammarTopics?: GrammarTopicItem[];
}

// 100 High-Quality Curated Image-Word Quiz Pool
export const DEFAULT_100_WORD_POOL: WordQuizItem[] = [
  // 1-10: Nature & Environment
  {
    id: 'w1',
    word: 'Mountain',
    translation: 'Tog‘',
    phonetic: '/ˈmaʊn.tən/',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    category: 'Nature',
    options: ['Mountain', 'Valley', 'River', 'Forest'],
    lang: 'en'
  },
  {
    id: 'w2',
    word: 'Waterfall',
    translation: 'Sharshara',
    phonetic: '/ˈwɔː.tə.fɔːl/',
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80',
    category: 'Nature',
    options: ['Waterfall', 'Lake', 'Ocean', 'Desert'],
    lang: 'en'
  },
  {
    id: 'w3',
    word: 'Desert',
    translation: 'Cho‘l',
    phonetic: '/ˈdez.ət/',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    category: 'Nature',
    options: ['Desert', 'Jungle', 'Meadow', 'Glacier'],
    lang: 'en'
  },
  {
    id: 'w4',
    word: 'Forest',
    translation: 'O‘rmon',
    phonetic: '/ˈfɒr.ɪst/',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    category: 'Nature',
    options: ['Forest', 'Beach', 'Cave', 'Island'],
    lang: 'en'
  },
  {
    id: 'w5',
    word: 'Lightning',
    translation: 'Chaqmoq',
    phonetic: '/ˈlaɪt.nɪŋ/',
    image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=600&q=80',
    category: 'Weather',
    options: ['Lightning', 'Rainbow', 'Snowstorm', 'Fog'],
    lang: 'en'
  },
  {
    id: 'w6',
    word: 'Rainbow',
    translation: 'Kamalak',
    phonetic: '/ˈreɪn.bəʊ/',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    category: 'Weather',
    options: ['Rainbow', 'Cloud', 'Sunrise', 'Tornado'],
    lang: 'en'
  },
  {
    id: 'w7',
    word: 'Island',
    translation: 'Orol',
    phonetic: '/ˈaɪ.lənd/',
    image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=600&q=80',
    category: 'Geography',
    options: ['Island', 'Peninsula', 'Continent', 'Coast'],
    lang: 'en'
  },
  {
    id: 'w8',
    word: 'Volcano',
    translation: 'Vulqon',
    phonetic: '/vɒlˈkeɪ.nəʊ/',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    category: 'Nature',
    options: ['Volcano', 'Canyon', 'Hill', 'Valley'],
    lang: 'en'
  },
  {
    id: 'w9',
    word: 'Glacier',
    translation: 'Muzlik',
    phonetic: '/ˈɡlæs.i.ər/',
    image: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=600&q=80',
    category: 'Nature',
    options: ['Glacier', 'Iceberg', 'Avalanche', 'Fjord'],
    lang: 'en'
  },
  {
    id: 'w10',
    word: 'Ocean',
    translation: 'Okean',
    phonetic: '/ˈəʊ.ʃən/',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    category: 'Nature',
    options: ['Ocean', 'Pond', 'River', 'Canal'],
    lang: 'en'
  },

  // 11-20: Animals & Wildlife
  {
    id: 'w11',
    word: 'Eagle',
    translation: 'Burgut',
    phonetic: '/ˈiː.ɡəl/',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=600&q=80',
    category: 'Animals',
    options: ['Eagle', 'Hawk', 'Owl', 'Falcon'],
    lang: 'en'
  },
  {
    id: 'w12',
    word: 'Dolphin',
    translation: 'Delfin',
    phonetic: '/ˈdɒl.fɪn/',
    image: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?auto=format&fit=crop&w=600&q=80',
    category: 'Animals',
    options: ['Dolphin', 'Whale', 'Shark', 'Seal'],
    lang: 'en'
  },
  {
    id: 'w13',
    word: 'Tiger',
    translation: 'Yo‘lbars',
    phonetic: '/ˈtaɪ.ɡər/',
    image: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80',
    category: 'Animals',
    options: ['Tiger', 'Lion', 'Leopard', 'Cheetah'],
    lang: 'en'
  },
  {
    id: 'w14',
    word: 'Butterfly',
    translation: 'Kapalak',
    phonetic: '/ˈbʌt.ə.flaɪ/',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
    category: 'Insects',
    options: ['Butterfly', 'Dragonfly', 'Bee', 'Ladybug'],
    lang: 'en'
  },
  {
    id: 'w15',
    word: 'Penguin',
    translation: 'Pingvin',
    phonetic: '/ˈpeŋ.ɡwɪn/',
    image: 'https://images.unsplash.com/photo-1598439210625-5067c578f3f6?auto=format&fit=crop&w=600&q=80',
    category: 'Animals',
    options: ['Penguin', 'Puffin', 'Pelican', 'Seagull'],
    lang: 'en'
  },
  {
    id: 'w16',
    word: 'Kangaroo',
    translation: 'Kenguru',
    phonetic: '/ˌkæŋ.ɡərˈuː/',
    image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=600&q=80',
    category: 'Animals',
    options: ['Kangaroo', 'Koala', 'Deer', 'Zebra'],
    lang: 'en'
  },
  {
    id: 'w17',
    word: 'Giraffe',
    translation: 'Jirafa',
    phonetic: '/dʒɪˈrɑːf/',
    image: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=600&q=80',
    category: 'Animals',
    options: ['Giraffe', 'Elephant', 'Camel', 'Horse'],
    lang: 'en'
  },
  {
    id: 'w18',
    word: 'Owl',
    translation: 'Boyqush',
    phonetic: '/aʊl/',
    image: 'https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?auto=format&fit=crop&w=600&q=80',
    category: 'Animals',
    options: ['Owl', 'Raven', 'Bat', 'Parrot'],
    lang: 'en'
  },
  {
    id: 'w19',
    word: 'Squirrel',
    translation: 'Mug‘uz / Olmaxon',
    phonetic: '/ˈskwɪr.əl/',
    image: 'https://images.unsplash.com/photo-1507666405895-422eee7d517f?auto=format&fit=crop&w=600&q=80',
    category: 'Animals',
    options: ['Squirrel', 'Hedgehog', 'Rabbit', 'Hamster'],
    lang: 'en'
  },
  {
    id: 'w20',
    word: 'Chameleon',
    translation: 'Buqalamun',
    phonetic: '/kəˈmiː.li.ən/',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    category: 'Animals',
    options: ['Chameleon', 'Lizard', 'Iguana', 'Gecko'],
    lang: 'en'
  },

  // 21-30: Professions & Careers
  {
    id: 'w21',
    word: 'Surgeon',
    translation: 'Jarroh',
    phonetic: '/ˈsɜː.dʒən/',
    image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80',
    category: 'Professions',
    options: ['Surgeon', 'Dentist', 'Pharmacist', 'Nurse'],
    lang: 'en'
  },
  {
    id: 'w22',
    word: 'Architect',
    translation: 'Me’mor',
    phonetic: '/ˈɑː.kɪ.tekt/',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
    category: 'Professions',
    options: ['Architect', 'Engineer', 'Carpenter', 'Designer'],
    lang: 'en'
  },
  {
    id: 'w23',
    word: 'Astronaut',
    translation: 'Falagiyotshunos / Fazogir',
    phonetic: '/ˈæs.trə.nɔːt/',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80',
    category: 'Professions',
    options: ['Astronaut', 'Pilot', 'Astronomer', 'Scientist'],
    lang: 'en'
  },
  {
    id: 'w24',
    word: 'Firefighter',
    translation: 'O‘t o‘chiruvchi',
    phonetic: '/ˈfaɪəˌfaɪ.tər/',
    image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=600&q=80',
    category: 'Professions',
    options: ['Firefighter', 'Police Officer', 'Soldier', 'Paramedic'],
    lang: 'en'
  },
  {
    id: 'w25',
    word: 'Chef',
    translation: 'Oshpaz',
    phonetic: '/ʃef/',
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80',
    category: 'Professions',
    options: ['Chef', 'Baker', 'Waiter', 'Butcher'],
    lang: 'en'
  },
  {
    id: 'w26',
    word: 'Judge',
    translation: 'Sudya',
    phonetic: '/dʒʌdʒ/',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    category: 'Professions',
    options: ['Judge', 'Lawyer', 'Diplomat', 'Politician'],
    lang: 'en'
  },
  {
    id: 'w27',
    word: 'Photographer',
    translation: 'Suratkash',
    phonetic: '/fəˈtɒɡ.rə.fər/',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=600&q=80',
    category: 'Professions',
    options: ['Photographer', 'Journalist', 'Director', 'Artist'],
    lang: 'en'
  },
  {
    id: 'w28',
    word: 'Musician',
    translation: 'Musiqachi',
    phonetic: '/mjuːˈzɪʃ.ən/',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    category: 'Art',
    options: ['Musician', 'Singer', 'Composer', 'Conductor'],
    lang: 'en'
  },
  {
    id: 'w29',
    word: 'Pilot',
    translation: 'Uchuvchi',
    phonetic: '/ˈpaɪ.lət/',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
    category: 'Aviation',
    options: ['Pilot', 'Flight Attendant', 'Navigator', 'Engineer'],
    lang: 'en'
  },
  {
    id: 'w30',
    word: 'Scientist',
    translation: 'Olim',
    phonetic: '/ˈsaɪən.tɪst/',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    category: 'Science',
    options: ['Scientist', 'Chemist', 'Physicist', 'Biologist'],
    lang: 'en'
  },

  // 31-40: City, Buildings & Places
  {
    id: 'w31',
    word: 'Skyscraper',
    translation: 'Osmono‘par bino',
    phonetic: '/ˈskaɪˌskreɪ.pər/',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    category: 'Architecture',
    options: ['Skyscraper', 'Castle', 'Monument', 'Tower'],
    lang: 'en'
  },
  {
    id: 'w32',
    word: 'Lighthouse',
    translation: 'Mayoq',
    phonetic: '/ˈlaɪt.haʊs/',
    image: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=600&q=80',
    category: 'Architecture',
    options: ['Lighthouse', 'Windmill', 'Harbor', 'Bridge'],
    lang: 'en'
  },
  {
    id: 'w33',
    word: 'Windmill',
    translation: 'Shamol tegirmoni',
    phonetic: '/ˈwɪnd.mɪl/',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    category: 'Architecture',
    options: ['Windmill', 'Barn', 'Factory', 'Watermill'],
    lang: 'en'
  },
  {
    id: 'w34',
    word: 'Bridge',
    translation: 'Ko‘prik',
    phonetic: '/brɪdʒ/',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    category: 'Infrastructure',
    options: ['Bridge', 'Tunnel', 'Highway', 'Pier'],
    lang: 'en'
  },
  {
    id: 'w35',
    word: 'Library',
    translation: 'Kutubxona',
    phonetic: '/ˈlaɪ.brər.i/',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80',
    category: 'Places',
    options: ['Library', 'Museum', 'Bookstore', 'Auditorium'],
    lang: 'en'
  },
  {
    id: 'w36',
    word: 'Airport',
    translation: 'Aeroport',
    phonetic: '/ˈeə.pɔːt/',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
    category: 'Travel',
    options: ['Airport', 'Train Station', 'Seaport', 'Bus Terminal'],
    lang: 'en'
  },
  {
    id: 'w37',
    word: 'Castle',
    translation: 'Qasr / Qal’a',
    phonetic: '/ˈkɑː.səl/',
    image: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?auto=format&fit=crop&w=600&q=80',
    category: 'History',
    options: ['Castle', 'Palace', 'Fortress', 'Mansion'],
    lang: 'en'
  },
  {
    id: 'w38',
    word: 'Museum',
    translation: 'Muzey',
    phonetic: '/mjuːˈziː.əm/',
    image: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=600&q=80',
    category: 'Culture',
    options: ['Museum', 'Art Gallery', 'Theater', 'Colosseum'],
    lang: 'en'
  },
  {
    id: 'w39',
    word: 'Subway',
    translation: 'Metropoliten / Metro',
    phonetic: '/ˈsʌb.weɪ/',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
    category: 'Transport',
    options: ['Subway', 'Tramway', 'Monorail', 'Underpass'],
    lang: 'en'
  },
  {
    id: 'w40',
    word: 'Stadium',
    translation: 'Stadion',
    phonetic: '/ˈsteɪ.di.əm/',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    category: 'Sports',
    options: ['Stadium', 'Arena', 'Gymnasium', 'Coliseum'],
    lang: 'en'
  },

  // 41-50: Technology & Objects
  {
    id: 'w41',
    word: 'Telescope',
    translation: 'Teleskop',
    phonetic: '/ˈtel.ɪ.skəʊp/',
    image: 'https://images.unsplash.com/photo-1520034475321-cbe63696469a?auto=format&fit=crop&w=600&q=80',
    category: 'Science',
    options: ['Telescope', 'Microscope', 'Binoculars', 'Periscope'],
    lang: 'en'
  },
  {
    id: 'w42',
    word: 'Microscope',
    translation: 'Mikroskop',
    phonetic: '/ˈmaɪ.krə.skəʊp/',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
    category: 'Science',
    options: ['Microscope', 'Centrifuge', 'Stethoscope', 'Thermometer'],
    lang: 'en'
  },
  {
    id: 'w43',
    word: 'Drone',
    translation: 'Dron',
    phonetic: '/drəʊn/',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80',
    category: 'Technology',
    options: ['Drone', 'Helicopter', 'Satellite', 'Radar'],
    lang: 'en'
  },
  {
    id: 'w44',
    word: 'Headphones',
    translation: 'Quloqchin',
    phonetic: '/ˈhed.fəʊnz/',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    category: 'Technology',
    options: ['Headphones', 'Speaker', 'Microphone', 'Amplifier'],
    lang: 'en'
  },
  {
    id: 'w45',
    word: 'Satellite',
    translation: 'Sun’iy yo‘ldosh',
    phonetic: '/ˈsæt.əl.aɪt/',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    category: 'Space',
    options: ['Satellite', 'Space Station', 'Asteroid', 'Spaceship'],
    lang: 'en'
  },
  {
    id: 'w46',
    word: 'Keyboard',
    translation: 'Klaviatura',
    phonetic: '/ˈkiː.bɔːd/',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    category: 'Technology',
    options: ['Keyboard', 'Touchpad', 'Screen', 'Mousepad'],
    lang: 'en'
  },
  {
    id: 'w47',
    word: 'Compass',
    translation: 'Kompas',
    phonetic: '/ˈkʌm.pəs/',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    category: 'Travel',
    options: ['Compass', 'Chronometer', 'Sundial', 'Protractor'],
    lang: 'en'
  },
  {
    id: 'w48',
    word: 'Hourglass',
    translation: 'Qumsoat',
    phonetic: '/ˈaʊə.ɡlɑːs/',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80',
    category: 'Time',
    options: ['Hourglass', 'Clock', 'Stopwatch', 'Pendulum'],
    lang: 'en'
  },
  {
    id: 'w49',
    word: 'Hot Air Balloon',
    translation: 'Havo shari',
    phonetic: '/ˌhɒt ˈeə bəˌluːn/',
    image: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=600&q=80',
    category: 'Aviation',
    options: ['Hot Air Balloon', 'Parachute', 'Blimp', 'Glider'],
    lang: 'en'
  },
  {
    id: 'w50',
    word: 'Submarine',
    translation: 'Suvosti kemasi',
    phonetic: '/ˌsʌb.məˈriːn/',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    category: 'Maritime',
    options: ['Submarine', 'Cruiser', 'Yacht', 'Hovercraft'],
    lang: 'en'
  },

  // 51-60: Food & Beverages
  {
    id: 'w51',
    word: 'Croissant',
    translation: 'Kruassan',
    phonetic: '/ˈkrwɑː.sɒ̃/',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    category: 'Food',
    options: ['Croissant', 'Bagel', 'Pretzel', 'Muffin'],
    lang: 'en'
  },
  {
    id: 'w52',
    word: 'Espresso',
    translation: 'Espresso qahvasi',
    phonetic: '/esˈpres.əʊ/',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    category: 'Drinks',
    options: ['Espresso', 'Cappuccino', 'Latte', 'Americano'],
    lang: 'en'
  },
  {
    id: 'w53',
    word: 'Pineapple',
    translation: 'Ananas',
    phonetic: '/ˈpaɪnˌæp.əl/',
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80',
    category: 'Fruits',
    options: ['Pineapple', 'Watermelon', 'Papaya', 'Mango'],
    lang: 'en'
  },
  {
    id: 'w54',
    word: 'Avocado',
    translation: 'Avokado',
    phonetic: '/ˌæv.əˈkɑː.dəʊ/',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
    category: 'Fruits',
    options: ['Avocado', 'Kiwi', 'Pear', 'Artichoke'],
    lang: 'en'
  },
  {
    id: 'w55',
    word: 'Sushi',
    translation: 'Sushi',
    phonetic: '/ˈsuː.ʃi/',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
    category: 'Food',
    options: ['Sushi', 'Ramen', 'Dumplings', 'Sashimi'],
    lang: 'en'
  },
  {
    id: 'w56',
    word: 'Pomegranate',
    translation: 'Anor',
    phonetic: '/ˈpɒm.ɪˌɡræn.ɪt/',
    image: 'https://images.unsplash.com/photo-1541344999736-83eca872f241?auto=format&fit=crop&w=600&q=80',
    category: 'Fruits',
    options: ['Pomegranate', 'Grapefruit', 'Fig', 'Plum'],
    lang: 'en'
  },
  {
    id: 'w57',
    word: 'Honey',
    translation: 'Asal',
    phonetic: '/ˈhʌn.i/',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    category: 'Food',
    options: ['Honey', 'Maple Syrup', 'Caramel', 'Molasses'],
    lang: 'en'
  },
  {
    id: 'w58',
    word: 'Almond',
    translation: 'Bodom',
    phonetic: '/ˈɑː.mənd/',
    image: 'https://images.unsplash.com/photo-1508061252224-237ff54ed5a4?auto=format&fit=crop&w=600&q=80',
    category: 'Nuts',
    options: ['Almond', 'Walnut', 'Hazelnut', 'Pistachio'],
    lang: 'en'
  },
  {
    id: 'w59',
    word: 'Cheese',
    translation: 'Pishloq',
    phonetic: '/tʃiːz/',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80',
    category: 'Food',
    options: ['Cheese', 'Butter', 'Yogurt', 'Cream'],
    lang: 'en'
  },
  {
    id: 'w60',
    word: 'Spices',
    translation: 'Ziravorlar',
    phonetic: '/ˈspaɪ.sɪz/',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    category: 'Food',
    options: ['Spices', 'Herbs', 'Seeds', 'Condiments'],
    lang: 'en'
  },

  // 61-70: Sports & Hobbies
  {
    id: 'w61',
    word: 'Archery',
    translation: 'Kamondan otish',
    phonetic: '/ˈɑː.tʃər.i/',
    image: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=600&q=80',
    category: 'Sports',
    options: ['Archery', 'Fencing', 'Shooting', 'Javelin'],
    lang: 'en'
  },
  {
    id: 'w62',
    word: 'Chess',
    translation: 'Shaxmat',
    phonetic: '/tʃes/',
    image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=600&q=80',
    category: 'Games',
    options: ['Chess', 'Checkers', 'Backgammon', 'Dominoes'],
    lang: 'en'
  },
  {
    id: 'w63',
    word: 'Surfing',
    translation: 'Syorfing',
    phonetic: '/ˈsɜː.fɪŋ/',
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80',
    category: 'Sports',
    options: ['Surfing', 'Sailing', 'Kayaking', 'Diving'],
    lang: 'en'
  },
  {
    id: 'w64',
    word: 'Snowboarding',
    translation: 'Snoubord sporti',
    phonetic: '/ˈsnəʊˌbɔː.dɪŋ/',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80',
    category: 'Sports',
    options: ['Snowboarding', 'Skiing', 'Ice Skating', 'Bobsleigh'],
    lang: 'en'
  },
  {
    id: 'w65',
    word: 'Scuba Diving',
    translation: 'Akvlangda sho‘ng‘ish',
    phonetic: '/ˈskuː.bə ˌdaɪ.vɪŋ/',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    category: 'Sports',
    options: ['Scuba Diving', 'Snorkeling', 'Freediving', 'Rowing'],
    lang: 'en'
  },
  {
    id: 'w66',
    word: 'Climbing',
    translation: 'Qoyaga tirmashish',
    phonetic: '/ˈklaɪ.mɪŋ/',
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=600&q=80',
    category: 'Sports',
    options: ['Climbing', 'Hiking', 'Trekking', 'Bouldering'],
    lang: 'en'
  },
  {
    id: 'w67',
    word: 'Pottery',
    translation: 'Kulolchilik',
    phonetic: '/ˈpɒt.ər.i/',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80',
    category: 'Art',
    options: ['Pottery', 'Sculpture', 'Carpentry', 'Weaving'],
    lang: 'en'
  },
  {
    id: 'w68',
    word: 'Sculpture',
    translation: 'Haykaltaroshlik',
    phonetic: '/ˈskʌlp.tʃər/',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    category: 'Art',
    options: ['Sculpture', 'Painting', 'Engraving', 'Mosaic'],
    lang: 'en'
  },
  {
    id: 'w69',
    word: 'Calligraphy',
    translation: 'Xattotlik',
    phonetic: '/kəˈlɪɡ.rə.fi/',
    image: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=600&q=80',
    category: 'Art',
    options: ['Calligraphy', 'Typography', 'Illustration', 'Origami'],
    lang: 'en'
  },
  {
    id: 'w70',
    word: 'Origami',
    translation: 'Origami (qog‘oz san’ati)',
    phonetic: '/ˌɒr.ɪˈɡɑː.mi/',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
    category: 'Crafts',
    options: ['Origami', 'Kirigami', 'Quilling', 'Embroidery'],
    lang: 'en'
  },

  // 71-80: Daily Life & Household
  {
    id: 'w71',
    word: 'Backpack',
    translation: 'Ryukzak / Orqa xalta',
    phonetic: '/ˈbæk.pæk/',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    category: 'Accessories',
    options: ['Backpack', 'Suitcase', 'Handbag', 'Briefcase'],
    lang: 'en'
  },
  {
    id: 'w72',
    word: 'Umbrella',
    translation: 'Soyabon',
    phonetic: '/ʌmˈbrel.ə/',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    category: 'Objects',
    options: ['Umbrella', 'Parasol', 'Raincoat', 'Canopy'],
    lang: 'en'
  },
  {
    id: 'w73',
    word: 'Candle',
    translation: 'Sham',
    phonetic: '/ˈkæn.dəl/',
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80',
    category: 'Objects',
    options: ['Candle', 'Lantern', 'Torch', 'Lamp'],
    lang: 'en'
  },
  {
    id: 'w74',
    word: 'Fireplace',
    translation: 'Kamin / O‘choq',
    phonetic: '/ˈfaɪə.pleɪs/',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    category: 'Home',
    options: ['Fireplace', 'Heater', 'Stove', 'Furnace'],
    lang: 'en'
  },
  {
    id: 'w75',
    word: 'Mirror',
    translation: 'Ko‘zgu / Oyna',
    phonetic: '/ˈmɪr.ər/',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    category: 'Home',
    options: ['Mirror', 'Window', 'Painting', 'Clock'],
    lang: 'en'
  },
  {
    id: 'w76',
    word: 'Clock',
    translation: 'Soat',
    phonetic: '/klɒk/',
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=600&q=80',
    category: 'Time',
    options: ['Clock', 'Watch', 'Compass', 'Thermometer'],
    lang: 'en'
  },
  {
    id: 'w77',
    word: 'Luggage',
    translation: 'Yuk / Chamadon',
    phonetic: '/ˈlʌɡ.ɪdʒ/',
    image: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?auto=format&fit=crop&w=600&q=80',
    category: 'Travel',
    options: ['Luggage', 'Backpack', 'Purse', 'Trunk'],
    lang: 'en'
  },
  {
    id: 'w78',
    word: 'Hammock',
    translation: 'Gamok (osma karovot)',
    phonetic: '/ˈhæm.ək/',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
    category: 'Outdoors',
    options: ['Hammock', 'Tent', 'Sleeping Bag', 'Mat'],
    lang: 'en'
  },
  {
    id: 'w79',
    word: 'Tent',
    translation: 'Chodir',
    phonetic: '/tent/',
    image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80',
    category: 'Camping',
    options: ['Tent', 'Cabin', 'Yurt', 'Bungalow'],
    lang: 'en'
  },
  {
    id: 'w80',
    word: 'Bonfire',
    translation: 'Gulxan',
    phonetic: '/ˈbɒn.faɪər/',
    image: 'https://images.unsplash.com/photo-1506543730435-e2c1d4553a84?auto=format&fit=crop&w=600&q=80',
    category: 'Camping',
    options: ['Bonfire', 'Candle', 'Flashlight', 'Beacon'],
    lang: 'en'
  },

  // 81-90: Plants & Botany
  {
    id: 'w81',
    word: 'Sunflower',
    translation: 'Kungaboqar',
    phonetic: '/ˈsʌnˌflaʊ.ər/',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
    category: 'Plants',
    options: ['Sunflower', 'Tulip', 'Daisy', 'Rose'],
    lang: 'en'
  },
  {
    id: 'w82',
    word: 'Cactus',
    translation: 'Kaktus',
    phonetic: '/ˈkæk.təs/',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80',
    category: 'Plants',
    options: ['Cactus', 'Fern', 'Aloe', 'Bamboo'],
    lang: 'en'
  },
  {
    id: 'w83',
    word: 'Bamboo',
    translation: 'Bambuk',
    phonetic: '/bæmˈbuː/',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    category: 'Plants',
    options: ['Bamboo', 'Sugar Cane', 'Reed', 'Palm'],
    lang: 'en'
  },
  {
    id: 'w84',
    word: 'Lavender',
    translation: 'Lavanda',
    phonetic: '/ˈlæv.ɪn.dər/',
    image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=600&q=80',
    category: 'Plants',
    options: ['Lavender', 'Lilac', 'Violet', 'Orchid'],
    lang: 'en'
  },
  {
    id: 'w85',
    word: 'Palm Tree',
    translation: 'Palma daraxti',
    phonetic: '/ˈpɑːm ˌtriː/',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80',
    category: 'Plants',
    options: ['Palm Tree', 'Oak Tree', 'Pine Tree', 'Birch'],
    lang: 'en'
  },
  {
    id: 'w86',
    word: 'Mushroom',
    translation: 'Qo‘ziqorin',
    phonetic: '/ˈmʌʃ.ruːm/',
    image: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&w=600&q=80',
    category: 'Fungi',
    options: ['Mushroom', 'Truffle', 'Moss', 'Lichen'],
    lang: 'en'
  },
  {
    id: 'w87',
    word: 'Lotus',
    translation: 'Nilufar guli / Lotus',
    phonetic: '/ˈləʊ.təs/',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80',
    category: 'Flowers',
    options: ['Lotus', 'Water Lily', 'Jasmine', 'Tulip'],
    lang: 'en'
  },
  {
    id: 'w88',
    word: 'Acorn',
    translation: 'Eman yong‘og‘i',
    phonetic: '/ˈeɪ.kɔːn/',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    category: 'Plants',
    options: ['Acorn', 'Pinecone', 'Chestnut', 'Walnut'],
    lang: 'en'
  },
  {
    id: 'w89',
    word: 'Pinecone',
    translation: 'Qarag‘ay g‘uddasi',
    phonetic: '/ˈpaɪn.kəʊn/',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
    category: 'Plants',
    options: ['Pinecone', 'Acorn', 'Nutmeg', 'Clove'],
    lang: 'en'
  },
  {
    id: 'w90',
    word: 'Maple Leaf',
    translation: 'Zarang bargi (chinor bargi)',
    phonetic: '/ˈmeɪ.pəl ˌliːf/',
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
    category: 'Plants',
    options: ['Maple Leaf', 'Oak Leaf', 'Palm Frond', 'Fern Leaf'],
    lang: 'en'
  },

  // 91-100: Astronomy, World & Concepts
  {
    id: 'w91',
    word: 'Galaxy',
    translation: 'Galaktika',
    phonetic: '/ˈɡæl.ək.si/',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80',
    category: 'Space',
    options: ['Galaxy', 'Nebula', 'Solar System', 'Constellation'],
    lang: 'en'
  },
  {
    id: 'w92',
    word: 'Aurora Borealis',
    translation: 'Qutb yog‘dusi',
    phonetic: '/ɔːˌrɔː.rə ˌbɔː.riˈɑː.lɪs/',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=600&q=80',
    category: 'Phenomenon',
    options: ['Aurora Borealis', 'Solar Flare', 'Eclipse', 'Meteor Shower'],
    lang: 'en'
  },
  {
    id: 'w93',
    word: 'Meteor',
    translation: 'Meteor / Oqar yulduz',
    phonetic: '/ˈmiː.ti.ɔːr/',
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
    category: 'Space',
    options: ['Meteor', 'Comet', 'Asteroid', 'Supernova'],
    lang: 'en'
  },
  {
    id: 'w94',
    word: 'Eclipse',
    translation: 'Quyosh/Oy tutilishi',
    phonetic: '/ɪˈklɪps/',
    image: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=600&q=80',
    category: 'Space',
    options: ['Eclipse', 'Equinox', 'Solstice', 'Zenith'],
    lang: 'en'
  },
  {
    id: 'w95',
    word: 'Pyramid',
    translation: 'Piramida',
    phonetic: '/ˈpɪr.ə.mɪd/',
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=600&q=80',
    category: 'Monuments',
    options: ['Pyramid', 'Sphinx', 'Obelisk', 'Temple'],
    lang: 'en'
  },
  {
    id: 'w96',
    word: 'Globe',
    translation: 'Globus',
    phonetic: '/ɡləʊb/',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80',
    category: 'Education',
    options: ['Globe', 'Atlas', 'Sphere', 'Planisphere'],
    lang: 'en'
  },
  {
    id: 'w97',
    word: 'Fountain',
    translation: 'Favvora',
    phonetic: '/ˈfaʊn.tɪn/',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80',
    category: 'Architecture',
    options: ['Fountain', 'Reservoir', 'Aqueduct', 'Canal'],
    lang: 'en'
  },
  {
    id: 'w98',
    word: 'Statue',
    translation: 'Haykal',
    phonetic: '/ˈstætʃ.uː/',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    category: 'Art',
    options: ['Statue', 'Bust', 'Pillar', 'Plaque'],
    lang: 'en'
  },
  {
    id: 'w99',
    word: 'Trophy',
    translation: 'Kubok / Mukofot',
    phonetic: '/ˈtrəʊ.fi/',
    image: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=600&q=80',
    category: 'Achievements',
    options: ['Trophy', 'Medal', 'Diploma', 'Badge'],
    lang: 'en'
  },
  {
    id: 'w100',
    word: 'Diploma',
    translation: 'Diplom / Sertifikat',
    phonetic: '/dɪˈpləʊ.mə/',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
    category: 'Education',
    options: ['Diploma', 'Certificate', 'Scroll', 'Degree'],
    lang: 'en'
  }
];

// Rich Speaking Default Data (Part 1: 5 Questions, Part 2: Describe Image)
export const DEFAULT_SPEAKING_QUESTIONS: SpeakingQuestion[] = [
  {
    id: 1,
    question: "Can you please introduce yourself and describe where you grew up?",
    translation: "O‘zingizni tanishtiring va qayerda ulg‘ayganingizni aytib bering.",
    timeLimitSec: 30,
    hint: "Ismingiz, tug‘ilgan shahringiz va u yerdagi muhit haqida gapiring.",
    sampleAnswer: "Hello! My name is Soxibjon. I grew up in a vibrant city in Uzbekistan known for its rich history and warm hospitality."
  },
  {
    id: 2,
    question: "What are your favorite hobbies and how do you spend your weekends?",
    translation: "Qanday sevimli mashg‘ulotlaringiz bor va dam olish kunlarini qanday o‘tkazasiz?",
    timeLimitSec: 30,
    hint: "Kitob o‘qish, sport, do‘stlar bilan vaqt o‘tkazish haqida ayting.",
    sampleAnswer: "During my free time, I really enjoy reading personal development books, coding new creative apps, and spending time outdoors."
  },
  {
    id: 3,
    question: "Why are you currently learning this foreign language?",
    translation: "Nima uchun ayni paytda ushbu chet tilini o‘rganmoqdasiz?",
    timeLimitSec: 30,
    hint: "Karyera imkoniyatlari, xalqaro ta’lim va sayohat maqsadlarini tilga oling.",
    sampleAnswer: "I am learning this language to unlock global career opportunities, access top educational materials, and communicate freely with people worldwide."
  },
  {
    id: 4,
    question: "Describe a memorable journey or an exciting place you have visited.",
    translation: "O‘zingiz tashrif buyurgan unutilmas sayohat yoki ajoyib joyni tasvirlang.",
    timeLimitSec: 30,
    hint: "Qachon borganingiz, nimalarni ko‘rganingiz va nima uchun yodingizda qolganini tushuntiring.",
    sampleAnswer: "One of the most memorable places I visited was the ancient city of Samarkand. The breathtaking architecture and turquoise domes truly inspired me."
  },
  {
    id: 5,
    question: "What are your main personal and professional goals for the next three years?",
    translation: "Keyingi 3 yil uchun asosiy shaxsiy va professional maqsadlaringiz nimalardan iborat?",
    timeLimitSec: 30,
    hint: "Til darajasini oshirish, kasbiy yutuqlar yoki yangi loyihalar haqida so‘zlang.",
    sampleAnswer: "In the next three years, I aim to master advanced English at a C1 level, build an impactful technology project, and study for international qualifications."
  }
];

// Speaking Part 2: Describe Image pool (60s timer)
export const DEFAULT_SPEAKING_DESCRIBE_IMAGES: SpeakingDescribeImage[] = [
  {
    id: 's-img-1',
    title: 'A Busy City Center at Dusk',
    descriptionHint: 'Gavjum zamonaviy shahar markazi, odamlar oqimi, baland binolar va ko‘cha chiroqlarini tasvirlang.',
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1000&q=80',
    timeLimitSec: 60,
    type: 'describe',
    keyVocabulary: ['pedestrians', 'illuminated skyscrapers', 'rush hour', 'vibrant atmosphere', 'urban life']
  },
  {
    id: 's-img-2',
    title: 'Collaborative Study Session in a Modern Library',
    descriptionHint: 'Kutubxonada birgalikda dars qilayotgan talabalar, noutbuklar, kitoblar va do‘stona muhitni tasvirlang.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
    timeLimitSec: 60,
    type: 'describe',
    keyVocabulary: ['students', 'collaboration', 'researching', 'bookshelves', 'focus and teamwork']
  },
  {
    id: 's-img-3',
    title: 'Cozy Family Gathering in an Open Kitchen',
    descriptionHint: 'Oshxonada birgalikda taom tayyorlayotgan va suhbatlashayotgan ahil oila a’zolarini tasvirlang.',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80',
    timeLimitSec: 60,
    type: 'describe',
    keyVocabulary: ['family members', 'preparing meals', 'warm smile', 'vegetables', 'togetherness']
  }
];

// Reading Default Data (Comprehension & Gap-Fill)
export const DEFAULT_READING_TESTS: ReadingTestItem[] = [
  {
    id: 'r-comp-1',
    title: 'The Architecture of Neuroplasticity and Habit Formation',
    genre: 'Ilmiy-ommabop maqola (Cognitive Science)',
    level: 'B1 - B2',
    type: 'comprehension',
    text: `For centuries, neuroscientists assumed that the adult human brain was structurally fixed and incapable of significant biological restructuring after adolescence. However, modern neuroimaging technologies have decisively overturned this dogma, revealing a phenomenon known as neuroplasticity.

Neuroplasticity is the brain's extraordinary ability to reorganize itself by forming novel neural pathways throughout life. Whenever an individual learns a foreign language, practices an intricate musical instrument, or acquires a motor skill, neurons synthesize new synaptic connections and strengthen existing circuits.

Consistent repetition plays a pivotal role in this transformation. When a specific cognitive activity is performed regularly, the myelin sheath insulating the nerve fibers thickens, accelerating signal transmission. Consequently, what initially required conscious concentration gradually transforms into an effortless, automatic habit. Learning is not merely the accumulation of abstract information; it is a physical sculpturing of neural architecture.`,
    questions: [
      {
        id: 1,
        question: "What traditional belief did modern neuroimaging decisively overturn?",
        options: [
          "That adult brains cannot reorganize or form new neural pathways",
          "That languages are easier to learn in older age",
          "That neurons do not require oxygen for synaptic connections",
          "That memory is stored exclusively in the temporal lobe"
        ],
        correctAnswer: 0,
        explanation: "Matnning 1-xatboshisida ta'kidlanishicha, ilgari katta yoshli inson miyasi o'zgarmas deb hisoblangan, biroq neyroplastiklik buni inkor etdi."
      },
      {
        id: 2,
        question: "According to the passage, how does repetitive practice physically alter brain structure?",
        options: [
          "It decreases the number of synaptic receptors",
          "It thickens the myelin sheath and accelerates signal transmission",
          "It reduces blood flow to cognitive centers",
          "It prevents the synthesis of neurotransmitters"
        ],
        correctAnswer: 1,
        explanation: "3-xatboshida aytilishicha, muntazam takrorlash mielin qobig'ini qalinlashtiradi va signallar o'tishini tezlashtiradi."
      },
      {
        id: 3,
        question: "The word 'pivotal' in the final paragraph is closest in meaning to:",
        options: [
          "Insignificant",
          "Crucial and decisive",
          "Temporary",
          "Hazardous"
        ],
        correctAnswer: 1,
        explanation: "'Pivotal' so'zi eng muhim, hal qiluvchi (crucial, central) degan ma'noni anglatadi."
      },
      {
        id: 4,
        question: "What is the primary conclusion of the author regarding learning?",
        options: [
          "Learning is merely gathering theoretical knowledge",
          "Adults should avoid learning complex instruments",
          "Learning is an active physical sculpturing of neural architecture",
          "Habits are impossible to establish without medical intervention"
        ],
        correctAnswer: 2,
        explanation: "Matn oxirida 'Learning is not merely abstract information; it is a physical sculpturing of neural architecture' deb xulosa qilinadi."
      }
    ]
  },
  {
    id: 'r-gap-1',
    title: 'The Sustainable Cities of Tomorrow',
    genre: 'Bo‘sh joylarni to‘ldirish (Gap-Fill Passage)',
    level: 'B1',
    type: 'gap_fill',
    text: `As global urbanization continues at an unprecedented pace, architects and urban planners are reimagining the blueprint of future metropolises. Future cities must not merely house growing populations, but also drastically reduce carbon {1}.

One foundational strategy involves {2} energy systems such as solar panels and geothermal grids integrated directly into building facades. Furthermore, sustainable urban transit emphasizes bicycle lanes and electric public transportation, thereby significantly {3} air quality.

Finally, integrating vertical gardens and rooftop vegetation restores natural biodiversity and combats urban heat islands, creating a healthier, more {4} environment for citizens.`,
    blanks: [
      {
        id: 1,
        label: '1-bo‘sh joy',
        correctWord: 'emissions',
        options: ['emissions', 'creations', 'traditions', 'dimensions']
      },
      {
        id: 2,
        label: '2-bo‘sh joy',
        correctWord: 'renewable',
        options: ['renewable', 'temporary', 'harmful', 'artificial']
      },
      {
        id: 3,
        label: '3-bo‘sh joy',
        correctWord: 'improving',
        options: ['improving', 'damaging', 'distorting', 'ignoring']
      },
      {
        id: 4,
        label: '4-bo‘sh joy',
        correctWord: 'resilient',
        options: ['resilient', 'polluted', 'dangerous', 'stagnant']
      }
    ]
  }
];

// Listening Default Data (YouTube link or audio, strict limit, gap-fill)
export const DEFAULT_LISTENING_TEST: ListeningTestItem = {
  id: 'l-test-1',
  title: 'The Power of Active Listening and Cultural Empathy',
  youtubeUrl: 'https://www.youtube.com/watch?v=0hK2f3VfP0U',
  audioUrl: '',
  totalDurationSec: 68,
  narrationScript: "Effective communication across cultures requires much more than just a wide vocabulary and flawless grammar. In today's interconnected society, genuine mutual understanding depends upon active empathy and patient listening. When individuals listen with sincere curiosity, they bridge cultural divides and establish lasting mutual respect that transcends geographic boundaries.",
  blanks: [
    {
      id: 1,
      blankNumber: 1,
      correctWord: 'communication',
      options: ['communication', 'transportation', 'imagination', 'anticipation'],
      hint: 'Muloqot va axborot almashish jarayoni'
    },
    {
      id: 2,
      blankNumber: 2,
      correctWord: 'interconnected',
      options: ['interconnected', 'isolated', 'interrupted', 'underrated'],
      hint: 'Bir-biri bilan chambarchas bog‘langan'
    },
    {
      id: 3,
      blankNumber: 3,
      correctWord: 'empathy',
      options: ['empathy', 'sympathy', 'apathy', 'jealousy'],
      hint: 'O‘zgalar his-tuyg‘usini chuqur tushunish'
    },
    {
      id: 4,
      blankNumber: 4,
      correctWord: 'boundaries',
      options: ['boundaries', 'mountains', 'territories', 'languages'],
      hint: 'Chegaralar yoki cheklovlar'
    }
  ]
};

// Writing Default Data (Minimum 150 words requirement + instant AI evaluation)
export const DEFAULT_WRITING_TEST: WritingTestItem = {
  id: 'w-test-1',
  topicTitle: 'The Influence of Artificial Intelligence on Education and Future Careers',
  genre: 'Argumentative & Evaluative Essay',
  minWords: 150,
  promptDescription: "Artificial intelligence (AI) is transforming the way students study and professionals work around the globe. Some believe that AI will replace traditional teachers and human workers, while others argue that it will serve as an empowering assistant that amplifies human creativity.",
  bulletPoints: [
    "Discuss both sides of this argument.",
    "Give your own opinion backed by specific real-world examples.",
    "Write at least 150 words in clear, well-structured paragraphs (Introduction, Body, Conclusion)."
  ],
  sampleBand8Text: `In recent years, the rapid advancement of artificial intelligence has sparked intense debate regarding its implications for education and modern employment. While certain skeptics fear that automation could displace teachers and knowledge workers, I firmly believe that AI will primarily function as a powerful catalyst for human empowerment rather than a complete replacement.

On the one hand, AI-powered tools offer unprecedented personalization in learning. Rather than adhering to a rigid one-size-fits-all curriculum, students can now receive tailored explanations, instantaneous feedback, and 24/7 tutoring suited to their unique pace. In the workplace, automating repetitive analytical tasks allows specialists to focus on higher-order problem-solving and strategic thinking.

On the other hand, essential human qualities such as emotional intelligence, ethical discernment, and creative nuance cannot be replicated by algorithms. Teachers provide mentorship, empathy, and moral guidance that remain irreplaceable.

In conclusion, artificial intelligence should be embraced as an augmentative tool that elevates human potential, provided it is governed with wisdom and ethical responsibility.`
};

// Writing Essay Pool (Part 1 - Random Assignment)
export const DEFAULT_WRITING_ESSAYS: WritingEssayItem[] = [
  {
    id: 'essay-1',
    topicTitle: 'Environment & Climate Change: Individual Responsibility vs Government Action',
    genre: 'Argumentative Essay',
    minWords: 150,
    promptDescription: "Global warming and ecological degradation pose critical threats to our planet. Some people assert that international governments and corporations must bear the sole responsibility for solving climate issues, whereas others contend that individual lifestyle shifts are equally paramount.",
    bulletPoints: [
      "Discuss both viewpoints in detail.",
      "Explain the specific role of renewable energy policies versus consumer habits.",
      "Conclude with your personal stance supported by logical reasoning."
    ],
    sampleBand8Text: `Climate degradation represents one of the most pressing crises of the modern era. While large corporations and legislative bodies undeniably hold the keys to systemic reform, I contend that sustainable consumer choices and grassroots movements are equally indispensable in mitigating environmental harm.

On one level, state intervention is mandatory to enforce green infrastructure. Without stringent emissions caps, carbon taxation, and substantial subsidies for renewable energies, corporate giants will continue prioritizing short-term profits over ecological balance. National policy has the unique authority to revolutionize energy grids and waste management systems at scale.

Conversely, public demand dictates industrial output. When conscious citizens transition toward zero-waste lifestyles, minimize single-use plastics, and adopt public transit, markets inevitably shift to satisfy these sustainable preferences. Individual mindfulness fosters a societal culture that holds institutions accountable.

To conclude, addressing climate change demands a harmonious synergy between top-down governmental enforcement and bottom-up individual vigilance.`
  },
  {
    id: 'essay-2',
    topicTitle: 'Artificial Intelligence & Future Careers: Catalyst or Threat?',
    genre: 'Evaluative Essay',
    minWords: 150,
    promptDescription: "The rapid integration of AI into industries has created unprecedented anxieties regarding job obsolescence. To what extent will AI redefine human labor, and how can future generations adapt?",
    bulletPoints: [
      "Analyze the impact of automation on routine and analytical tasks.",
      "Highlight irreplaceable human traits such as emotional intelligence and creative empathy.",
      "Propose actionable strategies for lifelong learning and educational reform."
    ],
    sampleBand8Text: `The rise of generative artificial intelligence is rapidly restructuring the global labor landscape. Although alarms regarding massive job displacement are understandable, history demonstrates that technological revolutions typically redefine work rather than eliminate it outright.

Automation undoubtedly excels at processing massive datasets, writing baseline software code, and handling redundant administrative workflows. However, this shift liberates human specialists to focus on strategic leadership, ethical judgment, and complex interpersonal diplomacy—domains where algorithmic models remain inadequate.

To prosper in this evolving era, educational curricula must pivot away from rote memorization and toward critical problem-solving, cognitive agility, and technological fluency. Professionals who leverage AI as a collaborative companion rather than an adversary will spearhead the modern economy.

In conclusion, AI is an augmentative amplifier of human ingenuity, destined to reshape professional roles into higher-value creative pursuits.`
  },
  {
    id: 'essay-3',
    topicTitle: 'Urbanization & Smart Cities: Sustainable Living for Future Generations',
    genre: 'Problem-Solution Essay',
    minWords: 150,
    promptDescription: "More than half of the world's population resides in urban metropolises, resulting in severe traffic congestion, housing shortages, and environmental strain. What major problems does this cause, and what solutions can smart city planning offer?",
    bulletPoints: [
      "Identify the primary challenges caused by uncontrolled urban sprawl.",
      "Explain how smart city technologies (intelligent grids, green transit) solve these issues.",
      "Offer realistic recommendations for local municipalities."
    ],
    sampleBand8Text: `Rapid urban migration has placed unprecedented strain on metropolitan infrastructure worldwide. Overcrowding, chronic traffic gridlock, and substandard air quality increasingly jeopardize the well-being of city dwellers. Nevertheless, implementing smart urban planning paradigms presents a viable path forward.

A prominent solution lies in establishing compact, decentralized '15-minute cities', where all fundamental services—employment, healthcare, and leisure—are accessible within a brief walk or cycle. Coupled with automated electric transit networks and sensor-driven traffic signals, this drastically reduces vehicular emissions and commuter stress.

Furthermore, retrofitting metropolitan architectures with vertical greenery and rooftop solar installations neutralizes urban heat islands while generating clean localized power.

In summary, while urban density creates intense logistical hurdles, embracing data-driven sustainable architecture transforms metropolises into resilient hubs of human flourishing.`
  },
  {
    id: 'essay-4',
    topicTitle: 'Global Tourism and Cultural Identity: Preservation or Dilution?',
    genre: 'Discursive Essay',
    minWords: 150,
    promptDescription: "International travel has expanded dramatically over the past two decades. Does massive tourism preserve cultural heritage by providing economic revenues, or does it erode authentic local traditions?",
    bulletPoints: [
      "Examine how tourism finances historical restoration and creates jobs.",
      "Discuss the risks of commercialization and cultural homogenization.",
      "Suggest balanced solutions for sustainable cultural tourism."
    ],
    sampleBand8Text: `The meteoric expansion of international travel has sparked ongoing discussion regarding its cultural ramifications. While mass tourism inevitably risks trivializing authentic customs into commercial spectacles, it simultaneously supplies vital funding for historical conservation that would otherwise languish unfunded.

Economically, revenue generated by visitors sustains artisanal trades, funds museum upkeep, and restores ancient architectural monuments. In destinations such as Samarkand or Venice, tourist interest directly revitalizes centuries-old craftsmanship and folklore that might otherwise fade in a modernized world.

Nonetheless, overtourism must be systematically regulated to prevent the erosion of residential community life and cultural authenticity. Implementing visitor quotas and promoting community-based ecotourism ensures that travel fosters reciprocal respect rather than shallow consumption.

Ultimately, conscious and well-regulated tourism serves as a powerful bridge connecting civilizations while preserving sacred cultural heritage.`
  }
];

// Writing Letter Pool (Part 2 - Random Assignment)
export const DEFAULT_WRITING_LETTERS: WritingLetterItem[] = [
  {
    id: 'letter-1',
    topicTitle: 'Xalqaro Kompaniyaga Ishga Qabul Qilish Arizasi (Formal Job Application Letter)',
    letterType: 'formal',
    minWords: 120,
    promptDescription: "Siz xalqaro kompaniyada e’lon qilingan bo‘sh ish o‘rni (masalan: Junior Project Manager yoki Content Specialist) uchun rasmiy ariza xati yozishingiz lozim.",
    bulletPoints: [
      "O‘zingizni tanishtiring va qaysi lavozimga murojaat qilayotganingizni yozing.",
      "O‘z bilimingiz, xorijiy til darajangiz va asosiy yutuqlaringizni ta’riflang.",
      "Kompaniya bilan suhbatga (interview) tayyor ekanligingizni bildirib xatni yakunlang."
    ],
    sampleBand8Text: `Dear Hiring Committee,

I am writing to express my enthusiastic interest in the Project Specialist position currently advertised on your corporate careers portal. With a strong academic background in linguistics and three years of practical experience coordinating cross-functional educational initiatives, I am eager to contribute effectively to your global team.

Throughout my tenure at my previous organization, I successfully spearheaded digital collaboration workshops, improving workflow efficiency by over twenty percent. Moreover, possessing certified C1 English fluency enables me to communicate seamlessly with diverse international stakeholders and draft comprehensive operational reports.

I would welcome the opportunity to discuss in greater detail how my qualifications and proactive work ethic align with your organizational goals. Thank you for your time and consideration.

Yours faithfully,
Akmal Rahimov`
  },
  {
    id: 'letter-2',
    topicTitle: 'Xorijdagi Do‘stga O‘zbekistonga Sayohat Haqida Xat (Informal Letter to a Friend)',
    letterType: 'informal',
    minWords: 120,
    promptDescription: "Xorijdagi chet ellik do‘stingiz O‘zbekistonga sayohat qilishni rejalashtirmoqda. Unga samimiy xat yozib, qaysi shaharlarni ziyorat qilishni va nimalarga e’tibor berishni maslahat bering.",
    bulletPoints: [
      "Do‘stingizning safari haqidagi yangilikdan xursand ekanligingizni bildiring.",
      "Samarqand, Buxoro yoki Xivada ko‘rish lozim bo‘lgan tarixiy obidalar va milliy taomlarni tavsiya qiling.",
      "Uning aeroportda kutib olinishi yoki mehmondorchilik taklifini bildiring."
    ],
    sampleBand8Text: `Dear Alex,

It was such a fantastic surprise to hear that you are planning a trip to Uzbekistan this coming spring! You simply could not have chosen a more scenic season to explore our ancient Silk Road heritage.

I strongly recommend spending at least two days wandering through Samarkand's breathtaking Registan Square and savoring authentic Samarkand plov. After that, head straight to Bukhara, where walking through the old fortress feels like stepping directly into a historical fairytale. Don't forget to pack comfortable walking shoes, as you will be exploring magnificent bazaars and minarets from sunrise to sunset!

Let me know your exact flight details as soon as they are confirmed—I will gladly meet you at the airport and show you around Tashkent.

Warm wishes,
Sardor`
  },
  {
    id: 'letter-3',
    topicTitle: 'Shahar Hokimiyatiga Jamoat Transporti Bo‘yicha Taklif (Semi-formal Complaint / Suggestion Letter)',
    letterType: 'semi-formal',
    minWords: 120,
    promptDescription: "Yashash tumaningizdagi jamoat transporti harakati va bekatlar holatini yaxshilash yuzasidan shahar transport boshqarmasiga muloyim va asosli taklif xati yozing.",
    bulletPoints: [
      "Murojaat sababini va tumaningizdagi transport bilan bog‘liq asosiy muammoni bayon qiling.",
      "Bu muammo o‘quvchilar va ishchilar kun tartibiga qanday salbiy ta’sir ko‘rsatayotganini tushuntiring.",
      "Vaziyatni o‘nglash uchun 2 ta aniq, amaliy yechim taklif qiling."
    ],
    sampleBand8Text: `Dear Municipal Transport Authorities,

I am writing to draw your attention to the increasing transit congestion and bus scheduling delays currently affecting residents in the Chilanzar district. Over the past three months, commuter wait times during peak morning hours have exceeded forty minutes.

This chronic irregularity creates substantial disruption for students attempting to reach universities on time, as well as working professionals facing workplace penalties. Furthermore, during evening rush hours, arriving buses are severely overcrowded, posing both comfort and safety concerns.

To remedy this situation constructively, I respectfully propose introducing two express bus routes operating specifically between 7:30 and 9:30 AM. Additionally, installing digital arrival tracking screens at major intersections would help commuters plan their transit efficiently.

Thank you for your proactive dedication to our city's infrastructure.

Sincerely,
Dilnoza Karimova`
  }
];

// Grammar Default Data (Identify error in text & correct it)
export const DEFAULT_GRAMMAR_TEST: GrammarTestItem = {
  id: 'g-test-1',
  title: 'Grammar & Syntax Error Detection',
  level: 'B1 - B2',
  passage: 'Quyidagi gaplarda tagiga chizilgan qismlardan qaysi biri grammatik xatoga ega ekanligini aniqlang va to‘g‘ri shaklini belgilang.',
  questions: [
    {
      id: 1,
      sentence: "Neither the team manager nor the players was prepared for the sudden rule alteration.",
      highlightedOptions: ["Neither", "nor", "was prepared", "rule alteration"],
      errorIndex: 2,
      correctCorrection: "were prepared",
      explanation: "'Neither ... nor ...' konstruksiyasida fe'l ikkinchi o'rindagi otga ('players' - ko'plik) moslashadi, shuning uchun 'was' emas, 'were prepared' bo'lishi shart."
    },
    {
      id: 2,
      sentence: "If she had arrived at the airport on time, she wouldn't missed the international conference flight.",
      highlightedOptions: ["had arrived", "on time", "wouldn't missed", "international conference"],
      errorIndex: 2,
      correctCorrection: "wouldn't have missed",
      explanation: "Third Conditional (o'tgan zamondagi nereal shart) qoidasiga ko'ra: If + Past Perfect, would/could + have + V3. Shuning uchun 'wouldn't have missed' to'g'ri shakldir."
    },
    {
      id: 3,
      sentence: "Despite of the heavy morning downpour, thousands of enthusiastic runners completed the marathon.",
      highlightedOptions: ["Despite of", "heavy morning downpour", "thousands of", "completed the marathon"],
      errorIndex: 0,
      correctCorrection: "Despite (or 'In spite of')",
      explanation: "'Despite' so'zidan keyin 'of' ishlatilmaydi ('Despite the heavy...'). 'Of' predlogi faqat 'In spite of' iborasida qo'llaniladi."
    },
    {
      id: 4,
      sentence: "The committee has decided to postpone their final decision until next Monday's session.",
      highlightedOptions: ["has decided", "to postpone", "their final decision", "next Monday's session"],
      errorIndex: 2,
      correctCorrection: "its final decision",
      explanation: "Gap boshidagi 'The committee has decided' birlik fe'l ('has') olgan, shuning uchun unga nisbatan egalik olmoshi ham birlikda ('its final decision') bo'lishi kerak."
    },
    {
      id: 5,
      sentence: "Hardly had the keynote speaker began his presentation when the power suddenly cut off.",
      highlightedOptions: ["Hardly had", "speaker began", "his presentation", "when the power"],
      errorIndex: 1,
      correctCorrection: "speaker begun",
      explanation: "Inversiyali 'Hardly had + Subject + V3' qolipida 'begin' fe'lining uchinchi shakli (Past Participle) 'begun' bo'lishi zarur."
    }
  ]
};

// Grammar Topics Pool (Each topic has a 3-minute simple explanation + practice questions)
export const DEFAULT_GRAMMAR_TOPICS: GrammarTopicItem[] = [
  {
    id: 'gt-1',
    title: 'Past Simple va Past Continuous (O‘tgan Zamon Qoidalari)',
    level: 'A2 - B1',
    readTimeMin: 3,
    explanationGuide: `⏱️ 3 DAQIQALIK SODDA VA QISQA TUSHUNTIRISH:

1. Past Simple (Oddiy o‘tgan zamon):
   • Formula: Ega + V2 (to‘g‘ri fe’llarga -ed, noto‘g‘ri fe’llar 2-ustun).
   • Inkor / So‘roq: didn't + V1 / Did + Ega + V1?
   • Qachon ishlatiladi: O‘tgan zamonda aniq vaqtda (yesterday, in 2021, two days ago) tugallangan qisqa harakatlar uchun.
   • Misol: "I visited London in 2022." (Vaqt aniq, ish tugagan).

2. Past Continuous (O‘tgan davomli zamon):
   • Formula: was / were + V-ing.
   • Qachon ishlatiladi: O‘tgan zamonda ma’lum bir vaqt davomida cho‘zilgan jarayon uchun.
   • Misol: "At 8 PM yesterday, I was studying English."

3. Ikkala zamonning birgalikda qo‘llanishi ('When' va 'While'):
   • Qoida: Davom etayotgan uzoq harakat (Past Continuous) paytida to‘satdan qisqa harakat (Past Simple) sodir bo‘lsa:
   • Misol: "While I was walking in the park, I met my teacher."
   • Yodda tuting: 'While'dan keyin odatda Continuous (was/were V-ing), 'When'dan keyin odatda Past Simple (V2) keladi!`,
    questions: [
      {
        id: 1,
        sentence: "While they was watching the football match, the electricity suddenly failed.",
        highlightedOptions: ["While", "was watching", "the football match", "suddenly failed"],
        errorIndex: 1,
        correctCorrection: "were watching",
        explanation: "Ega 'they' (ko'plik olmoshi) bo'lganligi sababli 'was' emas, 'were watching' ishlatilishi lozim."
      },
      {
        id: 2,
        sentence: "She didn't bought any fresh groceries because the supermarket was already closed.",
        highlightedOptions: ["didn't bought", "fresh groceries", "because", "was already closed"],
        errorIndex: 0,
        correctCorrection: "didn't buy",
        explanation: "Past Simple inkor shaklida 'didn't' yordamchi fe'lidan keyin asosiy fe'l o'tgan shaklda emas, boshlang'ich (V1) shaklda bo'ladi: didn't buy."
      },
      {
        id: 3,
        sentence: "When the phone rang, I cooked dinner in the spacious kitchen.",
        highlightedOptions: ["When", "the phone rang", "I cooked", "in the spacious kitchen"],
        errorIndex: 2,
        correctCorrection: "I was cooking",
        explanation: "Telefon jiringlagan vaqtda ovqat pishirish jarayoni davom etayotgan bo'lgan, shuning uchun 'I was cooking' bo'lishi shart."
      },
      {
        id: 4,
        sentence: "Last night at 9 PM, we listened to the new podcast when our neighbors knocked on the door.",
        highlightedOptions: ["Last night", "we listened", "to the new podcast", "knocked on the door"],
        errorIndex: 1,
        correctCorrection: "we were listening",
        explanation: "Aniq vaqt ko'rsatkichi ('at 9 PM') va davom etayotgan jarayon uchun Past Continuous ('we were listening') ishlatiladi."
      }
    ]
  },
  {
    id: 'gt-2',
    title: 'Present Perfect vs. Past Simple (Natija va Aniq Vaqt)',
    level: 'B1 - B2',
    readTimeMin: 3,
    explanationGuide: `⏱️ 3 DAQIQALIK SODDA VA QISQA TUSHUNTIRISH:

1. Eng muhim oltin farq:
   • Agar gapda 'yesterday', 'last week', 'in 2019', 'two hours ago' kabi ANIQ O‘TGAN VAQT ko‘rsatilsa — FAQAT Past Simple (V2) ishlatiladi!
   • Agar harakatning o‘tgan vaqti noma’lum yoki muhim bo‘lmay, uning NATIJASI hozirgi kunga bog‘liq bo‘lsa — Present Perfect (have/has + V3) ishlatiladi!

2. Misollar:
   • ❌ XATO: "I have lost my passport yesterday." (Yesterday bo'lgani uchun have lost mumkin emas!)
   • ✅ TO‘G‘RI: "I lost my passport yesterday." (Past Simple)
   • ✅ TO‘G‘RI: "I have lost my passport. Can you help me find it?" (Present Perfect: qachon yo'qolgani noma'lum, lekin hozir pasport yo'q - natija bor!)

3. Kalit so‘zlar:
   • Present Perfect: already, just, yet, ever, never, recently, so far, since, for.
   • Past Simple: yesterday, ago, last..., in (o'tgan yil), when I was young.`,
    questions: [
      {
        id: 1,
        sentence: "I have seen that captivating historical documentary yesterday with my colleagues.",
        highlightedOptions: ["have seen", "captivating", "yesterday", "with my colleagues"],
        errorIndex: 0,
        correctCorrection: "saw",
        explanation: "'Yesterday' (kecha) aniq o'tgan vaqt ko'rsatkichi bo'lganligi sababli Present Perfect emas, Past Simple 'saw' ishlatilishi shart."
      },
      {
        id: 2,
        sentence: "She has already lived in this apartment since three years without any complaints.",
        highlightedOptions: ["has already lived", "in this apartment", "since three years", "without any complaints"],
        errorIndex: 2,
        correctCorrection: "for three years",
        explanation: "Vaqt oralig'i (davomiylik) ko'rsatilganda 'since' emas, 'for' ishlatiladi ('for three years'). 'Since' aniq boshlanish nuqtasi bilan keladi (masalan: since 2020)."
      },
      {
        id: 3,
        sentence: "Did you ever tasted genuine Italian gelato during your vacation in Rome?",
        highlightedOptions: ["Did you ever", "tasted", "genuine Italian", "during your vacation"],
        errorIndex: 0,
        correctCorrection: "Have you ever tasted",
        explanation: "Hayotiy tajriba haqida so'ralganda 'Have you ever + V3' (Present Perfect) konstruksiyasi qo'llaniladi."
      },
      {
        id: 4,
        sentence: "The research team has published their breakthrough paper three days ago.",
        highlightedOptions: ["has published", "breakthrough paper", "three days ago", "in the medical journal"],
        errorIndex: 0,
        correctCorrection: "published",
        explanation: "'Three days ago' (uch kun avval) aniq o'tgan zamon bo'lgani sababli fe'l 'published' shaklida bo'ladi."
      }
    ]
  },
  {
    id: 'gt-3',
    title: 'Conditionals (Third Conditional — O‘tgan Zamondagi Nereal Shart)',
    level: 'B2',
    readTimeMin: 3,
    explanationGuide: `⏱️ 3 DAQIQALIK SODDA VA QISQA TUSHUNTIRISH:

1. Third Conditional nima?
   • O‘tgan zamonda bo‘lib o‘tgan ish-harakatga nisbatan afsuslanish yoki nereal farazni ifodalaydi.
   • "Agar shunday qilganimda, bunday bo‘lgan bo‘lardi (lekin amalda unday bo‘lmadi)."

2. Qat’iy formulasi:
   • If + Past Perfect (had + V3), would / could / might + have + V3.
   • Inkor: If + hadn't + V3, wouldn't have + V3.

3. Misollar:
   • "If I had studied harder, I would have passed the IELTS exam." (Lekin o'qimadim va imtihondan o'tolmadim).
   • "If she had left earlier, she wouldn't have missed the train."

4. Keng tarqalgan xatolar:
   • ❌ "If I would have known..." (Hech qachon 'If'li qismda 'would' ishlatilmaydi! Faqat 'had + V3' keladi).
   • ❌ "she wouldn't missed" ('have' tushirib qoldirilmasligi shart: 'wouldn't have missed').`,
    questions: [
      {
        id: 1,
        sentence: "If she had arrived at the airport on time, she wouldn't missed the international conference flight.",
        highlightedOptions: ["had arrived", "on time", "wouldn't missed", "international conference"],
        errorIndex: 2,
        correctCorrection: "wouldn't have missed",
        explanation: "Third Conditional qoidasiga ko'ra asosiy gapda 'would/could + have + V3' kelishi shart. Bu yerda 'have' tushib qolgan."
      },
      {
        id: 2,
        sentence: "If I would have known about your arrival, I would have prepared a welcoming dinner.",
        highlightedOptions: ["If I would have known", "about your arrival", "would have prepared", "welcoming dinner"],
        errorIndex: 0,
        correctCorrection: "If I had known",
        explanation: "Shart ergash gaplarning 'If'li qismida 'would' ishlatilmaydi, uning o'rniga Past Perfect 'had known' bo'ladi."
      },
      {
        id: 3,
        sentence: "Had the weather been warmer, the students would had enjoyed the botanical garden excursion.",
        highlightedOptions: ["Had the weather been", "warmer", "would had enjoyed", "botanical garden"],
        errorIndex: 2,
        correctCorrection: "would have enjoyed",
        explanation: "Modal fe'llardan keyin 'had' emas, faqat boshlang'ich shakl 'have' ishlatiladi ('would have enjoyed')."
      }
    ]
  },
  {
    id: 'gt-4',
    title: 'Passive Voice (Majhul Nisbat Qoidalari)',
    level: 'B1 - B2',
    readTimeMin: 3,
    explanationGuide: `⏱️ 3 DAQIQALIK SODDA VA QISQA TUSHUNTIRISH:

1. Passive Voice (Majhul nisbat) nima?
   • Harakatni kim bajarganidan ko‘ra, harakatning O‘ZI yoki uning OBYEKTI muhimroq bo‘lganda qo‘llaniladi.
   • Bosh qoida: Har doim 'TO BE' + V3 (Past Participle).

2. Asosiy zamonlar formulasi:
   • Present Simple: am / is / are + V3 ("English is spoken here.")
   • Past Simple: was / were + V3 ("The car was stolen yesterday.")
   • Present Perfect: have / has been + V3 ("The report has been completed.")
   • Future Simple: will be + V3 ("A new hospital will be built next year.")

3. Bajiruvchini ko‘rsatish:
   • Agar ish kim tomonidan bajarilgani aytilsa, 'BY' predlogi ishlatiladi:
   • "Hamlet was written by William Shakespeare."`,
    questions: [
      {
        id: 1,
        sentence: "The historic city castle was built from ancient stones by skilled craftsmen in the 14th century.",
        highlightedOptions: ["historic city castle", "was build", "by skilled craftsmen", "in the 14th century"],
        errorIndex: 1,
        correctCorrection: "was built",
        explanation: "Passive Voice formulasida fe'lning 3-shakli (V3) ishlatilishi kerak. 'Build'ning V3 shakli 'built'dir."
      },
      {
        id: 2,
        sentence: "All diplomatic documents has been signed before the press conference began.",
        highlightedOptions: ["All diplomatic documents", "has been signed", "before the press", "began"],
        errorIndex: 1,
        correctCorrection: "have been signed (or had been signed)",
        explanation: "'Documents' ko'plik ot bo'lgani sababli 'has' emas, 'have been signed' ishlatilishi zarur."
      },
      {
        id: 3,
        sentence: "The annual scholarship will being awarded to the top three academic performers tomorrow.",
        highlightedOptions: ["The annual scholarship", "will being awarded", "to the top three", "tomorrow"],
        errorIndex: 1,
        correctCorrection: "will be awarded",
        explanation: "Future Simple Passive qolipida 'will be + V3' bo'ladi, 'will being' emas."
      }
    ]
  }
];

// Initial Full Trial Tests Config
export const INITIAL_TRIAL_CONFIG: TrialTestsConfig = {
  wordPool: DEFAULT_100_WORD_POOL,
  speaking: {
    part1Questions: DEFAULT_SPEAKING_QUESTIONS,
    part2Images: DEFAULT_SPEAKING_DESCRIBE_IMAGES
  },
  reading: DEFAULT_READING_TESTS,
  listening: DEFAULT_LISTENING_TEST,
  writing: DEFAULT_WRITING_TEST,
  writingPool: {
    essayTopics: DEFAULT_WRITING_ESSAYS,
    letterTopics: DEFAULT_WRITING_LETTERS
  },
  grammar: DEFAULT_GRAMMAR_TEST,
  grammarTopics: DEFAULT_GRAMMAR_TOPICS
};

