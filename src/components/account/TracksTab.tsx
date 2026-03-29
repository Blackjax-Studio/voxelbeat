"use client";

import { Track } from "@/hooks/useTrackPlayer";

interface TracksTabProps {
  tracks: Track[];
  isTracksLoading: boolean;
  playingTrackId: string | null;
  isDownloading: { [key: string]: boolean };
  downloadProgress: { [key: string]: number };
  currentTime: number;
  duration: number;
  bufferedTime: number;
  isPaused: boolean;
  handleTogglePlay: (track: Track) => Promise<void>;
  handleSeek: (time: number) => void;
  setIsUploadModalOpen: (isOpen: boolean) => void;
  setDeleteTrackConfirm: (config: { isOpen: boolean; trackId: string | null; trackTitle: string }) => void;
  setEditingTrack: (track: Track | null) => void;
  setIsEditModalOpen: (isOpen: boolean) => void;
}

export default function TracksTab({
  tracks,
  isTracksLoading,
  playingTrackId,
  isDownloading,
  downloadProgress,
  currentTime,
  duration,
  bufferedTime,
  isPaused,
  handleTogglePlay,
  handleSeek,
  setIsUploadModalOpen,
  setDeleteTrackConfirm,
  setEditingTrack,
  setIsEditModalOpen
}: TracksTabProps) {
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-5">
      {/* Semantic Search Alert */}
      <div className="bg-violet-400/20 border border-violet-400/30 rounded-2xl p-4 flex gap-4 items-start animate-fadeIn shadow-[0_0_30px_rgba(167,139,250,0.15)]">
        <div className="bg-violet-400/30 p-2 rounded-xl shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-black text-violet-200 uppercase tracking-[0.15em]">Semantic Search Power</h3>
          <p className="text-xs leading-relaxed text-white/80">
            Your track descriptions are more than just text—they are <span className="text-white font-bold">Search Data</span>.
            Our vectorized search engine uses them to help game developers find <span className="text-violet-300 font-bold uppercase">YOU</span> based on the mood, instruments, and "feel" of your music.
            <span className="block mt-2 p-2 bg-white/5 rounded-lg border border-white/10 text-violet-300/90 font-medium italic">
              "A haunting, atmospheric orchestral piece featuring a solo cello..."
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-['Anton'] text-white">Your Music</h2>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-medium text-sm transition-colors"
          >
            + Upload Track
          </button>
        </div>
        {isTracksLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full" />
          </div>
        ) : tracks.length === 0 ? (
          <p className="text-white/60 text-sm">No tracks uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {tracks.map((track) => (
              <div key={track.id} className="bg-white/5 rounded-xl p-4 border border-white/10 group">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleTogglePlay(track)}
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-600/40 to-fuchsia-600/40 flex items-center justify-center flex-shrink-0 relative group/play overflow-hidden transition-transform hover:scale-105 active:scale-95"
                  >
                    {playingTrackId === track.id && (isDownloading[track.id] || !isPaused) ? (
                      isDownloading[track.id] ? (
                        <div className="relative w-6 h-6 flex items-center justify-center z-10">
                          <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="absolute text-[8px] font-bold text-white">{downloadProgress[track.id]}%</span>
                        </div>
                      ) : (
                        <svg className="w-5 h-5 text-white z-10" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      )
                    ) : (
                      <>
                        <span className="text-xl group-hover/play:opacity-0 transition-opacity">🎵</span>
                        <svg className="w-6 h-6 text-white absolute inset-0 m-auto opacity-0 group-hover/play:opacity-100 transition-opacity translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </>
                    )}
                    {playingTrackId === track.id && !isDownloading[track.id] && (
                      <div className="absolute inset-0 bg-violet-600/20 animate-pulse" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-base truncate">{track.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span className="text-cyan-400 text-xs font-black">{track.num_plays || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-red-400/10 px-2 py-0.5 rounded-md border border-red-400/20">
                        <svg className="w-3.5 h-3.5 text-red-400/60" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-red-400/80 text-xs font-black">{track.favorite_count || 0}</span>
                      </div>
                      <div className="text-white/30 text-[10px] font-medium uppercase tracking-wider">
                        {new Date(track.created_at).toLocaleDateString()}
                      </div>
                      {track.filesize && (
                        <div className="text-white/20 text-[10px] font-medium">
                          {(track.filesize / (1024 * 1024)).toFixed(1)}MB
                        </div>
                      )}
                    </div>
                    {track.description && (
                      <p className="text-white/60 text-xs line-clamp-2 mt-1">
                        {track.description}
                      </p>
                    )}
                    {track.tags && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {track.tags.split(',').map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-white/40">
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Timeline / Seekbar */}
                    {playingTrackId === track.id && (
                      <div className="mt-4 space-y-1.5 animate-fadeIn relative">
                        <div
                          className="relative h-1.5 bg-white/10 rounded-full overflow-hidden group/timeline cursor-pointer"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percentage = x / rect.width;
                            const newTime = percentage * duration;
                            handleSeek(newTime);
                          }}
                        >
                          {/* Buffered / Download progress bar */}
                          <div
                            className="absolute inset-y-0 left-0 bg-white/10 transition-all duration-300 pointer-events-none"
                            style={{ width: `${(bufferedTime / duration) * 100}%` }}
                          />
                          {/* Playback progress bar */}
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 group-hover/timeline:from-violet-400 group-hover/timeline:to-fuchsia-400 transition-all pointer-events-none"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-white/40 font-medium">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingTrack(track);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                      title="Edit Track"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTrackConfirm({ isOpen: true, trackId: track.id, trackTitle: track.title })}
                      className="p-2 hover:bg-rose-500/10 rounded-lg text-white/40 hover:text-rose-500 transition-colors"
                      title="Delete Track"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
