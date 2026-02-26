import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'my_blog',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function getConnection() {
  return await pool.getConnection();
}

export async function query(sql: string, values?: any[]) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, values || []);
    return results;
  } finally {
    connection.release();
  }
}

export async function initializeDatabase() {
  const connection = await getConnection();
  try {
    // Create series table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS series (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100) DEFAULT 'general',
        description TEXT,
        total_parts INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (name),
        INDEX (category)
      )
    `);

    // Create posts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        excerpt VARCHAR(500),
        category VARCHAR(100) DEFAULT 'ones&zeros',
        cover_image LONGTEXT,
        likes INT DEFAULT 0,
        views INT DEFAULT 0,
        series_id INT,
        series_part INT,
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE SET NULL,
        INDEX (category),
        INDEX (series_id)
      )
    `);

    // Create comments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        author VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        content TEXT NOT NULL,
        likes INT DEFAULT 0,
        approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        INDEX (post_id)
      )
    `);

    // Create admin users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create site settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        site_name VARCHAR(255) DEFAULT 'My Blog',
        site_logo LONGTEXT,
        site_favicon LONGTEXT,        site_favicon_dark LONGTEXT,        site_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create navigation sections table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS nav_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        icon LONGTEXT,
        description TEXT,
        category_id VARCHAR(100),
        order_index INT DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (order_index)
      )
    `);

    // Create user_post_likes table for tracking individual user likes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_post_likes (
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

    console.log('Database initialized successfully');
  } finally {
    connection.release();
  }
}
