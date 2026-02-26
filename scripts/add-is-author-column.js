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

async function addIsAuthorColumn() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'my_blog'
    });

    console.log('Connected to database');

    // Check if column exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM comments LIKE 'is_author'"
    );

    if (columns.length > 0) {
      console.log('✓ is_author column already exists');
    } else {
      // Add is_author column
      await connection.query(`
        ALTER TABLE comments 
        ADD COLUMN is_author BOOLEAN DEFAULT FALSE AFTER is_anonymous
      `);
      console.log('✓ is_author column added!');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addIsAuthorColumn();
