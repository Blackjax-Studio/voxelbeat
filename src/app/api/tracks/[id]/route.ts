import { createClient } from '@/utils/supabase/server';
import pool from '@/utils/db/pool';
import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding, formatTrackForEmbedding } from '@/utils/openai/embeddings';

// GET a specific track
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { rows } = await pool.query(
      `SELECT t.* FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1 AND u.sub = $2`,
      [id, user.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching track:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH update track metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const {
      title,
      description,
      tags
    } = body;

    // First ensure the track belongs to the user
    const { rows: checkRows } = await pool.query(
      `SELECT t.id FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1 AND u.sub = $2`,
      [id, user.id]
    );

    if (checkRows.length === 0) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // If any relevant fields changed, we should ideally re-generate the embedding.
    // To do this accurately, we need the current values for fields not provided in the body.
    const { rows: currentTrackRows } = await pool.query(
      'SELECT title, description, tags FROM tracks WHERE id = $1',
      [id]
    );
    const currentTrack = currentTrackRows[0];

    const newTitle = title !== undefined ? title : currentTrack.title;
    const newDescription = description !== undefined ? description : currentTrack.description;
    const newTags = tags !== undefined ? tags : currentTrack.tags;

    const embeddingText = formatTrackForEmbedding(newTitle, newDescription, newTags);
    const embedding = await generateEmbedding(embeddingText);

    // Update the track record
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCounter = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramCounter++}`);
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCounter++}`);
      updateValues.push(description);
    }
    if (tags !== undefined) {
      updateFields.push(`tags = $${paramCounter++}`);
      updateValues.push(tags);
    }

    // Always update embedding
    updateFields.push(`embedding = $${paramCounter++}`);
    updateValues.push(JSON.stringify(embedding));

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateValues.push(id);
    const { rows } = await pool.query(
      `UPDATE tracks SET ${updateFields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCounter} RETURNING *`,
      updateValues
    );

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating track:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a track record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { rowCount } = await pool.query(
      `DELETE FROM tracks 
       WHERE id = $1 AND user_id IN (SELECT id FROM users WHERE sub = $2)`,
      [id, user.id]
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('Error deleting track:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
