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
    visStyle: VisStyle;
    setVisStyle: (style: VisStyle) => void;
    onViewProfile: () => void;
    setAnalyser: (analyser: AnalyserNode | null) => void;
}

export default function MusicPlayer({
                                        tracks,
                                        visStyle,
                                        setVisStyle,
                                        onViewProfile,
                                        setAnalyser: setParentAnalyser
                                    }: MusicPlayerProps) {
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

    const setupAudio = useCallback(() => {
        if (!audioRef.current) return;

        if (audioContext && analyser) {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            return;
        }

        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = context.createMediaElementSource(audioRef.current);
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
    }, [audioContext, analyser]);

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

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            setupAudio();
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => {
                    if (err.name !== 'NotAllowedError') console.error(err);
                    setIsPlaying(false);
                });
        }
    };

    const nextTrack = () => setCurrentTrackIndex((i) => (i + 1) % tracks.length);
    const prevTrack = () => setCurrentTrackIndex((i) => (i - 1 + tracks.length) % tracks.length);

    const formatTime = (s: number) => {
        if (!s || isNaN(s)) return "0:00";
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const t = parseFloat(e.target.value);
        audioRef.current.currentTime = t;
        setCurrentTime(t);
    };

    const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = parseFloat(e.target.value);
        setVolume(v);
        if (audioRef.current) audioRef.current.volume = v;
        setIsMuted(v === 0);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        const next = !isMuted;
        setIsMuted(next);
        audioRef.current.volume = next ? 0 : volume;
    };

    useEffect(() => {
        const handleFirstInteraction = () => {
            if (!isPlaying) setIsPlaying(true);
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
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            } else {
                setupAudio();
            }
            audio.play().catch(err => {
                if (err.name !== 'NotAllowedError') console.error(err);
                setIsPlaying(false);
            });
        }
    }, [currentTrackIndex, isPlaying, setupAudio, audioContext]);

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

    useEffect(() => {
        // Change visualization style when track changes
        const styles: VisStyle[] = ['Circular', 'Bars', 'Waveform', 'Nebula'];
        const nextStyle = styles[currentTrackIndex % styles.length];
        setVisStyle(nextStyle);

        setLoadProgress(0);
        setCurrentTime(0);
        setDuration(0);
        setIsBuffering(false);
    }, [currentTrackIndex, setVisStyle]);

    const trackColors = [
        'from-violet-600 to-fuchsia-600',
        'from-amber-500 to-rose-500',
        'from-emerald-500 to-cyan-500',
        'from-blue-500 to-indigo-500',
    ];

    const currentColor = trackColors[currentTrackIndex % trackColors.length];
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div ref={containerRef} className="relative w-full lg:max-w-md flex items-center justify-center overflow-hidden shrink-0">
            {/* Main card */}
            <div className="relative z-10 w-full flex flex-col gap-0 rounded-3xl md:rounded-[2.5rem] overflow-hidden"
                 style={{
                     background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                     backdropFilter: 'blur(32px)',
                     border: '1px solid rgba(255,255,255,0.08)',
                     boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
                 }}>

                {/* Album Art Area */}
                <div className={`relative w-full aspect-video md:aspect-[21/9] bg-gradient-to-br ${currentColor} overflow-hidden`}>
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-30"
                         style={{
                             backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px)`
                         }} />

                    {/* Center logo */}
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center
                  ${isPlaying ? 'animate-spin' : ''} bg-yellow-400 backdrop-blur-md border border-white/20 shadow-xl`}
                                 style={{ animationDuration: '8s' }}>
                  <span className="text-xl md:text-2xl font-black text-black tracking-tighter"
                        style={{ fontFamily: "'Anton', sans-serif" }}>ELP</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white/60 text-[10px] font-black tracking-[0.3em] uppercase">ElpepesUno</span>
                                <p className="text-white font-bold text-sm md:text-lg leading-tight truncate drop-shadow-md">
                                    {tracks[currentTrackIndex].name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Track number badge */}
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        <span className="text-white/80 text-[10px] font-black">{currentTrackIndex + 1}</span>
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
                <div className="px-5 pt-4 pb-5 flex flex-col gap-4">
                    {/* Track Description (Now below banner) */}
                    {tracks[currentTrackIndex].description && (
                        <p className="text-white/60 text-[10px] md:text-xs leading-tight line-clamp-2">
                            {tracks[currentTrackIndex].description}
                        </p>
                    )}

                    {/* Seek bar */}
                    <div className="flex flex-col gap-1.5">
                        <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            {/* Buffer progress */}
                            <div className="absolute inset-y-0 left-0 bg-white/10 rounded-full transition-all duration-300"
                                 style={{ width: `${loadProgress}%` }} />
                            {/* Playback progress */}
                            <div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${currentColor} rounded-full transition-all duration-100`}
                                 style={{ width: `${progressPercent}%` }} />
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            step={0.1}
                            value={currentTime}
                            onChange={handleSeek}
                            className="absolute opacity-0 w-full cursor-pointer"
                            style={{ height: '12px', marginTop: '-6px' }}
                        />
                        <div className="flex justify-between">
                            <span className="text-[10px] text-white/30 font-mono">{formatTime(currentTime)}</span>
                            <span className="text-[10px] text-white/30 font-mono">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Main controls */}
                    <div className="flex items-center justify-between">

                        {/* Volume */}
                        <button onClick={toggleMute} className="text-white/40 hover:text-white/80 transition-colors">
                            {isMuted || volume === 0 ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                </svg>
                            ) : volume < 0.5 ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                </svg>
                            )}
                        </button>

                        {/* Prev */}
                        <button onClick={prevTrack}
                                className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
                            </svg>
                        </button>

                        {/* Play/Pause */}
                        <button onClick={togglePlay}
                                className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 bg-gradient-to-br ${currentColor}`}
                                style={{ boxShadow: `0 0 30px rgba(168,85,247,${0.3 + (isPlaying ? 0.3 : 0)})` }}>
                            {isPlaying ? (
                                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                </svg>
                            ) : (
                                <svg className="w-7 h-7 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            )}
                        </button>

                        {/* Next */}
                        <button onClick={nextTrack}
                                className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                            </svg>
                        </button>

                        {/* Track list toggle */}
                        <button onClick={() => setShowTrackList(!showTrackList)}
                                className={`transition-colors ${showTrackList ? 'text-white' : 'text-white/40 hover:text-white/80'}`}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                            </svg>
                        </button>
                    </div>

                    {/* Track list */}
                    {showTrackList && (
                        <div className="flex flex-col gap-1 pt-2 border-t border-white/5 max-h-48 overflow-y-auto custom-scrollbar">
                            {tracks.map((track, i) => (
                                <button key={i} onClick={() => { setCurrentTrackIndex(i); if (!isPlaying) togglePlay(); }}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all
                    ${i === currentTrackIndex ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                    ${i === currentTrackIndex ? `bg-gradient-to-br ${trackColors[i % trackColors.length]}` : 'bg-white/10'}`}>
                                        {i === currentTrackIndex && isPlaying ? (
                                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        ) : (
                                            <span className="text-[8px] font-black text-white/70">{i + 1}</span>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium truncate">{track.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* View Profile Button */}
                    <div className="pt-1 border-t border-white/5">
                        <button
                            onClick={onViewProfile}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 text-white font-bold text-sm hover:from-violet-600/30 hover:to-fuchsia-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            View Profile
                        </button>
                    </div>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={tracks[currentTrackIndex].src}
                onEnded={nextTrack}
                crossOrigin="anonymous"
            />
        </div>
    );
}
