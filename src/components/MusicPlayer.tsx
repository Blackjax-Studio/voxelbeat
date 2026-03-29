"use client";

import { useRef, useState, useEffect } from "react";
import { VisStyle } from "@/types/visualizer";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import AlbumArt from "./AlbumArt";
import PlayerControls from "./PlayerControls";
import TrackList from "./TrackList";

interface Track {
    id?: string;
    name: string;
    src: string;
    description?: string;
    tags?: string[];
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
    onToggleFavorite?: (track: Track) => void;
    isFavorited?: (trackId: string) => boolean;
    artistKey?: string | number;
    isFavoritesMode?: boolean;
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
                                        onPrevArtist,
                                        onToggleFavorite,
                                        isFavorited,
                                        artistKey,
                                        isFavoritesMode = false,
                                    }: MusicPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [showTrackList, setShowTrackList] = useState(false);

    const {
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
        toggleMute,
        seekToTime,
    } = useAudioPlayer({ tracks, currentTrackIndex, setParentAnalyser });

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Track the previous tracks src array to detect when artist changes
    const [lastTracksSrc, setLastTracksSrc] = useState<string[]>([]);

    // Reset track index when tracks change (different artist)
    const currentTracksSrc = tracks.map(t => t.src);
    const isSameTracks = currentTracksSrc.length === lastTracksSrc.length &&
                        currentTracksSrc.every((src, i) => src === lastTracksSrc[i]);

    if (tracks.length > 0 && !isSameTracks && (lastTracksSrc.length > 0 || isFavoritesMode)) {
        console.log(`[DEBUG_LOG] Tracks changed, resetting track index to 0. Length: ${tracks.length}`);
        setCurrentTrackIndex(0);
        setLastTracksSrc(currentTracksSrc);
    } else if (lastTracksSrc.length === 0 && tracks.length > 0) {
        // Initialize on first render
        setLastTracksSrc(currentTracksSrc);
    }

    // Change visualization when track or artist changes
    useEffect(() => {
        const styles: VisStyle[] = ['Circular', 'Bars', 'Waveform', 'Nebula'];
        const nextStyle = styles[Math.floor(Math.random() * styles.length)];

        console.log(`[DEBUG_LOG] Randomly changing visualization style to: ${nextStyle} for artist: ${artistName}, track index: ${currentTrackIndex}, artistKey: ${artistKey}`);
        setVisStyle(nextStyle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [artistKey, currentTrackIndex]); // Run when artist or track changes

    const toggleTrackList = () => {
        setShowTrackList(!showTrackList);
    };

    const nextTrack = () => {
        if (tracks.length === 0) return;
        setCurrentTrackIndex((prev) => {
            const nextIndex = (prev + 1) % tracks.length;
            console.log(`[DEBUG_LOG] Next track index: ${nextIndex} (was ${prev}), length: ${tracks.length}`);
            return nextIndex;
        });
        isPlayingRef.current = true;
    };

    const prevTrack = () => {
        if (tracks.length === 0) return;
        setCurrentTrackIndex((prev) => {
            const nextIndex = (prev - 1 + tracks.length) % tracks.length;
            console.log(`[DEBUG_LOG] Prev track index: ${nextIndex} (was ${prev}), length: ${tracks.length}`);
            return nextIndex;
        });
        isPlayingRef.current = true;
    };

    const handleTrackSelect = (index: number) => {
        setCurrentTrackIndex(index);
        if (!isPlaying) togglePlay();
    };

    const trackColors = [
        'from-violet-600 to-fuchsia-600',
        'from-amber-500 to-rose-500',
        'from-emerald-500 to-cyan-500',
        'from-blue-500 to-indigo-500',
    ];

    const currentColor = trackColors[currentTrackIndex % trackColors.length];
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div ref={containerRef} className={`relative w-full xl:max-w-[880px] md:max-w-md lg:max-w-md flex items-center justify-center shrink-0 transition-all duration-500 z-10 mx-auto`}>
            {/* Main card */}
            <div className={`relative z-10 w-full flex flex-col xl:flex-row gap-0 rounded-2xl xs:rounded-3xl md:rounded-[2.5rem] overflow-hidden isolation-auto`}
                 style={{
                     background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                     backdropFilter: 'blur(32px)',
                     WebkitBackdropFilter: 'blur(32px)',
                     border: '1px solid rgba(255,255,255,0.08)',
                     boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
                     transform: 'translateZ(0)',
                 }}>

                {/* Left Column: Album Art & Primary Controls */}
                <div className={`flex flex-col xl:w-[440px] xl:shrink-0 w-full`}>
                    <AlbumArt
                        artistName={artistName}
                        avatarUrl={avatarUrl}
                        currentTrack={tracks[currentTrackIndex]}
                        currentColor={currentColor}
                        isPlaying={isPlaying}
                        isBuffering={isBuffering}
                        onViewProfile={onViewProfile}
                    />

                    {/* Left Controls Area */}
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
                                    if (!duration) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const percentage = x / rect.width;
                                    const newTime = percentage * duration;
                                    seekToTime(newTime);
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
                        <PlayerControls
                            isPlaying={isPlaying}
                            isMuted={isMuted}
                            volume={volume}
                            currentColor={currentColor}
                            onTogglePlay={togglePlay}
                            onToggleMute={toggleMute}
                            onPrevTrack={prevTrack}
                            onNextTrack={nextTrack}
                            onToggleTrackList={toggleTrackList}
                            showTrackList={showTrackList}
                            showTrackListButton={true}
                            onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(tracks[currentTrackIndex]) : undefined}
                            isFavorited={isFavorited && tracks[currentTrackIndex]?.id ? isFavorited(tracks[currentTrackIndex].id!) : false}
                        />

                        {/* Mobile Track list */}
                        {showTrackList && (
                            <TrackList
                                tracks={tracks}
                                currentTrackIndex={currentTrackIndex}
                                isPlaying={isPlaying}
                                onTrackSelect={handleTrackSelect}
                                analyser={analyser}
                                variant="mobile"
                            />
                        )}

                        {/* View Profile Button (Single column or mobile) */}
                        {!isFavoritesMode && (
                            <div className={`pt-1 border-t border-white/5 xl:hidden`}>
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
                        )}
                    </div>
                </div>

                {/* Right Column: Track List & Profile Button (Visible on xl+) */}
                <div className="hidden xl:flex xl:w-[440px] xl:shrink-0 flex-col gap-4 p-6 border-l border-white/5 bg-black/10">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white/80 text-sm font-bold uppercase tracking-wider">Track List</h3>
                        <span className="text-white/30 text-[10px] font-mono">{tracks.length} tracks</span>
                    </div>

                    <TrackList
                        tracks={tracks}
                        currentTrackIndex={currentTrackIndex}
                        isPlaying={isPlaying}
                        onTrackSelect={handleTrackSelect}
                        analyser={analyser}
                        variant="desktop"
                    />

                    {/* View Profile Button (Right side) */}
                    {!isFavoritesMode && (
                        <div className="mt-auto pt-4 border-t border-white/5">
                            <button
                                onClick={onViewProfile}
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 text-white font-bold text-sm hover:from-violet-600/30 hover:to-fuchsia-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
                            >
                                <div className="p-1.5 rounded-lg bg-violet-500/20 group-hover/btn:bg-violet-500/30 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <span>View Artist Profile</span>
                            </button>
                        </div>
                    )}
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
