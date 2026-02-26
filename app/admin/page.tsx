'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import AdminSidebar from '@/app/components/AdminSidebar';

interface Comment {
  id: number;
  post_id: number;
  author: string;
  email: string;
  content: string;
  likes: number;
  created_at: string;
  slug: string;
  title: string;
}

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  likes: number;
  published: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/admin/posts', {
        withCredentials: true,
      });
      if (response.status === 200) {
        setIsAuthenticated(true);
        fetchData();
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!username || !password) {
      alert('Username and password are required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        '/api/admin/login',
        { username, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsAuthenticated(true);
        setUsername('');
        setPassword('');
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure cookie is set
        await fetchData();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.response?.data?.error || 'Login failed. Invalid credentials.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [commentsRes, postsRes] = await Promise.all([
        axios.get('/api/admin/comments/pending', {
          withCredentials: true,
        }),
        axios.get('/api/admin/posts', {
          withCredentials: true,
        }),
      ]);

      setPendingComments(commentsRes.data || []);
      setPosts(postsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const approveComment = async (commentId: number) => {
    try {
      await axios.put(
        `/api/admin/comments/${commentId}`,
        { action: 'approve' },
        { withCredentials: true }
      );
      fetchData();
    } catch (error) {
      alert('Failed to approve comment');
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await axios.delete(`/api/admin/comments/${commentId}`, {
        withCredentials: true,
      });
      fetchData();
    } catch (error) {
      alert('Failed to delete comment');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setPendingComments([]);
    setPosts([]);
    // Logout by making a request to clear the cookie
    axios.post('/api/admin/logout', {}, { withCredentials: true }).catch(() => {});
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">Admin Panel</h1>
          <p className="text-slate-600 text-center mb-6 text-sm">Manage your blog content</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              autoFocus
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 transition"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-2 font-semibold">Don't have an account?</p>
            <Link 
              href="/admin/create-user"
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              Create new admin account →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      
      <div className="md:ml-64 p-8">
        <div className="max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
          {/* Pending Comments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Pending Comments ({pendingComments.length})
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {pendingComments.length === 0 ? (
                <p className="text-slate-500">No pending comments</p>
              ) : (
                pendingComments.map((comment) => (
                  <div key={comment.id} className="border border-slate-200 rounded p-4">
                    <p className="font-semibold text-slate-900">{comment.author}</p>
                    <p className="text-sm text-slate-600 mb-2">On: {comment.title}</p>
                    <p className="text-slate-700 mb-3">{comment.content}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveComment(comment.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Posts List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Posts ({posts.length})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {posts.length === 0 ? (
                <p className="text-slate-500">No posts yet</p>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="border border-slate-200 rounded p-3">
                    <p className="font-semibold text-slate-900">{post.title}</p>
                    <p className="text-sm text-slate-600">{post.slug}</p>
                    <p className="text-xs text-slate-500">
                      {post.published ? '✓ Published' : '○ Draft'} • {post.likes} likes
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
