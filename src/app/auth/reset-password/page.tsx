"use client";

import { useState } from "react";
import { updatePassword } from "./actions";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div
        className="relative w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-3xl border border-white/10 text-white"
        style={{
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06) inset',
        }}
      >
        <div className="text-center">
          <h1 className="text-4xl font-['Anton'] mb-2 uppercase tracking-tight">
            Set New Password
          </h1>
          <p className="text-white/60 font-medium">
            Enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 ml-1">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all bg-clip-padding"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 ml-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all bg-clip-padding"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-6">
            <button
              formAction={async (formData) => {
                const password = formData.get('password') as string;
                const confirmPassword = formData.get('confirmPassword') as string;

                if (password !== confirmPassword) {
                  setError('Passwords do not match');
                  return;
                }

                if (password.length < 6) {
                  setError('Password must be at least 6 characters');
                  return;
                }

                try {
                  await updatePassword(formData);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to update password');
                }
              }}
              className="w-full bg-white text-black text-xs font-black uppercase tracking-widest py-4 px-6 rounded-2xl hover:scale-[1.02] transition-all active:scale-[0.98] shadow-lg shadow-white/10"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
