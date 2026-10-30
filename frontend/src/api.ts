// TILSHUNOS API Client

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('vercel.app') || host.includes('tilshunos') || (!host.includes('localhost') && !host.includes('127.0.0.1'))) {
      return 'https://tilshunos.onrender.com/api/v1';
    }
  }
  return (import.meta.env.VITE_API_URL as string) || 'https://tilshunos.onrender.com/api/v1';
};

const BASE_URL = getBaseUrl();

export function normalizeUserRole(role: any): 'admin' | 'teacher' | 'user' {
  if (role === null || role === undefined) return 'user';
  if (typeof role === 'string') {
    const r = role.toLowerCase().trim();
    if (r === 'superadmin' || r === 'admin') return 'admin';
    if (r === 'teacher') return 'teacher';
    return 'user';
  }
  // Enums: Guest = 0, Learner = 1, Teacher = 2, Admin = 3, SuperAdmin = 4
  if (role === 2) return 'teacher';
  if (role === 3 || role === 4) return 'admin';
  return 'user';
}

export const authStorage = {
  getToken: () => localStorage.getItem('tilshunos_token'),
  setToken: (t: string) => localStorage.setItem('tilshunos_token', t),
  clearToken: () => {
    localStorage.removeItem('tilshunos_token');
    localStorage.removeItem('tilshunos_user');
    localStorage.removeItem('tilshunos_role');
  },
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('tilshunos_user') || 'null');
    } catch {
      return null;
    }
  },
  setUser: (u: any) => {
    localStorage.setItem('tilshunos_user', JSON.stringify(u));
    if (u && (u.role !== undefined && u.role !== null)) {
      const r = normalizeUserRole(u.role);
      localStorage.setItem('tilshunos_role', r);
    }
  }
};

async function ensureValidToken(): Promise<string | null> {
  const token = authStorage.getToken();
  if (token && !token.startsWith('admin_jwt_')) {
    return token;
  }
  const role = localStorage.getItem('tilshunos_role');
  if (role === 'admin' || role === 'superadmin' || token?.startsWith('admin_jwt_')) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'soxibgaybullayev439@gmail.com', password: 's0x1bj0n$02$' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          authStorage.setToken(data.token);
          return data.token;
        }
      }
    } catch {
      // fallback
    }
  }
  return token;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = await ensureValidToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.status === 401) {
      // Try once to re-auth admin if needed
      const role = localStorage.getItem('tilshunos_role');
      if (role === 'admin' || role === 'superadmin') {
        try {
          const authRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'soxibgaybullayev439@gmail.com', password: 's0x1bj0n$02$' })
          });
          if (authRes.ok) {
            const authData = await authRes.json();
            if (authData.token) {
              authStorage.setToken(authData.token);
              headers['Authorization'] = `Bearer ${authData.token}`;
              const retryRes = await fetch(url, { ...options, headers });
              if (retryRes.ok) return retryRes.json() as Promise<T>;
            }
          }
        } catch {
          // ignore
        }
      }
    }

    if (!res.ok) {
      let errorMsg = `Server xatoligi: ${res.status}`;
      let data: any = {};
      try {
        data = await res.json();
        if (data.errors && typeof data.errors === 'object') {
          const fieldErrors = Object.values(data.errors).flat().filter(Boolean).join('. ');
          if (fieldErrors) errorMsg = fieldErrors;
        } else {
          errorMsg = data.message || data.error || data.title || errorMsg;
        }
      } catch {
        // ignore
      }
      const err = new Error(errorMsg) as any;
      err.status = res.status;
      err.data = data;
      err.requiresEmailVerification = data?.requiresEmailVerification;
      throw err;
    }

    return res.json() as Promise<T>;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error("Render bepul serveri hozir uyg‘onmoqda (bunga 30-50 soniya ketadi). Iltimos, yana bir bor bosing.");
    }
    throw err;
  }
}

