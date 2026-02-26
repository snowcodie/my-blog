-- Add user_post_likes table to track individual likes
CREATE TABLE IF NOT EXISTS user_post_likes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_token VARCHAR(255) NOT NULL,
  post_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_post (user_token, post_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_user_token (user_token),
  INDEX idx_post_id (post_id)
);
