import { createClient } from '@/utils/supabase/server';
import pool from '@/utils/db/pool';
import { NextRequest, NextResponse } from 'next/server';
import s3Client, { S3_BUCKET } from '@/utils/s3/client';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { generateEmbedding, formatTrackForEmbedding } from '@/utils/openai/embeddings';

// GET all tracks for the authenticated user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log(`[GET /api/tracks] Fetching tracks for Supabase user: ${user.id}`);

    // First, get the user's internal ID from our users table
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE sub = $1',
      [user.id]
    );

    if (userRows.length === 0) {
      console.log(`[GET /api/tracks] User not found in 'users' table for sub: ${user.id}`);
      return NextResponse.json([]);
    }

    const userId = userRows[0].id;
    console.log(`[GET /api/tracks] Successfully connected to database. Internal user ID: ${userId}`);

    // Fetch all tracks for this user
    console.log(`[GET /api/tracks] Querying tracks for user_id: ${userId}`);
    const { rows: trackRows } = await pool.query(
      'SELECT * FROM tracks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    if (trackRows.length === 0) {
      console.log(`[GET /api/tracks] Database connected. No tracks found for user_id: ${userId}`);
      return NextResponse.json([]);
    }

    console.log(`[GET /api/tracks] Found ${trackRows.length} tracks. Generating presigned URLs...`);

    // Add presigned URLs for each track
    const tracksWithUrls = await Promise.all(trackRows.map(async (track) => {
      try {
        const command = new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: track.storage_key,
        });

        const playbackUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        return {
          ...track,
          playback_url: playbackUrl
        };
      } catch (s3Error) {
        console.error(`[GET /api/tracks] Error generating presigned URL for track ${track.id}:`, s3Error);
        return {
          ...track,
          playback_url: null
        };
      }
    }));

    console.log(`[GET /api/tracks] Success! Returning ${tracksWithUrls.length} tracks.`);
    return NextResponse.json(tracksWithUrls);
  } catch (error) {
    console.error('[GET /api/tracks] CRITICAL DATABASE ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// POST create a new track record
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      tags,
      storage_key,
      filename,
      filetype,
      filesize
    } = body;

    // Validate required fields
    if (!title || !storage_key || !filename) {
      return NextResponse.json({ error: 'Title, storage_key, and filename are required' }, { status: 400 });
    }

    // Get internal user ID
    let { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE sub = $1',
      [user.id]
    );

    if (userRows.length === 0) {
      // Create user if they don't exist yet (this can happen if they never visited profile)
      const { rows: newUsers } = await pool.query(
        'INSERT INTO users (email, sub) VALUES ($1, $2) RETURNING id',
        [user.email, user.id]
      );
      userRows = newUsers;
    }

    const userId = userRows[0].id;

    // Generate embedding
    const embeddingText = formatTrackForEmbedding(title, description || '', tags || '');
    const embedding = await generateEmbedding(embeddingText);

    // Insert track
    const { rows } = await pool.query(
      `INSERT INTO tracks (
        title, description, tags, storage_key, filename, filetype, filesize, user_id, embedding
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        title,
        description || '',
        tags || '',
        storage_key,
        filename,
        filetype || '',
        filesize || 0,
        userId,
        JSON.stringify(embedding)
      ]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating track:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
