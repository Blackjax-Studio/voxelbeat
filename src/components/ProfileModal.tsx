"use client";

import { useEffect } from "react";

export interface UserProfile {
  studioName?: string;
  bio?: string;
  spotifyLink?: string;
  soundcloudLink?: string;
  discordUsername?: string;
  instagramLink?: string;
  contactEmail?: string;
  phoneNumber?: string;
  itchIoLink?: string;
  websiteLink?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: UserProfile;
}

export default function ProfileModal({ isOpen, onClose, profile }: ProfileModalProps) {
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md md:max-w-2xl rounded-3xl animate-slideUp bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06) inset',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all hover:scale-110"
          aria-label="Close"
        >
          <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with gradient */}
        <div className="relative px-6 pt-8 pb-16 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 overflow-hidden">
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px)`
            }}
          />

          {/* Avatar/Logo */}
          <div className="relative flex justify-center mb-3">
            <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md border-2 border-white/20 flex items-center justify-center overflow-hidden">
              <img src="/lumi-logo-2.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Name */}
          <h2 className="relative text-center text-2xl font-bold text-white mb-1">
            {profile?.studioName || 'NBK Productions'}
          </h2>
          <p className="relative text-center text-white/60 text-sm font-medium">
            Music Producer & Artist
          </p>
        </div>

        {/* Bio & Links section */}
        <div className="px-5 py-4 md:grid md:grid-cols-2 md:gap-4 space-y-3 md:space-y-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Left Column */}
          <div className="space-y-3">
            {/* Bio */}
            {profile?.bio && (
              <div>
                <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-2">About</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Contact Info */}
            {(profile?.contactEmail || profile?.phoneNumber || profile?.discordUsername) && (
              <div>
                <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-2">Contact</h3>
                <div className="space-y-1.5">
                  {profile.contactEmail && (
                    <a href={`mailto:${profile.contactEmail}`} className="block text-white/70 hover:text-white text-sm transition-colors">
                      📧 {profile.contactEmail}
                    </a>
                  )}
                  {profile.phoneNumber && (
                    <a href={`tel:${profile.phoneNumber}`} className="block text-white/70 hover:text-white text-sm transition-colors">
                      📱 {profile.phoneNumber}
                    </a>
                  )}
                  {profile.discordUsername && (
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z"/>
                      </svg>
                      <span>{profile.discordUsername}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Social Links */}
          <div>
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-2">Connect</h3>
            <div className="flex flex-col gap-1.5">
              {profile?.spotifyLink && (
                <a
                  href={profile.spotifyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 flex items-center justify-between transition-all hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎵</span>
                    <span className="text-white font-medium text-sm">Spotify</span>
                  </div>
                  <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
              {profile?.soundcloudLink && (
                <a
                  href={profile.soundcloudLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-between transition-all hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">☁️</span>
                    <span className="text-white font-medium text-sm">SoundCloud</span>
                  </div>
                  <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
              {profile?.instagramLink && (
                <a
                  href={profile.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30 flex items-center justify-between transition-all hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">📸</span>
                    <span className="text-white font-medium text-sm">Instagram</span>
                  </div>
                  <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
              {profile?.itchIoLink && (
                <a
                  href={profile.itchIoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-600/20 border border-red-500/30 flex items-center justify-between transition-all hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎮</span>
                    <span className="text-white font-medium text-sm">itch.io</span>
                  </div>
                  <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
              {profile?.websiteLink && (
                <a
                  href={profile.websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border border-blue-500/30 flex items-center justify-between transition-all hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌐</span>
                    <span className="text-white font-medium text-sm">Website</span>
                  </div>
                  <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
