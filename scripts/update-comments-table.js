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

async function updateCommentsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_blog',
  });

  try {
    console.log('Updating comments table for tree structure and anonymous comments...\n');
    
    // Check and add parent_comment_id column
    const [parentCol] = await connection.execute(
      "SHOW COLUMNS FROM comments LIKE 'parent_comment_id'"
    );
    
    if (parentCol.length === 0) {
      console.log('Adding parent_comment_id column...');
      await connection.execute(
        "ALTER TABLE comments ADD COLUMN parent_comment_id INT NULL AFTER post_id, ADD FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE"
      );
      console.log('✓ parent_comment_id column added!');
    } else {
      console.log('✓ parent_comment_id column already exists');
    }
    
    // Check and add is_anonymous column
    const [anonCol] = await connection.execute(
      "SHOW COLUMNS FROM comments LIKE 'is_anonymous'"
    );
    
    if (anonCol.length === 0) {
      console.log('Adding is_anonymous column...');
      await connection.execute(
        "ALTER TABLE comments ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE AFTER email"
      );
      console.log('✓ is_anonymous column added!');
    } else {
      console.log('✓ is_anonymous column already exists');
    }
    
    // Check and add generated_name column
    const [nameCol] = await connection.execute(
      "SHOW COLUMNS FROM comments LIKE 'generated_name'"
    );
    
    if (nameCol.length === 0) {
      console.log('Adding generated_name column...');
      await connection.execute(
        "ALTER TABLE comments ADD COLUMN generated_name VARCHAR(100) NULL AFTER is_anonymous"
      );
      console.log('✓ generated_name column added!');
    } else {
      console.log('✓ generated_name column already exists');
    }
    
    console.log('\n✅ Comments table updated successfully!');
    console.log('\nNew features enabled:');
    console.log('- Anonymous comments with funny generated names');
    console.log('- Nested comment replies (tree structure)');
    console.log('- Reply to any comment without restrictions');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

updateCommentsTable();
