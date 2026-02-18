import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, Trash2, Check } from 'lucide-react';

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

const AdminPanel: React.FC = () => {
  const [adminToken, setAdminToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('comments');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admin/login', {
        adminToken: adminToken,
      });
      if (response.status === 200) {
        localStorage.setItem('adminToken', adminToken);
        setIsLoggedIn(true);
        fetchPendingComments();
        fetchPosts();
      }
    } catch (error) {
      alert('Invalid admin token');
    }
  };

  const fetchPendingComments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/comments/pending', {
        headers: { 'x-admin-token': token },
      });
      setPendingComments(response.data);
    } catch (error) {
      console.error('Error fetching pending comments:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/posts', {
        headers: { 'x-admin-token': token },
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const approveComment = async (commentId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/admin/comments/${commentId}`, 
        { approved: true },
        { headers: { 'x-admin-token': token } }
      );
      fetchPendingComments();
    } catch (error) {
      console.error('Error approving comment:', error);
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/comments/${commentId}`, {
        headers: { 'x-admin-token': token },
      });
      fetchPendingComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAdminToken(token);
      setIsLoggedIn(true);
      fetchPendingComments();
      fetchPosts();
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Admin Token"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button
            onClick={() => {
              localStorage.removeItem('adminToken');
              setIsLoggedIn(false);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'comments'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            Pending Comments ({pendingComments.length})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'posts'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            Posts ({posts.length})
          </button>
        </div>

        {activeTab === 'comments' && (
          <div className="space-y-4">
            {pendingComments.length === 0 ? (
              <p className="text-gray-500">No pending comments</p>
            ) : (
              pendingComments.map((comment) => (
                <div key={comment.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold">{comment.author}</p>
                      <p className="text-gray-600 text-sm">{comment.email}</p>
                      <p className="text-gray-500 text-xs">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveComment(comment.id)}
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <p className="text-gray-600">{post.slug}</p>
                    <p className="text-gray-500 text-sm">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <ThumbsUp size={18} />
                    <span>{post.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
