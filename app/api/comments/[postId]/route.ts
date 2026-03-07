import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateFunnyName, buildCommentTree } from '@/lib/commentUtils';

interface Comment {
  id: number;
  post_id: number;
  parent_comment_id?: number;
  author: string;
  email?: string;
  is_anonymous: boolean;
  generated_name?: string;
  content: string;
  likes: number;
  approved: boolean;
  created_at: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    // Validate postId is numeric
    const postId = parseInt(params.postId);
    if (isNaN(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    const results = await query(
      'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC',
      [postId]
    ) as Comment[];

    // Build tree structure
    const commentTree = buildCommentTree(results);

    return NextResponse.json(commentTree);
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
    const { author, email, content, isAnonymous, parentCommentId } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Check if the request is from admin (author)
    const adminToken = request.headers.get('x-admin-token') || request.cookies.get('adminToken')?.value;
    const isAdmin = adminToken === process.env.ADMIN_TOKEN;

    let finalAuthor = author;
    let generatedName = null;
    let anonymous = false;

    // Generate funny name for anonymous comments (but not for admin)
    if (!isAdmin && (isAnonymous || !author)) {
      anonymous = true;
      generatedName = generateFunnyName();
      finalAuthor = 'Anonymous';
    }

    await query(
      'INSERT INTO comments (post_id, parent_comment_id, author, email, is_anonymous, generated_name, is_author, content, approved) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [params.postId, parentCommentId || null, finalAuthor, email || null, anonymous, generatedName, isAdmin, content, true]
    );

    return NextResponse.json({ 
      message: 'Comment posted successfully',
      generatedName: anonymous ? generatedName : null,
      isAuthor: isAdmin
    }, { status: 201 });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}
