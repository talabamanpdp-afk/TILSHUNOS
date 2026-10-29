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
    if (u?.role) {
      const r = typeof u.role === 'string' ? u.role.toLowerCase() : u.role === 1 ? 'admin' : u.role === 2 ? 'teacher' : 'user';
      localStorage.setItem('tilshunos_role', r === 'superadmin' ? 'admin' : r === 'learner' ? 'user' : r);
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
    return request<{ hero: string; description: string; cta: string; about: string; header: string; footer: string; contact: string }>('/cms');
  },

  async saveCms(data: any) {
    return request<any>('/cms', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async uploadCmsImage(data: { dataBase64?: string; file?: File | Blob; fileName?: string; contentType?: string }) {
    // 1. Direct Supabase Storage Bucket Upload (Zero lag, full resolution, 100% reliable)
    const supabaseUrl = 'https://yipexommqztxnvpckqyi.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcGV4b21tcXp0eG52cGNrcXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwODU0MDYsImV4cCI6MjEwODY2MTQwNn0.P17uUwPdlEJnOxorTav-wIExlfzUJGPEIqryrvGvfPI';
    const bucketName = 'tilshunos-media';

    try {
      let bodyData: any = data.file;
      let contentType = data.contentType || (data.file as any)?.type || 'image/jpeg';
      let originalName = data.fileName || (data.file as any)?.name || 'image.jpg';
      const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${cleanName}`;

      if (!bodyData && data.dataBase64) {
        const base64Clean = data.dataBase64.includes(',') ? data.dataBase64.split(',')[1] : data.dataBase64;
        const binary = atob(base64Clean);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        bodyData = new Blob([array], { type: contentType });
      }

      if (bodyData) {
        const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}/${uniqueName}`, {
          method: 'POST',
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': contentType
          },
          body: bodyData
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
        }
      }
    } catch (err) {
      console.warn('Direct bucket upload failed, trying backend...', err);
    }

    // 2. Fallback to backend /cms/upload-image
    return request<{ success: boolean; id: string; url: string; relativeUrl: string; message: string }>('/cms/upload-image', {
      method: 'POST',
      body: JSON.stringify(data)
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

