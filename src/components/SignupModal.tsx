"use client";

import { useEffect, useState } from "react";
import { signup } from "@/app/login/actions";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setEmail("");
      setPassword("");
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
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 min-h-screen"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn" />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-3xl border border-white/10 text-white animate-slideUp"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06) inset',
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

        <div className="text-center">
          <h1 className="text-4xl font-['Anton'] mb-2 uppercase tracking-tight">
            Create Account
          </h1>
          <p className="text-white/60 font-medium">
            Join our community of artists
          </p>
        </div>

        <form className="mt-8 space-y-4">
          <div>
            <label htmlFor="signup-email" className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 ml-1">
              Email Address
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all bg-clip-padding"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 ml-1">
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all bg-clip-padding"
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-3 pt-6">
            <button
              formAction={async (formData) => {
                setIsLoading(true);
                try {
                  await signup(formData);
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="w-full bg-white text-black text-xs font-black uppercase tracking-widest py-4 px-6 rounded-2xl hover:scale-[1.02] transition-all active:scale-[0.98] shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-white/40">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-white hover:underline font-bold transition-colors"
              >
                Log in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
