import { Pool } from 'pg';

const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_HOST?.includes('aiven');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'blog_db',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

export async function getConnection() {
  return await pool.connect();
}

export async function query(sql: string, values?: any[]) {
  try {
    const result = await pool.query(sql, values || []);
    return result.rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

export async function initializeDatabase() {
  const client = await getConnection();
  try {
    // Create series table
    await client.query(`
      CREATE TABLE IF NOT EXISTS series (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100) DEFAULT 'general',
        description TEXT,
        total_parts INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_series_name ON series(name)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_series_category ON series(category)
    `);

    // Create posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        excerpt VARCHAR(500),
        category VARCHAR(100) DEFAULT 'ones&zeros',
        cover_image TEXT,
        likes INT DEFAULT 0,
        views INT DEFAULT 0,
        series_id INT,
        series_part INT,
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE SET NULL
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_series_id ON posts(series_id)
    `);

    // Create comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INT NOT NULL,
        author VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        content TEXT NOT NULL,
        likes INT DEFAULT 0,
        approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)
    `);

    // Create admin users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create site settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        site_name VARCHAR(255) DEFAULT 'My Blog',
        site_logo TEXT,
        site_favicon TEXT,
        site_favicon_dark TEXT,
        site_description TEXT,
        hero_title TEXT,
        hero_subtitle TEXT,
        hero_background TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create navigation sections table
    await client.query(`
      CREATE TABLE IF NOT EXISTS nav_sections (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        icon TEXT,
        description TEXT,
        category_id VARCHAR(100),
        order_index INT DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_nav_sections_order ON nav_sections(order_index)
    `);

    // Create user_post_likes table for tracking individual user likes
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_post_likes (
        id SERIAL PRIMARY KEY,
        user_token VARCHAR(255) NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_token, post_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_post_likes_user_token ON user_post_likes(user_token)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_post_likes_post_id ON user_post_likes(post_id)
    `);

    console.log('Database initialized successfully');
  } finally {
    client.release();
  }
}
