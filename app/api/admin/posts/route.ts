import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Verify JWT from cookie
    const token = request.cookies.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const results = await query(
      `SELECT p.id, p.slug, p.title, p.excerpt, p.category, p.cover_image, p.likes, p.views, p.published, p.created_at,
       (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND approved = true) as comments_count
       FROM posts p
       ORDER BY p.created_at DESC`
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Posts list error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
