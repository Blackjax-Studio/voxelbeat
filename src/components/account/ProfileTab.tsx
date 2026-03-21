"use client";

import { User } from "@supabase/supabase-js";
import { useState } from "react";
import AlertModal from "../AlertModal";

interface ProfileData {
  studio_name: string;
  bio: string;
  spotify_link: string;
  soundcloud_link: string;
  discord_username: string;
  instagram_link: string;
  contact_email: string;
  phone_number: string;
  itch_io_link: string;
  website_link: string;
  avatar_url: string;
}

interface ProfileTabProps {
  user: User;
  profileData: ProfileData;
  isSaving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  handleInputChange: (field: string, value: string) => void;
  handleUpdateProfile: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export default function ProfileTab({
  user,
  profileData,
  isSaving,
  saveStatus,
  handleInputChange,
  handleUpdateProfile,
  fetchProfile
}: ProfileTabProps) {
  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarUploadStatus, setAvatarUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; message: string; type: 'info' | 'error' | 'warning' | 'success' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (e.g., 2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setAlertConfig({
        isOpen: true,
        title: "File Too Large",
        message: "Your avatar image must be less than 2MB. Please choose a smaller file.",
        type: 'warning'
      });
      return;
    }

    setIsAvatarUploading(true);
    setAvatarUploadStatus('idle');

    try {
      // 1. Get presigned URL
      const presignResponse = await fetch('/api/user/avatar/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          filetype: file.type
        }),
      });

      if (!presignResponse.ok) throw new Error('Failed to get presigned URL');
      const { url, storageKey } = await presignResponse.json();

      // 2. Upload to S3
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload to S3');

      // 3. Update profile with storage key
      // We use the storage key, the backend will generate a presigned URL when fetching
      const updateResponse = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileData,
          avatar_url: storageKey
        }),
      });

      if (!updateResponse.ok) throw new Error('Failed to update profile');

      setAvatarUploadStatus('success');
      await fetchProfile(); // Refresh the profile to get the new avatar URL
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setAvatarUploadStatus('error');
    } finally {
      setIsAvatarUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
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
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600/40 to-fuchsia-600/40 flex items-center justify-center border-2 border-white/20 overflow-hidden relative group">
                {profileData.avatar_url ? (
                  <img src={profileData.avatar_url} alt="Current Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-['Anton'] text-2xl tracking-tighter">
                    {getInitials(profileData.studio_name) || "👤"}
                  </span>
                )}
                {isAvatarUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-white/60 text-xs mb-2">Upload an image or logo that will appear in the music player (Max 2MB)</p>
                <div className="flex items-center gap-2">
                  <label className={`cursor-pointer inline-block px-4 py-2 rounded-lg text-white font-medium text-xs transition-colors ${
                    isAvatarUploading ? 'bg-violet-600/50 cursor-not-allowed' : 'bg-violet-600/80 hover:bg-violet-600'
                  }`}>
                    {isAvatarUploading ? 'Uploading...' : 'Upload Avatar'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} disabled={isAvatarUploading} />
                  </label>
                  {avatarUploadStatus === 'success' && (
                    <span className="text-emerald-500 text-xs flex items-center gap-1 animate-fadeIn">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      Updated!
                    </span>
                  )}
                  {avatarUploadStatus === 'error' && (
                    <span className="text-rose-500 text-xs flex items-center gap-1 animate-fadeIn">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Upload failed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide">Studio Name</label>
            <input
              type="text"
              value={profileData.studio_name}
              onChange={(e) => handleInputChange('studio_name', e.target.value)}
              placeholder="Enter your studio name"
              className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide">Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
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
              value={profileData.spotify_link}
              onChange={(e) => handleInputChange('spotify_link', e.target.value)}
              placeholder="https://spotify.com/..."
              className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide">SoundCloud Link</label>
            <input
              type="url"
              value={profileData.soundcloud_link}
              onChange={(e) => handleInputChange('soundcloud_link', e.target.value)}
              placeholder="https://soundcloud.com/..."
              className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide">Instagram Link</label>
            <input
              type="url"
              value={profileData.instagram_link}
              onChange={(e) => handleInputChange('instagram_link', e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide">itch.io Link</label>
            <input
              type="url"
              value={profileData.itch_io_link}
              onChange={(e) => handleInputChange('itch_io_link', e.target.value)}
              placeholder="https://itch.io/..."
              className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide">Website Link</label>
            <input
              type="url"
              value={profileData.website_link}
              onChange={(e) => handleInputChange('website_link', e.target.value)}
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
                value={profileData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="contact@example.com"
                className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wide">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide">Discord Username</label>
            <input
              type="text"
              value={profileData.discord_username}
              onChange={(e) => handleInputChange('discord_username', e.target.value)}
              placeholder="username#1234"
              className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleUpdateProfile}
        disabled={isSaving}
        className={`w-full px-6 py-2.5 rounded-lg text-white font-medium text-sm transition-all flex items-center justify-center gap-2 ${
          saveStatus === 'success' 
            ? 'bg-emerald-600 hover:bg-emerald-700' 
            : saveStatus === 'error'
            ? 'bg-rose-600 hover:bg-rose-700'
            : 'bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50'
        }`}
      >
        {isSaving ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving Changes...
          </>
        ) : saveStatus === 'success' ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Saved Successfully!
          </>
        ) : saveStatus === 'error' ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Failed to Save
          </>
        ) : (
          'Save Changes'
        )}
      </button>
    </div>
  );
}
