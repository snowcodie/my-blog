import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
      'SELECT c.id, c.post_id, c.author, c.email, c.content, c.likes, c.created_at, p.slug, p.title FROM comments c JOIN posts p ON c.post_id = p.id WHERE c.approved = false ORDER BY c.created_at ASC'
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Pending comments error:', error);
    return NextResponse.json({ error: 'Failed to fetch pending comments' }, { status: 500 });
  }
}
