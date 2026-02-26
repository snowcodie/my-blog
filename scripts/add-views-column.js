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

async function addViewsColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_blog',
  });

  try {
    console.log('Checking if views column exists...');
    
    // Check if column exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM posts LIKE 'views'"
    );

    if (columns.length === 0) {
      console.log('Adding views column...');
      await connection.execute(
        "ALTER TABLE posts ADD COLUMN views INT DEFAULT 0 AFTER likes"
      );
      console.log('✓ Views column added successfully!');
    } else {
      console.log('✓ Views column already exists!');
    }

    console.log('\n✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

addViewsColumn();
