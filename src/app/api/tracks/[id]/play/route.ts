import pool from '@/utils/db/pool';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: trackId } = await params;

    // Increment play count
    const { rows } = await pool.query(
      'UPDATE tracks SET num_plays = num_plays + 1 WHERE id = $1 RETURNING num_plays',
      [trackId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      num_plays: rows[0].num_plays
    });
  } catch (error) {
    console.error('Error incrementing play count:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
