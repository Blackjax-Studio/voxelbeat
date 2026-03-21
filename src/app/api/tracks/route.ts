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
    // First, get the user's internal ID from our users table
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE sub = $1',
      [user.id]
    );

    if (userRows.length === 0) {
      return NextResponse.json([]);
    }

    const userId = userRows[0].id;

    // Fetch all tracks for this user
    const { rows: trackRows } = await pool.query(
      'SELECT * FROM tracks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    // Add presigned URLs for each track
    const tracksWithUrls = await Promise.all(trackRows.map(async (track) => {
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: track.storage_key,
      });
      
      const playbackUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      
      return {
        ...track,
        playback_url: playbackUrl
      };
    }));

    return NextResponse.json(tracksWithUrls);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
