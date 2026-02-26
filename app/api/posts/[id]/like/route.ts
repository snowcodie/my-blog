import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/posts/[id]/like - Like a post (one per user token)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userToken } = await request.json();

    if (!userToken) {
      return NextResponse.json({ error: 'User token required' }, { status: 400 });
    }

    const postId = parseInt(params.id);

    // Check if user has already liked this post
    const existingLikes: any = await query(
      'SELECT id FROM user_post_likes WHERE user_token = ? AND post_id = ?',
      [userToken, postId]
    );

    if (Array.isArray(existingLikes) && existingLikes.length > 0) {
      return NextResponse.json({ 
        error: 'Already liked', 
        hasLiked: true 
      }, { status: 400 });
    }

    // Add like record
    await query(
      'INSERT INTO user_post_likes (user_token, post_id) VALUES (?, ?)',
      [userToken, postId]
    );

    // Increment post likes count
    await query(
      'UPDATE posts SET likes = likes + 1 WHERE id = ?',
      [postId]
    );

    // Get updated likes count
    const result: any = await query(
      'SELECT likes FROM posts WHERE id = ?',
      [postId]
    );

    return NextResponse.json({ 
      success: true, 
      likes: result[0]?.likes || 0,
      hasLiked: true
    });
  } catch (error: any) {
    console.error('Error liking post:', error);
    return NextResponse.json({ 
      error: 'Failed to like post', 
      details: error.message 
    }, { status: 500 });
  }
}

// GET /api/posts/[id]/like - Check if user has liked this post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userToken = searchParams.get('userToken');

    if (!userToken) {
      return NextResponse.json({ hasLiked: false });
    }

    const postId = parseInt(params.id);

    const existingLikes: any = await query(
      'SELECT id FROM user_post_likes WHERE user_token = ? AND post_id = ?',
      [userToken, postId]
    );

    return NextResponse.json({ 
      hasLiked: Array.isArray(existingLikes) && existingLikes.length > 0 
    });
  } catch (error: any) {
    console.error('Error checking like status:', error);
    return NextResponse.json({ 
      error: 'Failed to check like status', 
      hasLiked: false 
    }, { status: 500 });
  }
}
