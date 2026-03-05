import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const client = await getConnection();
    
    try {
      // Check if cover_image column exists in PostgreSQL
      const columns = await client.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'posts' 
         AND column_name = 'cover_image'`
      );

      if (columns.rows.length === 0) {
        // Add cover_image column if it doesn't exist
        await client.query(
          'ALTER TABLE posts ADD COLUMN cover_image TEXT'
        );
        
        return NextResponse.json({ 
          success: true, 
          message: 'cover_image column added successfully' 
        });
      } else {
        return NextResponse.json({ 
          success: true, 
          message: 'cover_image column already exists' 
        });
      }
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error updating database:', error);
    return NextResponse.json({ 
      error: 'Failed to update database', 
      details: error.message 
    }, { status: 500 });
  }
}
