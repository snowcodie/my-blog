import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Comment {
  id: number;
  post_id: number;
  author: string;
  email?: string;
  content: string;
  likes: number;
  approved: boolean;
  created_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const results = await query(
      'SELECT * FROM comments WHERE post_id = ? AND approved = true ORDER BY created_at DESC',
      [params.postId]
    ) as Comment[];

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const body = await request.json();
    const { author, email, content } = body;

    if (!author || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await query(
      'INSERT INTO comments (post_id, author, email, content) VALUES (?, ?, ?, ?)',
      [params.postId, author, email || null, content]
    );

    return NextResponse.json({ message: 'Comment posted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
