"use client";

import { useEffect } from "react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonLabel?: string;
  type?: 'info' | 'error' | 'success' | 'warning';
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  buttonLabel = "Got it",
  type = 'info',
}: AlertModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error': return 'text-rose-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-emerald-400';
      default: return 'text-violet-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-3xl animate-slideUp flex flex-col overflow-hidden bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06) inset",
        }}
      >
        {/* Header */}
        <div className={`px-6 pt-8 pb-4 flex flex-col items-center text-center gap-3`}>
          <span className="text-3xl mb-1">{getIcon()}</span>
          <h2 className={`text-2xl font-['Anton'] uppercase tracking-wide ${getTypeStyles()}`}>{title}</h2>
        </div>

        {/* Content */}
        <div className="px-8 py-2 text-center">
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-8">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-violet-600/20 active:scale-95"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
