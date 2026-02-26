'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Users } from 'lucide-react';
import AdminSidebar from '@/app/components/AdminSidebar';

export default function CreateAdminPage() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!username || !password) {
      setMessageType('error');
      setMessage('Username and password are required');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessageType('error');
      setMessage('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        '/api/admin/create-user',
        { username, password },
        {
          headers: {
            'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN,
          },
        }
      );

      if (response.data.success) {
        setMessageType('success');
        setMessage(`✓ Admin "${username}" created successfully!`);
        setUsername('');
        setPassword('');
      }
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.response?.data?.error || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-md mx-auto p-6">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Create New Admin</h1>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  messageType === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 mt-6"
            >
              {loading ? 'Creating...' : 'Create Admin User'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mb-3">Info:</p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li>• Username must be unique</li>
              <li>• Password must be at least 6 characters</li>
              <li>• New admin can log in with username/password</li>
              <li>• Or use ADMIN_TOKEN from .env.local</li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
