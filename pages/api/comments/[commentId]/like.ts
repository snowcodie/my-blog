import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { commentId } = req.query;

  if (req.method === 'PUT') {
    try {
      const { likes } = req.body;

      await query(
        'UPDATE comments SET likes = ? WHERE id = ?',
        [likes, commentId]
      );

      res.status(200).json({ message: 'Comment updated successfully' });
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({ error: 'Failed to update comment' });
    }
  }
}
