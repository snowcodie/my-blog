import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
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

    const connection = await getConnection();
    try {
      await connection.query(
        'UPDATE nav_sections SET name = ?, slug = ?, icon = ?, description = ?, active = ?, order_index = ?, category_id = ? WHERE id = ?',
        [name, slug, icon || null, description || null, active ? 1 : 0, order_index || 0, category_id || null, id]
      );

      return NextResponse.json({
        success: true,
        message: 'Navigation section updated successfully',
      });
    } finally {
      connection.release();
    }
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

    const connection = await getConnection();
    try {
      await connection.query('DELETE FROM nav_sections WHERE id = ?', [id]);

      return NextResponse.json({
        success: true,
        message: 'Navigation section deleted successfully',
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting nav section:', error);
    return NextResponse.json(
      { error: 'Failed to delete navigation section' },
      { status: 500 }
    );
  }
}
