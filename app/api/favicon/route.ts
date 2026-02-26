import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const results = await query('SELECT site_favicon FROM site_settings LIMIT 1');
    
    if (!Array.isArray(results) || results.length === 0 || !results[0]) {
      // Return a simple default favicon (1x1 transparent PNG)
      const defaultFavicon = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      return new NextResponse(defaultFavicon, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache',
        },
      });
    }

    const favicon = (results[0] as any).site_favicon;
    
    if (!favicon || typeof favicon !== 'string' || !favicon.startsWith('data:')) {
      // Return default favicon
      const defaultFavicon = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      return new NextResponse(defaultFavicon, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Parse data URL
    const matches = favicon.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || !matches[2]) {
      const defaultFavicon = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      return new NextResponse(defaultFavicon, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache',
        },
      });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType || 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Favicon error:', error);
    const defaultFavicon = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    return new NextResponse(defaultFavicon, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
