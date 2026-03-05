import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';
import crypto from 'crypto';

// Simple rate limiting (in production, use Redis or proper rate limiter)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts || now > attempts.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 }); // 15 min window
    return true;
  }

  if (attempts.count >= 5) {
    return false; // Max 5 attempts per 15 minutes
  }

  attempts.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { adminToken, username, password } = body;

    let isValid = false;

    // Validate JWT_SECRET is set
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key-change-this') {
      console.error('❌ SECURITY ERROR: JWT_SECRET not set or using default value!');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Method 1: Token-based login (from env)
    if (adminToken && adminToken === process.env.ADMIN_TOKEN) {
      isValid = true;
    }

    // Method 2: Username/password login (from database)
    if (username && password) {
      const results = await query(
        'SELECT id, password_hash FROM admin_users WHERE username = $1',
        [username]
      );

      if (Array.isArray(results) && results.length > 0) {
        const admin = results[0] as { password_hash: string };
        
        // Use timing-safe comparison to prevent timing attacks
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        const isMatch = crypto.timingSafeEqual(
          Buffer.from(admin.password_hash),
          Buffer.from(passwordHash)
        );
        
        if (isMatch) {
          isValid = true;
        }
      }
    }

    if (!isValid) {
      // Add delay to slow down brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { admin: true, iat: Math.floor(Date.now() / 1000) },
      process.env.JWT_SECRET,
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
