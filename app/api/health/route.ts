import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const health = {
    status: 'unknown',
    database: 'disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    config: {
      hasHost: !!process.env.DB_HOST,
      hasPort: !!process.env.DB_PORT,
      hasUser: !!process.env.DB_USER,
      hasPassword: !!process.env.DB_PASSWORD,
      hasDatabase: !!process.env.DB_NAME,
      host: process.env.DB_HOST ? process.env.DB_HOST.substring(0, 20) + '...' : 'NOT SET',
      port: process.env.DB_PORT || 'NOT SET',
      user: process.env.DB_USER || 'NOT SET',
      database: process.env.DB_NAME || 'NOT SET'
    }
  };

  try {
    // Test database connection
    await query('SELECT 1 as test');
    health.status = 'healthy';
    health.database = 'connected';
    
    return NextResponse.json(health, { status: 200 });
  } catch (error: any) {
    health.status = 'unhealthy';
    health.database = 'error: ' + error.message;
    
    console.error('❌ Health check failed:', {
      error: error.message,
      code: error.code,
      config: health.config
    });
    
    return NextResponse.json(health, { status: 503 });
  }
}
