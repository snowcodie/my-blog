import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminToken, username, password } = body;

    let isValid = false;

    // Method 1: Token-based login (from env)
    if (adminToken && adminToken === process.env.ADMIN_TOKEN) {
      isValid = true;
    }

    // Method 2: Username/password login (from database)
    if (username && password) {
      const results = await query(
        'SELECT id, password_hash FROM admin_users WHERE username = ?',
        [username]
      );

      if (Array.isArray(results) && results.length > 0) {
        const admin = results[0] as { password_hash: string };
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        
        if (admin.password_hash === passwordHash) {
          isValid = true;
        }
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { admin: true },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    // Create response with HTTP-only cookie
    const response = NextResponse.json({ 
      success: true,
      message: 'Login successful'
    });

    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
