-- PostgreSQL Migration: Update comments table for nested comments and anonymous users
-- Run this manually in your PostgreSQL database if you already have a comments table

-- Add parent_comment_id column for nested/threaded comments
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_comment_id INT;
ALTER TABLE comments ADD CONSTRAINT fk_comments_parent 
  FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE;

-- Add is_anonymous column to track anonymous comments
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Add generated_name column for funny anonymous names
ALTER TABLE comments ADD COLUMN IF NOT EXISTS generated_name VARCHAR(100);

-- Add is_author column to identify comments from the blog author
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_author BOOLEAN DEFAULT false;

-- Create index on parent_comment_id for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);

-- Display current table structure
\d comments;

SELECT 'Migration completed successfully!' as status;
