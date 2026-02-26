const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

async function addSeriesColumns() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'blog_db',
    });

    console.log('🔗 Connected to database');

    // Check if columns already exist
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM posts LIKE 'series_name'"
    );

    if (columns.length > 0) {
      console.log('✅ Series columns already exist');
      return;
    }

    console.log('📝 Adding series columns to posts table...');

    // Add series_name column
    await connection.query(`
      ALTER TABLE posts 
      ADD COLUMN series_name VARCHAR(255) AFTER views
    `);
    console.log('✓ Added series_name column');

    // Add series_part column
    await connection.query(`
      ALTER TABLE posts 
      ADD COLUMN series_part INT AFTER series_name
    `);
    console.log('✓ Added series_part column');

    // Add series_total column
    await connection.query(`
      ALTER TABLE posts 
      ADD COLUMN series_total INT AFTER series_part
    `);
    console.log('✓ Added series_total column');

    // Add index for series_name
    await connection.query(`
      ALTER TABLE posts 
      ADD INDEX idx_series_name (series_name)
    `);
    console.log('✓ Added index on series_name');

    console.log('✅ Series columns added successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

addSeriesColumns();
