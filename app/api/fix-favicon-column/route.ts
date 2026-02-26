import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key-change-this') {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }
      jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Route is locked - functionality disabled
    return NextResponse.json(
      { error: 'This maintenance endpoint has been disabled' },
      { status: 403 }
    );
  } catch (error: any) {
    console.error('❌ Error fixing columns:', error);
    return NextResponse.json({
      error: 'Failed to fix database columns',
      details: error.message,
    }, { status: 500 });
  }
}
