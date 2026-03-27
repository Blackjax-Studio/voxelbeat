"use client";

import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
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
  avatar_display_url?: string;
}

interface ProfileTabProps {
  user: User;
  profileData: ProfileData;
  isSaving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  handleInputChange: (field: string, value: string) => void;
  handleUpdateProfile: (overrides?: Partial<ProfileData>) => Promise<void>;
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countryCode, setCountryCode] = useState("+1");

  useEffect(() => {
    if (profileData.phone_number) {
      const match = profileData.phone_number.match(/^(\+(\d+))\s*(.*)$/);
      if (match) {
        setCountryCode(match[1]);
      }
    }
  }, [profileData.phone_number]);

  const validateField = (name: string, value: string) => {
    if (!value) return '';

    const urlPattern = /^https?:\/\/.+/i;
    const spotifyPattern = /^https:\/\/open\.spotify\.com\/(artist|album|track|playlist|user)\/.+/i;
    const soundcloudPattern = /^https:\/\/soundcloud\.com\/.+/i;
    const instagramPattern = /^https:\/\/(www\.)?instagram\.com\/.+/i;
    const itchIoPattern = /^https:\/\/.+\.itch\.io\/?/i;

    switch (name) {
      case 'spotify_link':
        return spotifyPattern.test(value) ? '' : 'Please enter a valid Spotify link (e.g., https://open.spotify.com/artist/...)';
      case 'soundcloud_link':
        return soundcloudPattern.test(value) ? '' : 'Please enter a valid SoundCloud link (e.g., https://soundcloud.com/...)';
      case 'instagram_link':
        return instagramPattern.test(value) ? '' : 'Please enter a valid Instagram link (e.g., https://instagram.com/...)';
      case 'itch_io_link':
        return itchIoPattern.test(value) ? '' : 'Please enter a valid itch.io link (e.g., https://username.itch.io)';
      case 'website_link':
        return urlPattern.test(value) ? '' : 'Please enter a valid website URL (starting with http:// or https://)';
      case 'contact_email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address';
      default:
        return '';
    }
  };

  const onInputChange = (field: string, value: string) => {
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    handleInputChange(field, value);
  };

  const onUpdateProfile = async () => {
    // Final validation check
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    const fieldsToValidate = [
      'spotify_link', 'soundcloud_link', 'instagram_link',
      'itch_io_link', 'website_link', 'contact_email'
    ];

    fieldsToValidate.forEach(field => {
      const error = validateField(field, (profileData as any)[field] || '');
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      setAlertConfig({
        isOpen: true,
        title: "Validation Error",
        message: "Please fix the errors in the form before saving.",
        type: 'error'
      });
      return;
    }

    // Use the combined phone number for update
    let overrides: Partial<ProfileData> = {};
    if (profileData.phone_number && !profileData.phone_number.startsWith('+')) {
      const cleanCountryCode = countryCode.trim();
      const fullPhoneNumber = cleanCountryCode ? `${cleanCountryCode} ${profileData.phone_number}` : profileData.phone_number;
      overrides.phone_number = fullPhoneNumber;
      handleInputChange('phone_number', fullPhoneNumber);
    }

    await handleUpdateProfile(overrides);
  };

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
      // We explicitly send only the storage key and exclude avatar_display_url
      const { avatar_display_url, ...profileWithoutDisplay } = profileData;
      const updateResponse = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileWithoutDisplay,
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

  const hasContactInfo = !!(profileData.phone_number || profileData.contact_email || profileData.discord_username);
  const hasStudioName = !!(profileData.studio_name && profileData.studio_name.trim() !== "");
  const hasBio = !!(profileData.bio && profileData.bio.trim() !== "");
  const isProfileComplete = hasContactInfo && hasStudioName && hasBio;

  return (
    <div className="space-y-5">
      {/* Semantic Search Alert */}
      <div className="bg-violet-400/20 border border-violet-400/30 rounded-2xl p-4 flex gap-4 items-start animate-fadeIn shadow-[0_0_30px_rgba(167,139,250,0.15)]">
        <div className="bg-violet-400/30 p-2 rounded-xl shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-black text-violet-200 uppercase tracking-[0.15em]">Semantic Search Power</h3>
          <p className="text-xs leading-relaxed text-white/80">
            Your studio name and bio are indexed by our <span className="text-white font-bold">Vectorized Search</span>.
            Describe your style and musical background to help developers find <span className="text-violet-300 font-bold uppercase">YOU</span> when they search for specific vibes or genres.
          </p>
        </div>
      </div>

      {!isProfileComplete && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <div className="p-1 bg-amber-500/20 rounded-lg shrink-0">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-amber-500 font-['Anton'] tracking-tight">Public Visibility Restricted</h3>
            <p className="text-white/80 text-sm mt-0.5">
              Your profile will not be shown publicly until you provide a <strong>Studio Name</strong>, <strong>Description (Bio)</strong>, and at least one <strong>Contact Method</strong> (Phone, Email, or Discord).
            </p>
          </div>
        </div>
      )}
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
                {profileData.avatar_display_url || profileData.avatar_url ? (
                  <img src={profileData.avatar_display_url || profileData.avatar_url} alt="Current Avatar" className="w-full h-full object-cover" />
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
              onChange={(e) => onInputChange('spotify_link', e.target.value)}
              placeholder="https://open.spotify.com/artist/..."
              className={`w-full mt-1.5 bg-white/10 border ${errors.spotify_link ? 'border-rose-500/50 focus:ring-rose-500' : 'border-white/20 focus:ring-violet-500'} rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2`}
            />
            {errors.spotify_link && <p className="mt-1 text-xs text-rose-500">{errors.spotify_link}</p>}
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide">SoundCloud Link</label>
            <input
              type="url"
              value={profileData.soundcloud_link}
              onChange={(e) => onInputChange('soundcloud_link', e.target.value)}
              placeholder="https://soundcloud.com/..."
              className={`w-full mt-1.5 bg-white/10 border ${errors.soundcloud_link ? 'border-rose-500/50 focus:ring-rose-500' : 'border-white/20 focus:ring-violet-500'} rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2`}
            />
            {errors.soundcloud_link && <p className="mt-1 text-xs text-rose-500">{errors.soundcloud_link}</p>}
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide">Instagram Link</label>
            <input
              type="url"
              value={profileData.instagram_link}
              onChange={(e) => onInputChange('instagram_link', e.target.value)}
              placeholder="https://instagram.com/..."
              className={`w-full mt-1.5 bg-white/10 border ${errors.instagram_link ? 'border-rose-500/50 focus:ring-rose-500' : 'border-white/20 focus:ring-violet-500'} rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2`}
            />
            {errors.instagram_link && <p className="mt-1 text-xs text-rose-500">{errors.instagram_link}</p>}
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide">itch.io Link</label>
            <input
              type="url"
              value={profileData.itch_io_link}
              onChange={(e) => onInputChange('itch_io_link', e.target.value)}
              placeholder="https://username.itch.io"
              className={`w-full mt-1.5 bg-white/10 border ${errors.itch_io_link ? 'border-rose-500/50 focus:ring-rose-500' : 'border-white/20 focus:ring-violet-500'} rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2`}
            />
            {errors.itch_io_link && <p className="mt-1 text-xs text-rose-500">{errors.itch_io_link}</p>}
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide">Website Link</label>
            <input
              type="url"
              value={profileData.website_link}
              onChange={(e) => onInputChange('website_link', e.target.value)}
              placeholder="https://yourwebsite.com"
              className={`w-full mt-1.5 bg-white/10 border ${errors.website_link ? 'border-rose-500/50 focus:ring-rose-500' : 'border-white/20 focus:ring-violet-500'} rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2`}
            />
            {errors.website_link && <p className="mt-1 text-xs text-rose-500">{errors.website_link}</p>}
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
                onChange={(e) => onInputChange('contact_email', e.target.value)}
                placeholder="contact@example.com"
                className={`w-full mt-1.5 bg-white/10 border ${errors.contact_email ? 'border-rose-500/50 focus:ring-rose-500' : 'border-white/20 focus:ring-violet-500'} rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2`}
              />
              {errors.contact_email && <p className="mt-1 text-xs text-rose-500">{errors.contact_email}</p>}
            </div>
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wide">Phone Number</label>
              <div className="flex mt-1.5 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm pointer-events-none">+</span>
                  <input
                    type="text"
                    value={countryCode.replace('+', '')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setCountryCode('+' + val);
                    }}
                    placeholder="1"
                    className="bg-white/10 border border-white/20 rounded-lg pl-6 pr-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-16"
                  />
                </div>
                <input
                  type="tel"
                  value={profileData.phone_number.startsWith('+') ? profileData.phone_number.split(' ').slice(1).join(' ') : profileData.phone_number}
                  onChange={(e) => {
                    const value = e.target.value;
                    onInputChange('phone_number', value);
                  }}
                  placeholder="(555) 123-4567"
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide">Discord Username</label>
            <input
              type="text"
              value={profileData.discord_username}
              onChange={(e) => onInputChange('discord_username', e.target.value)}
              placeholder="username#1234"
              className="w-full mt-1.5 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      <button
        onClick={onUpdateProfile}
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
