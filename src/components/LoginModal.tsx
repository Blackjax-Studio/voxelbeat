"use client";

import { useEffect, useState } from "react";
import { login, signup, resetPassword } from "@/app/login/actions";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resetEmail, setResetEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setShowForgotPassword(false);
      setResetEmailSent(false);
      setResendCooldown(0);
      setResetEmail("");
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
      onClick={onClose}
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
            {showForgotPassword ? 'Reset Password' : 'Welcome'}
          </h1>
          <p className="text-white/60 font-medium">
            {showForgotPassword ? 'Enter your email to receive a reset link' : 'Log in or create an account'}
          </p>
        </div>

        {showForgotPassword ? (
          resetEmailSent ? (
            <div className="mt-8 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/80 text-sm">
                  Password reset email sent to <span className="text-white font-bold">{resetEmail}</span>! Check your inbox and spam folder.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={async () => {
                    const formData = new FormData();
                    formData.append('email', resetEmail);
                    await resetPassword(formData);
                    setResendCooldown(60);
                  }}
                  className={`w-full text-xs font-black uppercase tracking-widest py-4 px-6 rounded-2xl border transition-all active:scale-[0.98] ${
                    resendCooldown > 0
                      ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                      : 'bg-white text-black border-white hover:scale-[1.02] shadow-lg shadow-white/10'
                  }`}
                >
                  {resendCooldown > 0 ? `Resend Link (${resendCooldown}s)` : 'Resend Link'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                    setResetEmail("");
                    setEmail("");
                    setPassword("");
                  }}
                  className="w-full bg-white/5 text-white text-xs font-black uppercase tracking-widest py-4 px-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 ml-1">
                  Email Address
                </label>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all bg-clip-padding"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <button
                  formAction={async (formData) => {
                    await resetPassword(formData);
                    setResetEmailSent(true);
                    setResendCooldown(60);
                  }}
                  className="w-full bg-white text-black text-xs font-black uppercase tracking-widest py-4 px-6 rounded-2xl hover:scale-[1.02] transition-all active:scale-[0.98] shadow-lg shadow-white/10"
                >
                  Send Reset Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setEmail("");
                    setPassword("");
                  }}
                  className="w-full bg-white/5 text-white text-xs font-black uppercase tracking-widest py-4 px-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )
        ) : (
          <form className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 ml-1">
              Email Address
            </label>
            <input
              id="email"
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
            <label htmlFor="password" className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 ml-1">
              Password
            </label>
            <input
              id="password"
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
                await signup(formData);
              }}
              className="w-full bg-white text-black text-xs font-black uppercase tracking-widest py-4 px-6 rounded-2xl hover:scale-[1.02] transition-all active:scale-[0.98] shadow-lg shadow-white/10"
            >
              Sign up
            </button>
            <button
              formAction={async (formData) => {
                await login(formData);
                // The server action redirects on success, which might still refresh the page.
                // But for now, let's keep it as is and see.
              }}
              className="w-full bg-white/5 text-white text-xs font-black uppercase tracking-widest py-4 px-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              Log in
            </button>
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
