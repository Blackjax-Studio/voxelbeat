import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import pool from '@/utils/db/pool';
import { NextResponse } from 'next/server';
import s3Client, { S3_BUCKET } from '@/utils/s3/client';
import { DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  try {
    // 1. Get internal user ID and avatar_url
    const { rows: userRows } = await pool.query(
      'SELECT id, avatar_url FROM users WHERE sub = $1',
      [userId]
    );

    if (userRows.length > 0) {
      const internalUserId = userRows[0].id;
      const avatarUrl = userRows[0].avatar_url;

      // 2. Delete tracks from S3
      const { rows: trackRows } = await pool.query(
        'SELECT storage_key FROM tracks WHERE user_id = $1',
        [internalUserId]
      );

      for (const track of trackRows) {
        if (track.storage_key) {
          try {
            await s3Client.send(new DeleteObjectCommand({
              Bucket: S3_BUCKET,
              Key: track.storage_key,
            }));
          } catch (s3Error) {
            console.error(`Error deleting track ${track.storage_key} from S3:`, s3Error);
          }
        }
      }

      // 3. Delete avatar from S3
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        try {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: S3_BUCKET,
            Key: avatarUrl,
          }));
        } catch (s3Error) {
          console.error(`Error deleting avatar ${avatarUrl} from S3:`, s3Error);
        }
      }

      // 4. Delete user from PostgreSQL (this will cascade delete tracks due to ON DELETE CASCADE)
      await pool.query('DELETE FROM users WHERE id = $1', [internalUserId]);
    }

    // 5. Delete user from Supabase Auth
    const adminClient = await createAdminClient();
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user from Supabase Auth:', deleteError);
      return NextResponse.json({ error: 'Failed to delete user from authentication service' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error in account deletion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
