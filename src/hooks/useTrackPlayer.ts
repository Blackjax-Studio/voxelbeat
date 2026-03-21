import { useState, useRef, useEffect } from "react";

export interface Track {
  id: string;
  title: string;
  storage_key: string;
  filesize?: number;
  filetype?: string;
  num_plays?: number;
  created_at: string;
  description?: string;
  tags?: string;
}

export function useTrackPlayer() {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [isDownloading, setIsDownloading] = useState<{ [key: string]: boolean }>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllers = useRef<{ [key: string]: AbortController }>({});
  const trackBlobUrls = useRef<{ [key: string]: string }>({});

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('progress', handleProgress);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('ended', handleTrackEnd);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('progress', handleProgress);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('ended', handleTrackEnd);
      }
      Object.values(trackBlobUrls.current).forEach(url => URL.revokeObjectURL(url));
      Object.values(abortControllers.current).forEach(ctrl => ctrl.abort());
    };
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      updateBuffered();
    }
  };

  const updateBuffered = () => {
    if (audioRef.current && audioRef.current.buffered.length > 0 && audioRef.current.duration > 0) {
      const curTime = audioRef.current.currentTime;
      let currentBufferedEnd = 0;

      for (let i = 0; i < audioRef.current.buffered.length; i++) {
        if (audioRef.current.buffered.start(i) <= curTime && audioRef.current.buffered.end(i) >= curTime) {
          currentBufferedEnd = audioRef.current.buffered.end(i);
          break;
        }
      }

      if (currentBufferedEnd === 0 && audioRef.current.buffered.length > 0) {
        currentBufferedEnd = audioRef.current.buffered.end(audioRef.current.buffered.length - 1);
      }

      setBufferedTime(currentBufferedEnd);
    }
  };

  const handleProgress = () => {
    updateBuffered();
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      updateBuffered();
    }
  };

  const handleTrackEnd = () => {
    setPlayingTrackId(null);
    setCurrentTime(0);
  };

  const downloadTrackInParts = async (track: Track) => {
    if (trackBlobUrls.current[track.id]) return trackBlobUrls.current[track.id];
    if (isDownloading[track.id]) return null;

    setIsDownloading(prev => ({ ...prev, [track.id]: true }));
    setDownloadProgress(prev => ({ ...prev, [track.id]: 0 }));

    const controller = new AbortController();
    abortControllers.current[track.id] = controller;

    try {
      const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB chunks
      const fileSize = track.filesize || 0;
      if (fileSize === 0) throw new Error("File size is unknown");

      const totalParts = Math.ceil(fileSize / CHUNK_SIZE);
      const chunks: Uint8Array[] = [];

      for (let i = 0; i < totalParts; i++) {
        if (controller.signal.aborted) throw new Error("Download aborted");

        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE - 1, fileSize - 1);
        const range = `bytes=${start}-${end}`;

        let retries = 0;
        const maxRetries = 3;
        let success = false;

        while (retries < maxRetries && !success) {
          try {
            if (controller.signal.aborted) throw new Error("Download aborted");

            const presignResponse = await fetch('/api/download/presign-part', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ storageKey: track.storage_key, range }),
              signal: controller.signal
            });

            if (!presignResponse.ok) throw new Error(`Failed to presign range ${range}`);
            const { url } = await presignResponse.json();

            const partResponse = await fetch(url, {
              headers: { 'Range': range },
              signal: controller.signal
            });

            if (!partResponse.ok) {
              throw new Error(`Failed to download range ${range}`);
            }

            const partBuffer = await partResponse.arrayBuffer();
            chunks.push(new Uint8Array(partBuffer));
            success = true;
          } catch (e: any) {
            if (e.name === 'AbortError') throw e;
            retries++;
            if (retries >= maxRetries) throw e;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 500));
          }
        }

        const progress = Math.round(((i + 1) / totalParts) * 100);
        setDownloadProgress(prev => ({ ...prev, [track.id]: progress }));
      }

      const fullBlob = new Blob(chunks as BlobPart[], { type: track.filetype || 'audio/mpeg' });
      const blobUrl = URL.createObjectURL(fullBlob);
      trackBlobUrls.current[track.id] = blobUrl;
      return blobUrl;
    } catch (error: any) {
      console.error('Error downloading track in parts:', error);
      return null;
    } finally {
      setIsDownloading(prev => ({ ...prev, [track.id]: false }));
      delete abortControllers.current[track.id];
    }
  };

  const handleTogglePlay = async (track: Track) => {
    if (!audioRef.current) return;

    if (playingTrackId === track.id) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(err => console.error("Playback failed:", err));
      } else {
        audioRef.current.pause();
        // Keep playingTrackId to show it's selected but paused
      }
    } else {
      // Get a presigned URL for streaming
      try {
        const response = await fetch('/api/download/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storageKey: track.storage_key }),
        });

        if (!response.ok) {
          console.error("Failed to get presigned URL");
          return;
        }

        const { url } = await response.json();

        if (audioRef.current.src !== url) {
          audioRef.current.src = url;
          setCurrentTime(0);
          setDuration(0);
          setBufferedTime(0);
        }

        audioRef.current.play().catch(err => console.error("Playback failed:", err));
        setPlayingTrackId(track.id);
      } catch (error) {
        console.error("Error getting presigned URL:", error);
      }
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      updateBuffered();
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingTrackId(null);
      setCurrentTime(0);
      setDuration(0);
      setBufferedTime(0);
    }
  };

  const clearResources = () => {
    Object.values(abortControllers.current).forEach(ctrl => ctrl.abort());
    abortControllers.current = {};
    Object.values(trackBlobUrls.current).forEach(url => URL.revokeObjectURL(url));
    trackBlobUrls.current = {};
    setDownloadProgress({});
    setIsDownloading({});
  };

  return {
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
    isPaused: audioRef.current?.paused ?? true
  };
}
