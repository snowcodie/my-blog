import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const client = await pool.connect();
    
    // Test query
    const result = await client.query('SELECT 1 as test');
    
    client.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      result: result.rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
