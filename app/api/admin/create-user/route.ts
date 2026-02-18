import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const adminToken = request.headers.get('x-admin-token');

    // Only allow creation if valid admin token is provided
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Hash password using SHA256
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Insert new admin
    await query(
      'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );

    return NextResponse.json({ 
      success: true, 
      message: `Admin user "${username}" created successfully` 
    });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }
    console.error('Admin creation error:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}
