import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  likes: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === 'GET') {
    try {
      const { slug } = req.query;
      
      if (slug) {
        // Get single post by slug
        const results = await query(
          'SELECT * FROM posts WHERE slug = ? AND published = true',
          [slug]
        ) as Post[];
        
        if (results.length === 0) {
          return res.status(404).json({ error: 'Post not found' });
        }
        
        return res.status(200).json(results[0]);
      } else {
        // Get all published posts
        const results = await query(
          'SELECT id, slug, title, excerpt, likes, created_at FROM posts WHERE published = true ORDER BY created_at DESC'
        ) as Post[];
        
        return res.status(200).json(results);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  } else if (req.method === 'POST') {
    // Create new post (protected - requires admin token)
    try {
      const { title, content, excerpt, slug } = req.body;
      const adminToken = req.headers['x-admin-token'];

      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!title || !content || !slug) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await query(
        'INSERT INTO posts (slug, title, content, excerpt) VALUES (?, ?, ?, ?)',
        [slug, title, content, excerpt || '']
      );

      res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }
}
