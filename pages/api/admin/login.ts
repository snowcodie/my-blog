import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const adminToken = req.headers['x-admin-token'];

      if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const adminToken2 = req.body.adminToken;
      if (adminToken2 !== process.env.ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate a session token or JWT
      res.status(200).json({ 
        success: true,
        token: adminToken,
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
}
