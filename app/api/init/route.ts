import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    // Check if database initialization is enabled
    if (process.env.ENABLE_DB_INIT !== 'true') {
      return NextResponse.json({ error: 'Database initialization is disabled' }, { status: 403 });
    }

    // Initialize database tables
    await initializeDatabase();

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
