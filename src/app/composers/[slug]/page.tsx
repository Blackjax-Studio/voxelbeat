import { getArtistBySlug } from '@/utils/artists';
import { slugify } from '@/utils/slugify';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) return { title: 'Artist Not Found' };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voxelbeat.com';
  const url = `${baseUrl}/composers/${slug}`;

  return {
    title: `${artist.name} | Indie Game Composer`,
    description: artist.profile.bio ? artist.profile.bio.substring(0, 160) : `Check out the music and portfolio of ${artist.name} on VoxelBeat.`,
    alternates: {
      canonical: `/composers/${slug}`,
    },
    openGraph: {
      title: `${artist.name} | VoxelBeat`,
      description: artist.profile.bio || `Indie game music by ${artist.name}`,
      url: `/composers/${slug}`,
      images: artist.avatarUrl ? [{ url: artist.avatarUrl }] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${artist.name} | VoxelBeat`,
      description: artist.profile.bio || `Indie game music by ${artist.name}`,
      images: artist.avatarUrl ? [artist.avatarUrl] : [],
    }
  };
}

export default async function ArtistProfilePage({ params }: Props) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) notFound();

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const artistsSchema = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": artist.name,
    "description": artist.profile.bio,
    "image": artist.avatarUrl,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://voxelbeat.com'}/composers/${slug}`,
    "track": Array.isArray(artist.tracks) ? artist.tracks.map((track: any) => ({
      "@type": "MusicRecording",
      "name": track.name,
      "description": track.description,
      "genre": Array.isArray(track.tags) ? track.tags : [],
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://voxelbeat.com'}/composers/${slug}/${slugify(track.name)}`
    })) : []
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(artistsSchema) }}
      />

      <div className="w-full max-w-4xl">
        <Link href="/" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
          </svg>
          Back to Discovery
        </Link>

        <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
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
                  {artist.tracks.map((track: any) => (
                      <Link
                        key={track.id}
                        href={`/composers/${slug}/${slugify(track.name)}`}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all"
                      >
                        <div>
                          <h3 className="text-white font-bold group-hover:text-violet-400 transition-colors">{track.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Array.isArray(track.tags) && track.tags.map((tag: string) => (
                              <span key={tag} className="text-[10px] uppercase tracking-wider text-white/30 border border-white/5 px-1.5 py-0.5 rounded bg-white/5">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-white/40 text-xs line-clamp-1 mt-1">{track.description}</p>
                        </div>
                        <div className="text-white/20 group-hover:text-violet-400 transition-colors">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </Link>
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
  );
}
