import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

interface Series {
  id: number;
  name: string;
  description?: string;
  total_parts: number;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category');
    
    let results;
    if (category) {
      results = await query(
        'SELECT * FROM series WHERE category = $1 ORDER BY name ASC',
        [category]
      ) as Series[];
    } else {
      results = await query(
        'SELECT * FROM series ORDER BY name ASC'
      ) as Series[];
    }
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 });
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
    const { name, category, description, total_parts } = body;

    if (!name) {
      return NextResponse.json({ error: 'Series name is required' }, { status: 400 });
    }

    const result: any = await query(
      'INSERT INTO series (name, category, description, total_parts) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, category || 'general', description || null, total_parts || 0]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Series created successfully',
      id: (result.length > 0) ? result[0].id : null
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating series:', error);
    return NextResponse.json({ error: 'Failed to create series', details: error.message }, { status: 500 });
  }
}
