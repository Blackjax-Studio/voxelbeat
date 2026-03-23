import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import s3Client, { S3_BUCKET } from '@/utils/s3/client';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { storageKey } = await request.json();
    if (!storageKey) {
      return NextResponse.json({ error: 'Missing storageKey' }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: storageKey,
    });

    // Generate a signed URL that's valid for 1 hour
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating presigned URL for streaming:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
