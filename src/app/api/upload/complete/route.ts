import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import s3Client, { S3_BUCKET } from '@/utils/s3/client';
import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { storageKey, uploadId, parts } = await request.json();
    if (!storageKey || !uploadId || !parts) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const command = new CompleteMultipartUploadCommand({
      Bucket: S3_BUCKET,
      Key: storageKey,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.sort((a: any, b: any) => a.PartNumber - b.PartNumber),
      },
    });

    const response = await s3Client.send(command);

    return NextResponse.json({
      location: response.Location,
      key: response.Key,
    });
  } catch (error) {
    console.error('Error completing multipart upload:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
