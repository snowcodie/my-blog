'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/app/components/AdminSidebar';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Check, X, MessageCircle } from 'lucide-react';

interface Comment {
  id: number;
  post_id: number;
  parent_comment_id?: number;
  author: string;
  email?: string;
  is_anonymous: boolean;
  generated_name?: string;
  content: string;
  likes: number;
  approved: boolean;
  created_at: string;
  post_title?: string;
}

export default function CommentsAdmin() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/comments', {
        headers: { 'x-admin-token': token || '' }
      });
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/admin/comments/${id}`, 
        { approved: true },
        { headers: { 'x-admin-token': token || '' } }
      );
      fetchComments();
    } catch (error) {
      console.error('Failed to approve comment:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/admin/comments/${id}`, 
        { approved: false },
        { headers: { 'x-admin-token': token || '' } }
      );
      fetchComments();
    } catch (error) {
      console.error('Failed to reject comment:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/comments/${id}`, {
        headers: { 'x-admin-token': token || '' }
      });
      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const filteredComments = comments.filter(comment => {
    if (filter === 'pending') return !comment.approved;
    if (filter === 'approved') return comment.approved;
    return true;
  });

  const displayName = (comment: Comment) => {
    if (comment.is_anonymous) {
      return comment.generated_name || 'Anonymous';
    }
    return comment.author;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
            Manage Comments
          </h1>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              All ({comments.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Pending ({comments.filter(c => !c.approved).length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'approved'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Approved ({comments.filter(c => c.approved).length})
            </button>
          </div>

          {/* Comments List */}
          {filteredComments.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg">
              <MessageCircle size={48} className="mx-auto mb-4 text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">No comments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm"
                >
                  {/* Comment Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold">
                        {displayName(comment)[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {displayName(comment)}
                          </span>
                          {comment.is_anonymous && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded">
                              Anonymous
                            </span>
                          )}
                          {!comment.approved && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 px-2 py-0.5 rounded">
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                          {comment.email && (
                            <>
                              <span>•</span>
                              <span>{comment.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        comment.approved
                          ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300'
                      }`}>
                        {comment.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Post Info */}
                  {comment.post_title && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      On post: <span className="font-medium">{comment.post_title}</span>
                      {comment.parent_comment_id && (
                        <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                          Reply to comment #{comment.parent_comment_id}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Comment Content */}
                  <p className="text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap">
                    {comment.content}
                  </p>

                  {/* Comment Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-slate-500 dark:text-slate-400">
                    <span>👍 {comment.likes} likes</span>
                    <span>ID: {comment.id}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {!comment.approved && (
                      <button
                        onClick={() => handleApprove(comment.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check size={16} />
                        Approve
                      </button>
                    )}
                    {comment.approved && (
                      <button
                        onClick={() => handleReject(comment.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        <X size={16} />
                        Unapprove
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