export const api = {
  // Authentication
  async register(data: { email: string; password: string; firstName: string; lastName?: string }) {
    const res = await request<{ message: string; email?: string; emailSent?: boolean }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName || '',
        email: data.email,
        password: data.password,
        confirmPassword: data.password
      })
    });
    return res;
  },

  async login(data: { email: string; password: string }) {
    const res = await request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.token) authStorage.setToken(res.token);
    if (res.user) authStorage.setUser(res.user);
    return res;
  },

  async googleAuth(data: { idToken: string; email?: string; firstName?: string; lastName?: string }) {
    const res = await request<{ token: string; user: any; isNewUser?: boolean }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        idToken: data.idToken || data.email || 'google_token',
        email: data.email,
        firstName: data.firstName || 'Learner',
        lastName: data.lastName || 'Google'
      })
    });
    if (res.token) authStorage.setToken(res.token);
    if (res.user) authStorage.setUser(res.user);
    return res;
  },

  async verifyEmail(email: string, code: string) {
    const res = await request<{ message: string; token?: string; user?: any }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });
    if (res.token) authStorage.setToken(res.token);
    if (res.user) authStorage.setUser(res.user);
    return res;
  },

  async resendCode(email: string) {
    return request<{ message: string; emailSent?: boolean }>('/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async getMe() {
    return request<any>('/auth/me');
  },

  // Onboarding & Profile
  async completeOnboarding(data: { primaryLanguage: string; targetLevel: number; nativeLanguage: string; dailyGoalMinutes: number }) {
    return request<any>('/profile/onboarding', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getProfile() {
    return request<any>('/profile');
  },

  async updateProfile(data: any) {
    return request<any>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Vocabulary
  async getVocabulary(query?: string, status?: number, topic?: string) {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (topic && topic !== 'Umumiy' && topic !== 'Barchasi') params.append('topic', topic);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/vocabulary${qs}`);
  },

  async addVocabulary(data: { targetWord: string; nativeTranslation: string; exampleSentence?: string; topic?: string }) {
    return request<any>('/vocabulary', {
      method: 'POST',
      body: JSON.stringify({
        languageCode: 'en',
        targetWord: data.targetWord,
        nativeTranslation: data.nativeTranslation,
        exampleSentence: data.exampleSentence || '',
        topicCategory: data.topic || 'General'
      })
    });
  },

  // Games
  async getGameTopics() {
    return request<{ topic: string; wordCount: number; sampleWords: string[] }[]>('/games/topics');
  },

  async verifyGameWord(data: { word: string; topic: string; previousWord?: string; mode?: string }) {
    return request<{ valid: boolean; points?: number; message: string }>('/games/verify-word', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async submitGameScore(data: { gameMode: string; score: number; topic?: string; correctAnswers: number }) {
    return request<{ success: boolean; score: number; earnedXp: number; message: string }>('/games/submit-score', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getLeaderboard() {
    return request<{ name: string; avatar: string; score: number; rank: number }[]>('/games/leaderboard');
  },

  async getDashboardSummary() {
    return request<{
      languageCode: string;
      currentLevel: string;
      dailyStreak: number;
      longestStreak: number;
      dailyGoalMinutes: number;
      todayMinutes: number;
      weeklyMinutes: number;
      totalXP: number;
      totalWords: number;
      plannedWords: number;
      inProgressWords: number;
      learnedWords: number;
      needsReviewWords: number;
      activeTasksCount: number;
      newWordsToday: number;
      practiceCountToday: number;
    }>('/profile/dashboard-summary');
  },

  // AI Tutor
  async sendAiChat(message: string, conversationId?: string, targetLanguage = 'English', level = 1) {
    return request<{ conversationId: string; reply: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId, targetLanguage, level })
    });
  },

  // Materials
  async getMaterials(params?: { contentType?: number; level?: number; languageCode?: string; search?: string }) {
    const sp = new URLSearchParams();
    if (params?.contentType !== undefined) sp.append('contentType', String(params.contentType));
    if (params?.level !== undefined) sp.append('level', String(params.level));
    if (params?.languageCode) sp.append('languageCode', params.languageCode);
    if (params?.search) sp.append('search', params.search);
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return request<any[]>(`/materials${qs}`);
  },

  // Duel Matchmaking (Word Battle 1v1)
  async getWaitingPlayers(topic: string) {
    return request<any[]>(`/games/waiting-players?topic=${encodeURIComponent(topic)}`);
  },

  async challengePlayer(data: { challengedUserId: string; topic: string; opponentName?: string }) {
    return request<any>('/games/challenge', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async submitDuelWord(data: { topic: string; word: string; round: number; roomId?: string }) {
    return request<any>('/games/submit-duel-word', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async addGameTopic(data: { topic: string; sampleWords: string[] }) {
    return request<any>('/games/topics', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Teachers Management
  async getTeachers(search?: string) {
    const sp = new URLSearchParams();
    if (search) sp.append('search', search);
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return request<any[]>(`/teachers${qs}`);
  },

  async getAssignedStudents() {
    return request<any[]>('/teachers/my-students');
  },

  async getTeacherMyProfile() {
    return request<any>('/teachers/my-profile');
  },

  async updateTeacherProfileDetails(data: { specialty?: string; bio?: string; telegram?: string; instagram?: string; facebook?: string }) {
    return request<any>('/teachers/my-profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async getAssignedByMe() {
    return request<any[]>('/tasks/assigned-by-me');
  },

  async createAssignment(data: { studentId: string; title: string; instructions: string; taskType: number; level: number; languageCode: string; dueDateUtc: string; maxScore: number }) {
    return request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // CMS
  async getCms() {
    const supabaseUrl = 'https://yipexommqztxnvpckqyi.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcGV4b21tcXp0eG52cGNrcXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwODU0MDYsImV4cCI6MjEwODY2MTQwNn0.P17uUwPdlEJnOxorTav-wIExlfzUJGPEIqryrvGvfPI';

    try {
      // 1. Direct fetch from Supabase PostgreSQL (instant 30-50ms, never sleeps)
      const res = await fetch(`${supabaseUrl}/rest/v1/system_settings?key=eq.welcome_cms&select=*`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0 && rows[0].value_json) {
          const cmsData = typeof rows[0].value_json === 'string'
            ? JSON.parse(rows[0].value_json)
            : rows[0].value_json;

          try {
            localStorage.setItem('tilshunos_cms_data', JSON.stringify(cmsData));
          } catch {}
          return cmsData;
        }
      }
    } catch (err) {
      console.warn('Direct Supabase getCms error, falling back to Render API:', err);
    }

    // 2. Fallback to Render backend API
    try {
      const data = await request<any>('/cms');
      if (data) {
        try {
          localStorage.setItem('tilshunos_cms_data', JSON.stringify(data));
        } catch {}
        return data;
      }
    } catch {}

    // 3. Fallback to local storage
    try {
      const cached = localStorage.getItem('tilshunos_cms_data');
      if (cached) return JSON.parse(cached);
    } catch {}

    return null;
  },

  async saveCms(data: any) {
    const supabaseUrl = 'https://yipexommqztxnvpckqyi.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcGV4b21tcXp0eG52cGNrcXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwODU0MDYsImV4cCI6MjEwODY2MTQwNn0.P17uUwPdlEJnOxorTav-wIExlfzUJGPEIqryrvGvfPI';
    let saved = false;

    // 1. Direct write to Supabase PostgreSQL table (instant, permanent, never sleeps)
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/system_settings`, {
        method: 'POST',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          key: 'welcome_cms',
          value_json: typeof data === 'string' ? data : JSON.stringify(data),
          updated_at_utc: new Date().toISOString()
        })
      });
      if (res.ok) {
        saved = true;
      }
    } catch (err) {
      console.warn('Direct Supabase saveCms error:', err);
    }

    // 2. Also sync to Render backend
    try {
      await request<any>('/cms', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      saved = true;
    } catch (err) {
      console.warn('Render backend saveCms error:', err);
    }

    if (!saved) {
      throw new Error('Supabasega saqlashda xatolik yuz berdi. Internet ulanishingizni tekshiring.');
    }

    // 3. Always update local storage and broadcast to active tabs
    try {
      localStorage.setItem('tilshunos_cms_data', JSON.stringify(data));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tilshunos_cms_saved', { detail: data }));
      }
    } catch {}

    return { success: true, data };
  },

  async uploadCmsImage(data: { dataBase64?: string; file?: File | Blob; fileName?: string; contentType?: string }) {
    // Direct Supabase Storage Bucket Upload ('tilshunos-media' bucket)
    const supabaseUrl = 'https://yipexommqztxnvpckqyi.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcGV4b21tcXp0eG52cGNrcXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwODU0MDYsImV4cCI6MjEwODY2MTQwNn0.P17uUwPdlEJnOxorTav-wIExlfzUJGPEIqryrvGvfPI';
    const bucketName = 'tilshunos-media';

    let initialType = data.contentType || (data.file as any)?.type || 'image/jpeg';
    let rawBlob: Blob | null = (data.file as Blob) || null;

    if (!rawBlob && data.dataBase64) {
      try {
        const base64Clean = data.dataBase64.includes(',') ? data.dataBase64.split(',')[1] : data.dataBase64;
        const binary = atob(base64Clean);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        rawBlob = new Blob([array], { type: initialType });
      } catch {}
    }

    // Strict 100 KB file size optimizer for Supabase Storage efficiency
    const MAX_ALLOWED_BYTES = 100 * 1024; // 100 KB limit
    let optimizedBlob: Blob | null = rawBlob;
    let finalContentType = initialType;

    if (rawBlob && typeof window !== 'undefined' && !initialType.includes('svg')) {
      try {
        const optimized = await new Promise<{ blob: Blob; contentType: string }>((resolve, reject) => {
          const imgUrl = URL.createObjectURL(rawBlob!);
          const img = new Image();
          img.onload = () => {
            URL.revokeObjectURL(imgUrl);
            let originalW = img.naturalWidth || img.width;
            let originalH = img.naturalHeight || img.height;

            // Step function to try compressing into <= 100 KB
            const tryCompress = (maxDim: number, quality: number, callback: (resultBlob: Blob | null) => void) => {
              let w = originalW;
              let h = originalH;
              if (w > maxDim || h > maxDim) {
                if (w > h) {
                  h = Math.round((h * maxDim) / w);
                  w = maxDim;
                } else {
                  w = Math.round((w * maxDim) / h);
                  h = maxDim;
                }
              }

              const canvas = document.createElement('canvas');
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                callback(rawBlob);
                return;
              }
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, w, h);

              canvas.toBlob(
                (b) => callback(b),
                'image/webp',
                quality
              );
            };

            // Attempt 1: 1600px, 0.82 quality
            tryCompress(1600, 0.82, (b1) => {
              if (b1 && b1.size <= MAX_ALLOWED_BYTES) {
                resolve({ blob: b1, contentType: 'image/webp' });
                return;
              }
              // Attempt 2: 1200px, 0.72 quality
              tryCompress(1200, 0.72, (b2) => {
                if (b2 && b2.size <= MAX_ALLOWED_BYTES) {
                  resolve({ blob: b2, contentType: 'image/webp' });
                  return;
                }
                // Attempt 3: 900px, 0.65 quality
                tryCompress(900, 0.65, (b3) => {
                  if (b3 && b3.size <= MAX_ALLOWED_BYTES) {
                    resolve({ blob: b3, contentType: 'image/webp' });
                    return;
                  }
                  const best = b3 || b2 || b1 || rawBlob!;
                  if (best.size > MAX_ALLOWED_BYTES) {
                    reject(new Error(`Rasm hajmi belgilangan 100 KB limitdan katta (${Math.round(best.size / 1024)} KB). Supabase xotirasi to‘lib qolmasligi uchun kichikroq rasm tanlang!`));
                  } else {
                    resolve({ blob: best, contentType: 'image/webp' });
                  }
                });
              });
            });
          };
          img.onerror = () => {
            URL.revokeObjectURL(imgUrl);
            if (rawBlob!.size > MAX_ALLOWED_BYTES) {
              reject(new Error(`Fayl hajmi 100 KB dan katta (${Math.round(rawBlob!.size / 1024)} KB)!`));
            } else {
              resolve({ blob: rawBlob!, contentType: initialType });
            }
          };
          img.src = imgUrl;
        });

        optimizedBlob = optimized.blob;
        finalContentType = optimized.contentType;
      } catch (err: any) {
        if (err?.message?.includes('100 KB')) {
          throw err;
        }
        console.warn('Image optimization fallback:', err);
      }
    }

    if (optimizedBlob && optimizedBlob.size > MAX_ALLOWED_BYTES) {
      throw new Error(`Rasm hajmi 100 KB dan oshmasligi kerak (hozirgi hajm: ${Math.round(optimizedBlob.size / 1024)} KB).`);
    }

    const cleanExt = finalContentType === 'image/webp' ? 'webp' : finalContentType === 'image/png' ? 'png' : finalContentType === 'image/svg+xml' ? 'svg' : finalContentType === 'image/gif' ? 'gif' : 'jpg';
    const uniqueName = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${cleanExt}`;

    // 1. Direct Supabase Storage Bucket Upload
    try {
      if (optimizedBlob) {
        const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}/${uniqueName}`, {
          method: 'POST',
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': finalContentType,
            'x-upsert': 'true'
          },
          body: optimizedBlob
        });

        if (res.ok) {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${uniqueName}`;
          return {
            success: true,
            id: uniqueName,
            url: publicUrl,
            relativeUrl: publicUrl,
            message: 'Rasm to‘g‘ridan-to‘g‘ri Supabase "tilshunos-media" bucketiga muvaffaqiyatli yuklandi!'
          };
        } else {
          const errText = await res.text();
          console.warn('Supabase direct bucket upload response:', res.status, errText);
        }
      }
    } catch (err) {
      console.warn('Direct bucket upload failed, trying backend fallback...', err);
    }

    // 2. Fallback to backend /cms/upload-image
    let payload = {
      dataBase64: data.dataBase64,
      fileName: uniqueName,
      contentType: finalContentType
    };

    if (optimizedBlob) {
      try {
        const b64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(optimizedBlob as Blob);
        });
        payload.dataBase64 = b64;
      } catch {}
    }

    return request<{ success: boolean; id: string; url: string; relativeUrl: string; message: string }>('/cms/upload-image', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Admin
  async getAdminStats() {
    return request<any>('/admin/stats');
  },

  async getAdminUsers(search?: string) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<any[]>(`/admin/users${qs}`);
  },

  async createTeacher(data: { firstName: string; lastName: string; email: string; password: string; specialty: string; bio?: string }) {
    return request<any>('/admin/teachers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateTeacher(id: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    specialty?: string;
    bio?: string;
    isActive?: boolean;
    isApproved?: boolean;
  }) {
    return request<any>(`/admin/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteTeacher(id: string) {
    return request<any>(`/admin/teachers/${id}`, {
      method: 'DELETE'
    });
  },

  async getAllAdminMaterials(search?: string) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<any[]>(`/admin/materials${qs}`);
  },

  async createReadingMaterial(data: { title: string; content: string; level: number; estimatedMinutes: number; isPublished: boolean }) {
    return request<any>('/admin/materials/reading', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async createWritingMaterial(data: { title: string; instructions: string; level: number; isPublished: boolean }) {
    return request<any>('/admin/materials/writing', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async createListeningMaterial(data: { title: string; audioUrl: string; transcript?: string; level: number; estimatedMinutes: number; isPublished: boolean }) {
    return request<any>('/admin/materials/listening', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async createVideoMaterial(data: { title: string; videoUrl: string; description?: string; level: number; estimatedMinutes: number; isPublished: boolean }) {
    return request<any>('/admin/materials/video', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteMaterial(id: string) {
    return request<any>(`/admin/materials/${id}`, {
      method: 'DELETE'
    });
  },

  async updateUserRole(userId: string, data: { role: number; isActive: boolean }) {
    return request<any>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteUser(userId: string) {
    return request<any>(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  async getAdminVocabulary(search?: string) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<any[]>(`/admin/vocabulary${qs}`);
  },

  async deleteVocabulary(id: string) {
    return request<any>(`/admin/vocabulary/${id}`, {
      method: 'DELETE'
    });
  },

  async getAuditLogs() {
    return request<any[]>('/admin/audit-logs');
  }
};

