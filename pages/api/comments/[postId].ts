import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

interface Comment {
  id: number;
  post_id: number;
  author: string;
  email?: string;
  content: string;
  likes: number;
  approved: boolean;
  created_at: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { postId } = req.query;

  if (req.method === 'GET') {
    try {
      const results = await query(
        'SELECT * FROM comments WHERE post_id = ? AND approved = true ORDER BY created_at DESC',
        [postId]
      ) as Comment[];

      res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  } else if (req.method === 'POST') {
    try {
      const { author, email, content } = req.body;

      if (!author || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await query(
        'INSERT INTO comments (post_id, author, email, content) VALUES (?, ?, ?, ?)',
        [postId, author, email || null, content]
      );

      res.status(201).json({ message: 'Comment posted successfully' });
    } catch (error) {
      console.error('Error posting comment:', error);
      res.status(500).json({ error: 'Failed to post comment' });
    }
  }
}
