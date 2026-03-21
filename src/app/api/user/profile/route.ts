import { createClient } from '@/utils/supabase/server';
import pool from '@/utils/db/pool';
import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding, formatUserForEmbedding } from '@/utils/openai/embeddings';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE sub = $1',
      [user.id]
    );

    if (rows.length === 0) {
      // Create user if not exists
      const { rows: newRows } = await pool.query(
        'INSERT INTO users (email, sub) VALUES ($1, $2) RETURNING *',
        [user.email, user.id]
      );
      return NextResponse.json(newRows[0]);
    }

    const userData = rows[0];

    // If avatar_url is a storage key, get a presigned URL
    if (userData.avatar_url && !userData.avatar_url.startsWith('http')) {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      const { default: s3Client, S3_BUCKET } = await import('@/utils/s3/client');

      try {
        const command = new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: userData.avatar_url,
        });
        userData.avatar_url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      } catch (e) {
        console.error('Error generating avatar presigned URL:', e);
      }
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
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
    const {
      studio_name,
      bio,
      spotify_link,
      soundcloud_link,
      discord_username,
      instagram_link,
      contact_email,
      phone_number,
      itch_io_link,
      website_link,
      avatar_url
    } = body;

    // Generate embedding for public profile data
    const embeddingText = formatUserForEmbedding(studio_name || '', bio || '');
    const embedding = await generateEmbedding(embeddingText);

    const { rows } = await pool.query(
      `UPDATE users SET 
        studio_name = $1, 
        bio = $2, 
        spotify_link = $3, 
        soundcloud_link = $4, 
        discord_username = $5, 
        instagram_link = $6, 
        contact_email = $7, 
        phone_number = $8, 
        itch_io_link = $9, 
        website_link = $10,
        avatar_url = $11,
        embedding = $12,
        updated_at = NOW()
      WHERE sub = $13 RETURNING *`,
      [
        studio_name,
        bio,
        spotify_link,
        soundcloud_link,
        discord_username,
        instagram_link,
        contact_email,
        phone_number,
        itch_io_link,
        website_link,
        avatar_url,
        JSON.stringify(embedding),
        user.id
      ]
    );

    if (rows.length === 0) {
        // Fallback: if user doesn't exist yet, insert them
        const { rows: newRows } = await pool.query(
            `INSERT INTO users (
                email, sub, studio_name, bio, spotify_link, soundcloud_link, 
                discord_username, instagram_link, 
                contact_email, phone_number, itch_io_link, website_link, avatar_url, embedding
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
            RETURNING *`,
            [
                user.email, user.id, studio_name, bio, spotify_link, soundcloud_link,
                discord_username, instagram_link,
                contact_email, phone_number, itch_io_link, website_link, avatar_url,
                JSON.stringify(embedding)
            ]
        );
        return NextResponse.json(newRows[0]);
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
