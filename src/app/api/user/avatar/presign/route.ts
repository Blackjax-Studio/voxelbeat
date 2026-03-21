import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import s3Client, { S3_BUCKET } from '@/utils/s3/client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { filename, filetype } = await request.json();

    if (!filename || !filetype) {
      return NextResponse.json({ error: 'Filename and filetype are required' }, { status: 400 });
    }

    const timestamp = Date.now();
    const storageKey = `avatars/${user.id}/${timestamp}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: storageKey,
      ContentType: filetype,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({ url, storageKey });
  } catch (error) {
    console.error('Error generating presigned URL for avatar:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
