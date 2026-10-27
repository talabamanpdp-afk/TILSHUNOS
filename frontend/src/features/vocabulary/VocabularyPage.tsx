import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { VocabularyEntry, VocabularyState, PublishedCollection } from '../../types';
import { 
  BookMarked, Plus, Search, Filter, ShieldCheck, 
  Trash2, Copy, Sparkles, AlertCircle, Check, Info, Globe 
} from 'lucide-react';

export const VocabularyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'public'>('personal');
  const [stateFilter, setStateFilter] = useState<VocabularyState | 'All'>('All');
  const [search, setSearch] = useState('');
  
  // Personal list
  const [words, setWords] = useState<VocabularyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Add word modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [targetWord, setTargetWord] = useState('');
  const [nativeTranslation, setNativeTranslation] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [hint, setHint] = useState('');
  const [topic, setTopic] = useState('General');
  const [partOfSpeech, setPartOfSpeech] = useState('Noun');
  const [personalNote, setPersonalNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Public collections
  const [publicCollections, setPublicCollections] = useState<PublishedCollection[]>([]);
  const [copySuccessMsg, setCopySuccessMsg] = useState<string | null>(null);

  const fetchWords = async () => {
    setLoading(true);
    try {
      let url = '/vocabulary';
      const params = new URLSearchParams();
      if (stateFilter !== 'All') params.append('state', stateFilter);
      if (search.trim()) params.append('search', search.trim());
      if (params.toString()) url += `?${params.toString()}`;

      const data = await api.get<VocabularyEntry[]>(url);
      setWords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicCollections = async () => {
    try {
      const data = await api.get<PublishedCollection[]>('/vocabulary/collections/public');
      setPublicCollections(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'personal') {
      fetchWords();
    } else {
      fetchPublicCollections();
    }
  }, [activeTab, stateFilter, search]);

  const handleCreateWord = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);

    try {
      await api.post('/vocabulary', {
        targetWord,
        nativeTranslation,
        languageCode: 'en',
        exampleSentence,
        hint,
        topic,
        partOfSpeech,
        personalNote,
      });

      setAddModalOpen(false);
      setTargetWord('');
      setNativeTranslation('');
      setExampleSentence('');
      setHint('');
      fetchWords();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add word.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWord = async (id: string) => {
    if (!confirm('Are you sure you want to remove this word?')) return;
    try {
      await api.del(`/vocabulary/${id}`);
      fetchWords();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyPublicCollection = async (collectionId: string) => {
    try {
      const res: any = await api.post(`/vocabulary/collections/${collectionId}/copy`);
      setCopySuccessMsg(res.message);
      setTimeout(() => setCopySuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to copy collection.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 pb-24 md:pb-12 text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <BookMarked className="w-8 h-8 text-blue-500" />
            <span>Vocabulary Notebook</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personal retention database protected by verified learning criteria.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Word</span>
        </button>
      </div>

      {/* Tabs: Personal vs Public */}
      <div className="flex border-b border-slate-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('personal')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'personal'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          My Personal Notebook ({words.length})
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'public'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-purple-400" />
          <span>Public Collections</span>
        </button>
      </div>

      {activeTab === 'personal' ? (
        <>
          {/* Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search words or translations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* State filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {(['All', 'Planned', 'InProgress', 'Learned', 'NeedsReview'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStateFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    stateFilter === st
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {st === 'InProgress' ? 'In Progress' : st === 'NeedsReview' ? 'Needs Review' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Words Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-36 bg-slate-900/60 rounded-2xl border border-slate-800"></div>
              ))}
            </div>
          ) : words.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl glass-panel bg-slate-900/40 border border-slate-800">
              <BookMarked className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">No vocabulary words found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Add words manually or browse the Public Collections tab to copy curated vocabulary into your Planned list.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {words.map((word) => (
                <div
                  key={word.id}
                  className="card-elevated p-5 bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-lg font-bold text-white tracking-tight">{word.targetWord}</span>
                        {word.partOfSpeech && (
                          <span className="text-[10px] italic text-slate-400 ml-2 font-mono">({word.partOfSpeech})</span>
                        )}
                      </div>
                      
                      {/* State Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          word.state === 'Learned'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : word.state === 'InProgress'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : word.state === 'NeedsReview'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-700/40 text-slate-300'
                        }`}
                      >
                        {word.state === 'InProgress' ? 'In Progress' : word.state === 'NeedsReview' ? 'Needs Review' : word.state}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-200 mt-1">{word.nativeTranslation}</p>

                    {word.exampleSentence && (
                      <p className="text-xs text-slate-400 italic mt-2 bg-slate-800/40 p-2 rounded-xl border border-slate-800/60">
                        "{word.exampleSentence}"
                      </p>
                    )}

                    {word.hint && (
                      <p className="text-[11px] text-amber-400/90 mt-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span>Hint: {word.hint}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>{word.consecutiveCorrectCount}/3 verified</span>
                    </span>
                    <button
                      onClick={() => handleDeleteWord(word.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Public Collections Tab */
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">
              <span className="font-bold text-white">Anti-Cheat Notice:</span> Copying curated public vocabulary adds entries to your <span className="font-bold text-white">Planned Words</span> list. A word is only awarded "Learned" status after you independently answer it correctly 3 consecutive times during practice.
            </p>
          </div>

          {copySuccessMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{copySuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicCollections.map((col) => (
              <div key={col.id} className="card-elevated p-6 bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                      {col.topic} • {col.level}
                    </span>
                    <span className="text-xs text-slate-400">{col.wordCount} words</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{col.title}</h3>
                  <p className="text-xs text-slate-400">{col.description}</p>
                  <p className="text-[11px] text-slate-500 mt-2">Curated by {col.authorName}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{col.copyCount} learners copied</span>
                  <button
                    onClick={() => handleCopyPublicCollection(col.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy to Planned</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Word Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-panel bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white mb-1">Add New Word</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter target word and native translation. Newly entered words automatically start in Planned.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateWord} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Word *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. perseverance"
                    value={targetWord}
                    onChange={(e) => setTargetWord(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Native Translation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. matonat, qat'iyat"
                    value={nativeTranslation}
                    onChange={(e) => setNativeTranslation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Part of Speech</label>
                  <select
                    value={partOfSpeech}
                    onChange={(e) => setPartOfSpeech(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="Noun">Noun</option>
                    <option value="Verb">Verb</option>
                    <option value="Adjective">Adjective</option>
                    <option value="Adverb">Adverb</option>
                    <option value="Phrase">Phrase</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Topic / Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Psychology"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Example Sentence</label>
                <input
                  type="text"
                  placeholder="e.g. Success requires perseverance through trials."
                  value={exampleSentence}
                  onChange={(e) => setExampleSentence(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Hint (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Continued effort and determination"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20"
                >
                  {saving ? 'Saving...' : 'Save to Planned'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
