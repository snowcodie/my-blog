const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }
}

async function addCategoryToSeries() {
  loadEnv();
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_blog',
  });

  try {
    console.log('Adding category column to series table...');

    // Step 1: Add category column to series table
    console.log('\n1. Adding category column...');
    try {
      await connection.execute(`
        ALTER TABLE series 
        ADD COLUMN category VARCHAR(100) DEFAULT 'general' AFTER name,
        ADD INDEX (category)
      `);
      console.log('✓ Category column added');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ Category column already exists');
      } else {
        throw error;
      }
    }

    // Step 2: Update existing series with category from their posts
    console.log('\n2. Updating existing series with category from posts...');
    const [series] = await connection.execute('SELECT id, name FROM series');
    
    for (const s of series) {
      // Get the category from the first post in this series
      const [posts] = await connection.execute(
        'SELECT category FROM posts WHERE series_id = ? LIMIT 1',
        [s.id]
      );
      
      if (posts.length > 0) {
        const category = posts[0].category;
        await connection.execute(
          'UPDATE series SET category = ? WHERE id = ?',
          [category, s.id]
        );
        console.log(`  ✓ Updated series "${s.name}" with category "${category}"`);
      }
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    await connection.end();
  }
}

addCategoryToSeries();
