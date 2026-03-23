import pool from '@/utils/db/pool';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client, { S3_BUCKET } from '@/utils/s3/client';
import { slugify } from './slugify';

export async function getArtistBySlug(slug: string) {
  try {
    // This is a bit tricky because we don't have a slug column.
    // For now, we fetch all users with studio_name and find the match.
    // In a larger app, we'd add a slug column and index it.
    const { rows: users } = await pool.query(
      `SELECT * FROM users 
       WHERE studio_name IS NOT NULL 
       AND studio_name != ''`
    );

    const user = users.find(u => slugify(u.studio_name) === slug);

    if (!user) return null;

    // Fetch tracks for this user
    const { rows: tracks } = await pool.query(
      'SELECT * FROM tracks WHERE user_id = $1',
      [user.id]
    );

    // Generate presigned URLs
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

    const tracksWithUrls = await Promise.all(
      tracks.map(async (track: any) => {
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
          return { ...track, url: null };
        }
      })
    );

    return {
      name: user.studio_name,
      avatarUrl: avatar_display_url,
      profile: {
        studioName: user.studio_name,
        avatarUrl: avatar_display_url,
        bio: user.bio,
        spotifyLink: user.spotify_link,
        soundcloudLink: user.soundcloud_link,
        discordUsername: user.discord_username,
        instagramLink: user.instagram_link,
        contactEmail: user.contact_email,
        phoneNumber: user.phone_number,
        itchIoLink: user.itch_io_link,
        websiteLink: user.website_link,
      },
      tracks: tracksWithUrls
        .map((track: any) => ({
          id: track.id,
          name: track.title,
          src: track.url,
          description: track.description || '',
          tags: track.tags || [],
        }))
        .filter((track: any) => track.src)
    };
  } catch (error) {
    console.error('Error in getArtistBySlug:', error);
    return null;
  }
}

export async function getAllArtists() {
  try {
    console.log('[DEBUG_LOG] getAllArtists: Querying tracks');
    const { rows: tracks } = await pool.query('SELECT user_id FROM tracks');
    console.log(`[DEBUG_LOG] getAllArtists: Found ${tracks.length} tracks total`);
    
    if (tracks.length === 0) {
      console.log('[DEBUG_LOG] getAllArtists: Warning - No tracks found in DB');
      return [];
    }
    
    const userIds = [...new Set(tracks.map((track: any) => track.user_id))];
    console.log(`[DEBUG_LOG] getAllArtists: Found ${userIds.length} unique userIds with tracks`);

    console.log('[DEBUG_LOG] getAllArtists: Querying users with studio_name');
    const { rows: users } = await pool.query(
      `SELECT id, studio_name, updated_at FROM users
       WHERE id = ANY($1)
       AND (studio_name IS NOT NULL AND studio_name != '')`,
      [userIds]
    );
    console.log(`[DEBUG_LOG] getAllArtists: Found ${users.length} matching users with studio_name`);

    return users.map(u => ({
      ...u,
      slug: slugify(u.studio_name)
    }));
  } catch (error) {
    console.error('[DEBUG_LOG] Error in getAllArtists:', error);
    return [];
  }
}
