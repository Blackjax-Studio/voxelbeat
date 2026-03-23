import { getArtistBySlug } from '@/utils/artists';
import { slugify } from '@/utils/slugify';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ComposerClient from '@/components/ComposerClient';

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(artistsSchema) }}
      />
      <ComposerClient artist={artist} slug={slug} />
    </>
  );
}
