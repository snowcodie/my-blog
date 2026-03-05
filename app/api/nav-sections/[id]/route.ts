import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify JWT from cookie
    const token = req.cookies.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const body = await req.json();
    const { name, slug, icon, description, active, order_index, category_id } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    await query(
      'UPDATE nav_sections SET name = $1, slug = $2, icon = $3, description = $4, active = $5, order_index = $6, category_id = $7 WHERE id = $8',
      [name, slug, icon || null, description || null, active ? true : false, order_index || 0, category_id || null, id]
    );

    return NextResponse.json({
      success: true,
      message: 'Navigation section updated successfully',
    });
  } catch (error) {
    console.error('Error updating nav section:', error);
    return NextResponse.json(
      { error: 'Failed to update navigation section' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify JWT from cookie
    const token = req.cookies.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const id = parseInt(params.id);

    await query('DELETE FROM nav_sections WHERE id = $1', [id]);

    return NextResponse.json({
      success: true,
      message: 'Navigation section deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting nav section:', error);
    return NextResponse.json(
      { error: 'Failed to delete navigation section' },
      { status: 500 }
    );
  }
}
