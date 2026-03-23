import pool from '@/utils/db/pool';
import { NextResponse } from 'next/server';
import s3Client, { S3_BUCKET } from '@/utils/s3/client';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET() {
  try {
    // Debug logging for environment variables (safe)
    console.log('[DEBUG_LOG] users/with-tracks: Starting request');
    console.log('[DEBUG_LOG] users/with-tracks: DATABASE_URL exists:', !!process.env.DATABASE_URL);
    if (process.env.DATABASE_URL) {
      console.log('[DEBUG_LOG] users/with-tracks: DATABASE_URL starts with:', process.env.DATABASE_URL.slice(0, 15));
    }

    // First, get all tracks using pool to avoid schema cache issues
    console.log('[DEBUG_LOG] users/with-tracks: Querying tracks');
    const { rows: tracks } = await pool.query('SELECT * FROM tracks');

    if (!tracks || tracks.length === 0) {
      console.log('No tracks found in database');
      return NextResponse.json([]);
    }

    // Get unique user IDs from tracks
    const userIds = [...new Set(tracks.map((track: any) => track.user_id))];

    // Fetch users using pool
    const { rows: users } = await pool.query(
      'SELECT * FROM users WHERE id = ANY($1) AND (phone_number IS NOT NULL OR contact_email IS NOT NULL OR discord_username IS NOT NULL) AND (studio_name IS NOT NULL AND studio_name != \'\') AND (bio IS NOT NULL AND bio != \'\')',
      [userIds]
    );

    // Group tracks by user
    const usersWithTracks = (users || []).map((user: any) => {
      const userTracks = tracks.filter((track: any) => track.user_id === user.id);

      // Randomize tracks for this user using Fisher-Yates shuffle
      for (let i = userTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [userTracks[i], userTracks[j]] = [userTracks[j], userTracks[i]];
      }

      return {
        ...user,
        tracks: userTracks
      };
    });

    // Filter out users with no tracks (shouldn't happen, but just in case)
    // AND double check contact info, studio name, and bio
    const filteredUsers = usersWithTracks.filter(user => 
      user.tracks && 
      user.tracks.length > 0 && 
      (user.phone_number || user.contact_email || user.discord_username) &&
      user.studio_name && user.studio_name.trim() !== '' &&
      user.bio && user.bio.trim() !== ''
    );

    // Randomize the order of users using Fisher-Yates shuffle
    for (let i = filteredUsers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filteredUsers[i], filteredUsers[j]] = [filteredUsers[j], filteredUsers[i]];
    }

    // Generate presigned URLs for all tracks and avatars
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
            (user.tracks || []).filter((track: any) => track).map(async (track: any) => {
              try {
                const command = new GetObjectCommand({
                  Bucket: S3_BUCKET,
                  Key: track.storage_key,
                });
                const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                return {
                  ...track,
                  url, // Add presigned URL
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

    return NextResponse.json(usersWithPresignedUrls);
  } catch (error) {
    console.error('Error in users/with-tracks route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
