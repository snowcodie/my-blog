import { Pool } from 'pg';

// Debug: Log environment variables (remove password for security)
if (process.env.VERCEL) {
  console.log('Database config:', {
    host: process.env.DB_HOST || 'NOT SET',
    port: process.env.DB_PORT || 'NOT SET',
    user: process.env.DB_USER || 'NOT SET',
    database: process.env.DB_NAME || 'NOT SET',
    hasPassword: !!process.env.DB_PASSWORD,
  });
}

const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_HOST?.includes('aiven');

// Configure connection pool for serverless environment
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'blog_db',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  // Serverless optimization
  max: 1, // Maximum connections per function instance (important for serverless!)
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Timeout if connection can't be established in 10 seconds
  allowExitOnIdle: true, // Allow the pool to close all connections and exit when idle
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export async function getConnection() {
  return await pool.connect();
}

export async function query(sql: string, values?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, values || []);
    return result.rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  } finally {
    client.release(); // Always release the connection back to the pool
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
        parent_comment_id INT,
        author VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        is_anonymous BOOLEAN DEFAULT false,
        generated_name VARCHAR(100),
        is_author BOOLEAN DEFAULT false,
        content TEXT NOT NULL,
        likes INT DEFAULT 0,
        approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id)
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
