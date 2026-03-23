import { Suspense } from "react";
import { headers, cookies } from 'next/headers';
import Link from 'next/link';
import HomeClient from "@/components/HomeClient";
import { MessageBanner } from "@/components/MessageBanner";
import pool from '@/utils/db/pool';
import { slugify } from '@/utils/slugify';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client, { S3_BUCKET } from '@/utils/s3/client';

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

async function getInitialArtists() {
  try {
    // Fetch all tracks
    const { rows: tracks } = await pool.query('SELECT * FROM tracks');

    if (!tracks || tracks.length === 0) {
      return [];
    }

    // Get unique user IDs from tracks
    const userIds = [...new Set(tracks.map((track: any) => track.user_id))];

    // Fetch users with complete profiles
    const { rows: users } = await pool.query(
      `SELECT * FROM users
       WHERE id = ANY($1)
       AND (studio_name IS NOT NULL AND studio_name != '')`,
      [userIds]
    );

    // Group tracks by user
    const usersWithTracks = users.map((user: any) => ({
      ...user,
      tracks: tracks.filter((track: any) => track.user_id === user.id)
    }));

    // Filter users with tracks
    const filteredUsers = usersWithTracks.filter(user => user.tracks && user.tracks.length > 0);

    // Randomize the order of users using Fisher-Yates shuffle with timestamp seed
    const seed = Date.now();
    const random = (i: number) => {
      const x = Math.sin(seed + i) * 10000;
      return x - Math.floor(x);
    };

    for (let i = filteredUsers.length - 1; i > 0; i--) {
      const j = Math.floor(random(i) * (i + 1));
      [filteredUsers[i], filteredUsers[j]] = [filteredUsers[j], filteredUsers[i]];
    }

    // Generate presigned URLs for avatars and tracks
    const usersWithPresignedUrls = await Promise.all(
      filteredUsers.map(async (user) => {
        let avatar_url = user.avatar_url;
        let avatar_display_url = avatar_url;
        if (avatar_url && !avatar_url.startsWith('http')) {
          try {
            const command = new GetObjectCommand({
              Bucket: S3_BUCKET,
              Key: avatar_url,
            });
            avatar_display_url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
          } catch (e) {
            console.error(`Error generating avatar presigned URL for user ${user.id}:`, e);
          }
        }

        return {
          ...user,
          avatar_url,
          avatar_display_url,
          tracks: await Promise.all(
            user.tracks.map(async (track: any) => {
              try {
                const command = new GetObjectCommand({
                  Bucket: S3_BUCKET,
                  Key: track.storage_key,
                });
                const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                return {
                  ...track,
                  url,
                };
              } catch (error) {
                console.error(`Error generating presigned URL for track ${track.id}:`, error);
                return {
                  ...track,
                  url: null,
                };
              }
            })
          ),
        };
      })
    );

    // Transform to expected format
    const transformedArtists = usersWithPresignedUrls.map((user: any) => ({
      name: user.studio_name || 'Unknown Artist',
      avatarUrl: user.avatar_display_url || user.avatar_url || '',
      profile: {
        studioName: user.studio_name || '',
        avatarUrl: user.avatar_display_url || user.avatar_url || '',
        bio: user.bio || '',
        spotifyLink: user.spotify_link || '',
        soundcloudLink: user.soundcloud_link || '',
        discordUsername: user.discord_username || '',
        instagramLink: user.instagram_link || '',
        contactEmail: user.contact_email || '',
        phoneNumber: user.phone_number || '',
        itchIoLink: user.itch_io_link || '',
        websiteLink: user.website_link || '',
        tracks: user.tracks.map((track: any) => ({
          id: track.id,
          name: track.title,
          src: track.url,
          description: track.description || '',
          tags: track.tags || [],
        }))
          .filter((track: any) => track.src)
      },
      tracks: user.tracks.map((track: any) => ({
        id: track.id,
        name: track.title,
        src: track.url,
        description: track.description || '',
        tags: track.tags || [],
      }))
        .filter((track: any) => track.src)
    }));

    return transformedArtists;
  } catch (error) {
    console.error('Error fetching initial artists:', error);
    return [];
  }
}

