import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Check if it's a likes update (legacy support) or full post update
    if (body.likes !== undefined && Object.keys(body).length === 1) {
      // Simple likes update
      await query(
        'UPDATE posts SET likes = ? WHERE id = ?',
        [body.likes, params.id]
      );
    } else {
      // Full post update
      const { title, content, excerpt, slug, category, cover_image, published, series_name, series_part } = body;

      console.log('PUT /api/posts/[id] - category value:', category);
      console.log('PUT /api/posts/[id] - series_name:', series_name);

      if (!title || !content || !slug) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      let series_id = null;
      
      // If series_name is provided, find or create the series
      if (series_name) {
        // Check if series exists (name is globally unique)
        const existingSeries: any = await query(
          'SELECT id FROM series WHERE name = ?',
          [series_name]
        );
        
        if (existingSeries.length > 0) {
          // Series exists - reuse it
          series_id = existingSeries[0].id;
          console.log('PUT - Reusing existing series ID:', series_id);
        } else {
          // Create new series with the post's category (should be section ID, not slug)
          console.log('PUT - Creating new series with category (should be section ID):', category || 'general');
          const result: any = await query(
            'INSERT INTO series (name, category, total_parts) VALUES (?, ?, ?)',
            [series_name, category || 'general', 0]
          );
          series_id = result.insertId;
          console.log('PUT - Created new series with ID:', series_id);
        }
      }

      await query(
        'UPDATE posts SET title = ?, content = ?, excerpt = ?, slug = ?, category = ?, cover_image = ?, series_id = ?, series_part = ?, published = ? WHERE id = ?',
        [title, content, excerpt || '', slug, category || 'general', cover_image || null, series_id, series_part || null, published || false, params.id]
      );
    }

    return NextResponse.json({ success: true, message: 'Post updated successfully' });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await query('DELETE FROM posts WHERE id = ?', [params.id]);

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post', details: error.message }, { status: 500 });
  }
}

