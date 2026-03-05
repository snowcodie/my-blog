import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

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
    const series = request.nextUrl.searchParams.get('series');
    
    // Check if admin is authenticated
    const token = request.cookies.get('adminToken')?.value;
    let isAdmin = false;
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
        isAdmin = true;
      } catch {
        // Not admin
      }
    }
    
    if (series) {
      // Get all posts in a series (series can be name or id)
      const results = await query(
        `SELECT p.id, p.slug, p.title, p.series_part, s.name as series_name, s.total_parts as series_total
         FROM posts p
         JOIN series s ON p.series_id = s.id
         WHERE (s.name = $1 OR s.id = $2) AND p.published = true
         ORDER BY p.series_part ASC`,
        [series, series]
      ) as Post[];
      
      return NextResponse.json(results);
    } else if (slug) {
      // Get single post by slug with comment count
      // For admin, show all posts; for public, only published
      const whereClause = isAdmin ? 'WHERE p.slug = $1' : 'WHERE p.slug = $1 AND p.published = true';
      const results = await query(
        `SELECT p.*, s.name as series_name, s.total_parts as series_total,
         (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
         FROM posts p 
         LEFT JOIN series s ON p.series_id = s.id
         ${whereClause}`,
        [slug]
      ) as Post[];
      
      if (results.length === 0) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      
      // Increment view count
      await query('UPDATE posts SET views = views + 1 WHERE id = $1', [results[0].id]);
      
      return NextResponse.json(results[0]);
    } else {
      // Get all published posts with comment counts and series info
      const results = await query(
        `SELECT p.id, p.slug, p.title, p.excerpt, p.category, p.cover_image, p.likes, p.views, p.created_at,
         p.series_id, p.series_part, s.name as series_name, s.total_parts as series_total,
         (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
         FROM posts p 
         LEFT JOIN series s ON p.series_id = s.id
         WHERE p.published = true 
         ORDER BY p.created_at DESC`
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
    const token = request.cookies.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, excerpt, slug, category, cover_image, published, series_name, series_part } = body;

    console.log('POST /api/posts - category value:', category);
    console.log('POST /api/posts - series_name:', series_name);

    if (!title || !content || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let series_id = null;
    
    // If series_name is provided, find or create the series
    if (series_name) {
      // Check if series exists (name is globally unique)
      const existingSeries: any = await query(
        'SELECT id FROM series WHERE name = $1',
        [series_name]
      );
      
      if (existingSeries.length > 0) {
        // Series exists - reuse it
        series_id = existingSeries[0].id;
        console.log('Reusing existing series ID:', series_id);
      } else {
        // Create new series with the post's category (should be section ID, not slug)
        console.log('Creating new series with category (should be section ID):', category || 'general');
        const result: any = await query(
          'INSERT INTO series (name, category, total_parts) VALUES ($1, $2, $3) RETURNING id',
          [series_name, category || 'general', 0]
        );
        series_id = (result.length > 0) ? result[0].id : null;
        console.log('Created new series with ID:', series_id);
      }
    }

    await query(
      'INSERT INTO posts (slug, title, content, excerpt, category, cover_image, series_id, series_part, published) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [slug, title, content, excerpt || '', category || 'general', cover_image || null, series_id, series_part || null, published || false]
    );

    return NextResponse.json({ success: true, message: 'Post created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post', details: error.message }, { status: 500 });
  }
}
