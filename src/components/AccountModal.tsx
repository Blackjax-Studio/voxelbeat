"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import UploadTrackModal from "./UploadTrackModal";
import LoginModal from "./LoginModal";
import { useRouter } from "next/navigation";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'profile' | 'tracks' | 'danger';

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };
    getUser();
  }, [supabase]);

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

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'tracks', label: 'Tracks', icon: '🎵' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️' },
  ];

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl h-[90vh] rounded-3xl animate-slideUp flex flex-col overflow-hidden bg-zinc-900"
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

        {/* Header - Fixed */}
        <div className="flex-shrink-0 relative px-6 pt-8 pb-4 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px)`
            }}
          />
          <div className="flex items-center gap-4 mb-4">
            <h1 className="relative text-3xl font-['Anton'] text-white">Account</h1>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.refresh();
                onClose();
              }}
              className="relative px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-white/40 hover:text-white/70 uppercase tracking-widest transition-all flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="relative flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 bg-black/20">
          {isLoading ? (
            <div className="py-12 text-center text-white/60">Loading...</div>
          ) : !user ? (
            <div className="py-12 text-center">
              <p className="text-white/60 mb-4">Please log in to access your account.</p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-block px-6 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-medium transition-colors"
              >
                Log In
              </button>
              <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
              />
            </div>
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h2 className="text-xl font-['Anton'] text-white mb-4">Profile Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide">Account Email</label>
                        <p className="text-white text-sm mt-1">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h2 className="text-xl font-['Anton'] text-white mb-4">Profile Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide block mb-2">Avatar</label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600/40 to-fuchsia-600/40 flex items-center justify-center border-2 border-white/20 overflow-hidden">
                            <img src="/lumi-logo-2.png" alt="Current Avatar" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white/60 text-xs mb-2">Upload an image or logo that will appear in the music player</p>
                            <label className="cursor-pointer inline-block px-4 py-2 bg-violet-600/80 hover:bg-violet-600 rounded-lg text-white font-medium text-xs transition-colors">
                              Upload Avatar
                              <input type="file" accept="image/*" className="hidden" />
                            </label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide">Studio Name</label>
                        <input
                          type="text"
                          placeholder="Enter your studio name"
                          className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide">Bio</label>
                        <textarea
                          placeholder="Tell us about yourself..."
                          rows={3}
                          className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h2 className="text-xl font-['Anton'] text-white mb-4">Social Links</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide">Spotify Link</label>
                        <input
                          type="url"
                          placeholder="https://spotify.com/..."
                          className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide">SoundCloud Link</label>
                        <input
                          type="url"
                          placeholder="https://soundcloud.com/..."
                          className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide">Instagram Link</label>
                        <input
                          type="url"
                          placeholder="https://instagram.com/..."
                          className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide">itch.io Link</label>
                        <input
                          type="url"
                          placeholder="https://itch.io/..."
                          className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide">Website Link</label>
                        <input
                          type="url"
                          placeholder="https://yourwebsite.com"
                          className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h2 className="text-xl font-['Anton'] text-white mb-4">Contact Information</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-white/60 uppercase tracking-wide">Contact Email</label>
                          <input
                            type="email"
                            placeholder="contact@example.com"
                            className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 uppercase tracking-wide">Phone Number</label>
                          <input
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wide">Discord Username</label>
                        <input
                          type="text"
                          placeholder="username#1234"
                          className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button className="w-full px-6 py-2.5 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-medium text-sm transition-colors">
                    Save Changes
                  </button>
                </div>
              )}

              {/* Tracks Tab */}
              {activeTab === 'tracks' && (
                <div className="space-y-5">
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-['Anton'] text-white">Your Music</h2>
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-medium text-sm transition-colors"
                      >
                        + Upload Track
                      </button>
                    </div>
                    <p className="text-white/60 text-sm">No tracks uploaded yet.</p>
                  </div>

                  {/* Stub tracks for layout */}
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-600/40 to-fuchsia-600/40 flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">🎵</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium text-sm">Track Name {i}</h3>
                            <p className="text-white/50 text-xs mb-2">2:34 • 123 plays</p>
                            <p className="text-white/60 text-xs line-clamp-2">
                              {i === 1 ? 'A smooth blend of electronic and acoustic elements with dreamy vocals.' :
                               i === 2 ? 'High-energy EDM track perfect for summer vibes.' :
                               'Track description goes here...'}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                              <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                              <svg className="w-4 h-4 text-red-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === 'danger' && (
                <div className="space-y-5">
                  <div className="bg-red-950/20 rounded-xl p-5 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">⚠️</span>
                      <h2 className="text-2xl font-['Anton'] text-red-400">Danger Zone</h2>
                    </div>
                    <p className="text-white/70 text-sm mb-6">
                      These actions are permanent and cannot be undone. Please proceed with caution.
                    </p>

                    {/* Delete Account Section */}
                    <div className="bg-red-950/30 rounded-lg p-4 border border-red-500/50">
                      <h3 className="text-red-400 font-bold text-sm mb-2">Delete Account</h3>
                      <p className="text-white/60 text-xs mb-3">
                        Permanently delete your account and all associated data. This action cannot be undone and will remove:
                      </p>
                      <ul className="text-white/50 text-xs mb-4 ml-4 space-y-1 list-disc">
                        <li>All uploaded tracks and music files</li>
                        <li>Your profile and settings</li>
                        <li>All comments and interactions</li>
                        <li>Account statistics and history</li>
                      </ul>
                      <button
                        onClick={() => {
                          if (confirm('⚠️ Are you absolutely sure you want to delete your account?\n\nThis will permanently delete:\n• All your tracks\n• Your profile and settings\n• All your data\n\nThis action CANNOT be undone!')) {
                            if (confirm('This is your final warning. Type DELETE in the next dialog to confirm.')) {
                              const confirmation = prompt('Type DELETE to confirm account deletion:');
                              if (confirmation === 'DELETE') {
                                // TODO: Implement account deletion
                                alert('Account deletion will be implemented soon');
                              } else {
                                alert('Account deletion cancelled - confirmation text did not match.');
                              }
                            }
                          }
                        }}
                        className="px-6 py-2.5 bg-red-700 hover:bg-red-600 border-2 border-red-500 rounded-lg text-white font-bold text-sm transition-colors"
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Upload Track Modal */}
      <UploadTrackModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
