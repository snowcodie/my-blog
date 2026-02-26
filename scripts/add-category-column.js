const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

async function addCategoryColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_blog',
  });

  try {
    console.log('Checking if category column exists...');
    
    // Check if column exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM posts LIKE 'category'"
    );

    if (columns.length === 0) {
      console.log('Adding category column...');
      await connection.execute(
        "ALTER TABLE posts ADD COLUMN category VARCHAR(100) DEFAULT 'general' AFTER excerpt, ADD INDEX (category)"
      );
      console.log('✓ Category column added successfully!');
    } else {
      console.log('✓ Category column already exists!');
    }

    // Check if cover_image column exists
    const [coverColumns] = await connection.execute(
      "SHOW COLUMNS FROM posts LIKE 'cover_image'"
    );

    if (coverColumns.length === 0) {
      console.log('Adding cover_image column...');
      await connection.execute(
        "ALTER TABLE posts ADD COLUMN cover_image LONGTEXT AFTER category"
      );
      console.log('✓ Cover_image column added successfully!');
    } else {
      console.log('✓ Cover_image column already exists!');
    }

    console.log('\n✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

addCategoryColumn();
