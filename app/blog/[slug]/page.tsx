'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp } from 'lucide-react';

interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  likes: number;
  created_at: string;
}

interface Comment {
  id: number;
  author: string;
  email?: string;
  content: string;
  likes: number;
  created_at: string;
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState(0);
  const [newComment, setNewComment] = useState({ author: '', email: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [params.slug]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts?slug=${params.slug}`);
      setPost(response.data);
      setLikes(response.data.likes);
      fetchComments(response.data.id);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: number) => {
    try {
      const response = await axios.get(`/api/comments/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      const newLikes = likes + 1;
      setLikes(newLikes);
      await axios.put(`/api/posts/${post.id}`, 
        { likes: newLikes },
        { headers: { 'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || '' } }
      );
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.author || !newComment.content) {
      alert('Please fill in required fields');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`/api/comments/${post.id}`, newComment);
      setNewComment({ author: '', email: '', content: '' });
      fetchComments(post.id);
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!post) {
    return <div className="min-h-screen flex items-center justify-center">Post not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Post Header */}
        <article className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
          <p className="text-gray-600 mb-6">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>

          {/* Post Content */}
          <div className="prose prose-lg mb-6">
            {post.content}
          </div>

          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <ThumbsUp size={20} />
            <span>{likes} Likes</span>
          </button>
        </article>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-8 pb-8 border-b">
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Name *</label>
              <input
                type="text"
                value={newComment.author}
                onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="Your name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Email</label>
              <input
                type="email"
                value={newComment.email}
                onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="your@email.com"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Comment *</label>
              <textarea
                value={newComment.content}
                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="Your comment..."
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          {/* Existing Comments */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-blue-600 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold">{comment.author}</p>
                      <p className="text-gray-600 text-sm">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <ThumbsUp size={16} />
                      <span className="text-sm">{comment.likes}</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
