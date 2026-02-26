import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check for auth token - accept from Authorization header OR query parameter
    const authHeader = request.headers.get('authorization');
    const querySecret = request.nextUrl.searchParams.get('secret');
    const expectedToken = process.env.INIT_SECRET || 'change-this-secret';

    // Check if token is in Authorization header (Bearer format)
    const headerValid = authHeader && authHeader === `Bearer ${expectedToken}`;
    // Check if token is in query parameter
    const queryValid = querySecret && querySecret === expectedToken;

    if (!headerValid && !queryValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize database tables
    await initializeDatabase();

    // Migrate icon column to LONGTEXT if needed
    try {
      await query(`
        ALTER TABLE nav_sections 
        MODIFY COLUMN icon LONGTEXT
      `);
      console.log('Migration: Updated icon column to LONGTEXT');
    } catch (migrationError: any) {
      // Ignore if column doesn't exist or already LONGTEXT
      if (!migrationError.message.includes('Unknown column') && !migrationError.message.includes('Syntax error')) {
        console.log('Migration note:', migrationError.message);
      }
    }

    // Migrate site_logo and site_favicon columns to LONGTEXT
    try {
      await query(`
        ALTER TABLE site_settings 
        MODIFY COLUMN site_logo LONGTEXT,
        MODIFY COLUMN site_favicon LONGTEXT
      `);
      console.log('Migration: Updated site_logo and site_favicon columns to LONGTEXT');
    } catch (migrationError: any) {
      // Ignore if columns don't exist or already LONGTEXT
      if (!migrationError.message.includes('Unknown column') && !migrationError.message.includes('Syntax error')) {
        console.log('Migration note:', migrationError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: String(error) },
      { status: 500 }
    );
  }
}
