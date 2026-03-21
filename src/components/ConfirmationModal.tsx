"use client";

import { useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  requireTextInput?: boolean;
  expectedInputText?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDanger = false,
  isLoading = false,
  requireTextInput = false,
  expectedInputText = "",
  inputValue = "",
  onInputChange,
}: ConfirmationModalProps) {
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

  const isConfirmDisabled = isLoading || (requireTextInput && inputValue !== expectedInputText);

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-3xl animate-slideUp flex flex-col overflow-hidden bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06) inset",
        }}
      >
        {/* Header */}
        <div className={`px-6 pt-6 pb-4 flex items-center gap-3 ${isDanger ? "text-red-400" : "text-white"}`}>
          {isDanger && (
            <span className="text-2xl">⚠️</span>
          )}
          <h2 className="text-xl font-['Anton'] uppercase tracking-wide">{title}</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-2">
          <p className="text-white/70 text-sm whitespace-pre-wrap">{message}</p>
          
          {requireTextInput && (
            <div className="mt-4">
              <label className="text-[10px] text-white/40 uppercase tracking-widest block mb-2">
                Type <span className="text-white/70 font-bold">{expectedInputText}</span> to confirm
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => onInputChange?.(e.target.value)}
                placeholder={expectedInputText}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              isDanger 
                ? "bg-red-600 hover:bg-red-500 text-white disabled:opacity-50" 
                : "bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50"
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
