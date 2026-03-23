import { useRef, useState, useEffect } from "react";

interface Track {
    id?: string;
    name: string;
    src: string;
    description?: string;
    tags?: string[];
}

interface AlbumArtProps {
    artistName: string;
    avatarUrl?: string;
    currentTrack: Track;
    currentColor: string;
    isPlaying: boolean;
    isBuffering: boolean;
    onViewProfile: () => void;
}

export default function AlbumArt({
    artistName,
    avatarUrl,
    currentTrack,
    currentColor,
    isPlaying,
    isBuffering,
    onViewProfile,
}: AlbumArtProps) {
    const [avatarError, setAvatarError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    const getInitials = (name: string) => {
        if (!name) return "";
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    useEffect(() => {
        setAvatarError(false);

        if (avatarUrl) {
            const timer = setTimeout(() => {
                if (imgRef.current) {
                    if (imgRef.current.naturalWidth === 0 || imgRef.current.complete === false) {
                        setAvatarError(true);
                    }
                }
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [avatarUrl]);

    return (
        <div
            onClick={onViewProfile}
            className={`relative w-full min-h-[160px] xs:min-h-[200px] md:min-h-[250px] bg-gradient-to-br ${currentColor} overflow-hidden cursor-pointer group flex items-center justify-center py-8 xs:py-10 md:py-12`}>
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-30"
                 style={{
                     backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px),
                    repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px)`
                 }} />

            {/* Center logo */}
            <div className="relative z-10 flex items-center justify-center px-3 xs:px-4 group-hover:scale-105 transition-transform duration-500">
                <div className="flex flex-col items-center gap-2 xs:gap-3">
                    <div className={`w-12 h-12 xs:w-16 xs:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center
                      ${isPlaying ? 'animate-spin' : ''} bg-yellow-400 backdrop-blur-md border border-white/20 shadow-xl group-hover:shadow-yellow-400/20 transition-all overflow-hidden`}
                         style={{ animationDuration: '8s' }}>
                        {avatarUrl && !avatarError ? (
                            <img
                                ref={imgRef}
                                key={avatarUrl}
                                src={avatarUrl}
                                alt={artistName}
                                className="w-full h-full object-cover"
                                onError={() => setAvatarError(true)}
                                onLoad={() => {}}
                            />
                        ) : (
                            <span className="text-white font-['Anton'] text-lg xs:text-xl md:text-2xl tracking-tighter">
                                {getInitials(artistName)}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <span className="text-white/60 text-[8px] xs:text-[10px] font-black tracking-[0.2em] xs:tracking-[0.3em] uppercase">{artistName}</span>
                        <p className="text-white font-bold text-sm xs:text-base md:text-xl leading-tight truncate drop-shadow-md max-w-[200px] xs:max-w-[300px] md:max-w-[500px]">
                            {currentTrack?.name || "Loading..."}
                        </p>
                        {((currentTrack?.tags && Array.isArray(currentTrack.tags)) ||
                          (typeof (currentTrack as any)?.tags === 'string' && (currentTrack as any).tags)) && (
                            <div className="flex flex-wrap items-center justify-center gap-1 mt-1 xs:mt-1.5 max-w-full overflow-hidden">
                                {(() => {
                                    const allTags = Array.isArray(currentTrack.tags)
                                        ? currentTrack.tags
                                        : (currentTrack as any).tags.split(',').filter(Boolean);

                                    return (
                                        <>
                                            {allTags.map((tag: string, i: number) => (
                                                <span key={i} className="px-1.5 py-0.5 rounded-sm bg-white/10 border border-white/5 text-[7px] xs:text-[8px] font-bold text-white/50 uppercase tracking-wider whitespace-nowrap">
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </>
                                    );
                                })()}
                            </div>
                        )}
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
    );
}
