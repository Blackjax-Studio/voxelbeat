import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import s3Client, { S3_BUCKET } from '@/utils/s3/client';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET() {
  const supabase = await createClient();

  try {
    // First, get all tracks
    const { data: tracks, error: tracksError } = await supabase
      .from('tracks')
      .select('*');

    if (tracksError) {
      console.error('Error fetching tracks:', tracksError);
      return NextResponse.json({ error: 'Failed to fetch tracks', details: tracksError }, { status: 500 });
    }

    console.log('Fetched tracks:', tracks);

    if (!tracks || tracks.length === 0) {
      console.log('No tracks found in database');
      return NextResponse.json([]);
    }

    // Get unique user IDs from tracks
    const userIds = [...new Set(tracks.map((track: any) => track.user_id))];
    console.log('User IDs from tracks:', userIds);

    // Fetch users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users', details: usersError }, { status: 500 });
    }

    console.log('Fetched users:', users);

    // Group tracks by user
    const usersWithTracks = (users || []).map((user: any) => ({
      ...user,
      tracks: tracks.filter((track: any) => track.user_id === user.id)
    }));

    // Filter out users with no tracks (shouldn't happen, but just in case)
    const filteredUsers = usersWithTracks.filter(user => user.tracks && user.tracks.length > 0);

    // Generate presigned URLs for all tracks and avatars
    const usersWithPresignedUrls = await Promise.all(
      filteredUsers.map(async (user) => {
        let avatar_url = user.avatar_url;
        if (avatar_url && !avatar_url.startsWith('http')) {
          try {
            const command = new GetObjectCommand({
              Bucket: S3_BUCKET,
              Key: avatar_url,
            });
            avatar_url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
          } catch (e) {
            console.error(`Error generating avatar presigned URL for user ${user.id}:`, e);
          }
        }

        return {
          ...user,
          avatar_url,
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
