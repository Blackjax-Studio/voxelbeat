"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { VisStyle } from "@/app/page";

interface Track {
    name: string;
    src: string;
    description?: string;
}

interface MusicPlayerProps {
    tracks: Track[];
    artistName: string;
    avatarUrl?: string;
    visStyle: VisStyle;
    setVisStyle: (style: VisStyle) => void;
    onViewProfile: () => void;
    setAnalyser: (analyser: AnalyserNode | null) => void;
    onNextArtist: () => void;
    onPrevArtist: () => void;
}

export default function MusicPlayer({
                                        tracks,
                                        artistName,
                                        avatarUrl,
                                        visStyle,
                                        setVisStyle,
                                        onViewProfile,
                                        setAnalyser: setParentAnalyser,
                                        onNextArtist,
                                        onPrevArtist
                                    }: MusicPlayerProps) {
                                        const getInitials = (name: string) => {
                                            if (!name) return "";
                                            return name
                                                .split(' ')
                                                .map(word => word[0])
                                                .join('')
                                                .toUpperCase()
                                                .slice(0, 2);
                                        };

                                        const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [loadProgress, setLoadProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [showTrackList, setShowTrackList] = useState(false);

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

        // Don't create a new source if one already exists
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
            // Wait for any existing play promise to resolve or catch to ensure sequential access
            if (playPromiseRef.current) {
                await playPromiseRef.current.catch(() => {});
            }

            // Check if we still want to play after the wait
            if (!isPlayingRef.current) return;

            const playPromise = audioRef.current.play();
            playPromiseRef.current = playPromise;

            await playPromise;
            setIsPlaying(true);
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                console.error('Playback error:', err);
            }
            // If it was an AbortError, we don't necessarily want to set isPlaying to false
            // because a new play request might already be starting.
            if (err instanceof Error && err.name !== 'AbortError') {
                setIsPlaying(false);
                isPlayingRef.current = false;
            }
        } finally {
            // Only clear the ref if it's still pointing to the promise we just awaited
            if (playPromiseRef.current === playPromiseRef.current) {
                // playPromiseRef.current = null;
            }
        }
    }, [setupAudio]);

    const pauseAudio = useCallback(async () => {
        if (!audioRef.current) return;

        isPlayingRef.current = false;
        setIsPlaying(false);

        try {
            // Wait for any pending play promise before pausing
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

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleMute = () => {
        if (audioRef.current) {
            const newMuted = !isMuted;
            audioRef.current.muted = newMuted;
            setIsMuted(newMuted);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Handle empty tracks list
        if (tracks.length === 0) {
            pauseAudio();
            return;
        }

        // Reset index if it's out of bounds for the new tracks array
        if (currentTrackIndex >= tracks.length) {
            setCurrentTrackIndex(0);
            return;
        }

        // Force reload the audio source when track index or tracks list change
        // This ensures the browser starts loading the new track immediately
        // audio.load();

        if (isPlayingRef.current) {
            audio.load();
            playAudio();
        } else {
            pauseAudio();
        }
    }, [currentTrackIndex, tracks, playAudio, pauseAudio]);

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

    // Track list scroll ref and effects
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

    const lastTracksRef = useRef<Track[]>([]);

    useEffect(() => {
        // Reset track index only when tracks (artist) actually change
        const isSameTracks = tracks.length === lastTracksRef.current.length &&
                           tracks.every((t, i) => t.src === lastTracksRef.current[i]?.src);

        if (tracks.length > 0 && !isSameTracks) {
            console.log(`[DEBUG_LOG] Artist tracks changed, resetting track index to 0. Length: ${tracks.length}`);
            setCurrentTrackIndex(0);
            lastTracksRef.current = tracks;
        }
    }, [tracks]);

    useEffect(() => {
        // Change visualization style when track changes
        const styles: VisStyle[] = ['Circular', 'Bars', 'Waveform', 'Nebula'];
        const nextStyle = styles[currentTrackIndex % styles.length];
        console.log(`[DEBUG_LOG] Changing visualization style to: ${nextStyle} for track index: ${currentTrackIndex}`);

        // Use a timeout to ensure this doesn't conflict with other state updates
        // and to make it very explicit that we are switching
        const timeoutId = setTimeout(() => {
            setVisStyle(nextStyle);
        }, 50);

        // Reset progress for new track
        setLoadProgress(0);
        setCurrentTime(0);
        setDuration(0);
        setIsBuffering(false);

        return () => clearTimeout(timeoutId);
    }, [currentTrackIndex, setVisStyle]);

    // Track list toggle
    const toggleTrackList = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent potentially triggering other handlers
        setShowTrackList(!showTrackList);
    };

    const nextTrack = useCallback(() => {
        if (tracks.length === 0) return;
        setCurrentTrackIndex((prev) => {
            const nextIndex = (prev + 1) % tracks.length;
            console.log(`[DEBUG_LOG] Next track index: ${nextIndex} (was ${prev}), length: ${tracks.length}`);
            return nextIndex;
        });
        isPlayingRef.current = true;
    }, [tracks.length]);

    const prevTrack = useCallback(() => {
        if (tracks.length === 0) return;
        setCurrentTrackIndex((prev) => {
            const nextIndex = (prev - 1 + tracks.length) % tracks.length;
            console.log(`[DEBUG_LOG] Prev track index: ${nextIndex} (was ${prev}), length: ${tracks.length}`);
            return nextIndex;
        });
        isPlayingRef.current = true;
    }, [tracks.length]);

    const trackColors = [
        'from-violet-600 to-fuchsia-600',
        'from-amber-500 to-rose-500',
        'from-emerald-500 to-cyan-500',
        'from-blue-500 to-indigo-500',
    ];

    const currentColor = trackColors[currentTrackIndex % trackColors.length];
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div ref={containerRef} className="relative w-full sm:max-w-sm md:max-w-md flex items-center justify-center overflow-hidden shrink-0">
            {/* Main card */}
            <div className="relative z-10 w-full flex flex-col gap-0 rounded-2xl xs:rounded-3xl md:rounded-[2.5rem] overflow-hidden"
                 style={{
                     background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                     backdropFilter: 'blur(32px)',
                     border: '1px solid rgba(255,255,255,0.08)',
                     boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
                 }}>

                {/* Album Art Area */}
                <div
                    onClick={onViewProfile}
                    className={`relative w-full aspect-video md:aspect-[21/9] bg-gradient-to-br ${currentColor} overflow-hidden cursor-pointer group`}>
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-30"
                         style={{
                             backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px)`
                         }} />

                    {/* Center logo */}
                    <div className="absolute inset-0 flex items-center justify-center px-3 xs:px-4 group-hover:scale-105 transition-transform duration-500">
                        <div className="flex flex-col items-center gap-2 xs:gap-3">
                            <div className={`w-12 h-12 xs:w-16 xs:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center
                  ${isPlaying ? 'animate-spin' : ''} bg-yellow-400 backdrop-blur-md border border-white/20 shadow-xl group-hover:shadow-yellow-400/20 transition-all overflow-hidden`}
                                 style={{ animationDuration: '8s' }}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={artistName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-['Anton'] text-lg xs:text-xl md:text-2xl tracking-tighter">
                                        {getInitials(artistName)}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <span className="text-white/60 text-[8px] xs:text-[10px] font-black tracking-[0.2em] xs:tracking-[0.3em] uppercase">{artistName}</span>
                                <p className="text-white font-bold text-sm xs:text-base md:text-xl leading-tight truncate drop-shadow-md max-w-[200px] xs:max-w-[300px] md:max-w-[500px]">
                                    {tracks[currentTrackIndex]?.name || "Loading..."}
                                </p>
                            </div>
                        </div>
                    </div>


                    {/* Buffering indicator */}
                    {isBuffering && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        </div>
                    )}

                    {/* Bottom gradient fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-12"
                         style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
                </div>

                {/* Controls Area */}
                <div className="px-3 xs:px-5 pt-3 xs:pt-4 pb-4 xs:pb-5 flex flex-col gap-3 xs:gap-4">
                    {/* Track Description (Now below banner) */}
                    {tracks[currentTrackIndex]?.description && (
                        <p className="text-white/60 text-[9px] xs:text-[10px] md:text-xs leading-tight line-clamp-2">
                            {tracks[currentTrackIndex]?.description}
                        </p>
                    )}

                    {/* Seek bar */}
                    <div className="relative flex flex-col gap-1 xs:gap-1.5 py-1.5 xs:py-2">
                        <div
                            className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden group/timeline cursor-pointer"
                            onClick={(e) => {
                                if (!audioRef.current || !duration) return;
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const percentage = x / rect.width;
                                const newTime = percentage * duration;
                                audioRef.current.currentTime = newTime;
                                setCurrentTime(newTime);
                            }}
                        >
                            {/* Buffer progress */}
                            <div className="absolute inset-y-0 left-0 bg-white/10 rounded-full transition-all duration-300 pointer-events-none"
                                 style={{ width: `${loadProgress}%` }} />
                            {/* Playback progress */}
                            <div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${currentColor} group-hover/timeline:opacity-80 rounded-full transition-all duration-100 pointer-events-none`}
                                 style={{ width: `${progressPercent}%` }} />
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[9px] xs:text-[10px] text-white/30 font-mono">{formatTime(currentTime)}</span>
                            <span className="text-[9px] xs:text-[10px] text-white/30 font-mono">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Main controls */}
                    <div className="flex items-center justify-between px-1 xs:px-2">
                        {/* Volume/Mute */}
                        <button onClick={toggleMute} className="text-white/40 hover:text-white/80 transition-colors">
                            {isMuted || volume === 0 ? (
                                <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                </svg>
                            ) : volume < 0.5 ? (
                                <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                </svg>
                            )}
                        </button>

                        {/* Prev Track */}
                        <button onClick={prevTrack}
                                className="w-8 h-8 xs:w-10 xs:h-10 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110"
                                title="Previous Track">
                            <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
                            </svg>
                        </button>

                        {/* Play/Pause */}
                        <button onClick={togglePlay}
                                className={`relative w-12 h-12 xs:w-16 xs:h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 bg-gradient-to-br ${currentColor} group shadow-lg overflow-hidden`}
                                style={{
                                    boxShadow: `0 0 25px rgba(168,85,247,${0.2 + (isPlaying ? 0.4 : 0)}), inset 0 0 12px rgba(255,255,255,0.2)`
                                }}>
                            {/* Inner glow/glass effect layer */}
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Background shine animation */}
                            <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/25 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />

                            {isPlaying ? (
                                <svg className="w-7 h-7 xs:w-8 xs:h-8 text-white drop-shadow-md z-10" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                </svg>
                            ) : (
                                <svg className="w-7 h-7 xs:w-8 xs:h-8 text-white translate-x-[2px] drop-shadow-md z-10" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            )}
                        </button>

                        {/* Next Track */}
                        <button onClick={nextTrack}
                                className="w-8 h-8 xs:w-10 xs:h-10 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110"
                                title="Next Track">
                            <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                            </svg>
                        </button>

                        {/* Track list toggle */}
                        <button onClick={toggleTrackList}
                                className={`transition-colors ${showTrackList ? 'text-white' : 'text-white/40 hover:text-white/80'}`}>
                            <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                            </svg>
                        </button>
                    </div>

                    {/* Track list */}
                    {showTrackList && (
                        <div className="flex flex-col gap-0.5 xs:gap-1 pt-2 border-t border-white/5 max-h-40 xs:max-h-48 overflow-y-auto custom-scrollbar">
                            {tracks.map((track, i) => (
                                <button key={i} onClick={() => { setCurrentTrackIndex(i); if (!isPlaying) togglePlay(); }}
                                        className={`flex items-center gap-2 xs:gap-3 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg text-left transition-all
                    ${i === currentTrackIndex ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                                    <div className={`w-5 h-5 xs:w-6 xs:h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm
                    ${i === currentTrackIndex ? `bg-gradient-to-br ${trackColors[i % trackColors.length]} ring-1 ring-white/30` : 'bg-white/10'}`}>
                                        {i === currentTrackIndex && isPlaying ? (
                                            <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-white animate-pulse" />
                                        ) : (
                                            <span className="text-[8px] xs:text-[9px] font-black text-white">{i + 1}</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] xs:text-xs font-medium truncate">{track.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* View Profile Button */}
                    <div className="pt-1 border-t border-white/5">
                        <button
                            onClick={onViewProfile}
                            className="w-full py-2.5 xs:py-3 rounded-lg xs:rounded-xl bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 text-white font-bold text-xs xs:text-sm hover:from-violet-600/30 hover:to-fuchsia-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            View Profile
                        </button>
                    </div>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={tracks[currentTrackIndex]?.src}
                onEnded={nextTrack}
                crossOrigin="anonymous"
                preload="none"
            />
        </div>
    );
}
