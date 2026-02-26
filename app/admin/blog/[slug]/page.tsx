'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, Eye, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AdminSidebar from '@/app/components/AdminSidebar';

interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image?: string;
  likes: number;
  views: number;
  comments_count: number;
  created_at: string;
}

interface Comment {
  id: number;
  post_id: number;
  parent_comment_id?: number;
  author: string;
  email?: string;
  is_anonymous: boolean;
  generated_name?: string;
  is_author: boolean;
  content: string;
  likes: number;
  approved: boolean;
  created_at: string;
  replies?: Comment[];
}

function CommentNode({ comment, postId, depth, onReplySubmit }: any) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayName = comment.is_author
    ? 'Author'
    : comment.is_anonymous 
    ? (comment.generated_name || 'Anonymous')
    : comment.author;

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      await axios.post(`/api/comments/${postId}`, {
        content: replyContent,
        author: null,
        email: null,
        isAnonymous: false,
        parentCommentId: comment.id
      }, { 
        headers: { 'x-admin-token': adminToken || '' }
      });

      setReplyContent('');
      setShowReplyForm(false);
      onReplySubmit();
    } catch (error) {
      console.error('Failed to post reply:', error);
      alert('Failed to post reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 mt-3 relative' : 'mt-4'}`}>
      {depth > 0 && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-600"></div>
          <div className="absolute left-0 top-6 w-4 h-px bg-slate-300 dark:bg-slate-600"></div>
        </>
      )}
      
      <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm ${depth > 0 ? 'ml-4' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
              {displayName[0].toUpperCase()}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                {displayName}
              </span>
              {comment.is_author && (
                <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded font-bold">
                  Author
                </span>
              )}
              {comment.is_anonymous && (
                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded">
                  Anonymous
                </span>
              )}
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>

        <p className="text-slate-700 dark:text-slate-300 mb-3 whitespace-pre-wrap">
          {comment.content}
        </p>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-600 dark:text-slate-400">👍 {comment.likes}</span>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-purple-600 dark:text-purple-400 hover:underline"
          >
            Reply
          </button>
        </div>

        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="mt-4 space-y-3">
            <textarea
              placeholder="Write your reply as Author..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Reply as Author'}
              </button>
              <button
                type="button"
                onClick={() => setShowReplyForm(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply: Comment) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onReplySubmit={onReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminBlogPost({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [params.slug]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts?slug=${params.slug}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!post) return;
    try {
      const response = await axios.get(`/api/comments/${post.id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  useEffect(() => {
    if (post) {
      fetchComments();
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      await axios.post(`/api/comments/${post.id}`, {
        content: newComment,
        author: null,
        email: null,
        isAnonymous: false,
        parentCommentId: null
      }, {
        headers: { 'x-admin-token': adminToken || '' }
      });

      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  if (!post) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-600 dark:text-slate-400">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">
          {/* Back Button */}
          <Link 
            href="/admin/posts"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Posts
          </Link>

          {/* Post Content */}
          <article className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden mb-8">
            {post.cover_image && (
              <div className="w-full h-96 overflow-hidden">
                <img 
                  src={post.cover_image} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">{post.title}</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>

              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Eye size={20} />
                  <span>{post.views} views</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <ThumbsUp size={20} />
                  <span>{post.likes} likes</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MessageCircle size={20} />
                  <span>{post.comments_count || 0} comments</span>
                </div>
              </div>

              <div 
                className="prose prose-lg dark:prose-invert mb-6 max-w-none [&_*]:!text-slate-900 dark:[&_*]:!text-slate-100 [&_a]:!text-blue-600 dark:[&_a]:!text-blue-400 [&_code]:!text-purple-600 dark:[&_code]:!text-purple-400"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </article>

          {/* Comments Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Comments ({comments.length})
            </h2>

            {/* New Comment Form */}
            <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 You're posting as <strong>Author</strong> (admin)
                  </p>
                </div>
                <textarea
                  placeholder="Share your thoughts as the author..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment as Author'}
                </button>
              </form>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-1">
                {comments.map((comment) => (
                  <CommentNode
                    key={comment.id}
                    comment={comment}
                    postId={post.id}
                    depth={0}
                    onReplySubmit={fetchComments}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
