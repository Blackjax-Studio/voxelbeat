import { createClient } from '@/utils/supabase/server';
import pool from '@/utils/db/pool';
import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client, { S3_BUCKET } from '@/utils/s3/client';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ favorites: [] });
  }

  try {
    const { rows } = await pool.query(
      'SELECT favorite_tracks FROM users WHERE sub = $1',
      [user.id]
    );

    if (rows.length === 0 || !rows[0].favorite_tracks) {
      return NextResponse.json({ favorites: [] });
    }

    const favoriteIds = rows[0].favorite_tracks.split(',').filter(Boolean);

    if (favoriteIds.length === 0) {
      return NextResponse.json({ favorites: [] });
    }

    // Fetch the track details for these IDs
    const { rows: trackRows } = await pool.query(
      `SELECT t.*, u.studio_name as artist_name 
       FROM tracks t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.id = ANY($1::uuid[])`,
      [favoriteIds]
    );

    // Sort according to favoriteIds order and generate presigned URLs
    const sortedTracks = favoriteIds.map((id: string) => trackRows.find((t: any) => t.id === id)).filter(Boolean);

    const transformedTracks = await Promise.all(sortedTracks.map(async (track: any) => {
      let url = track.url;
      if (track.storage_key) {
        try {
          const command = new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: track.storage_key,
          });
          url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        } catch (error) {
          console.error(`Error generating presigned URL for track ${track.id}:`, error);
        }
      }

      return {
        id: track.id,
        name: track.title,
        src: url,
        description: track.description || '',
        tags: track.tags || [],
        artistName: track.artist_name || 'Unknown Artist',
        favoriteCount: track.favorite_count || 0
      };
    }));

    return NextResponse.json({ favorites: transformedTracks });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { trackId, action } = body;

    if (!trackId || !['add', 'remove'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // 1. Get current favorites
    const { rows } = await pool.query(
      'SELECT id, favorite_tracks FROM users WHERE sub = $1',
      [user.id]
    );

    let currentFavorites = rows.length > 0 && rows[0].favorite_tracks
      ? rows[0].favorite_tracks.split(',').filter(Boolean)
      : [];

    if (action === 'add') {
      if (!currentFavorites.includes(trackId)) {
        currentFavorites.push(trackId);
        // Increment favorite_count on track
        await pool.query(
          'UPDATE tracks SET favorite_count = favorite_count + 1 WHERE id = $1',
          [trackId]
        );
      }
    } else {
      if (currentFavorites.includes(trackId)) {
        currentFavorites = currentFavorites.filter((id: string) => id !== trackId);
        // Decrement favorite_count on track
        await pool.query(
          'UPDATE tracks SET favorite_count = GREATEST(0, favorite_count - 1) WHERE id = $1',
          [trackId]
        );
      }
    }

    const updatedFavoritesStr = currentFavorites.join(',');

    if (rows.length === 0) {
      // Create user if not exists (should rarely happen here as profile GET usually creates it)
      await pool.query(
        'INSERT INTO users (email, sub, favorite_tracks) VALUES ($1, $2, $3)',
        [user.email, user.id, updatedFavoritesStr]
      );
    } else {
      await pool.query(
        'UPDATE users SET favorite_tracks = $1, updated_at = NOW() WHERE sub = $2',
        [updatedFavoritesStr, user.id]
      );
    }

    return NextResponse.json({ success: true, favorites: currentFavorites });
  } catch (error) {
    console.error('Error updating favorites:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
