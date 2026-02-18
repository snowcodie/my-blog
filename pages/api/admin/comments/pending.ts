import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const adminToken = req.headers['x-admin-token'];

      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const results = await query(
        'SELECT * FROM comments WHERE approved = false ORDER BY created_at DESC'
      );

      res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching pending comments:', error);
      res.status(500).json({ error: 'Failed to fetch pending comments' });
    }
  }
}
