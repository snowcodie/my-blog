import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Check if requesting all sections (for admin management)
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';
    
    const sql = includeInactive 
      ? 'SELECT * FROM nav_sections ORDER BY order_index ASC'
      : 'SELECT id, name, slug FROM nav_sections WHERE active = true ORDER BY order_index ASC';
    
    const results = await query(sql);
    return NextResponse.json(results || []);
  } catch (error) {
    console.error('Nav sections fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch nav sections' }, { status: 500 });
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
    const { name, slug, icon, description, category_id } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // Get the next order_index
    const maxResults = await query('SELECT COALESCE(MAX(order_index), 0) as maxIndex FROM nav_sections');
    const nextOrderIndex = (Array.isArray(maxResults) && maxResults.length > 0) 
      ? (maxResults[0] as any).maxIndex + 1 
      : 0;

    await query(
      'INSERT INTO nav_sections (name, slug, icon, description, category_id, order_index) VALUES (?, ?, ?, ?, ?, ?)',
      [
        name,
        slug,
        icon || null,
        description || null,
        category_id || null,
        nextOrderIndex
      ]
    );

    return NextResponse.json({ success: true, message: 'Navigation section created' });
  } catch (error) {
    console.error('Nav section creation error:', error);
    return NextResponse.json({ error: 'Failed to create nav section' }, { status: 500 });
  }
}
