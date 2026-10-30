import React, { useState, useRef } from 'react';
import {
  Sparkles, BookOpen, Headphones, PenLine, Mic, Trophy,
  Save, Plus, Trash2, Edit3, Image as ImageIcon, Upload,
  CheckCircle2, AlertCircle, RefreshCw, Eye, Search, ExternalLink, X
} from 'lucide-react';
import {
  TrialTestsConfig, INITIAL_TRIAL_CONFIG, WordQuizItem,
  SpeakingQuestion, SpeakingDescribeImage, ReadingTestItem,
  ListeningTestItem, WritingTestItem, GrammarTestItem
} from '../../data/trialTestData';
import { api } from '../../api';

interface AdminTrialTestsTabProps {
  cms: any;
  onSaveCms: (updatedCms: any) => Promise<void>;
  notify: (msg: string, isError?: boolean) => void;
  dark?: boolean;
}

type AdminSubTab = 'word' | 'speaking' | 'reading' | 'listening' | 'writing' | 'grammar';

export function AdminTrialTestsTab({ cms, onSaveCms, notify, dark }: AdminTrialTestsTabProps) {
  // Current config
  const currentConfig: TrialTestsConfig = cms?.trialTests || INITIAL_TRIAL_CONFIG;
  const [trialConfig, setTrialConfig] = useState<TrialTestsConfig>(currentConfig);
  const [activeTab, setActiveTab] = useState<AdminSubTab>('word');
  const [saving, setSaving] = useState(false);

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
          { key: 'grammar', label: '6. Grammar (Grammatika)', icon: Sparkles }
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
      {/* 3. READING SECTION                                                  */}
      {/* =================================================================== */}
      {activeTab === 'reading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {trialConfig.reading.map((r, idx) => (
            <div key={r.id} style={{ padding: '18px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--purple)' }}>
                  {r.type === 'comprehension' ? '1-Tur: Matn va savollar' : '2-Tur: Bo‘sh joylarni to‘ldirish'} ({r.level})
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{r.genre}</span>
              </div>

              <input
                type="text"
                value={r.title}
                onChange={e => {
                  const updated = [...trialConfig.reading];
                  updated[idx].title = e.target.value;
                  setTrialConfig({ ...trialConfig, reading: updated });
                }}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontWeight: 800, marginBottom: '8px' }}
              />

              <textarea
                rows={5}
                value={r.text}
                onChange={e => {
                  const updated = [...trialConfig.reading];
                  updated[idx].text = e.target.value;
                  setTrialConfig({ ...trialConfig, reading: updated });
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '13px', lineHeight: '1.6' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. LISTENING SECTION                                                */}
      {/* =================================================================== */}
      {activeTab === 'listening' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '18px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--soft)' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Audio Sarlavhasi:</label>
            <input
              type="text"
              value={trialConfig.listening.title}
              onChange={e => setTrialConfig({ ...trialConfig, listening: { ...trialConfig.listening, title: e.target.value } })}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', marginBottom: '14px' }}
            />

            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Audioda Aytiladigan Matn (TTS / Narration Script):</label>
            <textarea
              rows={4}
              value={trialConfig.listening.narrationScript}
              onChange={e => setTrialConfig({ ...trialConfig, listening: { ...trialConfig.listening, narrationScript: e.target.value } })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '13.5px', lineHeight: '1.6' }}
            />
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. WRITING SECTION                                                  */}
      {/* =================================================================== */}
      {activeTab === 'writing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '18px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--soft)' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Insho Mavzusi (Topic Title):</label>
            <input
              type="text"
              value={trialConfig.writing.topicTitle}
              onChange={e => setTrialConfig({ ...trialConfig, writing: { ...trialConfig.writing, topicTitle: e.target.value } })}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', marginBottom: '12px' }}
            />

            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Minimal So‘z Son (Min Words):</label>
            <input
              type="number"
              value={trialConfig.writing.minWords}
              onChange={e => setTrialConfig({ ...trialConfig, writing: { ...trialConfig.writing, minWords: parseInt(e.target.value) || 150 } })}
              style={{ width: '120px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', marginBottom: '12px' }}
            />

            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>Mavzu Tavsifi va Topshiriq Qoidalari:</label>
            <textarea
              rows={3}
              value={trialConfig.writing.promptDescription}
              onChange={e => setTrialConfig({ ...trialConfig, writing: { ...trialConfig.writing, promptDescription: e.target.value } })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg, transparent)', color: 'inherit', fontSize: '13px' }}
            />
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. GRAMMAR SECTION                                                  */}
      {/* =================================================================== */}
      {activeTab === 'grammar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '18px', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--soft)' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 800 }}>
              {trialConfig.grammar.title} ({trialConfig.grammar.level})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {trialConfig.grammar.questions.map((q, idx) => (
                <div key={q.id} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700 }}>
                    {idx + 1}. {q.sentence}
                  </div>
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                    To‘g‘ri tuzatish: {q.correctCorrection} ({q.explanation})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
