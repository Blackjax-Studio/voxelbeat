import { useState, useCallback } from "react";

export function useAccountTracks(clearResources?: () => void) {
  const [tracks, setTracks] = useState<any[]>([]);
  const [isTracksLoading, setIsTracksLoading] = useState(false);

  const fetchTracks = useCallback(async () => {
    setIsTracksLoading(true);
    if (clearResources) {
      clearResources();
    }
    try {
      const response = await fetch('/api/tracks');
      if (response.ok) {
        const data = await response.json();
        setTracks(data);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setIsTracksLoading(false);
    }
  }, [clearResources]);

  const deleteTrack = useCallback(async (trackId: string) => {
    const response = await fetch(`/api/tracks/${trackId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      setTracks(prev => prev.filter(track => track.id !== trackId));
      return true;
    }
    return false;
  }, []);

  return {
    tracks,
    isTracksLoading,
    fetchTracks,
    deleteTrack
  };
}
