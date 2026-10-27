import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { Assignment, AssignmentType, CefrLevel } from '../../types';
import { 
  CheckSquare, Plus, Clock, Award, Send, 
  CheckCircle, FileText, ChevronRight, UserCheck 
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-tasks' | 'teacher-portal'>('my-tasks');
  const [tasks, setTasks] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Grade modal (for teachers)
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [gradingTaskId, setGradingTaskId] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState('90');
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Create Assignment modal (for teachers)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assignType, setAssignType] = useState<AssignmentType>('Writing');
  const [assignLevel, setAssignLevel] = useState<CefrLevel>('B1');
  const [studentId, setStudentId] = useState('');
  const [connectedStudents, setConnectedStudents] = useState<any[]>([]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'my-tasks' ? '/tasks/my-tasks' : '/tasks/assigned-by-me';
      const data = await api.get<Assignment[]>(endpoint);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectedStudents = async () => {
    try {
      const res: any = await api.get('/teachers/connections');
      setConnectedStudents(res);
      if (res.length > 0) {
        setStudentId(res[0].studentId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (activeTab === 'teacher-portal') {
      fetchConnectedStudents();
    }
  }, [activeTab]);

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaskId || !submissionContent.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/tasks/${activeTaskId}/submit`, { content: submissionContent });
      setSubmitModalOpen(false);
      setSubmissionContent('');
      fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingTaskId) return;

    try {
      await api.post(`/tasks/${gradingTaskId}/grade`, {
        grade: parseFloat(gradeScore),
        feedback: gradeFeedback,
      });
      setGradeModalOpen(false);
      fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Grading failed.');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        studentId,
        title: assignTitle,
        instructions: assignInstructions,
        taskType: assignType,
        level: assignLevel,
        languageCode: 'en',
        maxScore: 100,
      });
      setCreateModalOpen(false);
      setAssignTitle('');
      setAssignInstructions('');
      fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to create assignment.');
    }
  };

  const isTeacher = user?.role === 'Teacher' || user?.role === 'Admin' || user?.role === 'SuperAdmin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 pb-24 md:pb-12 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-blue-500" />
            <span>Tasks & Assignments</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Teacher-assigned vocabulary, grammar, and writing activities with official rubric grades.
          </p>
        </div>

        {isTeacher && activeTab === 'teacher-portal' && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('my-tasks')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'my-tasks'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          My Assigned Tasks
        </button>

        {isTeacher && (
          <button
            onClick={() => setActiveTab('teacher-portal')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'teacher-portal'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span>Teacher Portal (Assigned by Me)</span>
          </button>
        )}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-slate-900/60 rounded-3xl border border-slate-800"></div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl glass-panel bg-slate-900/40 border border-slate-800">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No assignments found</p>
          <p className="text-xs text-slate-500 mt-1">Connect with a teacher in the Teacher Directory to receive custom tasks.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="card-elevated p-6 bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                    {task.taskType} • {task.level}
                  </span>
                  
                  {/* Status Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.status === 'Reviewed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : task.status === 'Submitted'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {task.status}
                  </span>

                  {task.grade !== null && task.grade !== undefined && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Grade: {task.grade}/{task.maxScore}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-white">{task.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{task.instructions}</p>

                {task.feedback && (
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-xs text-slate-300 mt-2">
                    <p className="font-bold text-emerald-400">Teacher Feedback:</p>
                    <p className="italic mt-0.5">"{task.feedback}"</p>
                  </div>
                )}

                <p className="text-[11px] text-slate-500">
                  {activeTab === 'my-tasks' ? `Assigned by: ${task.teacherName}` : `Student: ${task.studentName}`}
                </p>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-2">
                {activeTab === 'my-tasks' ? (
                  task.status !== 'Reviewed' && (
                    <button
                      onClick={() => {
                        setActiveTaskId(task.id);
                        setSubmitModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{task.status === 'Submitted' ? 'Resubmit Work' : 'Submit Task'}</span>
                    </button>
                  )
                ) : (
                  task.status === 'Submitted' && (
                    <button
                      onClick={() => {
                        setGradingTaskId(task.id);
                        setGradeModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Grade Submission</span>
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Work Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-panel bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white mb-2">Submit Assignment Work</h3>
            <form onSubmit={handleSubmitWork} className="space-y-4">
              <textarea
                rows={8}
                required
                placeholder="Type your response or paste your completed assignment text here..."
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              ></textarea>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20"
                >
                  {submitting ? 'Submitting...' : 'Send to Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Grade Modal */}
      {gradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white mb-3">Grade Student Submission</h3>
            <form onSubmit={handleGradeTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Score (Out of 100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Teacher Written Feedback & Rubric Notes</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain strengths, areas for vocabulary improvement, and grammatical corrections..."
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGradeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  Publish Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Create Assignment Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-panel bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white mb-3">Create New Student Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assign to Connected Student</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  {connectedStudents.map((c) => (
                    <option key={c.studentId} value={c.studentId}>{c.studentName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Essay: Pros & Cons of Artificial Intelligence"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Task Type</label>
                  <select
                    value={assignType}
                    onChange={(e) => setAssignType(e.target.value as AssignmentType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="Writing">Writing</option>
                    <option value="Vocabulary">Vocabulary</option>
                    <option value="Grammar">Grammar</option>
                    <option value="Reading">Reading</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target CEFR Level</label>
                  <select
                    value={assignLevel}
                    onChange={(e) => setAssignLevel(e.target.value as CefrLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Instructions & Guidelines *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide instructions, minimum word count (e.g. 250 words), and key vocabulary to include..."
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
