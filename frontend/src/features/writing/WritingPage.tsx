import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { WritingGenre, WritingDraft } from '../../types';
import { 
  PenTool, Sparkles, Save, Clock, AlertCircle, 
  Check, FileText, ChevronRight, ShieldAlert 
} from 'lucide-react';

export const WritingPage: React.FC = () => {
  const [genre, setGenre] = useState<WritingGenre>('Essay');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [drafts, setDrafts] = useState<WritingDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // AI Feedback
  const [evaluating, setEvaluating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const fetchDrafts = async () => {
    try {
      const data = await api.get<WritingDraft[]>('/writing/drafts');
      setDrafts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleSaveDraft = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await api.post('/writing/drafts', { genre, title, content });
      setSavedSuccess(true);
      fetchDrafts();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestAiEvaluation = async () => {
    if (!content.trim()) return;
    setEvaluating(true);
    setAiFeedback(null);

    try {
      const res: any = await api.post('/writing/ai-feedback', {
        text: content,
        genre,
        targetLanguage: 'English',
        level: 'B1',
      });
      setAiFeedback(res.feedback);
    } catch (err: any) {
      alert(err.message || 'AI evaluation failed.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleLoadDraft = (d: WritingDraft) => {
    setGenre(d.genre);
    setTitle(d.title);
    setContent(d.content);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 pb-24 md:pb-12 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <PenTool className="w-8 h-8 text-blue-500" />
            <span>Structured Writing Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Write essays, formal letters, requests, and receive instant AI stylistic feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
              <Check className="w-4 h-4" /> Saved!
            </span>
          )}
          <button
            onClick={handleSaveDraft}
            disabled={saving || !title.trim() || !content.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Editor Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl glass-panel bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            
            {/* Genre Selector */}
            <div className="flex flex-wrap items-center gap-2">
              {(['Essay', 'FormalLetter', 'InformalLetter', 'Email', 'ApplicationRequest', 'Tilxat'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    genre === g
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  {g === 'FormalLetter' ? 'Formal Letter' : g === 'InformalLetter' ? 'Informal Letter' : g === 'ApplicationRequest' ? 'Request' : g}
                </button>
              ))}
            </div>

            {/* Title Input */}
            <input
              type="text"
              placeholder="Writing Title or Topic Prompt..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Editor Area */}
            <textarea
              rows={14}
              placeholder="Begin writing here. Organize your thoughts into paragraphs with clear topic sentences..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-800/40 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed resize-y"
            ></textarea>

            {/* Bottom Bar: Word Count & AI Feedback trigger */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400 flex items-center gap-4">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} characters</span>
              </div>

              <button
                type="button"
                onClick={handleRequestAiEvaluation}
                disabled={evaluating || !content.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-98 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all disabled:opacity-40"
              >
                <Sparkles className="w-4 h-4" />
                <span>{evaluating ? 'Analyzing Writing...' : 'Get AI Writing Feedback'}</span>
              </button>
            </div>
          </div>

          {/* AI Feedback Presentation */}
          {aiFeedback && (
            <div className="p-6 rounded-3xl glass-panel bg-slate-900 border border-purple-500/30 space-y-3 shadow-2xl animate-in fade-in">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI Language Assistant Evaluation</span>
              </div>

              {/* Required Non-Teacher Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  Notice: This evaluation is generated by the AI Language Assistant for practice purposes and is not an official teacher grade.
                </span>
              </div>

              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                {aiFeedback}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Saved Drafts */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl glass-panel bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Saved Drafts</span>
            </h3>

            {drafts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No saved drafts yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {drafts.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleLoadDraft(d)}
                    className="p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors"
                  >
                    <p className="font-bold text-xs text-white truncate">{d.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{d.genre}</span>
                      <span>{d.wordCount} words</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
