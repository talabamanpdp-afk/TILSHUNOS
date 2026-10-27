import React, { useState } from 'react';
import { Languages, X, User, Mail, Calendar, ArrowRight, Shield, Check } from 'lucide-react';

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
}

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'choose' | 'consent' | 'setup'>('choose');
  
  // Default accounts or custom
  const [selectedAccount, setSelectedAccount] = useState({
    name: 'Soxib Gaybullayev',
    email: 'soxibgaybullayev439@gmail.com',
    avatarLetter: 'S'
  });
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Setup form
  const [firstName, setFirstName] = useState('Soxib');
  const [lastName, setLastName] = useState('Gaybullayev');
  const [birthDate, setBirthDate] = useState('2002-05-14');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectAccount = (name: string, email: string) => {
    setSelectedAccount({
      name,
      email,
      avatarLetter: name.charAt(0).toUpperCase() || 'G'
    });
    const parts = name.trim().split(' ');
    setFirstName(parts[0] || 'Foydalanuvchi');
    setLastName(parts.slice(1).join(' ') || 'Google');
    setStep('consent');
  };

  const handleCustomAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.includes('@')) return;
    const derivedName = customName.trim() || customEmail.split('@')[0];
    handleSelectAccount(derivedName, customEmail.trim().toLowerCase());
  };

  const handleConsentContinue = () => {
    setStep('setup');
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    onSuccess({
      email: selectedAccount.email,
      firstName: firstName.trim() || 'Foydalanuvchi',
      lastName: lastName.trim() || '',
      birthDate
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.72)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      {/* GOOGLE CHROME STYLE POPUP WINDOW */}
      {step !== 'setup' ? (
        <div style={{
          width: '100%',
          maxWidth: '460px',
          background: '#131314',
          color: '#e3e3e3',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          border: '1px solid #303134',
          fontFamily: "'Roboto', 'Segoe UI', Arial, sans-serif"
        }}>
          {/* Fake Browser Titlebar */}
          <div style={{
            background: '#1f1f1f',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #303134',
            fontSize: '12px',
            color: '#c4c7c5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Kirish – Google Hisoblar</span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#8e918f',
                cursor: 'pointer',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: '36px 36px 28px' }}>
            {/* Google Logo & App target */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span style={{ fontSize: '15px', color: '#e3e3e3', fontWeight: 500 }}>Google hisobingiz bilan kiring</span>
            </div>

            {/* App brand badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '18px'
              }}>
                T
              </div>
              <div style={{ fontSize: '13px', color: '#c4c7c5' }}>
                <strong style={{ display: 'block', color: '#fff', fontSize: '14px' }}>TILSHUNOS</strong>
                <span>tilshunosuz.vercel.app</span>
              </div>
            </div>

            {/* STEP 1: CHOOSE ACCOUNT */}
            {step === 'choose' && (
              <>
                <h2 style={{ fontSize: '26px', fontWeight: 500, margin: '0 0 6px 0', color: '#f2f2f2' }}>
                  Hisobni tanlang
                </h2>
                <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#a8c7fa' }}>
                  TILSHUNOS ilovasiga o‘tish
                </p>

                {/* Account list */}
                <div style={{ borderTop: '1px solid #303134', borderBottom: '1px solid #303134' }}>
                  {/* Account 1 */}
                  <div
                    onClick={() => handleSelectAccount('Soxib Gaybullayev', 'soxibgaybullayev439@gmail.com')}
                    style={{
                      padding: '16px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #28292a',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#282a2d')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#1a73e8',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '16px'
                    }}>
                      S
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#f2f2f2' }}>Soxib Gaybullayev</div>
                      <div style={{ fontSize: '12px', color: '#c4c7c5' }}>soxibgaybullayev439@gmail.com</div>
                    </div>
                  </div>

                  {/* Account 2: Custom Account Option */}
                  {!showCustomInput ? (
                    <div
                      onClick={() => setShowCustomInput(true)}
                      style={{
                        padding: '16px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#282a2d')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        border: '1px solid #5f6368',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#c4c7c5'
                      }}>
                        <User size={18} />
                      </div>
                      <div style={{ fontSize: '14px', color: '#f2f2f2' }}>
                        Boshqa hisobdan foydalanish
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleCustomAccountSubmit} style={{ padding: '14px 8px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <input
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="Ism va familiyangiz (masalan: Jasur Aliyev)"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: '#1f1f1f',
                            border: '1px solid #5f6368',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '13px',
                            boxSizing: 'border-box',
                            marginBottom: '8px'
                          }}
                        />
                        <input
                          type="email"
                          required
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          placeholder="Google email manzilingiz (@gmail.com)"
                          autoFocus
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: '#1f1f1f',
                            border: '1px solid #5f6368',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setShowCustomInput(false)}
                          style={{
                            padding: '6px 14px',
                            background: 'none',
                            border: '1px solid #5f6368',
                            color: '#c4c7c5',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Bekor qilish
                        </button>
                        <button
                          type="submit"
                          style={{
                            padding: '6px 16px',
                            background: '#a8c7fa',
                            color: '#041e49',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Tanlash
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <p style={{ fontSize: '12px', color: '#8e918f', marginTop: '24px', lineHeight: 1.5 }}>
                  Bu ilovani ishlatishdan oldin TILSHUNOS <span style={{ color: '#a8c7fa' }}>maxfiylik siyosati</span> va <span style={{ color: '#a8c7fa' }}>xizmat shartlari</span> bilan tanishib chiqing.
                </p>
              </>
            )}

            {/* STEP 2: CONSENT CONFIRMATION */}
            {step === 'consent' && (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: 500, margin: '0 0 16px 0', color: '#f2f2f2' }}>
                  TILSHUNOS ilovasiga hisobingiz bilan kiring
                </h2>

                {/* Selected account chip */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#282a2d',
                  padding: '8px 14px',
                  borderRadius: '24px',
                  width: 'fit-content',
                  marginBottom: '20px',
                  border: '1px solid #3c4043'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#1a73e8',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '11px'
                  }}>
                    {selectedAccount.avatarLetter}
                  </div>
                  <span style={{ fontSize: '13px', color: '#e3e3e3' }}>{selectedAccount.email}</span>
                </div>

                <p style={{ fontSize: '13px', color: '#c4c7c5', lineHeight: 1.5, marginBottom: '18px' }}>
                  Google <strong>TILSHUNOS</strong> uchun siz haqingizdagi ushbu ma’lumotlarga kirishga ruxsat beradi:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <User size={18} color="#a8c7fa" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#f2f2f2' }}>{selectedAccount.name}</div>
                      <div style={{ fontSize: '11px', color: '#8e918f' }}>Ism va profil ma’lumotlari</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <Mail size={18} color="#a8c7fa" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#f2f2f2' }}>{selectedAccount.email}</div>
                      <div style={{ fontSize: '11px', color: '#8e918f' }}>Asosiy email manzili</div>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '11px', color: '#8e918f', lineHeight: 1.5, marginBottom: '24px' }}>
                  TILSHUNOS maxfiylik siyosati va xizmat shartlari bilan tanishing. Google hisobingizdan istalgan vaqtda ruxsatni bekor qilishingiz mumkin.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setStep('choose')}
                    style={{
                      padding: '10px 20px',
                      background: 'none',
                      border: '1px solid #5f6368',
                      color: '#a8c7fa',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    onClick={handleConsentContinue}
                    style={{
                      padding: '10px 24px',
                      background: '#a8c7fa',
                      color: '#041e49',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Davom etish
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* STEP 3: "LET'S CREATE YOUR ACCOUNT" (User screenshot 4 style) */
        <div style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          color: '#1e293b',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          fontFamily: "'Inter', sans-serif",
          animation: 'modalSlideIn 0.3s ease'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 28px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <button
              onClick={() => setStep('consent')}
              style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
            >
              ←
            </button>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              Hisobingizni tasdiqlang
            </h3>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleFinalSubmit} style={{ padding: '28px' }}>
            {/* First and Last name */}
            <div style={{
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '16px'
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                  Ism (First name)
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#0f172a',
                    padding: '4px 0 0 0'
                  }}
                />
              </div>
              <div style={{ padding: '10px 14px', background: '#fff' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                  Familiya (Last name)
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#0f172a',
                    padding: '4px 0 0 0'
                  }}
                />
              </div>
            </div>

            {/* Date of birth */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Tug‘ilgan sana (Date of birth)
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Email (pre-filled from Google) */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Google email manzili
              </label>
              <div style={{
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '14px',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Mail size={16} color="#6366f1" />
                <span>{selectedAccount.email}</span>
                <span style={{ marginLeft: 'auto', background: '#dcfce7', color: '#16a34a', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
                  Google tasdiqlagan ✓
                </span>
              </div>
              <small style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginTop: '6px' }}>
                Barcha ma’lumotlar rasmiy Google hisobingizdan olindi.
              </small>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)'
              }}
            >
              {submitting ? 'Yuklanmoqda...' : 'Davom etish (Til va darajani tanlash)'} <ArrowRight size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
