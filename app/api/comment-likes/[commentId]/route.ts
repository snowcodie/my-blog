import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const body = await request.json();
    const { likes } = body;

    await query(
      'UPDATE comments SET likes = ? WHERE id = ?',
      [likes, params.commentId]
    );

    return NextResponse.json({ message: 'Comment updated successfully' });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}
