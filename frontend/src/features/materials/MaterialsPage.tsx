import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { LearningMaterial, MaterialContentType, CefrLevel } from '../../types';
import { 
  BookOpen, Video, Headphones, MessageSquare, BookMarked, 
  Search, CheckCircle, Clock, ExternalLink, Play, ArrowLeft, Award 
} from 'lucide-react';

export const MaterialsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<MaterialContentType>('Story');
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);

  // Comprehension answers state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await api.get<LearningMaterial[]>(`/materials?contentType=${selectedType}`);
      setMaterials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
    setSelectedMaterial(null);
  }, [selectedType]);

  const handleOpenMaterial = async (id: string) => {
    try {
      const data = await api.get<LearningMaterial>(`/materials/${id}`);
      setSelectedMaterial(data);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizScore(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = async (questions: any[]) => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    if (selectedMaterial) {
      await api.post(`/materials/${selectedMaterial.id}/progress`, {
        score,
        progressPercentage: 100,
        markCompleted: true,
      });
      setSelectedMaterial({ ...selectedMaterial, isCompleted: true, userScore: score });
    }
  };

  const handleMarkFinished = async () => {
    if (!selectedMaterial) return;
    try {
      await api.post(`/materials/${selectedMaterial.id}/progress`, {
        score: 100,
        progressPercentage: 100,
        markCompleted: true,
      });
      setSelectedMaterial({ ...selectedMaterial, isCompleted: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 pb-24 md:pb-12 text-slate-100">
      
      {/* Detail View */}
      {selectedMaterial ? (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedMaterial(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Materials</span>
          </button>

          <div className="p-6 sm:p-10 rounded-3xl glass-panel bg-slate-900 border border-slate-800 space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                  {selectedMaterial.contentType} • {selectedMaterial.level}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {selectedMaterial.estimatedMinutes} mins read
                </span>
                {selectedMaterial.isCompleted && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Completed
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{selectedMaterial.title}</h1>
              {selectedMaterial.attribution && (
                <p className="text-xs text-slate-400 mt-1">Source: {selectedMaterial.attribution}</p>
              )}
            </div>

            {/* Level Variants Switcher (A1, A2, B1, B2) */}
            {selectedMaterial.availableVersions && selectedMaterial.availableVersions.length > 1 && (
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <p className="text-xs font-bold text-slate-300 mb-2">Available CEFR Versions of this work:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMaterial.availableVersions.map((ver) => (
                    <button
                      key={ver.materialId}
                      onClick={() => handleOpenMaterial(ver.materialId)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedMaterial.id === ver.materialId
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {ver.level} Version
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Video Player if available */}
            {selectedMaterial.videoUrl && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                <iframe
                  src={selectedMaterial.videoUrl}
                  title={selectedMaterial.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* Content Body */}
            <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-800/30 p-6 rounded-2xl border border-slate-800/80">
              {selectedMaterial.contentBody}
            </div>

            {/* Comprehension Questions if any */}
            {selectedMaterial.comprehensionQuestionsJson && (
              (() => {
                try {
                  const questions = JSON.parse(selectedMaterial.comprehensionQuestionsJson);
                  return (
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <span>Comprehension Check</span>
                      </h3>

                      {questions.map((q: any, qIdx: number) => (
                        <div key={qIdx} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-2">
                          <p className="text-xs font-bold text-slate-200">{qIdx + 1}. {q.question}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt: string, optIdx: number) => {
                              const isSelected = quizAnswers[qIdx] === optIdx;
                              let btnClass = 'bg-slate-700/50 text-slate-200 border-transparent hover:bg-slate-700';
                              if (quizSubmitted) {
                                if (optIdx === q.correctIndex) {
                                  btnClass = 'bg-emerald-600 text-white font-bold';
                                } else if (isSelected && optIdx !== q.correctIndex) {
                                  btnClass = 'bg-rose-600 text-white';
                                }
                              } else if (isSelected) {
                                btnClass = 'bg-blue-600 text-white font-bold border-blue-400';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                  className={`p-2.5 rounded-xl border text-xs text-left transition-colors ${btnClass}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {!quizSubmitted ? (
                        <button
                          type="button"
                          onClick={() => handleSubmitQuiz(questions)}
                          disabled={Object.keys(quizAnswers).length < questions.length}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 disabled:opacity-50"
                        >
                          Submit Answers
                        </button>
                      ) : (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                          Exercise submitted! Score: {quizScore}%
                        </div>
                      )}
                    </div>
                  );
                } catch {
                  return null;
                }
              })()
            )}

            {/* External link if speaking topic or source */}
            {selectedMaterial.sourceUrl && (
              <a
                href={selectedMaterial.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20"
              >
                <span>Join Community Discussion Group</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {!selectedMaterial.isCompleted && !selectedMaterial.comprehensionQuestionsJson && (
              <button
                onClick={handleMarkFinished}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark as Finished</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Materials List View */
        <>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-indigo-400" />
              <span>Learning Materials Center</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Curated literature, YouTube listening, speaking rooms, and level-adapted stories.
            </p>
          </div>

          {/* Module Type Selector */}
          <div className="flex border-b border-slate-800 gap-2 sm:gap-6 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold">
            {[
              { type: 'Story', label: 'Stories & News', icon: BookOpen },
              { type: 'GrammarLesson', label: 'Grammar Lessons', icon: BookMarked },
              { type: 'VideoLesson', label: 'Video Listening', icon: Video },
              { type: 'SpeakingTopic', label: 'Speaking Clubs', icon: MessageSquare },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => setSelectedType(item.type as MaterialContentType)}
                className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  selectedType === item.type
                    ? 'border-blue-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <item.icon className="w-4 h-4 text-blue-400" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 bg-slate-900/60 rounded-2xl border border-slate-800"></div>
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl glass-panel bg-slate-900/40 border border-slate-800">
              <p className="text-sm font-semibold text-slate-300">No materials found in this section</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {materials.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleOpenMaterial(m.id)}
                  className="card-elevated p-6 bg-slate-900/80 border border-slate-800 flex flex-col justify-between cursor-pointer group hover:border-blue-500/50"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        {m.level}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {m.estimatedMinutes}m
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-white group-hover:text-blue-300 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {m.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-blue-400 font-semibold group-hover:underline">
                      Start Learning →
                    </span>
                    {m.isCompleted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Done
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
