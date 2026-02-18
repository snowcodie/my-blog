import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { likes } = req.body;
      const adminToken = req.headers['x-admin-token'];

      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await query(
        'UPDATE posts SET likes = ? WHERE id = ?',
        [likes, id]
      );

      res.status(200).json({ message: 'Post updated successfully' });
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'Failed to update post' });
    }
  }
}
