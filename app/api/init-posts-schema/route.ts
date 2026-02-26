import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await getConnection();
    
    try {
      // Check if cover_image column exists
      const [columns] = await connection.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'posts' 
         AND COLUMN_NAME = 'cover_image'`
      );

      if (Array.isArray(columns) && columns.length === 0) {
        // Add cover_image column if it doesn't exist
        await connection.execute(
          'ALTER TABLE posts ADD COLUMN cover_image LONGTEXT AFTER category'
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
      connection.release();
    }
  } catch (error: any) {
    console.error('Error updating database:', error);
    return NextResponse.json({ 
      error: 'Failed to update database', 
      details: error.message 
    }, { status: 500 });
  }
}
