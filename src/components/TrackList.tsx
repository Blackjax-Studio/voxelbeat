import { useRef, useEffect } from "react";

interface Track {
    id?: string;
    name: string;
    src: string;
    description?: string;
    tags?: string[];
    num_plays?: number;
    favorite_count?: number;
}

interface TrackListProps {
    tracks: Track[];
    currentTrackIndex: number;
    isPlaying: boolean;
    onTrackSelect: (index: number) => void;
    analyser: AnalyserNode | null;
    variant: 'mobile' | 'desktop';
}

const trackColors = [
    'from-violet-600 to-fuchsia-600',
    'from-amber-500 to-rose-500',
    'from-emerald-500 to-cyan-500',
    'from-blue-500 to-indigo-500',
];

export default function TrackList({
    tracks,
    currentTrackIndex,
    isPlaying,
    onTrackSelect,
    analyser,
    variant
}: TrackListProps) {
    const soundBarsRef = useRef<(HTMLDivElement | null)[]>([]);
    const animationFrameRef = useRef<number | null>(null);

    // Sound bar animation effect
    useEffect(() => {
        if (!isPlaying || !analyser) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            soundBarsRef.current.forEach(bar => {
                if (bar) bar.style.height = '20%';
            });
            return;
        }

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const animate = () => {
            if (!analyser) return;
            analyser.getByteFrequencyData(dataArray);

            const indices = [4, 12, 20];

            soundBarsRef.current.forEach((bar, i) => {
                if (bar) {
                    const index = indices[i % 3];
                    const value = dataArray[index] || 0;
                    const percent = Math.max(20, (value / 255) * 100);
                    bar.style.height = `${percent}%`;
                }
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, analyser]);

    if (variant === 'mobile') {
        return (
            <div className={`flex flex-col gap-0.5 xs:gap-1 pt-2 border-t border-white/5 max-h-40 xs:max-h-48 overflow-y-auto custom-scrollbar`}>
                {tracks.map((track, i) => (
                    <button
                        key={i}
                        onClick={() => onTrackSelect(i)}
                        className={`flex items-center gap-2 xs:gap-3 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg text-left transition-all
                            ${i === currentTrackIndex ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                    >
                        <div className={`w-5 h-5 xs:w-6 xs:h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm
                            ${i === currentTrackIndex ? `bg-gradient-to-br ${trackColors[i % trackColors.length]} ring-1 ring-white/30` : 'bg-white/10'}`}>
                            {i === currentTrackIndex && isPlaying ? (
                                <div className="flex gap-0.5 items-end h-2.5 px-0.5">
                                    <div ref={el => { if (i === currentTrackIndex) soundBarsRef.current[0] = el; }} className="w-0.5 bg-white transition-[height] duration-75" style={{height: '20%'}}></div>
                                    <div ref={el => { if (i === currentTrackIndex) soundBarsRef.current[1] = el; }} className="w-0.5 bg-white transition-[height] duration-75" style={{height: '20%'}}></div>
                                    <div ref={el => { if (i === currentTrackIndex) soundBarsRef.current[2] = el; }} className="w-0.5 bg-white transition-[height] duration-75" style={{height: '20%'}}></div>
                                </div>
                            ) : (
                                <span className="text-[8px] xs:text-[9px] font-black text-white">{i + 1}</span>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                            <span className={`text-[10px] xs:text-xs font-medium truncate ${i === currentTrackIndex ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{track.name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex items-center gap-0.5 text-[8px] xs:text-[9px] text-white/40">
                                    <svg className="w-2.5 h-2.5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    <span>{track.num_plays || 0}</span>
                                </div>
                                <div className="flex items-center gap-0.5 text-[8px] xs:text-[9px] text-white/40">
                                    <svg className="w-2.5 h-2.5 text-red-400/60" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span>{track.favorite_count || 0}</span>
                                </div>
                            </div>
                            {track.description && (
                                <p className="text-white/40 text-[8px] xs:text-[9px] leading-tight italic mt-0.5">
                                    {track.description}
                                </p>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-2">
            {tracks.map((track, i) => (
                <button
                    key={i}
                    onClick={() => onTrackSelect(i)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group
                        ${i === currentTrackIndex ? 'bg-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)]' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-sm
                        ${i === currentTrackIndex ? `bg-gradient-to-br ${trackColors[i % trackColors.length]} ring-1 ring-white/30` : 'bg-white/10'}`}>
                        {i === currentTrackIndex && isPlaying ? (
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        ) : (
                            <span className="text-[10px] font-black text-white">{i + 1}</span>
                        )}
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                        <span className={`text-[13px] font-bold truncate ${i === currentTrackIndex ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{track.name}</span>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-[10px] text-white/40 group-hover:text-white/60 transition-colors">
                                <svg className="w-3 h-3 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                <span className="font-bold">{track.num_plays || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-white/40 group-hover:text-white/60 transition-colors">
                                <svg className="w-3 h-3 text-red-400/60" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="font-bold">{track.favorite_count || 0}</span>
                            </div>
                        </div>
                        {track.description && (
                            <p className="text-white/40 text-[11px] leading-tight italic mt-1">
                                {track.description}
                            </p>
                        )}
                    </div>
                    {i === currentTrackIndex && (
                        <div className="flex gap-1 items-end h-3 px-1">
                            <div ref={el => { if (i === currentTrackIndex) soundBarsRef.current[3] = el; }} className="w-0.5 bg-violet-400 transition-[height] duration-75" style={{height: '20%'}}></div>
                            <div ref={el => { if (i === currentTrackIndex) soundBarsRef.current[4] = el; }} className="w-0.5 bg-violet-400 transition-[height] duration-75" style={{height: '20%'}}></div>
                            <div ref={el => { if (i === currentTrackIndex) soundBarsRef.current[5] = el; }} className="w-0.5 bg-violet-400 transition-[height] duration-75" style={{height: '20%'}}></div>
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}
