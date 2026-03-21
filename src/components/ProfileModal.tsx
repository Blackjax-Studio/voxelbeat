"use client";

import { useEffect } from "react";

export interface UserProfile {
  studioName?: string;
  bio?: string;
  spotifyLink?: string;
  soundcloudLink?: string;
  discordUsername?: string;
  discordServerLink?: string;
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md md:max-w-2xl rounded-3xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.12)',
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
            <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md border-2 border-white/20 flex items-center justify-center">
              <span
                className="text-3xl font-black text-white tracking-tighter"
                style={{ fontFamily: "'Anton', sans-serif" }}
              >
                {profile?.studioName?.substring(0, 3).toUpperCase() || 'NBK'}
              </span>
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
            {(profile?.contactEmail || profile?.phoneNumber) && (
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
              {(profile?.discordUsername || profile?.discordServerLink) && (
                <a
                  href={profile.discordServerLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 flex items-center justify-between transition-all hover:scale-[1.02] hover:bg-white/10 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <span className="text-white font-medium text-sm">
                      Discord {profile.discordUsername && `• ${profile.discordUsername}`}
                    </span>
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
