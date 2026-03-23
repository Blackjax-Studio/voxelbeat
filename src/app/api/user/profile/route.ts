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

    const userData = { ...rows[0] };
    userData.avatar_display_url = userData.avatar_url;

    // If avatar_url is a storage key, get a presigned URL for display
    if (userData.avatar_url && !userData.avatar_url.startsWith('http')) {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      const { default: s3Client, S3_BUCKET } = await import('@/utils/s3/client');

      try {
        const command = new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: userData.avatar_url,
        });
        userData.avatar_display_url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
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

    // Validation patterns
    const urlPattern = /^https?:\/\/.+/i;
    const spotifyPattern = /^https:\/\/open\.spotify\.com\/(artist|album|track|playlist|user)\/.+/i;
    const soundcloudPattern = /^https:\/\/soundcloud\.com\/.+/i;
    const instagramPattern = /^https:\/\/(www\.)?instagram\.com\/.+/i;
    const itchIoPattern = /^https:\/\/.+\.itch\.io\/?/i;

    const errors: string[] = [];
    if (spotify_link && !spotifyPattern.test(spotify_link)) errors.push('Invalid Spotify link');
    if (soundcloud_link && !soundcloudPattern.test(soundcloud_link)) errors.push('Invalid SoundCloud link');
    if (instagram_link && !instagramPattern.test(instagram_link)) errors.push('Invalid Instagram link');
    if (itch_io_link && !itchIoPattern.test(itch_io_link)) errors.push('Invalid itch.io link');
    if (website_link && !urlPattern.test(website_link)) errors.push('Invalid website URL');

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
    }

    let finalAvatarUrl = avatar_url;
    if (finalAvatarUrl && finalAvatarUrl.includes('X-Amz-Algorithm=')) {
      try {
        const url = new URL(finalAvatarUrl);
        finalAvatarUrl = url.pathname.split('/').slice(2).join('/');
        if (url.hostname.includes('s3')) {
            const pathParts = url.pathname.split('/').filter(Boolean);
            if (pathParts[0] === 'voxelbeat-prod' || pathParts[0] === 'voxelbeat-dev') {
                finalAvatarUrl = pathParts.slice(1).join('/');
            } else {
                finalAvatarUrl = pathParts.join('/');
            }
        }
      } catch (e) {
        console.error('Error parsing avatar URL:', e);
      }
    }

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
        finalAvatarUrl,
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
                contact_email, phone_number, itch_io_link, website_link, finalAvatarUrl,
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
