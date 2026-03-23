import { useRef, useState, useCallback, useEffect } from "react";

interface Track {
    id?: string;
    name: string;
    src: string;
    description?: string;
    tags?: string[];
}

interface UseAudioPlayerProps {
    tracks: Track[];
    currentTrackIndex: number;
    setParentAnalyser: (analyser: AnalyserNode | null) => void;
}

export function useAudioPlayer({ tracks, currentTrackIndex, setParentAnalyser }: UseAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [loadProgress, setLoadProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);

    const isPlayingRef = useRef(false);
    const playPromiseRef = useRef<Promise<void> | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

    const setupAudio = useCallback(() => {
        if (!audioRef.current) return;

        if (audioContext && analyser) {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            return;
        }

        if (sourceNodeRef.current) return;

        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = context.createMediaElementSource(audioRef.current);
            sourceNodeRef.current = source;
            const analyserNode = context.createAnalyser();
            analyserNode.fftSize = 512;
            source.connect(analyserNode);
            analyserNode.connect(context.destination);
            setAudioContext(context);
            setAnalyser(analyserNode);
            setParentAnalyser(analyserNode);
        } catch (err) {
            console.error('Audio setup error:', err);
        }
    }, [audioContext, analyser, setParentAnalyser]);

    const playAudio = useCallback(async () => {
        if (!audioRef.current) return;

        setupAudio();

        try {
            if (playPromiseRef.current) {
                await playPromiseRef.current.catch(() => {});
            }

            if (!isPlayingRef.current) return;

            const playPromise = audioRef.current.play();
            playPromiseRef.current = playPromise;

            await playPromise;
            setIsPlaying(true);

            const currentTrack = tracks[currentTrackIndex];
            if (currentTrack?.id) {
                console.log('Incrementing play count for track:', currentTrack.id);
                fetch(`/api/tracks/${currentTrack.id}/play`, {
                    method: 'POST',
                })
                .then(res => res.json())
                .then(data => console.log('Play count updated:', data))
                .catch(err => console.error('Failed to increment play count:', err));
            } else {
                console.warn('Track has no ID, cannot increment play count:', currentTrack);
            }
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                console.error('Playback error:', err);
            }
            if (err instanceof Error && err.name !== 'AbortError') {
                setIsPlaying(false);
                isPlayingRef.current = false;
            }
        }
    }, [setupAudio, tracks, currentTrackIndex]);

    const pauseAudio = useCallback(async () => {
        if (!audioRef.current) return;

        isPlayingRef.current = false;
        setIsPlaying(false);

        try {
            if (playPromiseRef.current) {
                await playPromiseRef.current.catch(() => {});
            }
            audioRef.current.pause();
        } catch (err) {
            console.error('Pause error:', err);
        }
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            pauseAudio();
        } else {
            isPlayingRef.current = true;
            playAudio();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            const newMuted = !isMuted;
            audioRef.current.muted = newMuted;
            setIsMuted(newMuted);
        }
    };

    const seekToTime = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    // First interaction handler
    useEffect(() => {
        const handleFirstInteraction = () => {
            setupAudio();
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };
        document.addEventListener('click', handleFirstInteraction);
        document.addEventListener('keydown', handleFirstInteraction);
        document.addEventListener('touchstart', handleFirstInteraction);
        return () => {
            document.removeEventListener('click', handleFirstInteraction);
            document.removeEventListener('keydown', handleFirstInteraction);
            document.removeEventListener('touchstart', handleFirstInteraction);
        };
    }, [setupAudio]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioContext) {
                audioContext.close();
            }
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [audioContext]);

    // Audio event listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleProgress = () => {
            if (audio.buffered.length > 0) {
                const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
                if (audio.duration > 0) setLoadProgress((bufferedEnd / audio.duration) * 100);
            }
        };
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration);
        const handleWaiting = () => setIsBuffering(true);
        const handlePlaying = () => setIsBuffering(false);
        const handleCanPlay = () => setIsBuffering(false);

        audio.addEventListener('progress', handleProgress);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('canplay', handleCanPlay);
        return () => {
            audio.removeEventListener('progress', handleProgress);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('canplay', handleCanPlay);
        };
    }, [currentTrackIndex]);

    // Handle track changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (tracks.length === 0) {
            pauseAudio();
            return;
        }

        if (currentTrackIndex >= tracks.length) {
            return;
        }

        if (isPlayingRef.current) {
            audio.load();
            playAudio();
        } else {
            pauseAudio();
        }
    }, [currentTrackIndex, tracks, playAudio, pauseAudio]);

    return {
        audioRef,
        isPlaying,
        isPlayingRef,
        analyser,
        loadProgress,
        currentTime,
        duration,
        isBuffering,
        volume,
        isMuted,
        togglePlay,
        handleSeek,
        toggleMute,
        seekToTime,
        playAudio,
        pauseAudio,
    };
}
