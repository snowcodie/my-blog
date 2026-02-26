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

async function migrateToSeriesTable() {
  loadEnv();
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_blog',
  });

  try {
    console.log('Starting migration to series table...');

    // Step 1: Create series table
    console.log('\n1. Creating series table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS series (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        total_parts INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (name)
      )
    `);
    console.log('✓ Series table created');

    // Step 2: Extract unique series from posts table and insert into series table
    console.log('\n2. Migrating existing series data...');
    const [existingPosts] = await connection.execute(
      'SELECT DISTINCT series_name, series_total FROM posts WHERE series_name IS NOT NULL AND series_name != ""'
    );

    if (existingPosts.length > 0) {
      console.log(`Found ${existingPosts.length} unique series to migrate`);
      
      for (const post of existingPosts) {
        const seriesName = post.series_name;
        const totalParts = post.series_total || 0;
        
        // Insert or ignore if already exists
        await connection.execute(
          'INSERT IGNORE INTO series (name, total_parts) VALUES (?, ?)',
          [seriesName, totalParts]
        );
        console.log(`  ✓ Migrated series: ${seriesName} (${totalParts} parts)`);
      }
    } else {
      console.log('No existing series found');
    }

    // Step 3: Add series_id column to posts table
    console.log('\n3. Adding series_id column to posts table...');
    try {
      await connection.execute(`
        ALTER TABLE posts 
        ADD COLUMN series_id INT AFTER views,
        ADD FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE SET NULL,
        ADD INDEX (series_id)
      `);
      console.log('✓ Added series_id column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ series_id column already exists');
      } else {
        throw error;
      }
    }

    // Step 4: Update posts with series_id based on series_name
    console.log('\n4. Updating posts with series_id...');
    const [posts] = await connection.execute(
      'SELECT id, series_name FROM posts WHERE series_name IS NOT NULL AND series_name != ""'
    );

    for (const post of posts) {
      const [seriesRows] = await connection.execute(
        'SELECT id FROM series WHERE name = ?',
        [post.series_name]
      );
      
      if (seriesRows.length > 0) {
        const seriesId = seriesRows[0].id;
        await connection.execute(
          'UPDATE posts SET series_id = ? WHERE id = ?',
          [seriesId, post.id]
        );
        console.log(`  ✓ Updated post ${post.id} with series_id ${seriesId}`);
      }
    }

    // Step 5: Remove old columns (series_name, series_total)
    console.log('\n5. Removing old series columns...');
    try {
      await connection.execute(`
        ALTER TABLE posts 
        DROP COLUMN series_name,
        DROP COLUMN series_total
      `);
      console.log('✓ Removed series_name and series_total columns');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('✓ Old columns already removed');
      } else {
        throw error;
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nSummary:');
    console.log('- Created series table');
    console.log('- Migrated existing series data');
    console.log('- Added series_id foreign key to posts');
    console.log('- Updated posts with proper series relationships');
    console.log('- Removed denormalized columns (series_name, series_total)');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    await connection.end();
  }
}

migrateToSeriesTable();
