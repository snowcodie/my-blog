import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Configure route for Vercel
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // console.log('📥 API: Fetching settings from database...');
    const results = await query('SELECT * FROM site_settings LIMIT 1');
    
    // console.log('📊 Query results:', {
    //   found: Array.isArray(results) && results.length > 0,
    //   count: Array.isArray(results) ? results.length : 0
    // });
    
    if (Array.isArray(results) && results.length > 0) {
      const settings = results[0];
      
      return NextResponse.json(settings);
    }

    // console.log('⚠️ No settings found, returning defaults');
    // Return default settings if none exist
    return NextResponse.json({
      site_name: 'My Blog',
      site_logo: '',
      site_favicon: '',
      site_favicon_dark: '',
      site_description: 'A personal blog built with Next.js',
      hero_title: 'Welcome to My Blog',
      hero_subtitle: 'Explore my thoughts on software, mechanics, and travels',
      hero_background: '',
    });
  } catch (error) {
    // console.error('❌ Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('adminToken')?.value;

    if (!token) {
      // console.error('❌ No admin token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
    } catch (err) {
      // console.error('❌ Invalid admin token:', err);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { site_name, site_logo, site_favicon, site_favicon_dark, site_description, hero_title, hero_subtitle, hero_background } = body;

    // Calculate total data size
    const totalSize = (site_name?.length || 0) + 
                      (site_logo?.length || 0) + 
                      (site_favicon?.length || 0) + 
                      (site_favicon_dark?.length || 0) + 
                      (site_description?.length || 0) + 
                      (hero_title?.length || 0) + 
                      (hero_subtitle?.length || 0) + 
                      (hero_background?.length || 0);

    // Check if total size exceeds Vercel's 4.5MB limit
    const MAX_SIZE = 4.5 * 1024 * 1024; // 4.5MB in bytes
    if (totalSize > MAX_SIZE) {
      console.error('❌ Payload too large:', (totalSize / 1024 / 1024).toFixed(2), 'MB (max: 4.5MB)');
      return NextResponse.json({ 
        error: 'Payload too large. Images must be smaller to fit within 4.5MB limit.',
        size: (totalSize / 1024 / 1024).toFixed(2) + 'MB',
        limit: '4.5MB'
      }, { status: 413 });
    }

    console.log('📝 Updating settings:', {
      site_name,
      has_logo: !!site_logo,
      has_favicon: !!site_favicon,
      has_favicon_dark: !!site_favicon_dark,
      hero_title,
      hero_subtitle,
      has_hero_background: !!hero_background,
      logo_length: site_logo?.length || 0,
      favicon_length: site_favicon?.length || 0,
      favicon_dark_length: site_favicon_dark?.length || 0,
      description_length: site_description?.length || 0,
      hero_background_length: hero_background?.length || 0,
      total_size_bytes: totalSize,
      total_size_mb: (totalSize / 1024 / 1024).toFixed(2)
    });

    // Warn if data is approaching the limit
    if (totalSize > 3 * 1024 * 1024) {
      console.warn('⚠️ WARNING: Total data size is large:', (totalSize / 1024 / 1024).toFixed(2), 'MB - approaching 4.5MB limit');
    }

    // Validate site_name
    if (!site_name || site_name.trim() === '') {
      return NextResponse.json({ error: 'Site name is required' }, { status: 400 });
    }

    console.log('🔍 Checking if settings exist...');
    // Check if settings exist
    const results = await query('SELECT id FROM site_settings LIMIT 1');
    console.log('✓ Settings check completed:', { found: Array.isArray(results) && results.length > 0 });

    if (Array.isArray(results) && results.length > 0) {
      // Update existing settings
      console.log('✓ Updating existing settings record with id:', (results[0] as any).id);
      const settingsId = (results[0] as any).id;
      
      const updateStart = Date.now();
      await query(
        'UPDATE site_settings SET site_name = $1, site_logo = $2, site_favicon = $3, site_favicon_dark = $4, site_description = $5, hero_title = $6, hero_subtitle = $7, hero_background = $8 WHERE id = $9',
        [
          site_name,
          site_logo || '',
          site_favicon || '',
          site_favicon_dark || '',
          site_description || '',
          hero_title || 'Welcome to My Blog',
          hero_subtitle || 'Explore my thoughts on software, mechanics, and travels',
          hero_background || '',
          settingsId
        ]
      );
      const updateDuration = Date.now() - updateStart;
      console.log('✓ Update completed in', updateDuration, 'ms');
    } else {
      // Insert new settings
      console.log('✓ Creating new settings record');
      const insertStart = Date.now();
      await query(
        'INSERT INTO site_settings (site_name, site_logo, site_favicon, site_favicon_dark, site_description, hero_title, hero_subtitle, hero_background) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          site_name,
          site_logo || '',
          site_favicon || '',
          site_favicon_dark || '',
          site_description || '',
          hero_title || 'Welcome to My Blog',
          hero_subtitle || 'Explore my thoughts on software, mechanics, and travels',
          hero_background || ''
        ]
      );
      const insertDuration = Date.now() - insertStart;
      console.log('✓ Insert completed in', insertDuration, 'ms');
    }

    // Verify the save by fetching back
    console.log('🔍 Verifying save...');
    const verifyResults = await query('SELECT site_name, LENGTH(site_logo) as logo_size, LENGTH(site_favicon) as favicon_size, LENGTH(site_favicon_dark) as favicon_dark_size, LENGTH(hero_background) as hero_bg_size FROM site_settings LIMIT 1');
    console.log('✓ Settings saved. Verification:', verifyResults[0]);

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully',
      saved: {
        site_name,
        has_favicon: !!site_favicon,
        has_favicon_dark: !!site_favicon_dark,
        favicon_size: site_favicon?.length || 0,
        favicon_dark_size: site_favicon_dark?.length || 0
      }
    });
  } catch (error: any) {
    console.error('❌ Settings update error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: 'Failed to update settings', 
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}
