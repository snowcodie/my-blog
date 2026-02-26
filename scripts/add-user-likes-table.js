const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Read .env.local file
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

loadEnv();

async function addUserLikesTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'my_blog',
    });

    console.log('🔌 Connected to database');

    // Check if user_post_likes table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'user_post_likes'"
    );

    if (tables.length > 0) {
      console.log('✓ user_post_likes table already exists');
      return;
    }

    console.log('📝 Creating user_post_likes table...');

    // Create user_post_likes table
    await connection.execute(`
      CREATE TABLE user_post_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_token VARCHAR(255) NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_post (user_token, post_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        INDEX idx_user_token (user_token),
        INDEX idx_post_id (post_id)
      )
    `);

    console.log('✅ user_post_likes table created successfully!');
    console.log('');
    console.log('📌 The table will track which users have liked which posts.');
    console.log('📌 Users are identified by a browser-based token stored in localStorage.');
    console.log('📌 Clearing browser cache will allow users to like posts again.');
    
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

addUserLikesTable();
