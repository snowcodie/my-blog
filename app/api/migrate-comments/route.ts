import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

async function runMigration() {
  const client = await getConnection();
  
  try {
    console.log('Starting comments table migration...');

    // Add parent_comment_id column
    await client.query(`
      ALTER TABLE comments 
      ADD COLUMN IF NOT EXISTS parent_comment_id INT
    `);
    console.log('✓ Added parent_comment_id column');

    // Add foreign key constraint (only if column was just added)
    try {
      await client.query(`
        ALTER TABLE comments 
        ADD CONSTRAINT fk_comments_parent 
        FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
      `);
      console.log('✓ Added foreign key constraint for parent_comment_id');
    } catch (error: any) {
      if (error.code === '42710') {
        console.log('✓ Foreign key constraint already exists');
      } else {
        throw error;
      }
    }

    // Add is_anonymous column
    await client.query(`
      ALTER TABLE comments 
      ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false
    `);
    console.log('✓ Added is_anonymous column');

    // Add generated_name column
    await client.query(`
      ALTER TABLE comments 
      ADD COLUMN IF NOT EXISTS generated_name VARCHAR(100)
    `);
    console.log('✓ Added generated_name column');

    // Add is_author column
    await client.query(`
      ALTER TABLE comments 
      ADD COLUMN IF NOT EXISTS is_author BOOLEAN DEFAULT false
    `);
    console.log('✓ Added is_author column');

    // Create index on parent_comment_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_parent_id 
      ON comments(parent_comment_id)
    `);
    console.log('✓ Created index on parent_comment_id');

    return NextResponse.json({
      success: true,
      message: 'Comments table migration completed successfully',
      columnsAdded: [
        'parent_comment_id',
        'is_anonymous', 
        'generated_name',
        'is_author'
      ]
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET() {
  return runMigration();
}

export async function POST() {
  return runMigration();
}
