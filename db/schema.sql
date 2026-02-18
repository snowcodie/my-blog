-- My Blog Database Schema
-- Execute this SQL to initialize your database

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  excerpt VARCHAR(500),
  likes INT DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_published (published),
  INDEX idx_created_at (created_at)
);

-- Create comments table
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
  INDEX idx_post_id (post_id),
  INDEX idx_approved (approved),
  INDEX idx_created_at (created_at)
);

-- Create admin_users table (for future enhancement)
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username)
);

-- Sample blog post (optional - remove if not needed)
INSERT INTO posts (slug, title, content, excerpt, published) 
VALUES (
  'welcome-to-my-blog',
  'Welcome to My Blog',
  'Welcome! This is my first blog post. You can write anything here - thoughts, ideas, tutorials, or anything else you want to share with your readers. Comments are enabled below, so feel free to leave your feedback!',
  'Welcome to my new blog! Excited to share my thoughts and ideas with you.',
  true
);

-- Verify tables were created
SHOW TABLES;
SHOW COLUMNS FROM posts;
SHOW COLUMNS FROM comments;
SHOW COLUMNS FROM admin_users;
