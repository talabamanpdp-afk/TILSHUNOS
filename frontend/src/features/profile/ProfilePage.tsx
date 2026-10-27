import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, Shield, Laptop, Smartphone, Tablet, Edit3, Trash2, CheckCircle2, 
  ExternalLink, Sparkles, RefreshCw, Eye, Flame, BookOpen, Volume2, Award, Clock
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { getDetectedDeviceInfo } from '../../lib/pwa';
import type { UserProfile, RegisteredDevice, PublicProfile } from '../../types';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'devices' | 'privacy'>('profile');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(20);
  const [isPublic, setIsPublic] = useState(true);
  const [showStreak, setShowStreak] = useState(true);
  const [showLearnedWords, setShowLearnedWords] = useState(true);

  // Rename modal
  const [editingDevice, setEditingDevice] = useState<RegisteredDevice | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');

  // Public Preview Modal
  const [showPublicModal, setShowPublicModal] = useState(false);

  // Load Profile
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get<UserProfile>('/profile');
      setFirstName(res.firstName);
      setLastName(res.lastName);
      setBio(res.bio || '');
      setAvatarUrl(res.avatarUrl || '');
      setDailyGoalMinutes(res.dailyGoalMinutes);
      setIsPublic(res.isPublic);
      setShowStreak(res.showStreak);
      setShowLearnedWords(res.showLearnedWords);
      return res;
    }
  });

  // Load Devices
  const { data: devices = [] } = useQuery<RegisteredDevice[]>({
    queryKey: ['devices'],
    queryFn: async () => {
      return await api.get<RegisteredDevice[]>('/devices');
    }
  });

  // Load Public Profile for Preview
  const { data: publicProfile } = useQuery<PublicProfile | null>({
    queryKey: ['public-profile', profile?.userId],
    queryFn: async () => {
      if (!profile?.userId) return null;
      return await api.get<PublicProfile>(`/profile/public/${profile.userId}`);
    },
    enabled: !!profile?.userId && showPublicModal
  });

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      await api.put('/profile', {
        firstName,
        lastName,
        bio,
        avatarUrl,
        dailyGoalMinutes: Number(dailyGoalMinutes),
        isPublic,
        showStreak,
        showLearnedWords
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      alert('Profile updated successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  });

  // Rename Device Mutation
  const renameDeviceMutation = useMutation({
    mutationFn: async () => {
      if (!editingDevice) return;
      await api.put(`/devices/${editingDevice.id}/rename`, {
        newDeviceName
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setEditingDevice(null);
      setNewDeviceName('');
    }
  });

  // Remove Device Mutation
  const removeDeviceMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/devices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    }
  });

  // Register Current Device
  const registerCurrentMutation = useMutation({
    mutationFn: async () => {
      const info = getDetectedDeviceInfo();
      await api.post('/devices/register', {
        deviceName: `${info.platform} ${info.deviceType} (${info.browser})`,
        deviceType: info.deviceType,
        platform: info.platform,
        browser: info.browser,
        isPwaInstalled: info.isPwaInstalled,
        installMethod: info.isPwaInstalled ? 'standalone' : 'browser'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      alert('Current device synchronized successfully!');
    }
  });

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-5 h-5 text-sky-500" />;
      case 'tablet': return <Tablet className="w-5 h-5 text-indigo-500" />;
      default: return <Laptop className="w-5 h-5 text-teal-500" />;
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header Profile Card */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-primary to-accent p-1 shadow-lg">
            <div className="w-full h-full rounded-full bg-surface-elevated flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-primary" />
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {profile?.firstName} {profile?.lastName}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 self-center sm:self-auto">
              <Shield className="w-3.5 h-3.5" />
              {profile?.role}
            </span>
          </div>
          <p className="text-muted-foreground text-sm max-w-xl">
            {profile?.bio || 'Language enthusiast exploring new cultures & mastering vocabulary on Tilshunos.'}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium">
              <Flame className="w-4 h-4 text-orange-500" />
              {profile?.currentStreakDays || 0} Day Streak
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Award className="w-4 h-4 text-primary" />
              Learning: {profile?.primaryLanguageCode?.toUpperCase() || 'EN'} ({profile?.primaryLevel || 'A1'})
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-4 h-4 text-sky-500" />
              Goal: {profile?.dailyGoalMinutes || 20}m / day
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowPublicModal(true)}
            className="btn-outline flex items-center justify-center gap-2 text-sm py-2 px-4"
          >
            <Eye className="w-4 h-4" />
            Public Preview
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40 gap-4">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'devices'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span>Installed Devices</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
            {devices.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'privacy'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Privacy & Visibility
        </button>
      </div>

      {/* TAB 1: General Profile */}
      {activeTab === 'profile' && (
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field w-full"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field w-full"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">Avatar URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="input-field w-full"
              placeholder="https://example.com/photo.jpg"
            />
            <p className="text-xs text-muted-foreground mt-1">Direct HTTPS image link to your profile photo.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field w-full resize-none"
              placeholder="Tell other language learners and teachers about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">
              Daily Learning Goal (Minutes)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-surface rounded-lg cursor-pointer"
              />
              <span className="font-bold text-lg text-primary min-w-[3.5rem] text-right">
                {dailyGoalMinutes}m
              </span>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => updateProfileMutation.mutate()}
              disabled={updateProfileMutation.isPending}
              className="btn-primary py-2.5 px-6"
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Installed Devices (Apple x Samsung Device Management) */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Server-Persisted Device Hub</h2>
              <p className="text-sm text-muted-foreground">
                Manage your active desktop, tablet, and mobile installations. Devices with installed PWA icon access enjoy instant offline cache and streamlined auth.
              </p>
            </div>
            <button
              onClick={() => registerCurrentMutation.mutate()}
              disabled={registerCurrentMutation.isPending}
              className="btn-outline flex items-center gap-2 text-sm shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${registerCurrentMutation.isPending ? 'animate-spin' : ''}`} />
              Sync Current Device
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => (
              <div key={device.id} className="glass-panel p-5 relative flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-border/50 flex items-center justify-center">
                      {getDeviceIcon(device.deviceType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                        {device.deviceName}
                        {device.isPwaInstalled && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            PWA Installed
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {device.platform} • {device.browser}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingDevice(device);
                        setNewDeviceName(device.deviceName);
                      }}
                      className="p-1.5 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground transition-colors"
                      title="Rename device"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove device "${device.deviceName}"?`)) {
                          removeDeviceMutation.mutate(device.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                      title="Unregister device"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Registered: {new Date(device.createdAtUtc).toLocaleDateString()}</span>
                  <span>Active: {new Date(device.lastActiveAtUtc).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Rename Device Modal */}
          {editingDevice && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up">
                <h3 className="font-bold text-lg text-foreground">Rename Device</h3>
                <p className="text-xs text-muted-foreground">
                  Give this device an easily recognizable custom name (e.g. "Soxibjon's MacBook Pro").
                </p>
                <input
                  type="text"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="input-field w-full"
                  placeholder="Device Name"
                  autoFocus
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setEditingDevice(null)}
                    className="btn-outline py-2 px-4 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => renameDeviceMutation.mutate()}
                    disabled={!newDeviceName.trim() || renameDeviceMutation.isPending}
                    className="btn-primary py-2 px-4 text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Privacy & Visibility */}
      {activeTab === 'privacy' && (
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface/50 border border-border/30">
              <div>
                <h4 className="font-semibold text-foreground text-sm">Public Profile</h4>
                <p className="text-xs text-muted-foreground">Allow other learners and mentors to view your achievements and streak.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-surface/50 border border-border/30">
              <div>
                <h4 className="font-semibold text-foreground text-sm">Show Learning Streak</h4>
                <p className="text-xs text-muted-foreground">Display your daily consecutive practice streak on leaderboards.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStreak}
                  onChange={(e) => setShowStreak(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-surface/50 border border-border/30">
              <div>
                <h4 className="font-semibold text-foreground text-sm">Show Verified Learned Words</h4>
                <p className="text-xs text-muted-foreground">Showcase your authentic, anti-fraud mastered vocabulary count.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLearnedWords}
                  onChange={(e) => setShowLearnedWords(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => updateProfileMutation.mutate()}
              disabled={updateProfileMutation.isPending}
              className="btn-primary py-2.5 px-6"
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Privacy Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* Public Profile Modal Preview */}
      {showPublicModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border-primary/30 animate-scale-up">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-tr from-primary to-accent p-1">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
                  {publicProfile?.avatarUrl ? (
                    <img src={publicProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-primary" />
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{publicProfile?.displayName || `${profile?.firstName} ${profile?.lastName}`}</h3>
                <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                  Target: {publicProfile?.targetLanguage?.toUpperCase() || 'EN'} ({publicProfile?.level || 'A1'})
                </p>
                <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
                  {publicProfile?.bio || 'Language learner on Tilshunos'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-surface/60 border border-border/40 text-center">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <span className="text-base font-bold text-foreground">{publicProfile?.streakDays ?? profile?.currentStreakDays ?? 0}</span>
                <span className="block text-[11px] text-muted-foreground">Day Streak</span>
              </div>
              <div className="p-3 rounded-xl bg-surface/60 border border-border/40 text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <span className="text-base font-bold text-foreground">{publicProfile?.verifiedLearnedWordsCount ?? 0}</span>
                <span className="block text-[11px] text-muted-foreground">Learned Words</span>
              </div>
              <div className="p-3 rounded-xl bg-surface/60 border border-border/40 text-center">
                <BookOpen className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                <span className="text-base font-bold text-foreground">{publicProfile?.readingStoriesCompleted ?? 0}</span>
                <span className="block text-[11px] text-muted-foreground">Stories Read</span>
              </div>
              <div className="p-3 rounded-xl bg-surface/60 border border-border/40 text-center">
                <Volume2 className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                <span className="text-base font-bold text-foreground">{publicProfile?.listeningCompletedCount ?? 0}</span>
                <span className="block text-[11px] text-muted-foreground">Audio & Video</span>
              </div>
              <div className="p-3 rounded-xl bg-surface/60 border border-border/40 text-center">
                <Edit3 className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-base font-bold text-foreground">{publicProfile?.writingSubmissionsCount ?? 0}</span>
                <span className="block text-[11px] text-muted-foreground">Essays Graded</span>
              </div>
              <div className="p-3 rounded-xl bg-surface/60 border border-border/40 text-center">
                <Award className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <span className="text-base font-bold text-foreground">{publicProfile?.averageWritingGrade ? `${publicProfile.averageWritingGrade.toFixed(1)}/10` : 'N/A'}</span>
                <span className="block text-[11px] text-muted-foreground">Avg Grade</span>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowPublicModal(false)}
                className="btn-primary py-2 px-6 text-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
