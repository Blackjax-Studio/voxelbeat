"use client";

import { useEffect } from "react";
import { Heart } from "lucide-react";

interface FavoritesPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: () => void;
  onLogin: () => void;
}

export default function FavoritesPromptModal({ isOpen, onClose, onSignup, onLogin }: FavoritesPromptModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar bg-zinc-900 p-8 rounded-3xl border border-white/10 text-white animate-slideUp isolation-auto text-center"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06) inset',
          WebkitBackdropFilter: 'blur(32px)',
          transform: 'translateZ(0)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110"
          aria-label="Close"
        >
          <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
            <Heart className="w-8 h-8 text-violet-500 fill-violet-500" />
          </div>
        </div>

        <h2 className="text-3xl font-['Anton'] mb-4 uppercase tracking-tight">
          Love this track?
        </h2>

        <p className="text-white/60 font-medium mb-8 leading-relaxed">
          Sign up to favorite and re-visit your loved tracks anytime.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onClose();
              onSignup();
            }}
            className="w-full bg-white text-black text-xs font-black uppercase tracking-widest py-4 px-6 rounded-2xl hover:scale-[1.02] transition-all active:scale-[0.98] shadow-lg shadow-white/10"
          >
            Create Account
          </button>

          <button
            onClick={() => {
              onClose();
              onLogin();
            }}
            className="w-full bg-white/5 text-white text-xs font-black uppercase tracking-widest py-4 px-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            Log In
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-[10px] font-bold text-white/30 hover:text-white/60 uppercase tracking-[0.2em] transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
