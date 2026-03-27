import { useState, useCallback } from "react";

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
  avatar_display_url: string;
}

export function useProfile() {
  const [profileData, setProfileData] = useState<ProfileData>({
    studio_name: '',
    bio: '',
    spotify_link: '',
    soundcloud_link: '',
    discord_username: '',
    instagram_link: '',
    contact_email: '',
    phone_number: '',
    itch_io_link: '',
    website_link: '',
    avatar_url: '',
    avatar_display_url: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          studio_name: data.studio_name || '',
          bio: data.bio || '',
          spotify_link: data.spotify_link || '',
          soundcloud_link: data.soundcloud_link || '',
          discord_username: data.discord_username || '',
          instagram_link: data.instagram_link || '',
          contact_email: data.contact_email || '',
          phone_number: data.phone_number || '',
          itch_io_link: data.itch_io_link || '',
          website_link: data.website_link || '',
          avatar_url: data.avatar_url || '',
          avatar_display_url: data.avatar_display_url || data.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  const updateProfile = useCallback(async (overrides?: Partial<ProfileData>) => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const { avatar_display_url, ...baseData } = profileData;
      const updateData = { ...baseData, ...overrides };

      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);

      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [profileData, fetchProfile]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  return {
    profileData,
    isSaving,
    saveStatus,
    fetchProfile,
    updateProfile,
    handleInputChange
  };
}
