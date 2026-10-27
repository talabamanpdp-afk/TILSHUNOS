import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import { isStandalone } from '../lib/pwa';
import { 
  BookOpen, Sparkles, User, LogOut, Sun, Moon, Download, 
  Menu, X, ShieldAlert, GraduationCap, CheckSquare, Layers 
} from 'lucide-react';

interface NavbarProps {
  onOpenInstallModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenInstallModal }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isPwa = isStandalone();

  return (
    <header className="sticky top-0 z-50 w-full glass-nav backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Tilshunos" 
              className="w-9 h-9 rounded-xl object-contain shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform" 
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                TILSHUNOS
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 -mt-1">
                Language Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
              <Link 
                to="/dashboard" 
                className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/vocabulary" 
                className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Vocabulary
              </Link>
              <Link 
                to="/practice" 
                className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors text-blue-400 font-semibold"
              >
                Practice
              </Link>
              <Link 
                to="/materials" 
                className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Materials
              </Link>
              <Link 
                to="/tasks" 
                className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Tasks
              </Link>
              <Link 
                to="/teachers" 
                className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Teachers
              </Link>
              <Link 
                to="/writing" 
                className="px-3 py-2 rounded-lg hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Writing
              </Link>
              <Link 
                to="/ai-tutor" 
                className="px-3 py-2 rounded-lg flex items-center gap-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 font-semibold"
              >
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                AI Tutor
              </Link>
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* Install PWA Button */}
            {!isPwa && onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-600/15 text-blue-400 border border-blue-500/30 hover:bg-blue-600/25 transition-all shadow-sm"
                title="Install Tilshunos as App"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-500/30">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden lg:block text-xs">
                    <p className="font-semibold text-slate-200 leading-tight">{user?.firstName}</p>
                    <span className="text-[10px] text-blue-400 font-medium">{user?.role}</span>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel bg-slate-900/95 border border-slate-800 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-sm font-semibold text-slate-100">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Profile & Settings
                    </Link>

                    {(user?.role === 'Admin' || user?.role === 'SuperAdmin') && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-amber-300 rounded-xl hover:bg-amber-950/40 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        Admin Console
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 rounded-xl hover:bg-rose-950/30 transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-600/30 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden glass-panel border-t border-slate-800/80 px-4 pt-2 pb-6 space-y-1">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Dashboard
          </Link>
          <Link
            to="/vocabulary"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Personal Vocabulary
          </Link>
          <Link
            to="/practice"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-blue-400 hover:bg-slate-800"
          >
            Word Practice
          </Link>
          <Link
            to="/materials"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Learning Materials
          </Link>
          <Link
            to="/tasks"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Tasks & Assignments
          </Link>
          <Link
            to="/teachers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Teacher Directory
          </Link>
          <Link
            to="/writing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Writing Module
          </Link>
          <Link
            to="/ai-tutor"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-purple-400 hover:bg-slate-800"
          >
            AI Language Tutor
          </Link>
        </div>
      )}
    </header>
  );
};
