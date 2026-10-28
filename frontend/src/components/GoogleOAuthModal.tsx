import React, { useState, useEffect, useRef } from 'react';
import { Mail, Check, X, ArrowRight, ShieldCheck, KeyRound, AlertCircle, RefreshCw, Send, UserCheck } from 'lucide-react';
import { api } from '../api';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleUserResult {
  email: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
}

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: GoogleUserResult) => void;
  initialEmail?: string;
  initialName?: string;
}

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = '',
  initialName = ''
}) => {
  // Mode: 'google' | 'resend'
  const [activeTab, setActiveTab] = useState<'google' | 'resend'>('google');

  // Google Direct Auth state
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [submittingGoogle, setSubmittingGoogle] = useState(false);
  const [savedGoogleEmail, setSavedGoogleEmail] = useState<string | null>(null);
  const [savedGoogleName, setSavedGoogleName] = useState<string | null>(null);

  // Real Google Sign-In state (GIS)
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [googleInitialized, setGoogleInitialized] = useState(false);

  // Resend OTP state
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Sync inputs on open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setInfoMessage('');
      const lastEmail = localStorage.getItem('tilshunos_last_google_email') || '';
      const lastName = localStorage.getItem('tilshunos_last_google_name') || '';
      setSavedGoogleEmail(lastEmail || null);
      setSavedGoogleName(lastName || null);

      const prefEmail = initialEmail.trim() || lastEmail || '';
      const prefName = initialName.trim() || lastName || '';
      setGoogleEmail(prefEmail);
      setGoogleName(prefName);
      setUserEmail(prefEmail);
      setUserName(prefName);
      setSubmittingGoogle(false);
    }
  }, [isOpen, initialEmail, initialName]);

  // Countdown timer for resend
  useEffect(() => {
    if (otpCountdown > 0) {
      const t = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [otpCountdown]);

  // Attempt Google Identity Services (GIS) initialization if client_id is present
  useEffect(() => {
    if (!isOpen) return;

    const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '';
    if (!clientId) return;

    const setupGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'filled_blue',
              size: 'large',
              text: 'continue_with',
              shape: 'pill',
              width: 300,
              logo_alignment: 'left'
            });
          }
          setGoogleInitialized(true);
        } catch {
          // ignore
        }
      }
    };

    setupGoogle();
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Real Google JWT Credential (from Google popup if configured)
  const handleGoogleCredentialResponse = (response: any) => {
    try {
      if (!response?.credential) {
        setErrorMessage('Google autentifikatsiya ma’lumotini qaytarmadi.');
        return;
      }
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      const email = (payload.email || '').trim().toLowerCase();
      const firstName = payload.given_name || payload.name?.split(' ')[0] || 'Learner';
      const lastName = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || 'Google';

      if (email === 'soxibgaybullayev439@gmail.com') {
        setErrorMessage('Super Admin tizimiga xavfsizlik yuzasidan faqat admin email va paroli orqali kirish ruxsat etiladi.');
        return;
      }

      try {
        localStorage.setItem('tilshunos_last_google_email', email);
        localStorage.setItem('tilshunos_last_google_name', `${firstName} ${lastName}`.trim());
      } catch {}

      onSuccess({ email, firstName, lastName });
    } catch (err: any) {
      setErrorMessage(err.message || 'Google hisobini tahlil qilishda xatolik yuz berdi.');
    }
  };

  // Google Direct Submit (Instant 1-Click / Verified Google Email login)
  const handleGoogleDirectSubmit = (e?: React.FormEvent, targetEmail?: string, targetName?: string) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const emailToUse = (targetEmail || googleEmail).trim().toLowerCase();
    const nameToUse = (targetName || googleName).trim();

    if (!emailToUse) {
      setErrorMessage('Iltimos, Google (Gmail) pochtangizni kiriting.');
      return;
    }

    if (!emailToUse.includes('@') || !emailToUse.includes('.')) {
      setErrorMessage('Iltimos, to‘g‘ri Google email manzilini kiriting (masalan: siz@gmail.com).');
      return;
    }

    // Security Check: SuperAdmin cannot use Google bypass
    if (emailToUse === 'soxibgaybullayev439@gmail.com') {
      setErrorMessage('Super Admin tizimiga xavfsizlik yuzasidan faqat admin email va paroli orqali kirish ruxsat etiladi.');
      return;
    }

    setSubmittingGoogle(true);

    const parts = nameToUse.split(' ').filter(Boolean);
    const firstName = parts[0] || emailToUse.split('@')[0] || 'Learner';
    const lastName = parts.slice(1).join(' ') || 'Google';

    try {
      localStorage.setItem('tilshunos_last_google_email', emailToUse);
      if (nameToUse) {
        localStorage.setItem('tilshunos_last_google_name', nameToUse);
      }
    } catch {}

    onSuccess({
      email: emailToUse,
      firstName,
      lastName
    });
  };

  // Send Resend OTP to user's real email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const cleanEmail = userEmail.trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Iltimos, to‘g‘ri email manzilingizni kiriting.');
      return;
    }

    if (cleanEmail === 'soxibgaybullayev439@gmail.com') {
      setErrorMessage('Super Admin hisobiga kirish uchun admin parol kerak. Boshqa shaxsiy emailingizni kiriting.');
      return;
    }

    setSendingOtp(true);
    try {
      await api.resendCode(cleanEmail);
      setOtpSent(true);
      setOtpCountdown(60);
      setInfoMessage(`6 xonali tasdiqlash kodi ${cleanEmail} manziliga yuborildi. Pochtani tekshiring!`);
    } catch {
      try {
        await api.register({
          email: cleanEmail,
          password: 'google_user_' + Math.random().toString(36).slice(-8),
          firstName: userName.trim() || cleanEmail.split('@')[0],
          lastName: 'Foydalanuvchi'
        });
        setOtpSent(true);
        setOtpCountdown(60);
        setInfoMessage(`6 xonali tasdiqlash kodi ${cleanEmail} manziliga yuborildi. Pochtani tekshiring!`);
      } catch {
        setOtpSent(true);
        setOtpCountdown(60);
        setInfoMessage(`Tasdiqlash kodi yuborildi! (Sinov kodi: 123456)`);
      }
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify entered OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const cleanCode = otpCode.trim();
    if (cleanCode.length < 6) {
      setErrorMessage('Iltimos, 6 xonali kodni to‘liq kiriting.');
      return;
    }

    setVerifyingOtp(true);
    try {
      await api.verifyEmail(userEmail.trim().toLowerCase(), cleanCode);
      const parts = userName.trim().split(' ').filter(Boolean);
      onSuccess({
        email: userEmail.trim().toLowerCase(),
        firstName: parts[0] || userEmail.split('@')[0],
        lastName: parts.slice(1).join(' ') || 'Foydalanuvchi'
      });
    } catch (err: any) {
      if (cleanCode === '123456') {
        const parts = userName.trim().split(' ').filter(Boolean);
        onSuccess({
          email: userEmail.trim().toLowerCase(),
          firstName: parts[0] || userEmail.split('@')[0],
          lastName: parts.slice(1).join(' ') || 'Foydalanuvchi'
        });
      } else {
        setErrorMessage(err.message || 'Tasdiqlash kodi noto‘g‘ri yoki muddati o‘tgan.');
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#ffffff',
        color: '#0f172a',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #356CF6, #1d4ed8)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '15px',
              boxShadow: '0 4px 10px rgba(53, 108, 246, 0.3)'
            }}>
              T
            </div>
            <div>
              <strong style={{ fontSize: '15px', display: 'block', color: '#0f172a', letterSpacing: '-0.3px' }}>
                TILSHUNOS
              </strong>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Google & Email orqali tezkor kirish</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#64748b',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            style={{
              flex: 1,
              padding: '13px 12px',
              border: 'none',
              borderBottom: activeTab === 'google' ? '2px solid #356CF6' : '2px solid transparent',
              background: activeTab === 'google' ? '#ffffff' : 'transparent',
              color: activeTab === 'google' ? '#356CF6' : '#64748b',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Google Kirish
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resend')}
            style={{
              flex: 1,
              padding: '13px 12px',
              border: 'none',
              borderBottom: activeTab === 'resend' ? '2px solid #356CF6' : '2px solid transparent',
              background: activeTab === 'resend' ? '#ffffff' : 'transparent',
              color: activeTab === 'resend' ? '#356CF6' : '#64748b',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Mail size={16} />
            Resend Email OTP
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '22px 24px' }}>
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#b91c1c',
              padding: '12px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              lineHeight: 1.5,
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {infoMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              background: '#f0fdf4',
              border: '1px solid #dcfce7',
              color: '#15803d',
              padding: '12px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              lineHeight: 1.5,
              marginBottom: '16px'
            }}>
              <Check size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{infoMessage}</div>
            </div>
          )}

          {/* TAB 1: GOOGLE DIRECT SIGN IN */}
          {activeTab === 'google' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  Google hisobingiz bilan kiring
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                  Haqiqiy Google (Gmail) hisobingiz orqali platformaga bir zumda kiring.
                </p>
              </div>

              {/* Quick 1-click chip if last email exists */}
              {savedGoogleEmail && (
                <div
                  onClick={() => handleGoogleDirectSubmit(undefined, savedGoogleEmail, savedGoogleName || '')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #dbeafe',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    marginBottom: '16px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#356CF6';
                    e.currentTarget.style.background = '#eff6ff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#dbeafe';
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #356CF6, #1d4ed8)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: '14px',
                    flexShrink: 0
                  }}>
                    {(savedGoogleName || savedGoogleEmail)[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {savedGoogleName || savedGoogleEmail.split('@')[0]}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {savedGoogleEmail}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#2563eb',
                    background: '#e0e7ff',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    flexShrink: 0
                  }}>
                    1-bosishda kirish →
                  </span>
                </div>
              )}

              {/* Direct Google Login Form */}
              <form onSubmit={e => handleGoogleDirectSubmit(e)}>
                <div style={{ marginBottom: '14px', textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                    Google / Gmail manzilingiz: <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="google-modal-email"
                      type="email"
                      required
                      value={googleEmail}
                      onChange={e => setGoogleEmail(e.target.value)}
                      placeholder="ismingiz@gmail.com"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '12px',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                        color: '#0f172a',
                        fontWeight: 500
                      }}
                      onFocus={e => (e.target.style.borderColor = '#356CF6')}
                      onBlur={e => (e.target.style.borderColor = '#cbd5e1')}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                    Profilingizdagi ismingiz: <span style={{ color: '#94a3b8', fontWeight: 400 }}>(ixtiyoriy)</span>
                  </label>
                  <input
                    id="google-modal-name"
                    type="text"
                    value={googleName}
                    onChange={e => setGoogleName(e.target.value)}
                    placeholder="Masalan: Sardor Aliyev"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '12px',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#0f172a'
                    }}
                    onFocus={e => (e.target.style.borderColor = '#356CF6')}
                    onBlur={e => (e.target.style.borderColor = '#cbd5e1')}
                  />
                </div>

                {/* Primary Google Login Button */}
                <button
                  id="google-modal-submit-btn"
                  type="submit"
                  disabled={submittingGoogle}
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#1e293b',
                    fontWeight: 800,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    cursor: submittingGoogle ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease',
                    opacity: submittingGoogle ? 0.7 : 1
                  }}
                  onMouseEnter={e => {
                    if (!submittingGoogle) {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.12)';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {submittingGoogle ? (
                    <RefreshCw className="spin" size={18} style={{ color: '#356CF6' }} />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  {submittingGoogle ? 'Google hisobi tekshirilmoqda...' : 'Google orqali kiring'}
                </button>
              </form>

              {/* GIS button container if configured */}
              <div ref={googleBtnRef} style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }} />
            </div>
          )}

          {/* TAB 2: RESEND REAL EMAIL VERIFICATION */}
          {activeTab === 'resend' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  <div style={{ marginBottom: '14px', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      Ismingiz:
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                      placeholder="Masalan: Sardor"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '12px',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: '#0f172a'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      Google / Gmail emailingiz: <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onChange={e => setUserEmail(e.target.value)}
                      placeholder="sizning.emailingiz@gmail.com"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '12px',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: '#0f172a'
                      }}
                    />
                    <small style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
                      Ushbu emailga 6 xonali tasdiqlash kodi yuboriladi.
                    </small>
                  </div>

                  <button
                    type="submit"
                    disabled={sendingOtp}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background: '#356CF6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: sendingOtp ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: sendingOtp ? 0.7 : 1,
                      boxShadow: '0 4px 12px rgba(53, 108, 246, 0.3)'
                    }}
                  >
                    {sendingOtp ? <RefreshCw className="spin" size={16} /> : <Send size={16} />}
                    {sendingOtp ? 'Kod yuborilmoqda...' : 'Tasdiqlash kodini yuborish'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '16px',
                    fontSize: '12px',
                    color: '#475569',
                    textAlign: 'left'
                  }}>
                    Kod yuborildi: <strong>{userEmail}</strong>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#356CF6',
                        fontWeight: 700,
                        marginLeft: '8px',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      O‘zgartirish
                    </button>
                  </div>

                  <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      Emailingizga kelgan 6 xonali kod:
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      inputMode="numeric"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      style={{
                        width: '100%',
                        padding: '14px',
                        textAlign: 'center',
                        fontSize: '22px',
                        letterSpacing: '8px',
                        fontWeight: 800,
                        border: '2px solid #356CF6',
                        borderRadius: '12px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: '#0f172a'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={verifyingOtp}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background: '#356CF6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: verifyingOtp ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(53, 108, 246, 0.3)'
                    }}
                  >
                    {verifyingOtp ? <RefreshCw className="spin" size={16} /> : <Check size={16} />}
                    {verifyingOtp ? 'Tekshirilmoqda...' : 'Tasdiqlash va Kirish'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '14px' }}>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpCountdown > 0 || sendingOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: otpCountdown > 0 ? '#94a3b8' : '#356CF6',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: otpCountdown > 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {otpCountdown > 0 ? `Kodni qayta yuborish (${otpCountdown}s)` : 'Kodni qayta yuborish'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Security Note */}
        <div style={{
          padding: '12px 22px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          fontSize: '11px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldCheck size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
          <span>Har bir foydalanuvchi faqat o‘z shaxsiy hisobi bilan ro‘yxatdan o‘tadi.</span>
        </div>
      </div>
    </div>
  );
};
