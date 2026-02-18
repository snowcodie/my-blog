import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { commentId } = req.query;

  if (req.method === 'PUT') {
    try {
      const adminToken = req.headers['x-admin-token'];

      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { approved } = req.body;

      await query(
        'UPDATE comments SET approved = ? WHERE id = ?',
        [approved, commentId]
      );

      res.status(200).json({ message: 'Comment approval updated' });
    } catch (error) {
      console.error('Error updating comment approval:', error);
      res.status(500).json({ error: 'Failed to update comment approval' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const adminToken = req.headers['x-admin-token'];

      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await query('DELETE FROM comments WHERE id = ?', [commentId]);

      res.status(200).json({ message: 'Comment deleted' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  }
}
