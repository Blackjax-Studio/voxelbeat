import pool from '@/utils/db/pool';
import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/utils/openai/embeddings';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client, { S3_BUCKET } from '@/utils/s3/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchQuery, selectedTags } = body;

    // Combine search query and tags into a semantic search string
    let searchText = '';
    if (searchQuery && searchQuery.trim()) {
      searchText += searchQuery.trim();
    }
    if (selectedTags && selectedTags.length > 0) {
      searchText += (searchText ? ' ' : '') + selectedTags.join(' ');
    }

    // If no search criteria, return all users with tracks (default behavior)
    if (!searchText) {
      const { rows: tracks } = await pool.query('SELECT * FROM tracks');
      if (!tracks || tracks.length === 0) {
        return NextResponse.json([]);
      }

      const userIds = [...new Set(tracks.map((track: any) => track.user_id))];
      const { rows: users } = await pool.query(
        'SELECT * FROM users WHERE id = ANY($1) AND (phone_number IS NOT NULL OR contact_email IS NOT NULL OR discord_username IS NOT NULL) AND (studio_name IS NOT NULL AND studio_name != \'\') AND (bio IS NOT NULL AND bio != \'\')',
        [userIds]
      );

      const usersWithTracks = await enrichUsersWithTracks(users, tracks);
      return NextResponse.json(usersWithTracks);
    }

    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(searchText);
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    // Search tracks using vector similarity (cosine distance)
    // Lower distance = more similar
    const { rows: trackResults } = await pool.query(
      `SELECT
        t.*,
        u.studio_name,
        u.bio,
        u.avatar_url,
        u.spotify_link,
        u.soundcloud_link,
        u.discord_username,
        u.instagram_link,
        u.contact_email,
        u.phone_number,
        u.itch_io_link,
        u.website_link,
        1 - (t.embedding <=> $1::vector) as similarity
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.embedding IS NOT NULL
         AND (u.phone_number IS NOT NULL OR u.contact_email IS NOT NULL OR u.discord_username IS NOT NULL)
         AND (u.studio_name IS NOT NULL AND u.studio_name != '')
         AND (u.bio IS NOT NULL AND u.bio != '')
       ORDER BY t.embedding <=> $1::vector
       LIMIT 50`,
      [embeddingString]
    );

    // Group tracks by user
    const userMap = new Map();
    for (const track of trackResults) {
      const userId = track.user_id;

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          studio_name: track.studio_name,
          bio: track.bio,
          avatar_url: track.avatar_url,
          spotify_link: track.spotify_link,
          soundcloud_link: track.soundcloud_link,
          discord_username: track.discord_username,
          instagram_link: track.instagram_link,
          contact_email: track.contact_email,
          phone_number: track.phone_number,
          itch_io_link: track.itch_io_link,
          website_link: track.website_link,
          tracks: [],
          maxSimilarity: track.similarity || 0,
        });
      }

      const user = userMap.get(userId);
      user.tracks.push({
        id: track.id,
        title: track.title,
        description: track.description,
        tags: track.tags,
        storage_key: track.storage_key,
        filename: track.filename,
        filetype: track.filetype,
        filesize: track.filesize,
        num_plays: track.num_plays,
        favorite_count: track.favorite_count,
        created_at: track.created_at,
        updated_at: track.updated_at,
        similarity: track.similarity,
      });

      // Update max similarity for the user
      if (track.similarity > user.maxSimilarity) {
        user.maxSimilarity = track.similarity;
      }
    }

    // Convert map to array and sort by max similarity
    let users = Array.from(userMap.values());
    users.sort((a, b) => b.maxSimilarity - a.maxSimilarity);

    // Generate presigned URLs for tracks and avatars
    const usersWithPresignedUrls = await Promise.all(
      users.map(async (user) => {
        let avatar_url = user.avatar_url;
        let avatar_display_url = avatar_url;
        if (avatar_url && !avatar_url.startsWith('http')) {
          try {
            const command = new GetObjectCommand({
              Bucket: S3_BUCKET,
              Key: avatar_url,
            });
            avatar_display_url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
          } catch (e) {
            console.error(`Error generating avatar presigned URL for user ${user.id}:`, e);
          }
        }

        return {
          ...user,
          avatar_url,
          avatar_display_url,
          tracks: await Promise.all(
            user.tracks.map(async (track: any) => {
              try {
                const command = new GetObjectCommand({
                  Bucket: S3_BUCKET,
                  Key: track.storage_key,
                });
                const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                return {
                  ...track,
                  url,
                };
              } catch (error) {
                console.error(`Error generating presigned URL for track ${track.id}:`, error);
                return {
                  ...track,
                  url: null,
                };
              }
            })
          ),
        };
      })
    );

    return NextResponse.json(usersWithPresignedUrls);
  } catch (error) {
    console.error('Error in search route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function to enrich users with tracks and presigned URLs
async function enrichUsersWithTracks(users: any[], tracks: any[]) {
  const usersWithTracks = users.map((user: any) => ({
    ...user,
    tracks: tracks.filter((track: any) => track.user_id === user.id)
  }));

  const filteredUsers = usersWithTracks.filter(user =>
    user.tracks &&
    user.tracks.length > 0 &&
    (user.phone_number || user.contact_email || user.discord_username) &&
    user.studio_name && user.studio_name.trim() !== '' &&
    user.bio && user.bio.trim() !== ''
  );

  const usersWithPresignedUrls = await Promise.all(
    filteredUsers.map(async (user) => {
      let avatar_url = user.avatar_url;
      let avatar_display_url = avatar_url;
      if (avatar_url && !avatar_url.startsWith('http')) {
        try {
          const command = new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: avatar_url,
          });
          avatar_display_url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        } catch (e) {
          console.error(`Error generating avatar presigned URL for user ${user.id}:`, e);
        }
      }

      return {
        ...user,
        avatar_url,
        avatar_display_url,
        tracks: await Promise.all(
          user.tracks.map(async (track: any) => {
            try {
              const command = new GetObjectCommand({
                Bucket: S3_BUCKET,
                Key: track.storage_key,
              });
              const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
              return {
                ...track,
                url,
              };
            } catch (error) {
              console.error(`Error generating presigned URL for track ${track.id}:`, error);
              return {
                ...track,
                url: null,
              };
            }
          })
        ),
      };
    })
  );

  return usersWithPresignedUrls;
}
