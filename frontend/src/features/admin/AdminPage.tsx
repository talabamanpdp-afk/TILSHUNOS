import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldAlert, Users, BookOpen, FileCheck, Activity, Search, 
  Trash2, Plus, CheckCircle, XCircle, Clock, ShieldCheck, Database
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { AdminDashboardStats, LearningMaterial, CefrLevel, MaterialContentType } from '../../types';

interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailConfirmed: boolean;
  isActive: boolean;
  createdAtUtc: string;
  lastLoginAtUtc?: string;
}

interface AuditLogItem {
  id: string;
  userId?: string;
  action: string;
  entityName: string;
  entityId: string;
  details: string;
  timestampUtc: string;
}

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'stats' | 'users' | 'cms' | 'audit'>('stats');
  const [userSearch, setUserSearch] = useState('');

  // CMS Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<MaterialContentType>('Story');
  const [level, setLevel] = useState<CefrLevel>('B1');
  const [languageCode, setLanguageCode] = useState('en');
  const [contentBody, setContentBody] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(5);

  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';

  // Stats query
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      return await api.get<AdminDashboardStats>('/admin/stats');
    },
    enabled: isAdmin
  });

  // Users query
  const { data: users = [] } = useQuery<UserListItem[]>({
    queryKey: ['admin-users', userSearch],
    queryFn: async () => {
      const endpoint = userSearch ? `/admin/users?search=${encodeURIComponent(userSearch)}` : '/admin/users';
      return await api.get<UserListItem[]>(endpoint);
    },
    enabled: isAdmin && tab === 'users'
  });

  // Materials query for CMS list
  const { data: materials = [] } = useQuery<LearningMaterial[]>({
    queryKey: ['materials'],
    queryFn: async () => {
      return await api.get<LearningMaterial[]>('/materials');
    },
    enabled: isAdmin && tab === 'cms'
  });

  // Audit logs query
  const { data: auditLogs = [] } = useQuery<AuditLogItem[]>({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      return await api.get<AuditLogItem[]>('/admin/audit-logs');
    },
    enabled: isAdmin && tab === 'audit'
  });

  // Update User Role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ id, role, isActive }: { id: string; role: string; isActive: boolean }) => {
      await api.put(`/admin/users/${id}/role`, { role, isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      alert('User updated successfully');
    }
  });

  // Create Material mutation
  const createMaterialMutation = useMutation({
    mutationFn: async () => {
      await api.post('/admin/materials', {
        title,
        description,
        contentType,
        level,
        languageCode,
        contentBody,
        audioUrl: audioUrl || null,
        videoUrl: videoUrl || null,
        estimatedMinutes: Number(estimatedMinutes)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setTitle('');
      setDescription('');
      setContentBody('');
      setAudioUrl('');
      setVideoUrl('');
      alert('Content material published to Tilshunos repository!');
    }
  });

  // Delete Material mutation
  const deleteMaterialMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/materials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    }
  });

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 glass-panel text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">
          You must have Administrator privileges to view the management console.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            Administration & Operations Console
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global metrics, user governance, content publication CMS, and compliance audit trail.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            Role: {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40 gap-4 overflow-x-auto">
        <button
          onClick={() => setTab('stats')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
            tab === 'stats' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          System Overview
        </button>
        <button
          onClick={() => setTab('users')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
            tab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          User Governance
        </button>
        <button
          onClick={() => setTab('cms')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
            tab === 'cms' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Content CMS
        </button>
        <button
          onClick={() => setTab('audit')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
            tab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* TAB 1: System Overview */}
      {tab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Total Users</span>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-extrabold text-foreground">{stats?.totalUsers ?? 0}</p>
              <p className="text-xs text-muted-foreground">{stats?.verifiedUsers ?? 0} email-confirmed accounts</p>
            </div>

            <div className="glass-panel p-5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Certified Teachers</span>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-extrabold text-foreground">{stats?.activeTeachers ?? 0}</p>
              <p className="text-xs text-muted-foreground">Active mentor profiles</p>
            </div>

            <div className="glass-panel p-5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Vocabulary Records</span>
                <Database className="w-5 h-5 text-sky-500" />
              </div>
              <p className="text-3xl font-extrabold text-foreground">{stats?.totalVocabularyEntries ?? 0}</p>
              <p className="text-xs text-muted-foreground">Personal user dictionary items</p>
            </div>

            <div className="glass-panel p-5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Practice Sessions</span>
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-extrabold text-foreground">{stats?.totalPracticeSessions ?? 0}</p>
              <p className="text-xs text-muted-foreground">Anti-fraud verified drills</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-6 space-y-3">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Curriculum Repository
              </h3>
              <p className="text-2xl font-bold text-foreground">{stats?.totalMaterials ?? 0} Materials</p>
              <p className="text-xs text-muted-foreground">
                Comprising CEFR-adapted leveled stories, grammar breakdowns, audio podcasts, and video drills.
              </p>
            </div>

            <div className="glass-panel p-6 space-y-3">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                Collaborative Tasks
              </h3>
              <p className="text-2xl font-bold text-foreground">{stats?.totalAssignments ?? 0} Assignments</p>
              <p className="text-xs text-muted-foreground">
                Teacher-assigned writing and vocabulary homework currently in flight or graded.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: User Governance */}
      {tab === 'users' && (
        <div className="space-y-6">
          <div className="glass-panel p-4 flex items-center gap-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users by name or email address..."
              className="bg-transparent border-none outline-none w-full text-foreground text-sm"
            />
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface/50 border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Email Status</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface/30 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRoleMutation.mutate({ id: u.id, role: e.target.value, isActive: u.isActive })}
                          className="text-xs rounded-lg bg-surface border border-border/60 py-1 px-2 text-foreground"
                        >
                          <option value="Learner">Learner</option>
                          <option value="Teacher">Teacher</option>
                          <option value="Admin">Admin</option>
                          <option value="SuperAdmin">SuperAdmin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        {u.emailConfirmed ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                            <CheckCircle className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-500">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {u.isActive ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(u.createdAtUtc).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => updateUserRoleMutation.mutate({ id: u.id, role: u.role, isActive: !u.isActive })}
                          className="btn-outline py-1 px-3 text-xs"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Content CMS */}
      {tab === 'cms' && (
        <div className="space-y-8">
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Publish New Learning Material
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-foreground">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field w-full text-sm"
                  placeholder="e.g. Navigating Airport Security in London"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as MaterialContentType)}
                  className="input-field w-full text-sm"
                >
                  <option value="Story">Story</option>
                  <option value="AudioPodcast">Audio Podcast</option>
                  <option value="VideoLesson">Video Lesson</option>
                  <option value="GrammarGuide">Grammar Guide</option>
                  <option value="SpeakingTopic">Speaking Topic</option>
                  <option value="BookChapter">Book Chapter</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Target CEFR Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as CefrLevel)}
                  className="input-field w-full text-sm"
                >
                  <option value="A1">A1 Beginner</option>
                  <option value="A2">A2 Elementary</option>
                  <option value="B1">B1 Intermediate</option>
                  <option value="B2">B2 Upper Intermediate</option>
                  <option value="C1">C1 Advanced</option>
                  <option value="C2">C2 Mastery</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Language Code</label>
                <input
                  type="text"
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value)}
                  className="input-field w-full text-sm"
                  placeholder="en, uz, ru..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Estimated Minutes</label>
                <input
                  type="number"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="input-field w-full text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field w-full text-sm"
                placeholder="Brief summary of the lesson or story..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Audio Stream URL (Optional)</label>
                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  className="input-field w-full text-sm"
                  placeholder="https://example.com/audio.mp3"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-foreground">Video Stream URL (Optional)</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="input-field w-full text-sm"
                  placeholder="https://youtube.com/embed/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-foreground">Content Text / Transcript / Dialogue</label>
              <textarea
                rows={6}
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                className="input-field w-full text-sm font-mono"
                placeholder="Write the full lesson text or transcript here..."
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => createMaterialMutation.mutate()}
                disabled={!title.trim() || !contentBody.trim() || createMaterialMutation.isPending}
                className="btn-primary py-2.5 px-6"
              >
                {createMaterialMutation.isPending ? 'Publishing...' : 'Publish to Learning Library'}
              </button>
            </div>
          </div>

          {/* List of Existing Materials */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground text-lg">Existing Library Materials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {materials.map((m) => (
                <div key={m.id} className="glass-panel p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                        {m.contentType}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface border border-border/40">
                        {m.level}
                      </span>
                    </div>
                    <h4 className="font-semibold text-foreground text-sm mt-1">{m.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{m.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete material "${m.title}"?`)) {
                        deleteMaterialMutation.mutate(m.id);
                      }
                    }}
                    className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Audit Logs */}
      {tab === 'audit' && (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/50 border-b border-border/40 text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface/30 text-xs">
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestampUtc).toLocaleString()}
                    </td>
                    <td className="p-4 font-semibold text-primary">{log.action}</td>
                    <td className="p-4 text-foreground">{log.entityName}</td>
                    <td className="p-4 text-muted-foreground font-mono">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
