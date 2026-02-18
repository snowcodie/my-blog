import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  likes: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');
    
    if (slug) {
      // Get single post by slug
      const results = await query(
        'SELECT * FROM posts WHERE slug = ? AND published = true',
        [slug]
      ) as Post[];
      
      if (results.length === 0) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      
      return NextResponse.json(results[0]);
    } else {
      // Get all published posts
      const results = await query(
        'SELECT id, slug, title, excerpt, likes, created_at FROM posts WHERE published = true ORDER BY created_at DESC'
      ) as Post[];
      
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminToken = request.headers.get('x-admin-token');

    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, excerpt, slug } = body;

    if (!title || !content || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await query(
      'INSERT INTO posts (slug, title, content, excerpt) VALUES (?, ?, ?, ?)',
      [slug, title, content, excerpt || '']
    );

    return NextResponse.json({ message: 'Post created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
