import { createClient } from '@/utils/supabase/server';
import pool from '@/utils/db/pool';
import { NextRequest, NextResponse } from 'next/server';
import s3Client, { S3_BUCKET } from '@/utils/s3/client';
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { filename, filetype } = await request.json();
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Get internal user ID to build path
    const { rows: userRows } = await pool.query(
      'SELECT id FROM users WHERE sub = $1',
      [user.id]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    const userId = userRows[0].id;
    // Path: /:userId/track/:timestamp-:filename
    const storageKey = `${userId}/track/${Date.now()}-${filename}`;

    const command = new CreateMultipartUploadCommand({
      Bucket: S3_BUCKET,
      Key: storageKey,
      ContentType: filetype || 'audio/mpeg',
    });

    const response = await s3Client.send(command);

    return NextResponse.json({
      uploadId: response.UploadId,
      storageKey: storageKey,
    });
  } catch (error) {
    console.error('Error initiating multipart upload:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
