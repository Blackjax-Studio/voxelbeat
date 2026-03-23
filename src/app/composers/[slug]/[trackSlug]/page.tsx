import { getArtistBySlug } from '@/utils/artists';
import { slugify } from '@/utils/slugify';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string; trackSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, trackSlug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) return { title: 'Artist Not Found' };

  const track = artist.tracks.find((t: any) => slugify(t.name) === trackSlug);
  if (!track) return { title: 'Track Not Found' };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voxelbeat.com';
  const url = `${baseUrl}/composers/${slug}/${trackSlug}`;

  return {
    title: `${track.name} by ${artist.name} | Indie Game Music`,
    description: track.description || `Listen to ${track.name} by ${artist.name} on VoxelBeat.`,
    keywords: [
      ...(track.tags || []),
      artist.name,
      'indie game music',
      'game soundtrack',
      'VoxelBeat'
    ],
    alternates: {
      canonical: `/composers/${slug}/${trackSlug}`,
    },
    openGraph: {
      title: `${track.name} by ${artist.name} | VoxelBeat`,
      description: track.description || `Indie game track ${track.name} by ${artist.name}`,
      url: `/composers/${slug}/${trackSlug}`,
      images: artist.avatarUrl ? [{ url: artist.avatarUrl }] : [],
      type: 'music.song',
    },
    twitter: {
      card: 'summary',
      title: `${track.name} by ${artist.name} | VoxelBeat`,
      description: track.description || `Indie game track ${track.name} by ${artist.name}`,
      images: artist.avatarUrl ? [artist.avatarUrl] : [],
    }
  };
}

export default async function TrackPage({ params }: Props) {
  const { slug, trackSlug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) notFound();

  const track = artist.tracks.find((t: any) => slugify(t.name) === trackSlug);
  if (!track) notFound();

  const trackSchema = {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    "name": track.name,
    "description": track.description,
    "genre": Array.isArray(track.tags) ? track.tags : [],
    "keywords": Array.isArray(track.tags) ? track.tags?.join(', ') : '',
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://voxelbeat.com'}/composers/${slug}/${trackSlug}`,
    "byArtist": {
      "@type": "MusicGroup",
      "name": artist.name,
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://voxelbeat.com'}/composers/${slug}`
    },
    "inAlbum": {
      "@type": "MusicAlbum",
      "name": `${artist.name} Tracks`,
      "byArtist": {
        "@type": "MusicGroup",
        "name": artist.name
      }
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(trackSchema) }}
      />

      <div className="w-full max-w-4xl">
        <Link href={`/composers/${slug}`} className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
          </svg>
          Back to {artist.name}
        </Link>

        <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-6 md:p-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="w-48 h-48 rounded-2xl bg-black/40 border-2 border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-xl">
              {artist.avatarUrl ? (
                <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-['Anton'] text-6xl tracking-tighter">
                  {artist.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-['Anton'] text-white mb-2 tracking-tight uppercase">
                {track.name}
              </h1>
              <Link href={`/composers/${slug}`} className="text-xl text-violet-400 hover:text-violet-300 transition-colors block mb-6">
                by {artist.name}
              </Link>

              {track.description && (
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-6">
                  <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-3">Description</h3>
                  <p className="text-white/80 leading-relaxed italic">"{track.description}"</p>
                </div>
              )}

              {track.tags && track.tags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-3">Tags & Genres</h3>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {track.tags.map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/?search=${encodeURIComponent(tag)}`}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-white/60 hover:text-white transition-all"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link
                  href={`/?search=${encodeURIComponent(track.name)}`}
                  className="px-8 py-3 bg-violet-600 hover:bg-violet-700 rounded-full text-white font-bold transition-all hover:scale-105"
                >
                  Listen on VoxelBeat
                </Link>
                <Link
                  href={`/composers/${slug}`}
                  className="px-8 py-3 bg-white/10 hover:bg-white/15 rounded-full text-white font-bold transition-all"
                >
                  View Artist Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
