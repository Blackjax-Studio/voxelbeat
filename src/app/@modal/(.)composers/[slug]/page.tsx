"use client";

import { useEffect, useState, use } from 'react';
import ProfileModal from '@/components/ProfileModal';
import ModalWrapper from './ModalWrapper';

export default function InterceptedProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtist() {
      try {
        const response = await fetch(`/api/artists/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setArtist(data);
        }
      } catch (error) {
        console.error('Error fetching artist:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtist();
  }, [slug]);

  if (loading) return null;
  if (!artist) return null;

  return (
    <ModalWrapper>
      <ProfileModal
        isOpen={true}
        onClose={() => {}} // Will be overridden by ModalWrapper
        profile={artist.profile}
      />
    </ModalWrapper>
  );
}
