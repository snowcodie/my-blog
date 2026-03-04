import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    });

    const connection = await pool.getConnection();
    
    // Test query
    const [result] = await connection.execute('SELECT 1 as test');
    
    connection.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      result: result,
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
