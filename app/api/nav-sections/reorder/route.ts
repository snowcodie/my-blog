import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

interface ReorderRequest {
  sections: Array<{
    id: number;
    order_index: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication using JWT cookie
    const token = request.cookies.get('adminToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const body: ReorderRequest = await request.json();

    if (!body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Update order_index for all sections
    const updatePromises = body.sections.map((section) =>
      query(
        'UPDATE nav_sections SET order_index = ? WHERE id = ?',
        [section.order_index, section.id]
      )
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Section order updated successfully',
    });
  } catch (error) {
    console.error('Error updating section order:', error);
    return NextResponse.json(
      { error: 'Failed to update section order', details: String(error) },
      { status: 500 }
    );
  }
}

