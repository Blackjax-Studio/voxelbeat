import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import s3Client, { S3_BUCKET } from '@/utils/s3/client';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { storageKey, uploadId, partNumber } = await request.json();
    if (!storageKey || !uploadId || !partNumber) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const command = new UploadPartCommand({
      Bucket: S3_BUCKET,
      Key: storageKey,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    // Generate a signed URL that's valid for 1 hour
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating presigned URL for part:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
