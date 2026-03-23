"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import UploadTrackModal from "./UploadTrackModal";
import EditTrackModal from "./EditTrackModal";
import ConfirmationModal from "./ConfirmationModal";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { useRouter } from "next/navigation";
import { useTrackPlayer } from "@/hooks/useTrackPlayer";
import { useAccountUser } from "@/hooks/useAccountUser";
import { useProfile } from "@/hooks/useProfile";
import { useAccountTracks } from "@/hooks/useAccountTracks";
import { useAccountModals } from "@/hooks/useAccountModals";
import ProfileTab from "./account/ProfileTab";
import TracksTab from "./account/TracksTab";
import DangerZoneTab from "./account/DangerZoneTab";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

type Tab = 'profile' | 'tracks' | 'danger';

export default function AccountModal({ isOpen, onClose, onOpenTerms, onOpenPrivacy }: AccountModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // Custom hooks
  const { user, isLoading } = useAccountUser(isOpen);
  const {
    profileData,
    isSaving,
    saveStatus,
    fetchProfile,
    updateProfile,
    handleInputChange
  } = useProfile();
  const {
    playingTrackId,
    currentTime,
    duration,
    bufferedTime,
    downloadProgress,
    isDownloading,
    handleTogglePlay,
    handleSeek,
    stopAudio,
    clearResources,
    isPaused
  } = useTrackPlayer();

  const { tracks, isTracksLoading, fetchTracks, deleteTrack } = useAccountTracks(clearResources);
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingTrack,
    setEditingTrack,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isSignupModalOpen,
    setIsSignupModalOpen,
    deleteTrackConfirm,
    setDeleteTrackConfirm,
    deleteAccountConfirm,
    setDeleteAccountConfirm
  } = useAccountModals();

  useEffect(() => {
    if (isOpen && user) {
      fetchProfile();
      fetchTracks();
    }
    if (!isOpen) {
      stopAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const handleDeleteTrack = async () => {
    const id = deleteTrackConfirm.trackId;
    if (!id) return;

    setIsDeleting(true);
    try {
      const success = await deleteTrack(id);
      if (success) {
        setDeleteTrackConfirm({ isOpen: false, trackId: null, trackTitle: '' });
      } else {
        alert('Failed to delete track');
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      alert('Error deleting track');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    // This is the final step
    if (deleteAccountConfirm.inputValue !== 'DELETE') return;

    setIsDeleting(true);
    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
      });
      if (response.ok) {
        await supabase.auth.signOut();
        router.refresh();
        onClose();
        setDeleteAccountConfirm({ isOpen: false, step: 1, inputValue: '' });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account');
    } finally {
      setIsDeleting(false);
    }
  };


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
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 md:p-8"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fadeIn" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] rounded-3xl animate-slideUp flex flex-col bg-zinc-900 isolation-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06) inset',
          transform: 'translateZ(0)',
          WebkitBackdropFilter: 'blur(32px)',
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
        <div className="flex-shrink-0 relative px-6 pt-8 pb-4 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 overflow-hidden rounded-t-3xl">
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
                onSwitchToSignup={() => {
                  setIsLoginModalOpen(false);
                  setIsSignupModalOpen(true);
                }}
              />
              <SignupModal
                isOpen={isSignupModalOpen}
                onClose={() => setIsSignupModalOpen(false)}
                onSwitchToLogin={() => {
                  setIsSignupModalOpen(false);
                  setIsLoginModalOpen(true);
                }}
                onOpenTerms={onOpenTerms}
                onOpenPrivacy={onOpenPrivacy}
              />
            </div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <ProfileTab
                  user={user}
                  profileData={profileData}
                  isSaving={isSaving}
                  saveStatus={saveStatus}
                  handleInputChange={handleInputChange}
                  handleUpdateProfile={updateProfile}
                  fetchProfile={fetchProfile}
                />
              )}

              {activeTab === 'tracks' && (
                <TracksTab
                  tracks={tracks}
                  isTracksLoading={isTracksLoading}
                  playingTrackId={playingTrackId}
                  isDownloading={isDownloading}
                  downloadProgress={downloadProgress}
                  currentTime={currentTime}
                  duration={duration}
                  bufferedTime={bufferedTime}
                  isPaused={isPaused}
                  handleTogglePlay={handleTogglePlay}
                  handleSeek={handleSeek}
                  setIsUploadModalOpen={setIsUploadModalOpen}
                  setDeleteTrackConfirm={setDeleteTrackConfirm}
                  setEditingTrack={setEditingTrack}
                  setIsEditModalOpen={setIsEditModalOpen}
                />
              )}

              {activeTab === 'danger' && (
                <DangerZoneTab
                  deleteAccountConfirm={deleteAccountConfirm}
                  setDeleteAccountConfirm={setDeleteAccountConfirm}
                  handleDeleteAccount={handleDeleteAccount}
                  isDeleting={isDeleting}
                />
              )}
            </>
          )}
        </div>
      </div>

      <UploadTrackModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          fetchTracks();
        }}
      />
      <EditTrackModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTrack(null);
          fetchTracks();
        }}
        track={editingTrack}
      />
      <ConfirmationModal
        isOpen={deleteTrackConfirm.isOpen}
        onClose={() => setDeleteTrackConfirm({ isOpen: false, trackId: null, trackTitle: '' })}
        onConfirm={handleDeleteTrack}
        title="Delete Track"
        message={`Are you sure you want to delete "${deleteTrackConfirm.trackTitle}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
