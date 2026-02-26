import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    console.log('📥 API: Fetching settings from database...');
    const results = await query('SELECT * FROM site_settings LIMIT 1');
    
    console.log('📊 Query results:', {
      found: Array.isArray(results) && results.length > 0,
      count: Array.isArray(results) ? results.length : 0
    });
    
    if (Array.isArray(results) && results.length > 0) {
      const settings = results[0];
      console.log('✓ Settings found:', {
        site_name: settings.site_name,
        has_logo: !!settings.site_logo,
        logo_length: settings.site_logo?.length || 0,
        has_favicon: !!settings.site_favicon,
        favicon_length: settings.site_favicon?.length || 0,
        favicon_type: typeof settings.site_favicon,
        favicon_preview: settings.site_favicon ? settings.site_favicon.substring(0, 50) : 'empty'
      });
      return NextResponse.json(settings);
    }

    console.log('⚠️ No settings found, returning defaults');
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
    console.error('❌ Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('adminToken')?.value;

    if (!token) {
      console.error('❌ No admin token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
    } catch {
      console.error('❌ Invalid admin token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { site_name, site_logo, site_favicon, site_favicon_dark, site_description, hero_title, hero_subtitle, hero_background } = body;

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
      description_length: site_description?.length || 0
    });

    // Validate site_name
    if (!site_name || site_name.trim() === '') {
      return NextResponse.json({ error: 'Site name is required' }, { status: 400 });
    }

    // Check if settings exist
    const results = await query('SELECT id FROM site_settings LIMIT 1');

    if (Array.isArray(results) && results.length > 0) {
      // Update existing settings
      console.log('✓ Updating existing settings record');
      await query(
        'UPDATE site_settings SET site_name = ?, site_logo = ?, site_favicon = ?, site_favicon_dark = ?, site_description = ?, hero_title = ?, hero_subtitle = ?, hero_background = ? WHERE id = ?',
        [site_name || '', site_logo || '', site_favicon || '', site_favicon_dark || '', site_description || '', hero_title || 'Welcome to My Blog', hero_subtitle || 'Explore my thoughts on software, mechanics, and travels', hero_background || '', results[0].id]
      );
    } else {
      // Insert new settings
      console.log('✓ Creating new settings record');
      await query(
        'INSERT INTO site_settings (site_name, site_logo, site_favicon, site_favicon_dark, site_description, hero_title, hero_subtitle, hero_background) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [site_name || '', site_logo || '', site_favicon || '', site_favicon_dark || '', site_description || '', hero_title || 'Welcome to My Blog', hero_subtitle || 'Explore my thoughts on software, mechanics, and travels', hero_background || '']
      );
    }

    // Verify the save by fetching back
    const verifyResults = await query('SELECT site_name, LENGTH(site_favicon) as favicon_size, LENGTH(site_favicon_dark) as favicon_dark_size FROM site_settings LIMIT 1');
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
    return NextResponse.json({ 
      error: 'Failed to update settings', 
      details: error.message 
    }, { status: 500 });
  }
}
