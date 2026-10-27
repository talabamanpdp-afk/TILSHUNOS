import React, { useState } from 'react';
import { isIosDevice, promptPwaInstall } from '../lib/pwa';
import { Download, Share, PlusSquare, X, Check, Smartphone, Sparkles } from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const [installing, setInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const isIos = isIosDevice();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    const success = await promptPwaInstall();
    setInstalling(false);
    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl glass-panel bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <img src="/logo.png" alt="Tilshunos" className="w-14 h-14 rounded-2xl shadow-lg shadow-blue-500/20 object-contain" />
          <div>
            <h3 className="text-lg font-bold">Install Tilshunos App</h3>
            <p className="text-xs text-slate-400">Add to your home screen for the best experience</p>
          </div>
        </div>

        {/* Features list */}
        <div className="space-y-3 mb-6 bg-slate-800/40 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs text-slate-300">
              <span className="font-semibold text-white">Full-Screen Immersion:</span> Distraction-free vocabulary learning, reading, and writing.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs text-slate-300">
              <span className="font-semibold text-white">1-Tap Fast Launch:</span> Opens directly like a native iOS & Samsung Galaxy app.
            </p>
          </div>
        </div>

        {/* Action based on OS */}
        {installedSuccess ? (
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-500/20 text-emerald-400 font-semibold text-sm">
            <Check className="w-5 h-5" />
            Application installed successfully!
          </div>
        ) : isIos ? (
          <div className="space-y-3 text-xs bg-blue-950/30 border border-blue-900/40 p-4 rounded-2xl">
            <p className="font-bold text-blue-300">How to install on iOS Safari:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <span>1. Tap the</span>
                <span className="inline-flex items-center gap-1 font-semibold text-white bg-slate-800 px-2 py-0.5 rounded">
                  <Share className="w-3.5 h-3.5 text-blue-400" /> Share
                </span>
                <span>button at bottom.</span>
              </li>
              <li className="flex items-center gap-2">
                <span>2. Scroll down and tap</span>
                <span className="inline-flex items-center gap-1 font-semibold text-white bg-slate-800 px-2 py-0.5 rounded">
                  <PlusSquare className="w-3.5 h-3.5 text-blue-400" /> Add to Home Screen
                </span>
              </li>
              <li>3. Confirm by tapping <span className="font-bold text-white">Add</span> in the top right.</li>
            </ol>
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            disabled={installing}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            {installing ? 'Preparing Install...' : 'Install App Now'}
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors text-center"
        >
          Maybe later, continue in browser
        </button>
      </div>
    </div>
  );
};
