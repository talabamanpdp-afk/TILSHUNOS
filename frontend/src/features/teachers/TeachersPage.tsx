import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { TeacherProfile } from '../../types';
import { 
  GraduationCap, Search, Star, ExternalLink, UserCheck, 
  Send, Sparkles, CheckCircle, ShieldCheck, Plus 
} from 'lucide-react';

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Apply modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [bio, setBio] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [languagesTaught, setLanguagesTaught] = useState('en');
  const [externalContactUrl, setExternalContactUrl] = useState('');
  const [hourlyRate, setHourlyRate] = useState('20');
  const [experience, setExperience] = useState('3');
  const [applySuccess, setApplySuccess] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await api.get<TeacherProfile[]>(`/teachers${search ? `?search=${search}` : ''}`);
      setTeachers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [search]);

  const handleConnect = async (teacherId: string) => {
    try {
      const res: any = await api.post(`/teachers/${teacherId}/connect`);
      alert(res.message || 'Connected successfully!');
    } catch (err: any) {
      alert(err.message || 'Connection failed.');
    }
  };

  const handleApplyTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teachers/apply', {
        bio,
        qualifications,
        languagesTaught,
        cefrLevelsTaught: 'A1,A2,B1,B2,C1',
        externalContactUrl,
        hourlyRate: parseFloat(hourlyRate),
        teachingExperienceYears: parseInt(experience, 10),
      });
      setApplySuccess(true);
      fetchTeachers();
      setTimeout(() => {
        setApplySuccess(false);
        setApplyModalOpen(false);
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Application failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 pb-24 md:pb-12 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-500" />
            <span>Certified Teachers & Mentors</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect with verified language instructors for personalized tasks and exam preparation.
          </p>
        </div>

        <button
          onClick={() => setApplyModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Apply to Teach</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by teacher name or qualification..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Teachers Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-slate-900/60 rounded-3xl border border-slate-800"></div>
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl glass-panel bg-slate-900/40 border border-slate-800">
          <p className="text-sm font-semibold text-slate-300">No teachers found matching your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <div
              key={teacher.userId}
              className="card-elevated p-6 bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={
                      teacher.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={teacher.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                      <span>{teacher.name}</span>
                      <span title="Verified Instructor">
                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                      </span>
                    </h3>
                    <p className="text-[11px] text-purple-400 font-semibold">{teacher.qualifications}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{teacher.teachingExperienceYears} years experience</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-2xl border border-slate-800/60">
                  "{teacher.bio}"
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Teaches: {teacher.languagesTaught.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Levels: {teacher.cefrLevelsTaught}
                  </span>
                  {teacher.hourlyRate && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      ${teacher.hourlyRate}/hr
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => handleConnect(teacher.userId)}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Connect</span>
                </button>

                {teacher.externalContactUrl && (
                  <a
                    href={teacher.externalContactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Telegram</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply to Teach Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-panel bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-white mb-1">Become a Tilshunos Teacher</h3>
            <p className="text-xs text-slate-400 mb-4">
              Share your expertise, assign structured tasks, and evaluate learner writing.
            </p>

            {applySuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Teacher profile submitted successfully!
              </div>
            ) : (
              <form onSubmit={handleApplyTeacher} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Qualifications & Certifications *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IELTS 8.5, CELTA Pass A, MA TESOL"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Biography & Teaching Methodology *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell prospective students about your lesson format, accent training, and experience..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Languages Taught</label>
                    <input
                      type="text"
                      placeholder="e.g. English, German"
                      value={languagesTaught}
                      onChange={(e) => setLanguagesTaught(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      min={1}
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Hourly Rate (USD)</label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">External Contact (Telegram link)</label>
                    <input
                      type="text"
                      placeholder="https://t.me/your_username"
                      value={externalContactUrl}
                      onChange={(e) => setExternalContactUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
