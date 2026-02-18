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

export async function getStaticPaths() {
  try {
    const response = await axios.get('http://localhost:3000/api/posts');
    const paths = response.data.map((post: Post) => ({
      params: { slug: post.slug },
    }));
    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error generating paths:', error);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  try {
    const response = await axios.get(`http://localhost:3000/api/posts?slug=${params.slug}`);
    return {
      props: {
        post: response.data,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    return {
      notFound: true,
    };
  }
}

interface BlogPostProps {
  post: Post;
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState(post.likes);
  const [newComment, setNewComment] = useState({ author: '', email: '', content: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/${post.id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
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
    if (!newComment.author || !newComment.content) {
      alert('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/api/comments/${post.id}`, newComment);
      setNewComment({ author: '', email: '', content: '' });
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

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
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post Comment'}
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
};

export default BlogPost;
