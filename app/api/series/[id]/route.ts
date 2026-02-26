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
    const { name, category, description, total_parts } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    // Check if another series with same name exists (excluding current)
    const existing: any = await query(
      'SELECT id FROM series WHERE name = ? AND id != ?',
      [name, params.id]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'A series with this name already exists' }, { status: 400 });
    }

    await query(
      'UPDATE series SET name = ?, category = ?, description = ?, total_parts = ? WHERE id = ?',
      [name, category, description || null, total_parts || 0, params.id]
    );

    return NextResponse.json({ success: true, message: 'Series updated successfully' });
  } catch (error: any) {
    console.error('Error updating series:', error);
    return NextResponse.json({ error: 'Failed to update series', details: error.message }, { status: 500 });
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

    // Set series_id to NULL for all posts in this series (cascade handled by FK)
    await query('DELETE FROM series WHERE id = ?', [params.id]);

    return NextResponse.json({ success: true, message: 'Series deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting series:', error);
    return NextResponse.json({ error: 'Failed to delete series', details: error.message }, { status: 500 });
  }
}
