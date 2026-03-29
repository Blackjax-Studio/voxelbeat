interface PlayerControlsProps {
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    currentColor: string;
    onTogglePlay: () => void;
    onToggleMute: () => void;
    onPrevTrack: () => void;
    onNextTrack: () => void;
    onToggleTrackList?: () => void;
    onToggleFavorite?: () => void;
    isFavorited?: boolean;
    showTrackList?: boolean;
    showTrackListButton?: boolean;
}

export default function PlayerControls({
    isPlaying,
    isMuted,
    volume,
    currentColor,
    onTogglePlay,
    onToggleMute,
    onPrevTrack,
    onNextTrack,
    onToggleTrackList,
    onToggleFavorite,
    isFavorited = false,
    showTrackList,
    showTrackListButton = false,
}: PlayerControlsProps) {
    return (
        <div className="flex items-center justify-between px-1 xs:px-2">
            {/* Volume/Mute */}
            <div className="group/tooltip relative flex items-center justify-center">
                <button onClick={onToggleMute} className="text-white/40 hover:text-white/80 transition-colors">
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
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {isMuted ? 'Unmute' : 'Mute'}
                </div>
            </div>

            {/* Prev Track */}
            <div className="group/tooltip relative flex items-center justify-center">
                <button onClick={onPrevTrack}
                        className="w-8 h-8 xs:w-10 xs:h-10 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110">
                    <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
                    </svg>
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Previous Track
                </div>
            </div>

            {/* Play/Pause */}
            <button onClick={onTogglePlay}
                    className={`relative w-12 h-12 xs:w-16 xs:h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 bg-gradient-to-br ${currentColor} group shadow-lg overflow-hidden`}
                    style={{
                        boxShadow: `0 0 25px rgba(168,85,247,${0.2 + (isPlaying ? 0.4 : 0)}), inset 0 0 12px rgba(255,255,255,0.2)`
                    }}>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
            <div className="group/tooltip relative flex items-center justify-center">
                <button onClick={onNextTrack}
                        className="w-8 h-8 xs:w-10 xs:h-10 flex items-center justify-center text-white/60 hover:text-white transition-all hover:scale-110">
                    <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                    </svg>
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Next Track
                </div>
            </div>

            {/* Favorite */}
            <div className="group/tooltip relative flex items-center justify-center">
                <button onClick={onToggleFavorite}
                        className={`w-8 h-8 xs:w-10 xs:h-10 flex items-center justify-center transition-all hover:scale-110 ${isFavorited ? 'text-red-500' : 'text-white/40 hover:text-white/80'}`}>
                    <svg className="w-4 h-4 xs:w-5 xs:h-5" fill={isFavorited ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                </div>
            </div>

            {/* Track list toggle */}
            {showTrackListButton && onToggleTrackList && (
                <div className={`group/tooltip relative flex items-center justify-center`}>
                    <button onClick={onToggleTrackList}
                            className={`transition-colors ${showTrackList ? 'text-white' : 'text-white/40 hover:text-white/80'}`}>
                        <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                        </svg>
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {showTrackList ? 'Hide Tracks' : 'Show All Tracks'}
                    </div>
                </div>
            )}
        </div>
    );
}