export default async function Home() {
  // Force dynamic rendering by reading headers and cookies
  await headers();
  await cookies();

  const initialArtists = await getInitialArtists();

  const artistsSchema = initialArtists.map(artist => ({
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": artist.name,
    "description": artist.profile?.bio,
    "image": artist.avatarUrl,
    "track": Array.isArray(artist.tracks) ? artist.tracks.map((track: any) => ({
      "@type": "MusicRecording",
      "name": track.name,
      "description": track.description,
      "genre": Array.isArray(track.tags) ? track.tags : [],
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://voxelbeat.com'}/composers/${slugify(artist.name)}/${slugify(track.name)}`
    })) : []
  }));

  return (
    <>
      {/* Dynamic Schema.org for Artists */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(artistsSchema) }}
      />

      <Suspense fallback={null}>
        <MessageBanner />
      </Suspense>
      <HomeClient initialArtists={initialArtists} />

      {/* Fallback content for SEO and No-JS users */}
      <noscript>
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: '#eee', backgroundColor: '#111' }}>
          <header>
            <img src="/lumi-logo-2.png" alt="VoxelBeat Logo" width="100" height="100" />
            <h1>VoxelBeat — Discover Indie Game Music</h1>
            <p>The premier platform for indie game musicians and developers to connect. Find your game's unique sound with vectorized search.</p>
          </header>
          <main>
            <section>
              <h2>Platform Features</h2>
              <ul>
                <li><strong>Semantic Discovery</strong>: Find music by feel — describe your scene and our vectorized search does the rest</li>
                <li><strong>Vibe Matching</strong>: Search for 'chilly, mysterious, and lo-fi' to find the exact atmosphere for your level</li>
                <li><strong>Built for Games</strong>: Genre and mood categories designed for game audio, not pop charts</li>
                <li><strong>Composer Profiles</strong>: Every artist gets a searchable, shareable portfolio page</li>
                <li><strong>Direct Connect</strong>: Reach the developers who need your sound, no middleman</li>
                <li><strong>Developer-First</strong>: Find the right track for your scene in seconds, not hours</li>
              </ul>
            </section>
            <section>
              <h2>Featured Artists & Composers</h2>
              {initialArtists.map((artist, index) => (
                <article key={index} style={{ marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                  <h3>{artist.name}</h3>
                  {artist.avatarUrl && <img src={artist.avatarUrl} alt={`${artist.name} avatar`} width="60" height="60" style={{ borderRadius: '50%' }} />}
                  {artist.profile?.bio && <p><strong>Bio:</strong> {artist.profile.bio}</p>}

                  <h4>Music Catalog</h4>
                  <ul>
                    {artist.tracks.map((track: any, tIndex: number) => (
                      <li key={tIndex}>
                        <Link href={`/composers/${slugify(artist.name)}/${slugify(track.name)}`} className="text-violet-400 hover:text-violet-300">
                          <strong>{track.name}</strong>
                        </Link>
                        {Array.isArray(track.tags) && track.tags.length > 0 && (
                          <span className="text-xs text-white/30 ml-2">
                            ({track.tags.join(', ')})
                          </span>
                        )}
                        {track.description && `: ${track.description}`}
                      </li>
                    ))}
                  </ul>
                  {(artist.profile?.websiteLink || artist.profile?.spotifyLink || artist.profile?.soundcloudLink) && (
                    <p>
                      <strong>Links:</strong>
                      {artist.profile?.websiteLink && <a href={artist.profile.websiteLink} style={{ marginLeft: '10px' }}>Website</a>}
                      {artist.profile?.spotifyLink && <a href={artist.profile.spotifyLink} style={{ marginLeft: '10px' }}>Spotify</a>}
                      {artist.profile?.soundcloudLink && <a href={artist.profile.soundcloudLink} style={{ marginLeft: '10px' }}>SoundCloud</a>}
                    </p>
                  )}
                </article>
              ))}
            </section>
            <section id="terms">
              <h2>Terms of Service</h2>
              <p>VoxelBeat is operated by Blackjax, LLC. By using the service, you agree to our terms. Users retain ownership of their content while granting VoxelBeat a license to host and promote it.</p>
              <p>For the full, current Terms of Service, please visit our platform with JavaScript enabled.</p>
            </section>
            <section id="privacy">
              <h2>Privacy Policy</h2>
              <p>We respect your privacy. We collect account information to provide our services and do not sell your personal data to third parties. We use industry-standard security measures to protect your information.</p>
            </section>
            <section id="contact">
              <h2>Contact VoxelBeat</h2>
              <p>Have questions? Reach out to us at <a href="mailto:contact@blackjaxstudio.com">contact@blackjaxstudio.com</a>.</p>
            </section>
          </main>
          <footer>
            <p>© 2026 VoxelBeat | Blackjax, LLC</p>
          </footer>
        </div>
      </noscript>
    </>
  );
}
