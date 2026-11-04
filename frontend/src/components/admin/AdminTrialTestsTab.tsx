import React, { useState, useRef } from 'react';
import {
  Sparkles, BookOpen, Headphones, PenLine, Mic, Trophy,
  Save, Plus, Trash2, Edit3, Image as ImageIcon, Upload,
  CheckCircle2, AlertCircle, RefreshCw, Eye, Search, ExternalLink, X,
  Play, Pause, Youtube, Video, FileText, ChevronDown, ChevronRight, HelpCircle,
  Bot, Cpu, Key, Zap, ShieldCheck
} from 'lucide-react';
import {
  TrialTestsConfig, INITIAL_TRIAL_CONFIG, WordQuizItem,
  SpeakingQuestion, SpeakingDescribeImage, ReadingTestItem, ReadingQuestion, ReadingGapFillBlank,
  ListeningTestItem, ListeningGapBlank, WritingTestItem, WritingEssayItem,
  WritingLetterItem, GrammarTestItem, GrammarTopicItem, GrammarQuestion,
  DEFAULT_WRITING_ESSAYS, DEFAULT_WRITING_LETTERS, DEFAULT_GRAMMAR_TOPICS
} from '../../data/trialTestData';
import {
  getStoredAiConfig, saveStoredAiConfig, testGeminiConnection, GeminiAiConfig
} from '../../services/geminiAiService';
import { api } from '../../api';

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?enablejsapi=1`;
  }
  return null;
}

interface AdminTrialTestsTabProps {
  cms: any;
  onSaveCms: (updatedCms: any) => Promise<void>;
  notify: (msg: string, isError?: boolean) => void;
  dark?: boolean;
}

type AdminSubTab = 'word' | 'speaking' | 'reading' | 'listening' | 'writing' | 'grammar' | 'ai_settings';

export function AdminTrialTestsTab({ cms, onSaveCms, notify, dark }: AdminTrialTestsTabProps) {
  // Current config with robust fallbacks
  const currentConfig: TrialTestsConfig = {
    ...INITIAL_TRIAL_CONFIG,
    ...(cms?.trialTests || {}),
    writingPool: cms?.trialTests?.writingPool || INITIAL_TRIAL_CONFIG.writingPool || {
      essayTopics: DEFAULT_WRITING_ESSAYS,
      letterTopics: DEFAULT_WRITING_LETTERS
    },
    grammarTopics: cms?.trialTests?.grammarTopics || INITIAL_TRIAL_CONFIG.grammarTopics || DEFAULT_GRAMMAR_TOPICS,
    aiConfig: cms?.trialTests?.aiConfig || INITIAL_TRIAL_CONFIG.aiConfig || {
      apiKey: '',
      model: 'gemini-2.0-flash',
      enabled: true,
      temperature: 0.2
    }
  };
  const [trialConfig, setTrialConfig] = useState<TrialTestsConfig>(currentConfig);
  const [activeTab, setActiveTab] = useState<AdminSubTab>('word');
  const [saving, setSaving] = useState(false);

  // AI Settings states
  const [aiConfig, setAiConfig] = useState<GeminiAiConfig>(() => {
    const stored = getStoredAiConfig();
    return {
      ...stored,
      ...(currentConfig.aiConfig || {})
    };
  });
  const [testingAiConnection, setTestingAiConnection] = useState(false);
  const [aiConnectionResult, setAiConnectionResult] = useState<{
    success: boolean;
    latencyMs?: number;
    message: string;
    sampleResponse?: string;
  } | null>(null);
  const [showAiApiKey, setShowAiApiKey] = useState(false);

  // Subtab states for Writing and expanded accordions
  const [writingSubTab, setWritingSubTab] = useState<'essay' | 'letter'>('essay');
  const [expandedReadingId, setExpandedReadingId] = useState<string | null>(trialConfig.reading[0]?.id || null);
  const [expandedGrammarId, setExpandedGrammarId] = useState<string | null>(trialConfig.grammarTopics?.[0]?.id || null);

  // Word pool search & edit
  const [wordSearch, setWordSearch] = useState('');
  const [editingWord, setEditingWord] = useState<WordQuizItem | null>(null);
  const [isAddingNewWord, setIsAddingNewWord] = useState(false);
  const [uploadingWordImg, setUploadingWordImg] = useState(false);
  const wordFileInputRef = useRef<HTMLInputElement | null>(null);

  // Speaking Part 2 Image upload
  const [uploadingSpeakingImg, setUploadingSpeakingImg] = useState(false);
  const speakingFileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingSpeakingImage, setEditingSpeakingImage] = useState<SpeakingDescribeImage | null>(null);

  // Save changes to Supabase & CMS
  const handleSaveAll = async (overrideConfig?: TrialTestsConfig) => {
    setSaving(true);
    try {
      const configToSave = overrideConfig || trialConfig;
      const updatedCms = {
        ...cms,
        trialTests: configToSave
      };
      await onSaveCms(updatedCms);
      setTrialConfig(configToSave);
      notify('Boshlang‘ich sinov testlari ma’lumotlari Supabasega muvaffaqiyatli saqlandi! 🎉');
    } catch (err: any) {
      notify(err.message || 'Saqlashda xatolik yuz berdi', true);
    } finally {
      setSaving(false);
    }
  };

  // Image upload helper
  const handleUploadImageFile = async (file: File, prefix: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataBase64 = reader.result as string;
          const cleanName = `${prefix}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const res = await api.uploadCmsImage({
            file,
            dataBase64,
            fileName: cleanName,
            contentType: file.type || 'image/jpeg'
          });
          if (res?.url) {
            resolve(res.url);
          } else {
            reject(new Error('Rasm yuklashda URL olinmadi'));
          }
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Filtered word pool
  const filteredWords = trialConfig.wordPool.filter(w =>
    w.word.toLowerCase().includes(wordSearch.toLowerCase()) ||
    w.translation.toLowerCase().includes(wordSearch.toLowerCase()) ||
    w.category.toLowerCase().includes(wordSearch.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} style={{ color: 'var(--purple)' }} />
            Boshlang‘ich Sinov Testlari Sozlamalari (Trial Tests CMS)
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
            Foydalanuvchilar "O‘zingizni sinab ko‘ring" tugmasini bosganda ochiluvchi 6 ta modulning savollari, rasmlari va matnlarini boshqaring.
          </p>
        </div>

        <button
          onClick={() => handleSaveAll()}
          disabled={saving}
          className="primary-btn"
          style={{ padding: '10px 22px', fontSize: '13px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
          <span>{saving ? 'Saqlanmoqda...' : 'Barcha O‘zgarishlarni Saqlash'}</span>
        </button>
      </div>

      {/* Sub-Tabs: 6 Skills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'word', label: `1. Rasmli So‘zlar (${trialConfig.wordPool.length} ta)`, icon: Trophy },
          { key: 'speaking', label: '2. Speaking (Nutq)', icon: Mic },
          { key: 'reading', label: '3. Reading (O‘qish)', icon: BookOpen },
          { key: 'listening', label: '4. Listening (Tinglash)', icon: Headphones },
          { key: 'writing', label: '5. Writing (Yozish)', icon: PenLine },
          { key: 'grammar', label: '6. Grammar (Grammatika)', icon: Sparkles },
          { key: 'ai_settings', label: '7. AI Yordamçi (Gemini API)', icon: Bot }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as AdminSubTab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 750,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'var(--purple)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--muted)',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* 1. WORD POOL (100 IMAGE-WORD QUIZ POOL)                            */}
      {/* =================================================================== */}
      {activeTab === 'word' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '400px' }}>
              <Search size={16} style={{ color: 'var(--muted)' }} />
              <input
                type="text"
                placeholder="So‘z, tarjima yoki kategoriyani qidirish..."
                value={wordSearch}
                onChange={e => setWordSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--input-bg, transparent)',
                  color: 'inherit',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setEditingWord({
                    id: `w_${Date.now()}`,
                    word: '',
                    translation: '',
                    category: 'General',
                    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
                    options: ['', '', '', ''],
                    lang: 'en'
                  });
                  setIsAddingNewWord(true);
                }}
                className="outline-btn"
                style={{ padding: '8px 14px', fontSize: '12.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} /> Yangi Rasmli So‘z Qo‘shish
              </button>

              <button
                onClick={() => {
                  if (confirm('Barcha rasmli so‘zlarni standart 100 ta bazaga qaytarilsinmi?')) {
                    const updated = { ...trialConfig, wordPool: INITIAL_TRIAL_CONFIG.wordPool };
                    handleSaveAll(updated);
                  }
                }}
                className="outline-btn"
                style={{ padding: '8px 14px', fontSize: '12.5px', color: 'var(--muted)' }}
              >
                Standart 100 bazani tiklash
              </button>
            </div>
          </div>

          {/* Word Edit / Add Modal */}
          {editingWord && (
            <div style={{ padding: '20px', borderRadius: '16px', background: 'var(--soft)', border: '1.5px solid var(--purple)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  {isAddingNewWord ? 'Yangi Rasmli So‘z Qo‘shish' : 'Rasmli So‘zni Tahrirlash'}
                </h3>
                <button onClick={() => setEditingWord(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Chet tilidagi so‘z (Word):</label>
                  <input
                    type="text"
                    value={editingWord.word}
                    onChange={e => setEditingWord({ ...editingWord, word: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>O‘zbekcha tarjimasi:</label>
                  <input
                    type="text"
                    value={editingWord.translation}
                    onChange={e => setEditingWord({ ...editingWord, translation: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Kategoriya:</label>
                  <input
                    type="text"
                    value={editingWord.category}
                    onChange={e => setEditingWord({ ...editingWord, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Transkripsiya (ixtiyoriy):</label>
                  <input
                    type="text"
                    value={editingWord.phonetic || ''}
                    onChange={e => setEditingWord({ ...editingWord, phonetic: e.target.value })}
                    placeholder="/ˈmaʊn.tən/"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                  />
                </div>
              </div>

              {/* Image URL & Supabase Upload */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Rasm URL yoki Fayl Yuklash:</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={editingWord.image}
                    onChange={e => setEditingWord({ ...editingWord, image: e.target.value })}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                  />

                  <input
                    type="file"
                    ref={wordFileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingWordImg(true);
                      try {
                        const url = await handleUploadImageFile(file, 'word-quiz');
                        setEditingWord({ ...editingWord, image: url });
                        notify('Rasm muvaffaqiyatli yuklandi!');
                      } catch (err: any) {
                        notify(err.message || 'Rasm yuklashda xatolik', true);
                      } finally {
                        setUploadingWordImg(false);
                      }
                    }}
                  />

                  <button
                    onClick={() => wordFileInputRef.current?.click()}
                    disabled={uploadingWordImg}
                    className="outline-btn"
                    style={{ padding: '8px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Upload size={14} />
                    <span>{uploadingWordImg ? 'Yuklanmoqda...' : 'Rasm Yuklash'}</span>
                  </button>
                </div>

                {editingWord.image && (
                  <img
                    src={editingWord.image}
                    alt="Preview"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }}
                  />
                )}
              </div>

              {/* 4 Quiz Options */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  4 ta Variant (Birinchisi yoki ulardan biri to‘g‘ri so‘z bilan bir xil bo‘lishi kerak):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {editingWord.options.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Variant ${String.fromCharCode(65 + i)}`}
                      value={opt}
                      onChange={e => {
                        const newOpts = [...editingWord.options];
                        newOpts[i] = e.target.value;
                        setEditingWord({ ...editingWord, options: newOpts });
                      }}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '13px' }}
                    />
                  ))}
                </div>
              </div>

              {/* Save / Cancel */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    if (!editingWord.word || !editingWord.translation) {
                      notify('So‘z va tarjimani kiriting', true);
                      return;
                    }
                    let updatedList = [...trialConfig.wordPool];
                    if (isAddingNewWord) {
                      updatedList = [editingWord, ...updatedList];
                    } else {
                      updatedList = updatedList.map(w => w.id === editingWord.id ? editingWord : w);
                    }
                    const updated = { ...trialConfig, wordPool: updatedList };
                    setTrialConfig(updated);
                    handleSaveAll(updated);
                    setEditingWord(null);
                    setIsAddingNewWord(false);
                  }}
                  className="primary-btn"
                  style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 800 }}
                >
                  Saqlash
                </button>
                <button onClick={() => setEditingWord(null)} className="outline-btn" style={{ padding: '8px 16px' }}>
                  Bekor qilish
                </button>
              </div>
            </div>
          )}

          {/* Words Grid Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
            {filteredWords.map(w => (
              <div key={w.id} style={{ borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--soft)', display: 'flex', flexDirection: 'column' }}>
                <img
                  src={w.image}
                  alt={w.word}
                  style={{ width: '100%', height: '110px', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>{w.word}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{w.translation}</div>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(0,0,0,0.05)', color: 'var(--purple)', marginTop: '4px', display: 'inline-block' }}>
                      {w.category}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingWord({ ...w });
                        setIsAddingNewWord(false);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--purple)', cursor: 'pointer', padding: '4px' }}
                      title="Tahrirlash"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`"${w.word}" so‘zini o‘chirishni xohlaysizmi?`)) {
                          const updated = {
                            ...trialConfig,
                            wordPool: trialConfig.wordPool.filter(item => item.id !== w.id)
                          };
                          setTrialConfig(updated);
                          handleSaveAll(updated);
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="O‘chirish"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. SPEAKING SECTION                                                 */}
      {/* =================================================================== */}
      {activeTab === 'speaking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Part 1: 5 Questions */}
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 800 }}>
              1-Qism: 5 ta Qisqa Savol (30 soniya, 1 martalik javob)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {trialConfig.speaking.part1Questions.map((q, idx) => (
                <div key={q.id} style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--soft)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--purple)', marginBottom: '4px' }}>
                    {idx + 1}-Savol (30s):
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={e => {
                      const updated = [...trialConfig.speaking.part1Questions];
                      updated[idx].question = e.target.value;
                      setTrialConfig({ ...trialConfig, speaking: { ...trialConfig.speaking, part1Questions: updated } });
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', marginBottom: '6px', fontSize: '14px' }}
                  />
                  <input
                    type="text"
                    placeholder="O‘zbekcha tarjimasi"
                    value={q.translation}
                    onChange={e => {
                      const updated = [...trialConfig.speaking.part1Questions];
                      updated[idx].translation = e.target.value;
                      setTrialConfig({ ...trialConfig, speaking: { ...trialConfig.speaking, part1Questions: updated } });
                    }}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '12.5px' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Part 2: Describe Image Pool */}
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 800 }}>
              2-Qism: Rasm Tasvirlash (Describe Image) Rasmlar Jamg‘armasi (60 soniya)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {trialConfig.speaking.part2Images.map((img, idx) => (
                <div key={img.id} style={{ borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--soft)' }}>
                  <img src={img.imageUrl} alt={img.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>{img.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{img.descriptionHint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. READING SECTION (MATNLAR VA SAVOLLAR/BO‘SH JOYLAR CRUD)           */}
      {/* =================================================================== */}
      {activeTab === 'reading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                3. Reading (Öqiş) Matnlari va Savollar Jamğarmasi ({trialConfig.reading.length} ta)
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                Har bir matn uchun CEFR darajasi, matn mazmuni va unga tegishli savollar yoki böş joylarni boshqaring.
              </p>
            </div>

            <button
              onClick={() => {
                const newTest: ReadingTestItem = {
                  id: `r-test-${Date.now()}`,
                  title: 'Yangi Reading Matni',
                  genre: 'Ilmiy-ommabop maqola',
                  level: 'B1',
                  type: 'comprehension',
                  text: 'Reading matnini shu yerga yozing yoki nusxa köçirib qöying...',
                  questions: [
                    {
                      id: 1,
                      question: 'Matnning asosiy mavzusi nima haqida?',
                      options: ['1-variant', '2-variant', '3-variant', '4-variant'],
                      correctAnswer: 0,
                      explanation: 'Matnning birinchi xatboshisidan kelib çiqadi.'
                    }
                  ]
                };
                setTrialConfig(prev => ({ ...prev, reading: [...prev.reading, newTest] }));
                setExpandedReadingId(newTest.id);
              }}
              className="outline-btn"
              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>Yangi Reading Matni Qo‘şiş</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {trialConfig.reading.map((r, rIdx) => {
              const isExpanded = expandedReadingId === r.id;

              return (
                <div
                  key={r.id}
                  style={{
                    borderRadius: '16px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--soft)',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s'
                  }}
                >
                  {/* Card Header Accordion */}
                  <div
                    onClick={() => setExpandedReadingId(isExpanded ? null : r.id)}
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: isExpanded ? 'rgba(120, 105, 245, 0.08)' : 'transparent',
                      borderBottom: isExpanded ? '1px solid var(--border)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: r.type === 'comprehension' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: r.type === 'comprehension' ? '#3b82f6' : '#10b981',
                        fontSize: '11.5px',
                        fontWeight: 800
                      }}>
                        {r.type === 'comprehension' ? 'Savollar' : 'Böş joylar'} · {r.level}
                      </span>
                      <strong style={{ fontSize: '15px' }}>{r.title || 'Sarlavhasiz matn'}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                        {r.type === 'comprehension' ? `${r.questions?.length || 0} ta savol` : `${r.blanks?.length || 0} ta böş joy`}
                      </span>
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {/* Meta Fields */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '5px' }}>Matn Sarlavhasi:</label>
                          <input
                            type="text"
                            value={r.title}
                            onChange={e => {
                              const updated = [...trialConfig.reading];
                              updated[rIdx].title = e.target.value;
                              setTrialConfig({ ...trialConfig, reading: updated });
                            }}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontWeight: 700 }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '5px' }}>Janr / Mavzu:</label>
                          <input
                            type="text"
                            value={r.genre}
                            onChange={e => {
                              const updated = [...trialConfig.reading];
                              updated[rIdx].genre = e.target.value;
                              setTrialConfig({ ...trialConfig, reading: updated });
                            }}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '5px' }}>CEFR Darajasi:</label>
                          <select
                            value={r.level}
                            onChange={e => {
                              const updated = [...trialConfig.reading];
                              updated[rIdx].level = e.target.value;
                              setTrialConfig({ ...trialConfig, reading: updated });
                            }}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                          >
                            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lvl => (
                              <option key={lvl} value={lvl}>{lvl}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '5px' }}>Topşiriq Turi:</label>
                          <select
                            value={r.type}
                            onChange={e => {
                              const updated = [...trialConfig.reading];
                              updated[rIdx].type = e.target.value as any;
                              setTrialConfig({ ...trialConfig, reading: updated });
                            }}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                          >
                            <option value="comprehension">1-Tur: Matn va Savollar (Comprehension)</option>
                            <option value="gap_fill">2-Tur: Böş Joylarni Töldiriş (Gap-Fill)</option>
                          </select>
                        </div>
                      </div>

                      {/* Reading Passage Text */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '5px' }}>
                          Reading Matni (Passage Text):
                        </label>
                        <textarea
                          rows={6}
                          value={r.text}
                          onChange={e => {
                            const updated = [...trialConfig.reading];
                            updated[rIdx].text = e.target.value;
                            setTrialConfig({ ...trialConfig, reading: updated });
                          }}
                          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '13.5px', lineHeight: '1.6' }}
                        />
                      </div>

                      {/* COMPREHENSION QUESTIONS MANAGER */}
                      {r.type === 'comprehension' && (
                        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <HelpCircle size={16} /> Matn Savollari ({r.questions?.length || 0} ta)
                            </div>
                            <button
                              onClick={() => {
                                const questions = r.questions ? [...r.questions] : [];
                                questions.push({
                                  id: Date.now(),
                                  question: '',
                                  options: ['', '', '', ''],
                                  correctAnswer: 0,
                                  explanation: ''
                                });
                                const updated = [...trialConfig.reading];
                                updated[rIdx].questions = questions;
                                setTrialConfig({ ...trialConfig, reading: updated });
                              }}
                              className="outline-btn"
                              style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Plus size={14} /> Savol Qo‘şiş
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {(r.questions || []).map((q, qIdx) => (
                              <div key={q.id} style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card-bg, #ffffff)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--purple)' }}>
                                    {qIdx + 1}-Savol:
                                  </span>
                                  <button
                                    onClick={() => {
                                      const questions = r.questions!.filter((_, i) => i !== qIdx);
                                      const updated = [...trialConfig.reading];
                                      updated[rIdx].questions = questions;
                                      setTrialConfig({ ...trialConfig, reading: updated });
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                    title="Savolni öçiriş"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>

                                <input
                                  type="text"
                                  placeholder="Savol matnini kiriting..."
                                  value={q.question}
                                  onChange={e => {
                                    const questions = [...r.questions!];
                                    questions[qIdx].question = e.target.value;
                                    const updated = [...trialConfig.reading];
                                    updated[rIdx].questions = questions;
                                    setTrialConfig({ ...trialConfig, reading: updated });
                                  }}
                                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontWeight: 700, marginBottom: '10px' }}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                                  {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <input
                                        type="radio"
                                        name={`correct_${r.id}_${q.id}`}
                                        checked={q.correctAnswer === oIdx}
                                        onChange={() => {
                                          const questions = [...r.questions!];
                                          questions[qIdx].correctAnswer = oIdx;
                                          const updated = [...trialConfig.reading];
                                          updated[rIdx].questions = questions;
                                          setTrialConfig({ ...trialConfig, reading: updated });
                                        }}
                                        title="Uşbu variantni töğri javob sifatida belgilang"
                                      />
                                      <span style={{ fontSize: '12px', fontWeight: 800 }}>{String.fromCharCode(65 + oIdx)})</span>
                                      <input
                                        type="text"
                                        placeholder={`${String.fromCharCode(65 + oIdx)} varianti`}
                                        value={opt}
                                        onChange={e => {
                                          const questions = [...r.questions!];
                                          const opts = [...questions[qIdx].options];
                                          opts[oIdx] = e.target.value;
                                          questions[qIdx].options = opts;
                                          const updated = [...trialConfig.reading];
                                          updated[rIdx].questions = questions;
                                          setTrialConfig({ ...trialConfig, reading: updated });
                                        }}
                                        style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '12.5px' }}
                                      />
                                    </div>
                                  ))}
                                </div>

                                <input
                                  type="text"
                                  placeholder="Töğri javob izohi / tushuntirishi (Explanation)..."
                                  value={q.explanation}
                                  onChange={e => {
                                    const questions = [...r.questions!];
                                    questions[qIdx].explanation = e.target.value;
                                    const updated = [...trialConfig.reading];
                                    updated[rIdx].questions = questions;
                                    setTrialConfig({ ...trialConfig, reading: updated });
                                  }}
                                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '12px', fontStyle: 'italic' }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* GAP-FILL BLANKS MANAGER */}
                      {r.type === 'gap_fill' && (
                        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <CheckCircle2 size={16} /> Böş Joylar ({r.blanks?.length || 0} ta)
                            </div>
                            <button
                              onClick={() => {
                                const blanks = r.blanks ? [...r.blanks] : [];
                                blanks.push({
                                  id: Date.now(),
                                  label: `${blanks.length + 1}-böş joy`,
                                  correctWord: '',
                                  options: ['', '', '', '']
                                });
                                const updated = [...trialConfig.reading];
                                updated[rIdx].blanks = blanks;
                                setTrialConfig({ ...trialConfig, reading: updated });
                              }}
                              className="outline-btn"
                              style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Plus size={14} /> Böş Joy Qo‘şiş
                            </button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                            {(r.blanks || []).map((blank, bIdx) => (
                              <div key={blank.id} style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card-bg, #ffffff)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <input
                                    type="text"
                                    value={blank.label}
                                    onChange={e => {
                                      const blanks = [...r.blanks!];
                                      blanks[bIdx].label = e.target.value;
                                      const updated = [...trialConfig.reading];
                                      updated[rIdx].blanks = blanks;
                                      setTrialConfig({ ...trialConfig, reading: updated });
                                    }}
                                    style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontWeight: 800, fontSize: '12.5px', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                                  />
                                  <button
                                    onClick={() => {
                                      const blanks = r.blanks!.filter((_, i) => i !== bIdx);
                                      const updated = [...trialConfig.reading];
                                      updated[rIdx].blanks = blanks;
                                      setTrialConfig({ ...trialConfig, reading: updated });
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>

                                <div style={{ marginBottom: '8px' }}>
                                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#10b981', marginBottom: '2px' }}>Töğri söz:</label>
                                  <input
                                    type="text"
                                    value={blank.correctWord}
                                    onChange={e => {
                                      const blanks = [...r.blanks!];
                                      blanks[bIdx].correctWord = e.target.value;
                                      const updated = [...trialConfig.reading];
                                      updated[rIdx].blanks = blanks;
                                      setTrialConfig({ ...trialConfig, reading: updated });
                                    }}
                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1.5px solid #10b981', background: 'var(--input-bg, transparent)', color: 'inherit', fontWeight: 750, fontSize: '13px' }}
                                  />
                                </div>

                                <div>
                                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '2px' }}>4 ta tanlov varianti:</label>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                                    {blank.options.map((opt, oIdx) => (
                                      <input
                                        key={oIdx}
                                        type="text"
                                        placeholder={`Variant ${oIdx + 1}`}
                                        value={opt}
                                        onChange={e => {
                                          const blanks = [...r.blanks!];
                                          const opts = [...blanks[bIdx].options];
                                          opts[oIdx] = e.target.value;
                                          blanks[bIdx].options = opts;
                                          const updated = [...trialConfig.reading];
                                          updated[rIdx].blanks = blanks;
                                          setTrialConfig({ ...trialConfig, reading: updated });
                                        }}
                                        style={{ padding: '4px 6px', borderRadius: '5px', border: '1px solid var(--border)', fontSize: '11.5px', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Delete Test Button */}
                      <div style={{ textAlign: 'right', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                        <button
                          onClick={() => {
                            if (window.confirm(`"${r.title}" reading matnini öçirmoqçimisiz?`)) {
                              const updated = trialConfig.reading.filter((_, i) => i !== rIdx);
                              setTrialConfig({ ...trialConfig, reading: updated });
                            }
                          }}
                          className="danger-btn"
                          style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Trash2 size={14} />
                          <span>Uşbu Reading Matnini Öçiriş</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. LISTENING SECTION (YOUTUBE LINK, AUDIO & GAP-FILL CRUD)          */}
      {/* =================================================================== */}
      {activeTab === 'listening' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
              4. Listening (Tinglaş) Sozlamalari & Gap-Fill Variantlari
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
              Listening uchun YouTube havolasi yoki audio fayl joylang va öquvchi eshitib töldirishi kerak bölgan böş joylarni sozlang.
            </p>
          </div>

          <div style={{ padding: '20px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--soft)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* YouTube Link Field with Live Preview */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, marginBottom: '6px', color: '#ef4444' }}>
                <Youtube size={16} /> YouTube Video / Audio Havolasi:
              </label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=0hK2f3VfP0U yoki video ID"
                value={trialConfig.listening.youtubeUrl || ''}
                onChange={e => setTrialConfig({ ...trialConfig, listening: { ...trialConfig.listening, youtubeUrl: e.target.value } })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '14px', fontWeight: 650 }}
              />
              <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
                💡 YouTube videosi yoki audiosi sinov testida öquvchiga avtomatik ijro etiladi.
              </span>

              {/* YouTube Live Embed Preview */}
              {getYouTubeEmbedUrl(trialConfig.listening.youtubeUrl) && (
                <div style={{ marginTop: '14px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', maxWidth: '500px', height: '280px', background: '#000' }}>
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYouTubeEmbedUrl(trialConfig.listening.youtubeUrl)!}
                    title="YouTube Listening Audio Preview"
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Direct Audio URL */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>
                Yoki To‘g‘ridan-to‘g‘ri Audio URL (.mp3):
              </label>
              <input
                type="text"
                placeholder="https://example.com/audio.mp3 (ixtiyoriy zaxira audio)"
                value={trialConfig.listening.audioUrl || ''}
                onChange={e => setTrialConfig({ ...trialConfig, listening: { ...trialConfig.listening, audioUrl: e.target.value } })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '13px' }}
              />
            </div>

            {/* Audio Title & Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Audio Sarlavhasi:</label>
                <input
                  type="text"
                  value={trialConfig.listening.title}
                  onChange={e => setTrialConfig({ ...trialConfig, listening: { ...trialConfig.listening, title: e.target.value } })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Davomiyligi (soniya):</label>
                <input
                  type="number"
                  value={trialConfig.listening.totalDurationSec}
                  onChange={e => setTrialConfig({ ...trialConfig, listening: { ...trialConfig.listening, totalDurationSec: parseInt(e.target.value) || 60 } })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontWeight: 700 }}
                />
              </div>
            </div>

            {/* Narration Script */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>
                Audioda Aytiladigan Matn (Dialog Transkripti / TTS Script):
              </label>
              <textarea
                rows={4}
                value={trialConfig.listening.narrationScript}
                onChange={e => setTrialConfig({ ...trialConfig, listening: { ...trialConfig.listening, narrationScript: e.target.value } })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '13.5px', lineHeight: '1.6' }}
              />
            </div>

            {/* GAP-FILL BLANKS MANAGER */}
            <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(236, 72, 153, 0.05)', border: '1.5px solid rgba(236, 72, 153, 0.25)', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#ec4899', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Headphones size={16} /> Böş Joylar va Javob Variantlari ({trialConfig.listening.blanks?.length || 0} ta)
                </div>
                <button
                  onClick={() => {
                    const blanks = [...(trialConfig.listening.blanks || [])];
                    const nextNum = blanks.length + 1;
                    blanks.push({
                      id: Date.now(),
                      blankNumber: nextNum,
                      correctWord: '',
                      options: ['', '', '', ''],
                      hint: ''
                    });
                    setTrialConfig({ ...trialConfig, listening: { ...trialConfig.listening, blanks } });
                  }}
                  className="outline-btn"
                  style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Böş Joy Qo‘şiş
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {(trialConfig.listening.blanks || []).map((blank, bIdx) => (
                  <div key={blank.id} style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card-bg, #ffffff)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#ec4899' }}>
                        {blank.blankNumber}-böş joy:
                      </span>
                      <button
                        onClick={() => {
                          const blanks = trialConfig.listening.blanks.filter((_, i) => i !== bIdx);
                          setTrialConfig({ ...trialConfig, listening: { ...trialConfig.listening, blanks } });
                        }}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Böş joyni öçiriş"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#10b981', marginBottom: '2px' }}>
                        Töğri Söz (Audioda eshitiladigan söz):
                      </label>
                      <input
                        type="text"
                        placeholder="masalan: communication"
                        value={blank.correctWord}
                        onChange={e => {
                          const blanks = [...trialConfig.listening.blanks];
                          blanks[bIdx].correctWord = e.target.value;
                          setTrialConfig({ ...trialConfig, listening: { ...trialConfig.listening, blanks } });
                        }}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1.5px solid #10b981', background: 'var(--input-bg, transparent)', color: 'inherit', fontWeight: 750 }}
                      />
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '2px' }}>
                        Maslahat / Hint (ixtiyoriy):
                      </label>
                      <input
                        type="text"
                        placeholder="Masalan: Muloqot va axborot almashinuvi"
                        value={blank.hint || ''}
                        onChange={e => {
                          const blanks = [...trialConfig.listening.blanks];
                          blanks[bIdx].hint = e.target.value;
                          setTrialConfig({ ...trialConfig, listening: { ...trialConfig.listening, blanks } });
                        }}
                        style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '12px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', marginBottom: '4px' }}>
                        4 ta Tanlov Varianti:
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {blank.options.map((opt, oIdx) => (
                          <input
                            key={oIdx}
                            type="text"
                            placeholder={`${String.fromCharCode(65 + oIdx)} varianti`}
                            value={opt}
                            onChange={e => {
                              const blanks = [...trialConfig.listening.blanks];
                              const opts = [...blanks[bIdx].options];
                              opts[oIdx] = e.target.value;
                              blanks[bIdx].options = opts;
                              setTrialConfig({ ...trialConfig, listening: { ...trialConfig.listening, blanks } });
                            }}
                            style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '12px' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. WRITING SECTION (ESSAY & LETTER TOPICS POOL CRUD)                */}
      {/* =================================================================== */}
      {activeTab === 'writing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
              5. Writing (Yoziş) Mavzular Jamğarmasi & Random Taqsimot
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
              Foydalanuvchi sinov testiga kirganda insho (Part 1 - Essay) va xat (Part 2 - Letter) mavzulari random tarzda taqdim etiladi.
            </p>
          </div>

          {/* Sub-Tabs: Essay vs Letter */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setWritingSubTab('essay')}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '13px',
                background: writingSubTab === 'essay' ? '#10b981' : 'var(--soft)',
                color: writingSubTab === 'essay' ? '#ffffff' : 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <PenLine size={15} />
              <span>1. Insho Mavzulari (Part 1 - Essay, {(trialConfig.writingPool?.essayTopics || DEFAULT_WRITING_ESSAYS).length} ta)</span>
            </button>

            <button
              onClick={() => setWritingSubTab('letter')}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '13px',
                background: writingSubTab === 'letter' ? '#7869f5' : 'var(--soft)',
                color: writingSubTab === 'letter' ? '#ffffff' : 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileText size={15} />
              <span>2. Xat Topşiriqlari (Part 2 - Letter, {(trialConfig.writingPool?.letterTopics || DEFAULT_WRITING_LETTERS).length} ta)</span>
            </button>
          </div>

          {/* ESSAY POOL */}
          {writingSubTab === 'essay' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    const currentEssays = trialConfig.writingPool?.essayTopics || DEFAULT_WRITING_ESSAYS;
                    const newEssay: WritingEssayItem = {
                      id: `essay-${Date.now()}`,
                      topicTitle: 'Yangi Insho Mavzusi',
                      genre: 'Argumentative Essay',
                      minWords: 150,
                      promptDescription: 'Mavzu tavsifi va foydalanuvchiga beriladigan savol...',
                      bulletPoints: [
                        'Ikkala taraf nuqtayi nazarini muhokama qiling.',
                        'Öz shaxsiy fikringizni misollar bilan asoslang.',
                        'Kamida 150 ta sözdan iborat xulosa yozing.'
                      ]
                    };
                    const updatedPool = {
                      ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }),
                      essayTopics: [...currentEssays, newEssay]
                    };
                    setTrialConfig({ ...trialConfig, writingPool: updatedPool });
                  }}
                  className="outline-btn"
                  style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} />
                  <span>Yangi Insho Mavzusi Qo‘şiş</span>
                </button>
              </div>

              {(trialConfig.writingPool?.essayTopics || DEFAULT_WRITING_ESSAYS).map((essay, eIdx) => (
                <div key={essay.id} style={{ padding: '20px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--soft)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '12px', fontWeight: 800 }}>
                        Insho #{eIdx + 1}
                      </span>
                      <strong style={{ fontSize: '15px' }}>{essay.topicTitle}</strong>
                    </div>

                    <button
                      onClick={() => {
                        const currentEssays = trialConfig.writingPool?.essayTopics || DEFAULT_WRITING_ESSAYS;
                        const updated = currentEssays.filter((_, i) => i !== eIdx);
                        setTrialConfig({
                          ...trialConfig,
                          writingPool: {
                            ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }),
                            essayTopics: updated
                          }
                        });
                      }}
                      className="danger-btn"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                    >
                      <Trash2 size={13} /> Öçiriş
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Mavzu Nomi (Topic Title):</label>
                      <input
                        type="text"
                        value={essay.topicTitle}
                        onChange={e => {
                          const currentEssays = [...(trialConfig.writingPool?.essayTopics || DEFAULT_WRITING_ESSAYS)];
                          currentEssays[eIdx].topicTitle = e.target.value;
                          setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), essayTopics: currentEssays } });
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Insho Janri / Turi:</label>
                      <input
                        type="text"
                        value={essay.genre}
                        onChange={e => {
                          const currentEssays = [...(trialConfig.writingPool?.essayTopics || DEFAULT_WRITING_ESSAYS)];
                          currentEssays[eIdx].genre = e.target.value;
                          setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), essayTopics: currentEssays } });
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Minimal Söz Soni:</label>
                      <input
                        type="number"
                        value={essay.minWords}
                        onChange={e => {
                          const currentEssays = [...(trialConfig.writingPool?.essayTopics || DEFAULT_WRITING_ESSAYS)];
                          currentEssays[eIdx].minWords = parseInt(e.target.value) || 150;
                          setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), essayTopics: currentEssays } });
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Mavzu Tavsifi & Savol Matni:</label>
                    <textarea
                      rows={3}
                      value={essay.promptDescription}
                      onChange={e => {
                        const currentEssays = [...(trialConfig.writingPool?.essayTopics || DEFAULT_WRITING_ESSAYS)];
                        currentEssays[eIdx].promptDescription = e.target.value;
                        setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), essayTopics: currentEssays } });
                      }}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '13px' }}
                    />
                  </div>

                  {/* Bullet points */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 800 }}>Reja Talablari (Bullet Points):</label>
                      <button
                        onClick={() => {
                          const currentEssays = [...(trialConfig.writingPool?.essayTopics || DEFAULT_WRITING_ESSAYS)];
                          currentEssays[eIdx].bulletPoints.push('Yangi reja talabi');
                          setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), essayTopics: currentEssays } });
                        }}
                        style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
                      >
                        + Band qo‘şiş
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {essay.bulletPoints.map((bp, bpIdx) => (
                        <div key={bpIdx} style={{ display: 'flex', gap: '6px' }}>
                          <input
                            type="text"
                            value={bp}
                            onChange={e => {
                              const currentEssays = [...(trialConfig.writingPool?.essayTopics || DEFAULT_WRITING_ESSAYS)];
                              currentEssays[eIdx].bulletPoints[bpIdx] = e.target.value;
                              setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), essayTopics: currentEssays } });
                            }}
                            style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '12.5px' }}
                          />
                          <button
                            onClick={() => {
                              const currentEssays = [...(trialConfig.writingPool?.essayTopics || DEFAULT_WRITING_ESSAYS)];
                              currentEssays[eIdx].bulletPoints = currentEssays[eIdx].bulletPoints.filter((_, i) => i !== bpIdx);
                              setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), essayTopics: currentEssays } });
                            }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Namuna Insho (Band 8.0 Text):</label>
                    <textarea
                      rows={4}
                      value={essay.sampleBand8Text || ''}
                      onChange={e => {
                        const currentEssays = [...(trialConfig.writingPool?.essayTopics || DEFAULT_WRITING_ESSAYS)];
                        currentEssays[eIdx].sampleBand8Text = e.target.value;
                        setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), essayTopics: currentEssays } });
                      }}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '12.5px', fontStyle: 'italic' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LETTER POOL */}
          {writingSubTab === 'letter' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    const currentLetters = trialConfig.writingPool?.letterTopics || DEFAULT_WRITING_LETTERS;
                    const newLetter: WritingLetterItem = {
                      id: `letter-${Date.now()}`,
                      topicTitle: 'Yangi Xat Topşirig‘i',
                      letterType: 'formal',
                      minWords: 120,
                      promptDescription: 'Xat kimga va nima maqsadda yozilishi kerakligi...',
                      bulletPoints: [
                        'Murojaat sababini yozing.',
                        'Vaziyatni tushuntiring.',
                        'Amaliy yechim yoki javob taklif qiling.'
                      ]
                    };
                    const updatedPool = {
                      ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }),
                      letterTopics: [...currentLetters, newLetter]
                    };
                    setTrialConfig({ ...trialConfig, writingPool: updatedPool });
                  }}
                  className="outline-btn"
                  style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} />
                  <span>Yangi Xat Topşirig‘i Qo‘şiş</span>
                </button>
              </div>

              {(trialConfig.writingPool?.letterTopics || DEFAULT_WRITING_LETTERS).map((letter, lIdx) => (
                <div key={letter.id} style={{ padding: '20px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'var(--soft)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(120, 105, 245, 0.15)', color: '#7869f5', fontSize: '12px', fontWeight: 800 }}>
                        Xat #{lIdx + 1} ({letter.letterType})
                      </span>
                      <strong style={{ fontSize: '15px' }}>{letter.topicTitle}</strong>
                    </div>

                    <button
                      onClick={() => {
                        const currentLetters = trialConfig.writingPool?.letterTopics || DEFAULT_WRITING_LETTERS;
                        const updated = currentLetters.filter((_, i) => i !== lIdx);
                        setTrialConfig({
                          ...trialConfig,
                          writingPool: {
                            ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }),
                            letterTopics: updated
                          }
                        });
                      }}
                      className="danger-btn"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                    >
                      <Trash2 size={13} /> Öçiriş
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Xat Sarlavhasi (Topic Title):</label>
                      <input
                        type="text"
                        value={letter.topicTitle}
                        onChange={e => {
                          const currentLetters = [...(trialConfig.writingPool?.letterTopics || DEFAULT_WRITING_LETTERS)];
                          currentLetters[lIdx].topicTitle = e.target.value;
                          setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), letterTopics: currentLetters } });
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Xat Turi (Letter Type):</label>
                      <select
                        value={letter.letterType}
                        onChange={e => {
                          const currentLetters = [...(trialConfig.writingPool?.letterTopics || DEFAULT_WRITING_LETTERS)];
                          currentLetters[lIdx].letterType = e.target.value as any;
                          setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), letterTopics: currentLetters } });
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                      >
                        <option value="formal">Formal (Rasmiy ariza / murojaat)</option>
                        <option value="informal">Informal (Do‘stona xat)</option>
                        <option value="semi-formal">Semi-formal (Yarim rasmiy taklif / shikoyat)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Minimal Söz Soni:</label>
                      <input
                        type="number"
                        value={letter.minWords}
                        onChange={e => {
                          const currentLetters = [...(trialConfig.writingPool?.letterTopics || DEFAULT_WRITING_LETTERS)];
                          currentLetters[lIdx].minWords = parseInt(e.target.value) || 120;
                          setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), letterTopics: currentLetters } });
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Xat Tavsifi va Topshiriq Qoidasi:</label>
                    <textarea
                      rows={3}
                      value={letter.promptDescription}
                      onChange={e => {
                        const currentLetters = [...(trialConfig.writingPool?.letterTopics || DEFAULT_WRITING_LETTERS)];
                        currentLetters[lIdx].promptDescription = e.target.value;
                        setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), letterTopics: currentLetters } });
                      }}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '13px' }}
                    />
                  </div>

                  {/* Bullet points */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 800 }}>Xat Reja Talablari:</label>
                      <button
                        onClick={() => {
                          const currentLetters = [...(trialConfig.writingPool?.letterTopics || DEFAULT_WRITING_LETTERS)];
                          currentLetters[lIdx].bulletPoints.push('Yangi reja bandi');
                          setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), letterTopics: currentLetters } });
                        }}
                        style={{ background: 'none', border: 'none', color: '#7869f5', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer' }}
                      >
                        + Band qo‘şiş
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {letter.bulletPoints.map((bp, bpIdx) => (
                        <div key={bpIdx} style={{ display: 'flex', gap: '6px' }}>
                          <input
                            type="text"
                            value={bp}
                            onChange={e => {
                              const currentLetters = [...(trialConfig.writingPool?.letterTopics || DEFAULT_WRITING_LETTERS)];
                              currentLetters[lIdx].bulletPoints[bpIdx] = e.target.value;
                              setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), letterTopics: currentLetters } });
                            }}
                            style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '12.5px' }}
                          />
                          <button
                            onClick={() => {
                              const currentLetters = [...(trialConfig.writingPool?.letterTopics || DEFAULT_WRITING_LETTERS)];
                              currentLetters[lIdx].bulletPoints = currentLetters[lIdx].bulletPoints.filter((_, i) => i !== bpIdx);
                              setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), letterTopics: currentLetters } });
                            }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Namuna Xat (Sample Letter):</label>
                    <textarea
                      rows={4}
                      value={letter.sampleBand8Text || ''}
                      onChange={e => {
                        const currentLetters = [...(trialConfig.writingPool?.letterTopics || DEFAULT_WRITING_LETTERS)];
                        currentLetters[lIdx].sampleBand8Text = e.target.value;
                        setTrialConfig({ ...trialConfig, writingPool: { ...(trialConfig.writingPool || { essayTopics: DEFAULT_WRITING_ESSAYS, letterTopics: DEFAULT_WRITING_LETTERS }), letterTopics: currentLetters } });
                      }}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '12.5px', fontStyle: 'italic' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. GRAMMAR SECTION (3-MINUTE THEORY GUIDE & QUESTIONS CRUD)         */}
      {/* =================================================================== */}
      {activeTab === 'grammar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                6. Grammar (Grammatika) Mavzulari & 3 Daqiqalik Nazariya ({ (trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS).length } ta)
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                Har bir grammatik mavzu boshida foydalanuvchiga 3 daqiqalik qisqa, sodda tushuntirish beriladi, söng mashqlar yechiladi.
              </p>
            </div>

            <button
              onClick={() => {
                const currentTopics = trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS;
                const newTopic: GrammarTopicItem = {
                  id: `gt-${Date.now()}`,
                  title: 'Yangi Grammatik Mavzu (masalan: Relative Clauses)',
                  level: 'B1',
                  readTimeMin: 3,
                  explanationGuide: `⏱️ 3 DAQIQALIK SODDA VA QISQA TUSHUNTIRISH:

1. Asosiy Qoida:
   • Mavzuning mohiyati va formulasi.

2. Qachon ishlatiladi:
   • Amaliy holatlar va misollar.

3. Keng tarqalgan xatolar:
   • E'tibor berish lozim bo'lgan nozik joylar.`,
                  questions: [
                    {
                      id: 1,
                      sentence: 'Misol gap va tagiga chizilgan qismlar',
                      highlightedOptions: ['1-qism', '2-qism', '3-qism', '4-qism'],
                      errorIndex: 1,
                      correctCorrection: 'Töğri shakl',
                      explanation: 'Nega xato ekanligi va grammatik qoida.'
                    }
                  ]
                };
                setTrialConfig({ ...trialConfig, grammarTopics: [...currentTopics, newTopic] });
                setExpandedGrammarId(newTopic.id);
              }}
              className="outline-btn"
              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>Yangi Grammatik Mavzu Qo‘şiş</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS).map((topic, tIdx) => {
              const isExpanded = expandedGrammarId === topic.id;

              return (
                <div
                  key={topic.id}
                  style={{
                    borderRadius: '16px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--soft)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Topic Header Accordion */}
                  <div
                    onClick={() => setExpandedGrammarId(isExpanded ? null : topic.id)}
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: isExpanded ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                      borderBottom: isExpanded ? '1px solid var(--border)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#d97706',
                        fontSize: '11.5px',
                        fontWeight: 800
                      }}>
                        {topic.level} · {topic.readTimeMin || 3} daqiqa
                      </span>
                      <strong style={{ fontSize: '15px' }}>{topic.title}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                        {topic.questions.length} ta savol
                      </span>
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                  </div>

                  {/* Expanded Topic Details */}
                  {isExpanded && (
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '5px' }}>Mavzu Nomi (Grammar Title):</label>
                          <input
                            type="text"
                            value={topic.title}
                            onChange={e => {
                              const currentTopics = [...(trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS)];
                              currentTopics[tIdx].title = e.target.value;
                              setTrialConfig({ ...trialConfig, grammarTopics: currentTopics });
                            }}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontWeight: 700 }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '5px' }}>CEFR Darajasi:</label>
                          <input
                            type="text"
                            value={topic.level}
                            onChange={e => {
                              const currentTopics = [...(trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS)];
                              currentTopics[tIdx].level = e.target.value;
                              setTrialConfig({ ...trialConfig, grammarTopics: currentTopics });
                            }}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '5px' }}>Öqiş Vaqti (daqiqa):</label>
                          <input
                            type="number"
                            value={topic.readTimeMin || 3}
                            onChange={e => {
                              const currentTopics = [...(trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS)];
                              currentTopics[tIdx].readTimeMin = parseInt(e.target.value) || 3;
                              setTrialConfig({ ...trialConfig, grammarTopics: currentTopics });
                            }}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit' }}
                          />
                        </div>
                      </div>

                      {/* 3-Minute Theory Explanation Editor */}
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '5px', color: '#d97706' }}>
                          📖 Mashq Boshidagi 3 Daqiqalik Sodda Tushuntirish Matni (Theory Guide):
                        </label>
                        <textarea
                          rows={8}
                          value={topic.explanationGuide}
                          onChange={e => {
                            const currentTopics = [...(trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS)];
                            currentTopics[tIdx].explanationGuide = e.target.value;
                            setTrialConfig({ ...trialConfig, grammarTopics: currentTopics });
                          }}
                          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid rgba(245, 158, 11, 0.4)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '13px', lineHeight: '1.6', fontFamily: 'monospace' }}
                        />
                      </div>

                      {/* PRACTICE QUESTIONS CRUD */}
                      <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <HelpCircle size={16} /> Maşq Savollari ({topic.questions.length} ta)
                          </div>
                          <button
                            onClick={() => {
                              const currentTopics = [...(trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS)];
                              currentTopics[tIdx].questions.push({
                                id: Date.now(),
                                sentence: 'Yangi gap misoli',
                                highlightedOptions: ['1-qism', '2-qism', '3-qism', '4-qism'],
                                errorIndex: 1,
                                correctCorrection: 'Töğri shakli',
                                explanation: 'Grammatik qoida tushuntirishi'
                              });
                              setTrialConfig({ ...trialConfig, grammarTopics: currentTopics });
                            }}
                            className="outline-btn"
                            style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Plus size={14} /> Savol Qo‘şiş
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {topic.questions.map((q, qIdx) => (
                            <div key={q.id} style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card-bg, #ffffff)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#d97706' }}>
                                  {qIdx + 1}-Savol (Xatolikni aniqlash):
                                </span>
                                <button
                                  onClick={() => {
                                    const currentTopics = [...(trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS)];
                                    currentTopics[tIdx].questions = currentTopics[tIdx].questions.filter((_, i) => i !== qIdx);
                                    setTrialConfig({ ...trialConfig, grammarTopics: currentTopics });
                                  }}
                                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                  title="Savolni öçiriş"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <div style={{ marginBottom: '8px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '2px' }}>Gap Matni (Sentence):</label>
                                <input
                                  type="text"
                                  value={q.sentence}
                                  onChange={e => {
                                    const currentTopics = [...(trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS)];
                                    currentTopics[tIdx].questions[qIdx].sentence = e.target.value;
                                    setTrialConfig({ ...trialConfig, grammarTopics: currentTopics });
                                  }}
                                  style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontWeight: 700, fontSize: '13px' }}
                                />
                              </div>

                              <div style={{ marginBottom: '8px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '4px' }}>
                                  Tagiga chizilgan 4 ta qism va Xato variant (radio tanlang):
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px' }}>
                                  {q.highlightedOptions.map((opt, oIdx) => (
                                    <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <input
                                        type="radio"
                                        name={`error_${topic.id}_${q.id}`}
                                        checked={q.errorIndex === oIdx}
                                        onChange={() => {
                                          const currentTopics = [...(trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS)];
                                          currentTopics[tIdx].questions[qIdx].errorIndex = oIdx;
                                          setTrialConfig({ ...trialConfig, grammarTopics: currentTopics });
                                        }}
                                        title="Ushbu qismda xato borligini belgilash"
                                      />
                                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: q.errorIndex === oIdx ? '#ef4444' : 'inherit' }}>
                                        [{oIdx + 1}]
                                      </span>
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={e => {
                                          const currentTopics = [...(trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS)];
                                          const opts = [...currentTopics[tIdx].questions[qIdx].highlightedOptions];
                                          opts[oIdx] = e.target.value;
                                          currentTopics[tIdx].questions[qIdx].highlightedOptions = opts;
                                          setTrialConfig({ ...trialConfig, grammarTopics: currentTopics });
                                        }}
                                        style={{ flex: 1, padding: '4px 6px', borderRadius: '5px', border: q.errorIndex === oIdx ? '1.5px solid #ef4444' : '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '12px' }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#10b981', marginBottom: '2px' }}>Töğri Tuzatiş Shakli:</label>
                                  <input
                                    type="text"
                                    value={q.correctCorrection}
                                    onChange={e => {
                                      const currentTopics = [...(trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS)];
                                      currentTopics[tIdx].questions[qIdx].correctCorrection = e.target.value;
                                      setTrialConfig({ ...trialConfig, grammarTopics: currentTopics });
                                    }}
                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1.5px solid #10b981', background: 'var(--input-bg, transparent)', color: 'inherit', fontWeight: 700, fontSize: '12px' }}
                                  />
                                </div>

                                <div>
                                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--muted)', marginBottom: '2px' }}>Grammatik Qoida Izohi (Explanation):</label>
                                  <input
                                    type="text"
                                    value={q.explanation}
                                    onChange={e => {
                                      const currentTopics = [...(trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS)];
                                      currentTopics[tIdx].questions[qIdx].explanation = e.target.value;
                                      setTrialConfig({ ...trialConfig, grammarTopics: currentTopics });
                                    }}
                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '12px' }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delete Topic Button */}
                      <div style={{ textAlign: 'right', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                        <button
                          onClick={() => {
                            if (window.confirm(`"${topic.title}" grammatik mavzusini öçirmoqçimisiz?`)) {
                              const currentTopics = (trialConfig.grammarTopics || DEFAULT_GRAMMAR_TOPICS).filter((_, i) => i !== tIdx);
                              setTrialConfig({ ...trialConfig, grammarTopics: currentTopics });
                            }
                          }}
                          className="danger-btn"
                          style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Trash2 size={14} />
                          <span>Uşbu Grammatik Mavzuni Öçiriş</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. AI YORDAMÇI & GOOGLE GEMINI API SOZLAMALARI                      */}
      {/* =================================================================== */}
      {activeTab === 'ai_settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Info Card */}
          <div style={{ padding: '24px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(120, 105, 245, 0.08) 100%)', border: '1.5px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#10b981', color: '#ffffff', display: 'grid', placeItems: 'center', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}>
                  <Bot size={26} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Google Gemini AI Integratsiyasi (Real-time Evaluation)
                    <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#10b981', color: '#ffffff' }}>
                      2.0 Flash
                    </span>
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                    Writing (insho va xatlar) hamda Speaking (ovozli savollar va rasm tasvirlash) topshiriqlarini haqiqiy sun’iy intellekt orqali tekshirish.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '100px', background: aiConfig.apiKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', border: `1px solid ${aiConfig.apiKey ? '#10b981' : '#f59e0b'}` }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: aiConfig.apiKey ? '#10b981' : '#f59e0b', display: 'inline-block', boxShadow: aiConfig.apiKey ? '0 0 10px #10b981' : 'none' }} />
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: aiConfig.apiKey ? '#10b981' : '#f59e0b' }}>
                  {aiConfig.apiKey ? 'Haqiqiy Gemini API Faol' : 'Simulyatsiya Rejimida (Kalit Kiritilmagan)'}
                </span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--muted)' }}>
              Ushbu tizim Google Gemini modeliga to‘g‘ridan-to‘g‘ri yoki Vercel serverless proksisi orqali xavfsiz ulanadi. Foydalanuvchilar insho yozganda yoki gapirganda, AI ularning grammatikasini, so‘z boyligini (lexicon), ravonligini (fluency) va xalqaro CEFR darajasini soniyalar ichida professional tahlil qilib beradi.
            </p>
          </div>

          {/* Form Settings */}
          <div style={{ padding: '24px', borderRadius: '18px', background: 'var(--soft)', border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* API Key Input */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={15} style={{ color: 'var(--purple)' }} />
                  Google Gemini API Kaliti (API Key):
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '12px', fontWeight: 750, color: '#10b981', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Bepul Gemini API kaliti olish (Google AI Studio) <ExternalLink size={12} />
                </a>
              </div>

              <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
                <input
                  type={showAiApiKey ? 'text' : 'password'}
                  value={aiConfig.apiKey}
                  onChange={e => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--input-bg, transparent)',
                    color: 'inherit',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowAiApiKey(!showAiApiKey)}
                  className="outline-btn"
                  style={{ padding: '0 16px', fontSize: '12.5px', fontWeight: 700 }}
                >
                  {showAiApiKey ? 'Yashirish' : 'Ko‘rsatish'}
                </button>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                🔒 Sizning API kalitingiz shifrlangan holda xavfsiz saqlanadi va faqat topshiriqlarni tekshirish uchun ishlatiladi.
              </p>
            </div>

            {/* Model & Parameters Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
                  AI Modeli:
                </label>
                <select
                  value={aiConfig.model}
                  onChange={e => setAiConfig({ ...aiConfig, model: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--input-bg, transparent)',
                    color: 'inherit',
                    fontSize: '13.5px',
                    fontWeight: 700
                  }}
                >
                  <option value="gemini-2.0-flash">⚡ Google Gemini 2.0 Flash (Tavsiya etiladi - Ultra-tezkor)</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Tezkor & Barqaror)</option>
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Maksimal chuqur tahlil)</option>
                </select>
                <span style={{ fontSize: '11.5px', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
                  Gemini 2.0 Flash har bir insho va audioni 0.5–1 soniyada tekshirib, real vaqtda javob beradi.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
                  Baholash Harorati (Temperature: {aiConfig.temperature ?? 0.2}):
                </label>
                <input
                  type="range"
                  min="0.0"
                  max="0.7"
                  step="0.05"
                  value={aiConfig.temperature ?? 0.2}
                  onChange={e => setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--purple)', margin: '8px 0' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--muted)' }}>
                  <span>0.0 (O‘ta qat’iy & xolis)</span>
                  <span>0.2 (Tavsiya: Ilmiy-akademik)</span>
                  <span>0.7 (Ijodiy)</span>
                </div>
              </div>
            </div>

            {/* Toggle Real AI */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px', background: 'var(--soft)' }}>
              <input
                type="checkbox"
                id="enableAiToggle"
                checked={aiConfig.enabled}
                onChange={e => setAiConfig({ ...aiConfig, enabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
              />
              <label htmlFor="enableAiToggle" style={{ fontSize: '13.5px', fontWeight: 750, cursor: 'pointer' }}>
                Writing va Speaking modullarida jonli AI tahlilini faol qilish
              </label>
            </div>

            {/* Test Connection Result Box */}
            {aiConnectionResult && (
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: aiConnectionResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1.5px solid ${aiConnectionResult.success ? '#10b981' : '#ef4444'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                {aiConnectionResult.success ? (
                  <CheckCircle2 size={22} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <AlertCircle size={22} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                )}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: aiConnectionResult.success ? '#10b981' : '#ef4444' }}>
                    {aiConnectionResult.success ? 'Aloqa Muvaffaqiyatli O‘rnatildi!' : 'Aloqa O‘rnatilmadi'}
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '4px', color: 'inherit' }}>
                    {aiConnectionResult.message}
                  </div>
                  {aiConnectionResult.latencyMs && (
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                      ⚡ Server javob vaqti (Latency): <strong>{aiConnectionResult.latencyMs} ms</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={async () => {
                  setTestingAiConnection(true);
                  setAiConnectionResult(null);
                  try {
                    const result = await testGeminiConnection(aiConfig.apiKey, aiConfig.model);
                    setAiConnectionResult(result);
                    if (result.success) {
                      notify('Google Gemini API bilan muvaffaqiyatli bog‘lanildi! ⚡');
                    } else {
                      notify(result.message, true);
                    }
                  } catch (err: any) {
                    setAiConnectionResult({
                      success: false,
                      message: err.message || 'Kutilmagan xatolik yuz berdi'
                    });
                  } finally {
                    setTestingAiConnection(false);
                  }
                }}
                disabled={testingAiConnection || !aiConfig.apiKey}
                className="outline-btn"
                style={{
                  padding: '11px 20px',
                  fontSize: '13px',
                  fontWeight: 750,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {testingAiConnection ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                <span>{testingAiConnection ? 'Tekshirilmoqda...' : 'Aloqani Tekshirish (Test Ping)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  saveStoredAiConfig(aiConfig);
                  const updated = {
                    ...trialConfig,
                    aiConfig
                  };
                  handleSaveAll(updated);
                  notify('AI sozlamalari muvaffaqiyatli saqlandi! 🎉');
                }}
                disabled={saving}
                className="primary-btn"
                style={{
                  padding: '11px 24px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Save size={16} />
                <span>AI Sozlamalarini Saqlash</span>
              </button>
            </div>
          </div>

          {/* Quick Guide on Google AI Studio */}
          <div style={{ padding: '20px', borderRadius: '16px', background: 'var(--soft)', border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14.5px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: '#10b981' }} />
              Google Gemini API Kalitini 30 soniyada olish yo‘riqnomasi:
            </h4>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.7', color: 'var(--muted)' }}>
              <li>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#10b981', fontWeight: 700 }}>
                  aistudio.google.com/app/apikey
                </a> sahifasiga Google hisobingiz bilan kiring.
              </li>
              <li><strong>"Create API key"</strong> ko‘k tugmasini bosing.</li>
              <li>Hosil bo‘lgan kalitni (odatda <code>AIzaSy...</code> bilan boshlanadi) nusxalang va yuqoridagi maydonga kiriting.</li>
              <li><strong>"Aloqani Tekshirish"</strong> tugmasini bosib, aloqa yashil yongach <strong>"Saqlash"</strong> tugmasini bosing!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

