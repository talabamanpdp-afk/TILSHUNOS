import React, { useState } from 'react';
import {
  BookOpen, Send, Instagram, Youtube, Layers, FileText,
  Mail, Phone, Heart, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react';

interface FooterSectionProps {
  cms?: any;
  heroBgDesktop?: string;
  heroBgMobile?: string;
  dark?: boolean;
  onBegin: (intent: 'login' | 'register' | 'trial') => void;
  onOpenAbout: () => void;
}

export function FooterSection({
  cms,
  heroBgDesktop,
  heroBgMobile,
  dark,
  onBegin,
  onOpenAbout
}: FooterSectionProps) {
  // Mobile accordion state (default: all collapsed or platform expanded)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (key: string) => {
    setOpenAccordion(prev => prev === key ? null : key);
  };

  const contacts = cms?.contacts || {
    telegram: '@tilshunos',
    instagram: 'tilshunos_app',
    email: 'soxibgaybullayev439@gmail.com',
    phone: '+998 90 123 45 67'
  };

  const telegramUrl = contacts.telegram
    ? (contacts.telegram.startsWith('http') ? contacts.telegram : `https://t.me/${contacts.telegram.replace('@', '')}`)
    : 'https://t.me/tilshunos';

  const instagramUrl = contacts.instagram
    ? (contacts.instagram.startsWith('http') ? contacts.instagram : `https://instagram.com/${contacts.instagram.replace('@', '')}`)
    : 'https://instagram.com/tilshunos_app';

  const youtubeUrl = contacts.youtube || 'https://youtube.com';
  const twitterUrl = contacts.twitter || 'https://x.com/tilshunos';

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={`modern-footer-section ${dark ? 'is-dark' : 'is-light'} ${heroBgDesktop || heroBgMobile ? 'has-custom-bg' : ''}`}>
      {/* Dynamic Background Image Layer (when user uploaded custom background) */}
      {(heroBgDesktop || heroBgMobile) && (
        <div className="footer-custom-bg-layer" aria-hidden="true">
          {heroBgDesktop && (
            <div
              className={`footer-custom-bg footer-custom-bg-desktop ${heroBgMobile ? 'desktop-only-bg' : ''}`}
              style={{
                backgroundImage: `url(${heroBgDesktop})`,
                backgroundPosition: 'center bottom'
              }}
            />
          )}
          {heroBgMobile && (
            <div
              className="footer-custom-bg footer-custom-bg-mobile mobile-only-bg"
              style={{
                backgroundImage: `url(${heroBgMobile})`,
                backgroundPosition: 'center bottom'
              }}
            />
          )}
          <div className="footer-custom-bg-overlay" />
        </div>
      )}

      {/* Scoped CSS Styles strictly mirroring reference mockup */}
      <style>{`
        .modern-footer-section {
          position: relative;
          background: linear-gradient(180deg, #060913 0%, #080e22 50%, #050816 100%);
          color: #ffffff;
          padding: 70px 24px 34px;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          transition: background 0.3s ease, color 0.3s ease;
        }

        /* 100% LIGHT MODE SUPPORT */
        .modern-footer-section.is-light {
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%) !important;
          color: #0f172a !important;
        }
        .modern-footer-section.is-light .footer-ambient-wave-top path,
        .modern-footer-section.is-light .footer-ambient-wave-bottom path {
          opacity: 0.35;
        }
        .modern-footer-section.is-light .footer-glass-card {
          background: rgba(255, 255, 255, 0.94) !important;
          border: 1.5px solid rgba(226, 232, 240, 0.95) !important;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.08), 0 0 35px rgba(59, 130, 246, 0.06) !important;
          color: #0f172a !important;
        }
        .modern-footer-section.is-light .footer-glass-card::before {
          background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.25), rgba(124, 58, 237, 0.25), transparent) !important;
        }
        .modern-footer-section.is-light .footer-brand-title {
          color: #0f172a !important;
        }
        .modern-footer-section.is-light .footer-brand-name {
          color: #0f172a !important;
        }
        .modern-footer-section.is-light .footer-brand-slogan {
          color: #475569 !important;
        }
        .modern-footer-section.is-light .footer-social-btn {
          background: rgba(241, 245, 249, 0.9) !important;
          border: 1px solid rgba(203, 213, 225, 0.8) !important;
          color: #3b82f6 !important;
        }
        .modern-footer-section.is-light .footer-social-btn:hover {
          background: #2563eb !important;
          color: #ffffff !important;
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35) !important;
        }
        .modern-footer-section.is-light .footer-col-title {
          color: #0f172a !important;
        }
        .modern-footer-section.is-light .footer-col-icon-badge {
          background: rgba(37, 99, 235, 0.12) !important;
          color: #2563eb !important;
        }
        .modern-footer-section.is-light .footer-link {
          color: #475569 !important;
        }
        .modern-footer-section.is-light .footer-link:hover {
          color: #2563eb !important;
        }
        .modern-footer-section.is-light .footer-telegram-widget {
          background: linear-gradient(135deg, rgba(239, 246, 255, 0.95) 0%, rgba(224, 231, 255, 0.9) 100%) !important;
          border: 1.5px solid rgba(191, 219, 254, 0.9) !important;
          box-shadow: 0 10px 25px rgba(37, 99, 235, 0.08) !important;
        }
        .modern-footer-section.is-light .footer-widget-title {
          color: #1e3a8a !important;
        }
        .modern-footer-section.is-light .footer-widget-desc {
          color: #475569 !important;
        }
        .modern-footer-section.is-light .footer-contact-item {
          background: rgba(241, 245, 249, 0.9) !important;
          border: 1px solid rgba(226, 232, 240, 0.95) !important;
          color: #1e293b !important;
        }
        .modern-footer-section.is-light .footer-contact-item:hover {
          border-color: rgba(37, 99, 235, 0.4) !important;
          color: #2563eb !important;
        }
        .modern-footer-section.is-light .footer-contact-icon-wrap {
          background: rgba(37, 99, 235, 0.1) !important;
          color: #2563eb !important;
        }
        .modern-footer-section.is-light .footer-accordion-item {
          background: rgba(255, 255, 255, 0.95) !important;
          border: 1px solid rgba(226, 232, 240, 0.95) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03) !important;
        }
        .modern-footer-section.is-light .footer-accordion-btn {
          color: #0f172a !important;
        }
        .modern-footer-section.is-light .footer-accordion-btn.is-open {
          border-bottom-color: rgba(226, 232, 240, 0.95) !important;
        }
        .modern-footer-section.is-light .footer-bottom-bar-modern {
          border-top-color: rgba(226, 232, 240, 0.9) !important;
        }
        .modern-footer-section.is-light .footer-copyright-text {
          color: #64748b !important;
        }
        .modern-footer-section.is-light .footer-legal-link {
          color: #475569 !important;
        }
        .modern-footer-section.is-light .footer-legal-link:hover {
          color: #2563eb !important;
        }
        .modern-footer-section.is-light .footer-legal-divider {
          background: rgba(203, 213, 225, 0.8) !important;
        }

        /* Ambient Flowing Neon Waves (Matching Mockup Curves) */
        .footer-ambient-wave-top {
          position: absolute;
          top: -120px;
          left: -80px;
          width: 580px;
          height: 480px;
          pointer-events: none;
          opacity: 0.7;
          filter: blur(2px);
          z-index: 1;
        }
        .footer-ambient-wave-bottom {
          position: absolute;
          bottom: -100px;
          right: -100px;
          width: 620px;
          height: 460px;
          pointer-events: none;
          opacity: 0.65;
          filter: blur(2px);
          z-index: 1;
        }

        /* Custom image background support */
        .footer-custom-bg-layer {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .footer-custom-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-repeat: no-repeat;
          opacity: 0.28;
          transform: scale(1.04);
        }
        .footer-custom-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(6, 9, 19, 0.82) 0%, rgba(8, 14, 34, 0.94) 100%);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .footer-inner-container {
          max-width: 1260px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        /* ========================================================= */
        /* MAIN FLOATING FROSTED GLASS CONTAINER                     */
        /* ========================================================= */
        .footer-glass-card {
          background: rgba(12, 19, 40, 0.72);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 40px 38px 36px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45), 0 0 35px rgba(56, 189, 248, 0.05);
          position: relative;
          overflow: hidden;
        }

        /* Subtle top border highlight shine */
        .footer-glass-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 5%;
          right: 5%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.35), rgba(129, 140, 248, 0.35), transparent);
          pointer-events: none;
        }

        /* Desktop Layout (5 Columns Grid) */
        .footer-desktop-grid {
          display: grid;
          grid-template-columns: 240px 220px 1.05fr 1.15fr 1.6fr;
          gap: 28px;
          align-items: flex-start;
        }

        /* Col 1: Brand & Slogan & Socials */
        .footer-col-brand {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .footer-brand-title {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 14px;
          text-decoration: none;
          color: #ffffff;
        }
        .footer-brand-badge {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 50%, #6366f1 100%);
          display: grid;
          place-items: center;
          color: #ffffff;
          box-shadow: 0 6px 18px rgba(59, 130, 246, 0.4);
          flex-shrink: 0;
        }
        .footer-brand-text {
          font-size: 21px;
          font-weight: 850;
          letter-spacing: -0.4px;
          color: #ffffff;
        }
        .footer-brand-text span {
          color: #38bdf8;
        }

        .footer-brand-slogan {
          font-size: 13px;
          line-height: 1.62;
          color: #94a3b8;
          margin: 0 0 22px;
          max-width: 230px;
        }

        /* Social icons row */
        .footer-social-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer-social-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(30, 41, 59, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.09);
          display: grid;
          place-items: center;
          color: #94a3b8;
          transition: all 0.22s ease;
          text-decoration: none;
        }
        .footer-social-btn:hover {
          color: #ffffff;
          background: rgba(59, 130, 246, 0.35);
          border-color: rgba(96, 165, 250, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
        }

        /* Col 2: "Biz bilan bog‘laning" Featured Card */
        .footer-connect-card {
          background: rgba(15, 23, 42, 0.65);
          border: 1.5px solid rgba(59, 130, 246, 0.28);
          border-radius: 20px;
          padding: 22px 18px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.08);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          position: relative;
          overflow: hidden;
        }
        .footer-connect-card::before {
          content: "";
          position: absolute;
          top: -20px;
          right: -20px;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, transparent 70%);
          pointer-events: none;
        }

        .connect-top-icon-wrap {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 14px;
        }
        .connect-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          display: grid;
          place-items: center;
          color: #ffffff;
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
        }
        .connect-rays-svg {
          margin-left: 2px;
          opacity: 0.85;
        }

        .connect-card-title {
          font-size: 15.5px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 6px;
        }
        .connect-card-desc {
          font-size: 11.8px;
          line-height: 1.52;
          color: #94a3b8;
          margin: 0 0 16px;
        }
        .connect-action-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: #ffffff;
          font-size: 13px;
          font-weight: 750;
          border: none;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
          transition: all 0.22s ease;
        }
        .connect-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(99, 102, 241, 0.45);
          filter: brightness(1.06);
        }

        /* Generic Column Heading with Icon */
        .footer-col-header {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 18px;
        }
        .footer-col-icon-box {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(30, 58, 138, 0.38);
          border: 1px solid rgba(59, 130, 246, 0.25);
          display: grid;
          place-items: center;
          color: #60a5fa;
          flex-shrink: 0;
        }
        .footer-col-header h4 {
          margin: 0;
          font-size: 12.5px;
          font-weight: 850;
          letter-spacing: 0.9px;
          text-transform: uppercase;
          color: #ffffff;
        }

        /* Link Lists */
        .footer-links-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-links-list a,
        .footer-links-list button {
          font-size: 13px;
          color: #94a3b8;
          text-decoration: none;
          transition: all 0.2s ease;
          background: none;
          border: none;
          padding: 0;
          text-align: left;
          cursor: pointer;
          display: inline-block;
        }
        .footer-links-list a:hover,
        .footer-links-list button:hover {
          color: #38bdf8;
          transform: translateX(3px);
        }

        /* Col 5: ALOQA VA TARMOQLAR Contact Pills */
        .footer-contacts-intro {
          font-size: 12px;
          line-height: 1.5;
          color: #94a3b8;
          margin: -6px 0 14px;
        }

        .footer-contact-pills-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .footer-contact-pill {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 14px;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          font-size: 12.5px;
          text-decoration: none;
          transition: all 0.22s ease;
        }
        .footer-contact-pill:hover {
          background: rgba(30, 58, 138, 0.3);
          border-color: rgba(96, 165, 250, 0.35);
          color: #ffffff;
          transform: translateX(3px);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
        }
        .footer-contact-pill-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(30, 41, 59, 0.85);
          display: grid;
          place-items: center;
          color: #60a5fa;
          flex-shrink: 0;
        }

        /* ========================================================= */
        /* BOTTOM COPYRIGHT & LEGAL BAR                              */
        /* ========================================================= */
        .footer-bottom-bar-modern {
          margin-top: 28px;
          padding: 0 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12.5px;
          color: #64748b;
        }
        .footer-copyright {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
        }
        .footer-legal-links {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .footer-legal-links a {
          color: #64748b;
          text-decoration: none;
          transition: color 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .footer-legal-links a:hover {
          color: #94a3b8;
        }
        .footer-legal-divider {
          color: #334155;
        }

        /* ========================================================= */
        /* MOBILE ACCORDION LAYOUT (Right Phone Mockup in Image)     */
        /* ========================================================= */
        .footer-mobile-view {
          display: none;
          flex-direction: column;
          gap: 20px;
        }

        .footer-accordion-item {
          border-radius: 16px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
          transition: border-color 0.2s ease;
        }
        .footer-accordion-item.is-open {
          border-color: rgba(59, 130, 246, 0.35);
        }
        .footer-accordion-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: none;
          border: none;
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.6px;
          cursor: pointer;
          text-align: left;
        }
        .footer-accordion-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer-accordion-content {
          padding: 4px 16px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          animation: accordionSlide 0.25s ease;
        }
        @keyframes accordionSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ========================================================= */
        /* RESPONSIVE BREAKPOINTS                                    */
        /* ========================================================= */
        @media (max-width: 1100px) {
          .footer-desktop-grid {
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
          .footer-col-brand {
            grid-column: span 2;
          }
        }

        @media (max-width: 768px) {
          .modern-footer-section {
            padding: 45px 16px 28px;
          }
          .footer-glass-card {
            padding: 24px 18px;
            border-radius: 24px;
          }
          /* Hide desktop grid on mobile */
          .footer-desktop-grid {
            display: none !important;
          }
          /* Show mobile accordion & stack */
          .footer-mobile-view {
            display: flex !important;
          }
          .footer-bottom-bar-modern {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 12px;
            margin-top: 22px;
          }
        }
      `}</style>

      {/* SVG Background Glowing Flowing Wave Ribbons */}
      <svg className="footer-ambient-wave-top" viewBox="0 0 580 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M -50 40 C 80 80 180 20 280 140 C 380 260 480 200 580 280"
          stroke="url(#waveGradTop)"
          strokeWidth="60"
          strokeLinecap="round"
          opacity="0.25"
        />
        <path
          d="M -30 110 C 100 150 200 80 300 200 C 390 310 470 270 560 330"
          stroke="url(#waveGradTop2)"
          strokeWidth="35"
          strokeLinecap="round"
          opacity="0.3"
        />
        <defs>
          <linearGradient id="waveGradTop" x1="0" y1="0" x2="580" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="waveGradTop2" x1="0" y1="50" x2="560" y2="350" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>

      <svg className="footer-ambient-wave-bottom" viewBox="0 0 620 460" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M 640 400 C 500 360 400 420 300 300 C 200 180 100 240 0 160"
          stroke="url(#waveGradBottom)"
          strokeWidth="65"
          strokeLinecap="round"
          opacity="0.22"
        />
        <defs>
          <linearGradient id="waveGradBottom" x1="640" y1="400" x2="0" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="60%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>

      <div className="footer-inner-container">
        {/* Main Floating Glass Container */}
        <div className="footer-glass-card">
          {/* ===================================================== */}
          {/* 1. DESKTOP 5-COLUMN VIEW                              */}
          {/* ===================================================== */}
          <div className="footer-desktop-grid">
            {/* Column 1: Brand & Socials */}
            <div className="footer-col-brand">
              <a href="#" className="footer-brand-title">
                <div className="footer-brand-badge">
                  <BookOpen size={22} strokeWidth={2.5} />
                </div>
                <span className="footer-brand-text">
                  TILŞUNOS<span>.</span>
                </span>
              </a>

              <p className="footer-brand-slogan">
                Til örganiş — yangi imkoniyatlar eşiklarini oçadi. Biz siz bilan birga bu yölda!
              </p>

              {/* Social Media Circular Buttons */}
              <div className="footer-social-row">
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  title="Telegram"
                >
                  <Send size={16} />
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  title="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  title="YouTube"
                >
                  <Youtube size={16} />
                </a>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  title="X (Twitter)"
                >
                  {/* Modern X logo SVG */}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: "Biz bilan bog‘laning" Highlighted Card */}
            <div className="footer-connect-card">
              <div className="connect-top-icon-wrap">
                <div className="connect-icon-badge">
                  <Send size={18} />
                </div>
                <svg className="connect-rays-svg" width="22" height="18" viewBox="0 0 24 20" fill="none">
                  <path d="M 2 4 C 8 2 14 5 18 10" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M 5 9 C 9 8 13 10 15 13" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
                </svg>
              </div>

              <h4 className="connect-card-title">Biz bilan boğlaning</h4>
              <p className="connect-card-desc">
                Savollaringiz bölsa, biz bilan aloqaga çiqing. Sizning fikringiz biz uçun muhim!
              </p>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="connect-action-btn"
              >
                <span>Boğlaniş</span>
                <ArrowRight size={15} strokeWidth={2.4} />
              </a>
            </div>

            {/* Column 3: PLATFORMA Links */}
            <div>
              <div className="footer-col-header">
                <div className="footer-col-icon-box">
                  <Layers size={15} />
                </div>
                <h4>Platforma</h4>
              </div>

              <ul className="footer-links-list">
                <li><a href="#preview" onClick={(e) => { e.preventDefault(); scrollToSection('preview'); }}>Interfeys körinişi</a></li>
                <li><a href="#roadmap" onClick={(e) => { e.preventDefault(); scrollToSection('roadmap'); }}>CEFR Standartlari</a></li>
                <li><a href="#skills" onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }}>5 ta Könikma</a></li>
                <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>Qanday işlaydi?</a></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Imkoniyatlar</a></li>
              </ul>
            </div>

            {/* Column 4: MA’LUMOTLAR Links */}
            <div>
              <div className="footer-col-header">
                <div className="footer-col-icon-box">
                  <FileText size={15} />
                </div>
                <h4>Ma’lumotlar</h4>
              </div>

              <ul className="footer-links-list">
                <li>
                  <a href="#about" onClick={(e) => { e.preventDefault(); onOpenAbout(); }}>
                    Biz haqimizda (Batafsil)
                  </a>
                </li>
                <li>
                  <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>
                    Köp beriladigan savollar
                  </a>
                </li>
                <li>
                  <button type="button" onClick={() => onBegin('register')}>
                    Öqituvçilar bilan işlaş
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onBegin('login')}>
                    Hisobga kiriş
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => onBegin('register')}>
                    Röyxatdan ötiş
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 5: ALOQA VA TARMOQLAR Contact Pills */}
            <div>
              <div className="footer-col-header">
                <div className="footer-col-icon-box">
                  <Mail size={15} />
                </div>
                <h4>Aloqa va Tarmoqlar</h4>
              </div>

              <p className="footer-contacts-intro">
                Taklif yoki savollaringiz bölsa, biz bilan boğlaning:
              </p>

              <div className="footer-contact-pills-list">
                {contacts.telegram && (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-contact-pill"
                  >
                    <div className="footer-contact-pill-icon">
                      <Send size={14} />
                    </div>
                    <span>Telegram: {contacts.telegram}</span>
                  </a>
                )}

                {contacts.instagram && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-contact-pill"
                  >
                    <div className="footer-contact-pill-icon">
                      <Instagram size={14} />
                    </div>
                    <span>Instagram: {contacts.instagram}</span>
                  </a>
                )}

                {contacts.email && (
                  <a
                    href={`mailto:${contacts.email}`}
                    className="footer-contact-pill"
                  >
                    <div className="footer-contact-pill-icon">
                      <Mail size={14} />
                    </div>
                    <span>Email: {contacts.email}</span>
                  </a>
                )}

                {contacts.phone && (
                  <a
                    href={`tel:${contacts.phone}`}
                    className="footer-contact-pill"
                  >
                    <div className="footer-contact-pill-icon">
                      <Phone size={14} />
                    </div>
                    <span>Tel: {contacts.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* 2. MOBILE VIEW (Phone Mockup with Accordion in Image) */}
          {/* ===================================================== */}
          <div className="footer-mobile-view">
            {/* Top Brand & Socials on Mobile */}
            <div className="footer-col-brand" style={{ width: '100%' }}>
              <a href="#" className="footer-brand-title">
                <div className="footer-brand-badge">
                  <BookOpen size={20} strokeWidth={2.5} />
                </div>
                <span className="footer-brand-text">
                  TILŞUNOS<span>.</span>
                </span>
              </a>

              <p className="footer-brand-slogan" style={{ maxWidth: '100%' }}>
                Til örganiş — yangi imkoniyatlar eşiklarini oçadi. Biz siz bilan birga bu yölda!
              </p>

              <div className="footer-social-row" style={{ marginBottom: '14px' }}>
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Telegram">
                  <Send size={15} />
                </a>
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Instagram">
                  <Instagram size={15} />
                </a>
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="YouTube">
                  <Youtube size={15} />
                </a>
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="X (Twitter)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* "Biz bilan bog‘laning" Mobile Highlight Card */}
            <div className="footer-connect-card" style={{ width: '100%', boxSizing: 'border-box' }}>
              <div className="connect-top-icon-wrap">
                <div className="connect-icon-badge">
                  <Send size={16} />
                </div>
                <svg className="connect-rays-svg" width="20" height="16" viewBox="0 0 24 20" fill="none">
                  <path d="M 2 4 C 8 2 14 5 18 10" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M 5 9 C 9 8 13 10 15 13" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
                </svg>
              </div>

              <h4 className="connect-card-title">Biz bilan boğlaning</h4>
              <p className="connect-card-desc">
                Savollaringiz bölsa, biz bilan aloqaga çiqing. Sizning fikringiz biz uçun muhim!
              </p>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="connect-action-btn"
              >
                <span>Boğlaniş</span>
                <ArrowRight size={15} strokeWidth={2.4} />
              </a>
            </div>

            {/* Accordion 1: PLATFORMA */}
            <div className={`footer-accordion-item ${openAccordion === 'platform' ? 'is-open' : ''}`}>
              <button
                type="button"
                className="footer-accordion-header"
                onClick={() => toggleAccordion('platform')}
              >
                <div className="footer-accordion-left">
                  <div className="footer-col-icon-box">
                    <Layers size={14} />
                  </div>
                  <span>PLATFORMA</span>
                </div>
                {openAccordion === 'platform' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {openAccordion === 'platform' && (
                <div className="footer-accordion-content">
                  <ul className="footer-links-list">
                    <li><a href="#preview" onClick={(e) => { e.preventDefault(); scrollToSection('preview'); }}>Interfeys körinişi</a></li>
                    <li><a href="#roadmap" onClick={(e) => { e.preventDefault(); scrollToSection('roadmap'); }}>CEFR Standartlari</a></li>
                    <li><a href="#skills" onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }}>5 ta Könikma</a></li>
                    <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>Qanday işlaydi?</a></li>
                    <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Imkoniyatlar</a></li>
                  </ul>
                </div>
              )}
            </div>

            {/* Accordion 2: MA’LUMOTLAR */}
            <div className={`footer-accordion-item ${openAccordion === 'info' ? 'is-open' : ''}`}>
              <button
                type="button"
                className="footer-accordion-header"
                onClick={() => toggleAccordion('info')}
              >
                <div className="footer-accordion-left">
                  <div className="footer-col-icon-box">
                    <FileText size={14} />
                  </div>
                  <span>MA’LUMOTLAR</span>
                </div>
                {openAccordion === 'info' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {openAccordion === 'info' && (
                <div className="footer-accordion-content">
                  <ul className="footer-links-list">
                    <li><a href="#about" onClick={(e) => { e.preventDefault(); onOpenAbout(); }}>Biz haqimizda (Batafsil)</a></li>
                    <li><a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>Köp beriladigan savollar</a></li>
                    <li><button type="button" onClick={() => onBegin('register')}>Öqituvçilar bilan işlaş</button></li>
                    <li><button type="button" onClick={() => onBegin('login')}>Hisobga kiriş</button></li>
                    <li><button type="button" onClick={() => onBegin('register')}>Röyxatdan ötiş</button></li>
                  </ul>
                </div>
              )}
            </div>

            {/* Accordion 3: ALOQA VA TARMOQLAR */}
            <div className={`footer-accordion-item ${openAccordion === 'contacts' ? 'is-open' : ''}`}>
              <button
                type="button"
                className="footer-accordion-header"
                onClick={() => toggleAccordion('contacts')}
              >
                <div className="footer-accordion-left">
                  <div className="footer-col-icon-box">
                    <Mail size={14} />
                  </div>
                  <span>ALOQA VA TARMOQLAR</span>
                </div>
                {openAccordion === 'contacts' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {openAccordion === 'contacts' && (
                <div className="footer-accordion-content">
                  <div className="footer-contact-pills-list" style={{ marginTop: '8px' }}>
                    {contacts.telegram && (
                      <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="footer-contact-pill">
                        <div className="footer-contact-pill-icon"><Send size={13} /></div>
                        <span>Telegram: {contacts.telegram}</span>
                      </a>
                    )}
                    {contacts.instagram && (
                      <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-contact-pill">
                        <div className="footer-contact-pill-icon"><Instagram size={13} /></div>
                        <span>Instagram: {contacts.instagram}</span>
                      </a>
                    )}
                    {contacts.email && (
                      <a href={`mailto:${contacts.email}`} className="footer-contact-pill">
                        <div className="footer-contact-pill-icon"><Mail size={13} /></div>
                        <span>Email: {contacts.email}</span>
                      </a>
                    )}
                    {contacts.phone && (
                      <a href={`tel:${contacts.phone}`} className="footer-contact-pill">
                        <div className="footer-contact-pill-icon"><Phone size={13} /></div>
                        <span>Tel: {contacts.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal Policies (Outside the card, exactly like image) */}
        <div className="footer-bottom-bar-modern">
          <div className="footer-copyright">
            <span>© 2026 TILŞUNOS — Barça huquqlar himoyalangan.</span>
          </div>

          <div className="footer-legal-links">
            <a href="#about" onClick={(e) => { e.preventDefault(); onOpenAbout(); }}>
              <Heart size={13} color="#60a5fa" style={{ fill: 'rgba(96, 165, 250, 0.2)' }} />
              <span>Maxfiylik siyosati</span>
            </a>
            <span className="footer-legal-divider">|</span>
            <a href="#about" onClick={(e) => { e.preventDefault(); onOpenAbout(); }}>
              <span>Foydalaniş şartlari</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

