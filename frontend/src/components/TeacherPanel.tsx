import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { api, authStorage } from '../api';

interface Student {
  id: string;
  name: string;
  email: string;
  targetLevel: string;
  dailyGoalMinutes: number;
  assignedTasksCount: number;
  vocabularyCount: number;
  joinedDate: string;
}

interface TeacherProfileState {
  fullName: string;
  email: string;
  bio: string;
  specialty: string;
  telegram: string;
  instagram: string;
  facebook: string;
}

interface TeacherPanelProps {
  onLogout: () => void;
  dark?: boolean;
  setDark?: (d: boolean) => void;
}

export const TeacherPanel: React.FC<TeacherPanelProps> = ({ onLogout, dark, setDark }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'tasks' | 'profile' | 'personal'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<TeacherProfileState>({
    fullName: '',
    email: '',
    bio: '',
    specialty: '',
    telegram: '',
    instagram: '',
    facebook: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  // Assign task modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    instructions: '',
    taskType: 1, // 1: Writing, 2: Reading, 3: Listening, 4: Speaking, 5: Grammar
    level: 3, // B1
    dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    maxScore: 100
  });
  const [assigningTask, setAssigningTask] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState('');

  // Assigned tasks list
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);

  // Teacher personal vocabulary
  const [personalVocab, setPersonalVocab] = useState<any[]>([]);
  const [newWord, setNewWord] = useState({ target: '', translation: '', example: '' });

  const currentUser = authStorage.getUser();

  useEffect(() => {
    loadStudents();
    loadProfile();
    loadAssignedTasks();
    loadPersonalVocab();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await (api as any).getAssignedStudents();
      if (Array.isArray(res) && res.length > 0) {
        setStudents(res);
      } else {
        // Fallback demo students if database is just seeded
        setStudents([
          { id: '11111111-1111-1111-1111-111111111111', name: 'Madina Karimova', email: 'madina@gmail.com', targetLevel: 'B2', dailyGoalMinutes: 30, assignedTasksCount: 4, vocabularyCount: 142, joinedDate: '2026-03-15' },
          { id: '22222222-2222-2222-2222-222222222222', name: 'Jasur Bekmurodov', email: 'jasur@gmail.com', targetLevel: 'B1', dailyGoalMinutes: 20, assignedTasksCount: 2, vocabularyCount: 95, joinedDate: '2026-04-02' },
          { id: '33333333-3333-3333-3333-333333333333', name: 'Malika Rustamova', email: 'malika@mail.uz', targetLevel: 'A2', dailyGoalMinutes: 15, assignedTasksCount: 1, vocabularyCount: 68, joinedDate: '2026-05-10' },
          { id: '44444444-4444-4444-4444-444444444444', name: 'Azizbek Aliyev', email: 'azizbek@gmail.com', targetLevel: 'C1', dailyGoalMinutes: 45, assignedTasksCount: 5, vocabularyCount: 310, joinedDate: '2026-02-20' },
        ]);
      }
    } catch {
      setStudents([
        { id: '11111111-1111-1111-1111-111111111111', name: 'Madina Karimova', email: 'madina@gmail.com', targetLevel: 'B2', dailyGoalMinutes: 30, assignedTasksCount: 4, vocabularyCount: 142, joinedDate: '2026-03-15' },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Jasur Bekmurodov', email: 'jasur@gmail.com', targetLevel: 'B1', dailyGoalMinutes: 20, assignedTasksCount: 2, vocabularyCount: 95, joinedDate: '2026-04-02' },
        { id: '33333333-3333-3333-3333-333333333333', name: 'Malika Rustamova', email: 'malika@mail.uz', targetLevel: 'A2', dailyGoalMinutes: 15, assignedTasksCount: 1, vocabularyCount: 68, joinedDate: '2026-05-10' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const res = await (api as any).getTeacherMyProfile();
      if (res) {
        setProfile({
          fullName: res.fullName || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || "O'qituvchi",
          email: res.email || currentUser?.email || '',
          bio: res.bio || "O'quvchilarga ingliz tili grammatikasi va so'z boyligini oshirish bo'yicha amaliy darslar beraman.",
          specialty: res.specialty || "IELTS, Speaking & Academic Writing",
          telegram: res.telegram || 'https://t.me/tilshunos_ustoz',
          instagram: res.instagram || 'https://instagram.com/tilshunos_teacher',
          facebook: res.facebook || ''
        });
      }
    } catch {
      setProfile({
        fullName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || "O'qituvchi",
        email: currentUser?.email || 'teacher@tilshunos.uz',
        bio: "O'quvchilarga ingliz tili grammatikasi va so'z boyligini oshirish bo'yicha amaliy darslar beraman.",
        specialty: "IELTS, Speaking & Academic Writing",
        telegram: 'https://t.me/tilshunos_ustoz',
        instagram: 'https://instagram.com/tilshunos_teacher',
        facebook: ''
      });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    try {
      await (api as any).updateTeacherProfileDetails({
        bio: profile.bio,
        specialty: profile.specialty,
        telegram: profile.telegram,
        instagram: profile.instagram,
        facebook: profile.facebook
      });
      setProfileSuccess("Profil va aloqa ma'lumotlari Supabase bazasida muvaffaqiyatli saqlandi!");
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err: any) {
      setProfileSuccess(err.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setProfileSaving(false);
    }
  };

  const loadAssignedTasks = async () => {
    try {
      const res = await (api as any).getAssignedByMe();
      if (Array.isArray(res)) setAssignedTasks(res);
    } catch {
      // ignore
    }
  };

  const loadPersonalVocab = async () => {
    try {
      const res = await api.getVocabulary();
      if (Array.isArray(res)) setPersonalVocab(res);
    } catch {
      // ignore
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setAssigningTask(true);
    setTaskSuccess('');
    try {
      await (api as any).createAssignment({
        studentId: selectedStudent.id,
        title: taskForm.title,
        instructions: taskForm.instructions,
        taskType: Number(taskForm.taskType),
        level: Number(taskForm.level),
        languageCode: 'en',
        dueDateUtc: new Date(taskForm.dueDate).toISOString(),
        maxScore: Number(taskForm.maxScore)
      });
      setTaskSuccess(`${selectedStudent.name} ga vazifa muvaffaqiyatli yuborildi!`);
      setTimeout(() => {
        setSelectedStudent(null);
        setTaskSuccess('');
        loadStudents();
        loadAssignedTasks();
      }, 1500);
    } catch (err: any) {
      setTaskSuccess(err.message || 'Topshiriq yuborishda xatolik yuz berdi');
    } finally {
      setAssigningTask(false);
    }
  };

  const handleAddPersonalWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.target || !newWord.translation) return;
    try {
      await api.addVocabulary({
        targetWord: newWord.target,
        nativeTranslation: newWord.translation,
        exampleSentence: newWord.example,
        topic: 'General'
      });
      setNewWord({ target: '', translation: '', example: '' });
      loadPersonalVocab();
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: dark ? '#151522' : '#f8fafc', color: dark ? '#f1f0fc' : '#1e293b', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Navigation */}
      <header style={{
        background: dark ? '#202032' : '#ffffff',
        borderBottom: dark ? '1px solid #343449' : '1px solid #e2e8f0',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
          }}>
            <img src="/brand_logo.png" alt="TILSHUNOS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: dark ? '#f1f0fc' : '#0f172a' }}>TILSHUNOS</h1>
              <span style={{
                background: dark ? '#312e81' : '#e0e7ff',
                color: dark ? '#c7d2fe' : '#4338ca',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                O'QITUVCHI PANELI
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: dark ? '#94a3b8' : '#64748b' }}>
              O'quvchilar monitoringi, vazifalar taqsimoti va shaxsiy kabinet
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: dark ? '#f1f0fc' : '#0f172a' }}>{profile.fullName}</div>
            <div style={{ fontSize: '11px', color: dark ? '#94a3b8' : '#64748b' }}>{profile.specialty || "Ingliz tili ustozi"}</div>
          </div>
          {setDark && (
            <button
              onClick={() => setDark(!dark)}
              style={{
                width: '36px',
                height: '36px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '8px',
                border: dark ? '1px solid #343449' : '1px solid #e2e8f0',
                background: dark ? '#2e2b4b' : '#fff',
                color: dark ? '#f1f0fc' : '#475569',
                cursor: 'pointer'
              }}
              title="Mavzuni almashtirish"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}
          <button
            onClick={onLogout}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: dark ? '1px solid #343449' : '1px solid #e2e8f0',
              background: dark ? '#202032' : '#fff',
              color: '#dc2626',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Chiqish
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px' }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '24px',
          paddingBottom: '2px'
        }}>
          <button
            onClick={() => setActiveTab('students')}
            style={{
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'students' ? '#6366f1' : '#64748b',
              borderBottom: activeTab === 'students' ? '3px solid #6366f1' : '3px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            Mening O'quvchilarim ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            style={{
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'tasks' ? '#6366f1' : '#64748b',
              borderBottom: activeTab === 'tasks' ? '3px solid #6366f1' : '3px solid transparent'
            }}
          >
            Berilgan Topshiriqlar ({assignedTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'profile' ? '#6366f1' : '#64748b',
              borderBottom: activeTab === 'profile' ? '3px solid #6366f1' : '3px solid transparent'
            }}
          >
            Shaxsiy Profil va Ijtimoiy tarmoqlar
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            style={{
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'personal' ? '#6366f1' : '#64748b',
              borderBottom: activeTab === 'personal' ? '3px solid #6366f1' : '3px solid transparent'
            }}
          >
            Shaxsiy Dashboard (Lug'at va O'rganish)
          </button>
        </div>

        {/* TAB 1: Assigned Students */}
        {activeTab === 'students' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
                  Biriktirilgan o'quvchilar
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Har bir o'quvchining darajasini kuzatib boring va ularga yangi vazifalar bering.
                </p>
              </div>
              <button
                onClick={loadStudents}
                style={{
                  padding: '8px 16px',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Yangilash
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>O'quvchilar yuklanmoqda...</div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px'
              }}>
                {students.map((student) => (
                  <div
                    key={student.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: '#eef2ff',
                            color: '#4f46e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '16px'
                          }}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{student.name}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{student.email}</div>
                          </div>
                        </div>
                        <span style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700
                        }}>
                          {student.targetLevel}
                        </span>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        background: '#f8fafc',
                        padding: '12px',
                        borderRadius: '10px',
                        marginBottom: '16px',
                        fontSize: '12px'
                      }}>
                        <div>
                          <span style={{ color: '#64748b' }}>Lug'at hajmi:</span>
                          <strong style={{ display: 'block', color: '#0f172a', fontSize: '14px' }}>{student.vocabularyCount} ta so'z</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Topshiriqlar:</span>
                          <strong style={{ display: 'block', color: '#0f172a', fontSize: '14px' }}>{student.assignedTasksCount} ta berilgan</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Kunlik maqsad:</span>
                          <strong style={{ display: 'block', color: '#0f172a' }}>{student.dailyGoalMinutes} daqiqa/kun</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>A'zo bo'lgan:</span>
                          <strong style={{ display: 'block', color: '#0f172a' }}>{student.joinedDate}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setTaskForm(prev => ({ ...prev, title: `${student.name} uchun amaliy topshiriq` }));
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#6366f1',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      Topshiriq berish
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Assigned Tasks List */}
        {activeTab === 'tasks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
                  O'quvchilarga berilgan vazifalar
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Barcha yuborilgan topshiriqlar va ularning topshirilish holati
                </p>
              </div>
              <button
                onClick={loadAssignedTasks}
                style={{
                  padding: '8px 16px',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Yangilash
              </button>
            </div>

            {assignedTasks.length === 0 ? (
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Hali topshiriqlar berilmagan
                </div>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px 0' }}>
                  "Mening O'quvchilarim" bo'limiga o'tib, istalgan o'quvchiga yangi yozma yoki og'zaki vazifa yuboring.
                </p>
                <button
                  onClick={() => setActiveTab('students')}
                  style={{
                    padding: '8px 18px',
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  O'quvchilarga o'tish
                </button>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Mavzu</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>O'quvchi</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Turi</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Muddati</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Holat</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Baho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedTasks.map((t, i) => (
                      <tr key={t.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{t.title}</td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{t.studentName || "O'quvchi"}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: '#e0e7ff',
                            color: '#4338ca',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}>
                            {t.taskType === 1 ? 'Writing' : t.taskType === 2 ? 'Reading' : t.taskType === 3 ? 'Listening' : 'Topshiriq'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>
                          {t.dueDateUtc ? new Date(t.dueDateUtc).toLocaleDateString() : '-'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: t.status === 2 ? '#dcfce7' : '#fef3c7',
                            color: t.status === 2 ? '#15803d' : '#b45309',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}>
                            {t.status === 2 ? 'Topshirildi' : 'Kutilmoqda'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                          {t.teacherGrade !== null && t.teacherGrade !== undefined ? `${t.teacherGrade} ball` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Teacher Profile & Social Media Links */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a' }}>
                O'qituvchi shaxsiy profili
              </h2>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
                Profil ma'lumotlaringiz va o'quvchilar bilan muloqot uchun ijtimoiy tarmoq havolalarini saqlang.
              </p>

              {profileSuccess && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: '#dcfce7',
                  color: '#15803d',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '18px'
                }}>
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    F.I.Sh (O'qituvchi nomi)
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    disabled
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#64748b',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Mutaxassislik yo'nalishingiz
                  </label>
                  <input
                    type="text"
                    value={profile.specialty}
                    onChange={(e) => setProfile(p => ({ ...p, specialty: e.target.value }))}
                    placeholder="Masalan: IELTS 8.0, CEFR B2-C1, Speaking club"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Qisqacha bio / tajriba haqida
                  </label>
                  <textarea
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                    placeholder="O'quvchilarga o'zingiz haqingizda qisqacha ma'lumot bering..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>
                    Ijtimoiy tarmoqlar (O'quvchilar bilan aloqa)
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        Telegram profil / kanal havolasi
                      </label>
                      <input
                        type="url"
                        value={profile.telegram}
                        onChange={(e) => setProfile(p => ({ ...p, telegram: e.target.value }))}
                        placeholder="https://t.me/username"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        Instagram profil havolasi
                      </label>
                      <input
                        type="url"
                        value={profile.instagram}
                        onChange={(e) => setProfile(p => ({ ...p, instagram: e.target.value }))}
                        placeholder="https://instagram.com/username"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                        Facebook profil havolasi
                      </label>
                      <input
                        type="url"
                        value={profile.facebook}
                        onChange={(e) => setProfile(p => ({ ...p, facebook: e.target.value }))}
                        placeholder="https://facebook.com/username"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#6366f1',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  {profileSaving ? "Saqlanmoqda..." : "Profilni saqlash"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: Personal Dashboard (Lug'at va O'rganish) */}
        {activeTab === 'personal' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
                O'qituvchining shaxsiy lug'at va o'rganish maydoni
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Siz ham oddiy foydalanuvchilar kabi o'z lug'at daftaringizni yuritishingiz va materiallar bilan ishlashingiz mumkin.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              {/* Add Word Form */}
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 14px 0', color: '#0f172a' }}>
                  Yangi so'z qo'shish
                </h3>
                <form onSubmit={handleAddPersonalWord} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Inglizcha so'z
                    </label>
                    <input
                      type="text"
                      value={newWord.target}
                      onChange={(e) => setNewWord(w => ({ ...w, target: e.target.value }))}
                      placeholder="e.g. Resilience"
                      required
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      O'zbekcha tarjimasi
                    </label>
                    <input
                      type="text"
                      value={newWord.translation}
                      onChange={(e) => setNewWord(w => ({ ...w, translation: e.target.value }))}
                      placeholder="e.g. Bardoshlilik"
                      required
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Misol jumla
                    </label>
                    <input
                      type="text"
                      value={newWord.example}
                      onChange={(e) => setNewWord(w => ({ ...w, example: e.target.value }))}
                      placeholder="e.g. She showed great resilience."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      padding: '10px',
                      background: '#6366f1',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '6px'
                    }}
                  >
                    Lug'atga qo'shish
                  </button>
                </form>
              </div>

              {/* Personal Words List */}
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    Shaxsiy lug'at daftari ({personalVocab.length} ta so'z)
                  </h3>
                  <button
                    onClick={loadPersonalVocab}
                    style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Yangilash
                  </button>
                </div>

                {personalVocab.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    Lug'atingizda hozircha so'zlar yo'q. Chap tarafdan yangi so'z kiriting!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
                    {personalVocab.map((w: any, idx: number) => (
                      <div
                        key={w.id || idx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #f1f5f9',
                          background: '#f8fafc',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{w.targetWord}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{w.nativeTranslation}</div>
                        </div>
                        {w.exampleSentence && (
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', maxWidth: '40%' }}>
                            "{w.exampleSentence}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ASSIGN TASK MODAL */}
      {selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '560px',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedStudent(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0', color: '#0f172a' }}>
              {selectedStudent.name} uchun yangi vazifa
            </h3>
            <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: '#64748b' }}>
              Ushbu topshiriq o'quvchining shaxsiy kabinetida ko'rinadi va bajarilgach tekshirish uchun sizga keladi.
            </p>

            {taskSuccess && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#dcfce7',
                color: '#15803d',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '14px'
              }}>
                {taskSuccess}
              </div>
            )}

            <form onSubmit={handleAssignTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Topshiriq sarlavhasi
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(t => ({ ...t, title: e.target.value }))}
                  required
                  placeholder="Masalan: Essay writing - Technology in modern life"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Topshiriq yo'nalishi
                  </label>
                  <select
                    value={taskForm.taskType}
                    onChange={(e) => setTaskForm(t => ({ ...t, taskType: Number(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value={1}>Writing (Insho / Matn yozish)</option>
                    <option value={2}>Reading (Matn tahlili)</option>
                    <option value={3}>Listening (Tinglash va savollar)</option>
                    <option value={4}>Speaking (Og'zaki nutq)</option>
                    <option value={5}>Grammar (Grammatika mashqi)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Topsirish muddati (Deadline)
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm(t => ({ ...t, dueDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Topshiriq sharti va ko'rsatmalar
                </label>
                <textarea
                  rows={4}
                  value={taskForm.instructions}
                  onChange={(e) => setTaskForm(t => ({ ...t, instructions: e.target.value }))}
                  required
                  placeholder="O'quvchi nima qilishi kerakligi haqida batafsil ma'lumot kiriting (kamida 150 ta so'z, yangi lug'at so'zlaridan foydalanish va h.k.)..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={assigningTask}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#6366f1',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {assigningTask ? "Yuborilmoqda..." : "Topshiriqni yuborish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
