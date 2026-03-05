import { NextResponse } from 'next/server';
import { initializeDatabase, getConnection } from '@/lib/db';

export async function GET() {
  try {
    // Check if database initialization is enabled
    if (process.env.ENABLE_DB_INIT !== 'true') {
      return NextResponse.json({ error: 'Database initialization is disabled' }, { status: 403 });
    }

    // Initialize database tables
    await initializeDatabase();

    // Run migrations to add missing columns
    const client = await getConnection();
    try {
      // Drop and recreate site_settings table to ensure all columns exist
      await client.query(`DROP TABLE IF EXISTS site_settings CASCADE`);
      
      await client.query(`
        CREATE TABLE site_settings (
          id SERIAL PRIMARY KEY,
          site_name VARCHAR(255) DEFAULT 'My Blog',
          site_logo TEXT,
          site_favicon TEXT,
          site_favicon_dark TEXT,
          site_description TEXT,
          hero_title TEXT,
          hero_subtitle TEXT,
          hero_background TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✓ Recreated site_settings table with all columns');
    } catch (error: any) {
      console.log('Migration note:', error.message);
    } finally {
      client.release();
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
