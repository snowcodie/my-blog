const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

async function addHeroFields() {
  const connection = await mysql.createConnection({
    host: env.DB_HOST || 'localhost',
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'my_blog',
  });

  try {
    console.log('🔍 Checking if hero fields already exist...');
    
    // Check if columns exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'site_settings'
      AND COLUMN_NAME IN ('hero_title', 'hero_subtitle', 'hero_background')
    `);

    if (columns.length === 3) {
      console.log('✓ Hero fields already exist!');
      return;
    }

    console.log('📝 Adding hero fields to site_settings table...');

    // Add hero_title if not exists
    if (!columns.find(c => c.COLUMN_NAME === 'hero_title')) {
      await connection.execute(`
        ALTER TABLE site_settings 
        ADD COLUMN hero_title VARCHAR(255) DEFAULT 'Welcome to My Blog' 
        AFTER site_description
      `);
      console.log('✓ Added hero_title column');
    }

    // Add hero_subtitle if not exists
    if (!columns.find(c => c.COLUMN_NAME === 'hero_subtitle')) {
      await connection.execute(`
        ALTER TABLE site_settings 
        ADD COLUMN hero_subtitle VARCHAR(500) DEFAULT 'Explore my thoughts on software, mechanics, and travels' 
        AFTER hero_title
      `);
      console.log('✓ Added hero_subtitle column');
    }

    // Add hero_background if not exists
    if (!columns.find(c => c.COLUMN_NAME === 'hero_background')) {
      await connection.execute(`
        ALTER TABLE site_settings 
        ADD COLUMN hero_background LONGTEXT 
        AFTER hero_subtitle
      `);
      console.log('✓ Added hero_background column');
    }

    console.log('');
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('You can now:');
    console.log('1. Go to /admin → Settings');
    console.log('2. Edit Hero Title and Subtitle');
    console.log('3. Upload a Hero Background Image');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

addHeroFields().catch(console.error);
