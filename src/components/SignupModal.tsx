"use client";

import { useEffect, useState } from "react";
import { signup } from "@/app/login/actions";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

export default function SignupModal({ isOpen, onClose, onSwitchToLogin, onOpenTerms, onOpenPrivacy }: SignupModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setEmail("");
      setPassword("");
      setAgreeToTerms(false);
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
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar space-y-8 bg-zinc-900 p-8 rounded-3xl border border-white/10 text-white animate-slideUp isolation-auto"
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

          <div className="pt-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-5 h-5 bg-white/5 border-2 border-white/20 rounded checked:bg-violet-600 checked:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all cursor-pointer"
                  required
                />
              </div>
              <span className="text-xs text-white/60 leading-relaxed">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenTerms?.();
                  }}
                  className="text-white hover:underline font-bold transition-colors"
                >
                  Terms of Service
                </button>
                {" "}and{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPrivacy?.();
                  }}
                  className="text-white hover:underline font-bold transition-colors"
                >
                  Privacy Policy
                </button>
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              formAction={async (formData) => {
                setIsLoading(true);
                try {
                  await signup(formData);
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading || !agreeToTerms}
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
