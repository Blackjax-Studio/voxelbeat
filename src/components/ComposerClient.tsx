"use client";

import { useState } from "react";
import Link from "next/link";
import MusicPlayer from "./MusicPlayer";
import BackgroundVisualization from "./BackgroundVisualization";
import { VisStyle } from "@/types/visualizer";
import { slugify } from "@/utils/slugify";

interface ComposerClientProps {
  artist: {
    name: string;
    avatarUrl?: string;
    profile: {
      bio?: string;
      spotifyLink?: string;
      soundcloudLink?: string;
      discordUsername?: string;
      instagramLink?: string;
      contactEmail?: string;
      phoneNumber?: string;
      itchIoLink?: string;
      websiteLink?: string;
    };
    tracks: Array<{
      id: string;
      name: string;
      src: string;
      description?: string;
      tags?: string[];
    }>;
  };
  slug: string;
}

export default function ComposerClient({ artist, slug }: ComposerClientProps) {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [visStyle, setVisStyle] = useState<VisStyle>('Circular');

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative min-h-screen">
      <BackgroundVisualization analyser={analyser} visStyle={visStyle} />

      <main className="relative z-10 min-h-screen text-white p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <Link href="/" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
            </svg>
            Back to Discovery
          </Link>

          {/* Music Player */}
          {artist.tracks.length > 0 && (
            <div className="mb-8">
              <MusicPlayer
                tracks={artist.tracks}
                artistName={artist.name}
                avatarUrl={artist.avatarUrl}
                visStyle={visStyle}
                setVisStyle={setVisStyle}
                onViewProfile={() => {}}
                setAnalyser={setAnalyser}
                onNextArtist={() => {}}
                onPrevArtist={() => {}}
                artistKey={slug}
              />
            </div>
          )}

          <div className="bg-zinc-900/80 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="relative px-6 pt-12 pb-20 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px),
                  repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px)`
              }} />

              <div className="relative flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-black/40 backdrop-blur-md border-4 border-white/20 flex items-center justify-center overflow-hidden mb-6 shadow-xl">
                  {artist.avatarUrl ? (
                    <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-['Anton'] text-4xl tracking-tighter">
                      {getInitials(artist.name) || '👤'}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-['Anton'] text-white mb-2 text-center tracking-tight uppercase">
                  {artist.name}
                </h1>
                <p className="text-white/60 text-lg font-medium text-center">
                  Music Producer & Artist
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-10 grid md:grid-cols-3 gap-10">
              {/* Bio & Socials */}
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-4">About</h2>
                  <p className="text-white/80 leading-relaxed text-lg whitespace-pre-wrap">
                    {artist.profile.bio || "No biography provided."}
                  </p>
                </section>

                {/* Tracks List (Static representation for SEO) */}
                <section>
                  <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-4">Tracks</h2>
                  <div className="space-y-3">
                    {artist.tracks.map((track) => (
                      <div
                        key={track.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-4"
                      >
                        <div>
                          <h3 className="text-white font-bold">{track.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Array.isArray(track.tags) && track.tags.map((tag: string) => (
                              <span key={tag} className="text-[10px] uppercase tracking-wider text-white/30 border border-white/5 px-1.5 py-0.5 rounded bg-white/5">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-white/40 text-xs line-clamp-1 mt-1">{track.description}</p>
                        </div>
                      </div>
                    ))}
                    {artist.tracks.length === 0 && (
                      <p className="text-white/40 italic">No tracks available.</p>
                    )}
                  </div>
                </section>
              </div>

              {/* Links & Contact */}
              <div className="space-y-8">
                <section>
                  <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-4">Connect</h2>
                  <div className="space-y-2">
                    {artist.profile.websiteLink && (
                      <a href={artist.profile.websiteLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all">
                        <span>🌐</span> <span className="text-sm font-medium">Website</span>
                      </a>
                    )}
                    {artist.profile.spotifyLink && (
                      <a href={artist.profile.spotifyLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all">
                        <span>🎵</span> <span className="text-sm font-medium">Spotify</span>
                      </a>
                    )}
                    {artist.profile.soundcloudLink && (
                      <a href={artist.profile.soundcloudLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all">
                        <span>☁️</span> <span className="text-sm font-medium">SoundCloud</span>
                      </a>
                    )}
                    {artist.profile.itchIoLink && (
                      <a href={artist.profile.itchIoLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all">
                        <span>🎮</span> <span className="text-sm font-medium">itch.io</span>
                      </a>
                    )}
                  </div>
                </section>

                {(artist.profile.contactEmail || artist.profile.discordUsername || artist.profile.phoneNumber) && (
                  <section>
                    <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-4">Direct Contact</h2>
                    <div className="p-4 rounded-2xl bg-violet-600/10 border border-violet-500/20 space-y-4">
                      {artist.profile.contactEmail && (
                        <div>
                          <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Email</p>
                          <p className="text-white font-medium select-all">{artist.profile.contactEmail}</p>
                        </div>
                      )}
                      {artist.profile.discordUsername && (
                        <div>
                          <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Discord</p>
                          <p className="text-white font-medium select-all">{artist.profile.discordUsername}</p>
                        </div>
                      )}
                      {artist.profile.phoneNumber && (
                        <div>
                          <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Phone</p>
                          <p className="text-white font-medium select-all">{artist.profile.phoneNumber}</p>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
