import { useState, useEffect } from 'react';
import { MessageCircle, Reply } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

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

interface CommentNodeProps {
  comment: Comment;
  postId: number;
  depth: number;
  onReplySubmit: () => void;
}

function CommentNode({ comment, postId, depth, onReplySubmit }: CommentNodeProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyIsAnonymous, setReplyIsAnonymous] = useState(false);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

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
      const headers: any = {};
      if (adminToken) {
        headers['x-admin-token'] = adminToken;
      }

      await axios.post(`/api/comments/${postId}`, {
        content: replyContent,
        author: replyIsAnonymous ? null : replyAuthor,
        email: replyIsAnonymous ? null : replyEmail,
        isAnonymous: replyIsAnonymous,
        parentCommentId: comment.id
      }, { headers });

      setReplyContent('');
      setReplyAuthor('');
      setReplyEmail('');
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
    <div 
      className={`${depth > 0 ? 'ml-6 mt-3 relative' : 'mt-4'}`}
    >
      {/* Tree line connector for replies */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-600"></div>
      )}
      {depth > 0 && (
        <div className="absolute left-0 top-6 w-4 h-px bg-slate-300 dark:bg-slate-600"></div>
      )}
      
      <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm ${depth > 0 ? 'ml-4' : ''}`}>
        {/* Comment Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
              {displayName[0].toUpperCase()}
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {displayName}
              </span>              {comment.is_author && (
                <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded font-bold">
                  Author
                </span>
              )}              {comment.is_anonymous && (
                <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded">
                  Anonymous
                </span>
              )}
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Comment Content */}
        <p className="text-slate-700 dark:text-slate-300 mb-3 whitespace-pre-wrap">
          {comment.content}
        </p>

        {/* Comment Actions */}
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <Reply size={16} />
            <span>Reply</span>
          </button>
          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <MessageCircle size={16} />
              <span>
                {isCollapsed ? 'Show' : 'Hide'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </span>
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="mt-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id={`anonymous-${comment.id}`}
                checked={replyIsAnonymous}
                onChange={(e) => setReplyIsAnonymous(e.target.checked)}
                className="rounded"
              />
              <label htmlFor={`anonymous-${comment.id}`} className="text-sm text-slate-700 dark:text-slate-300">
                Post anonymously (get a funny name!)
              </label>
            </div>

            {!replyIsAnonymous && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={replyAuthor}
                  onChange={(e) => setReplyAuthor(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required={!replyIsAnonymous}
                />
                <input
                  type="email"
                  placeholder="Your email (optional)"
                  value={replyEmail}
                  onChange={(e) => setReplyEmail(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            )}

            <textarea
              placeholder="Write your reply..."
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                type="button"
                onClick={() => setShowReplyForm(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Render Replies */}
      {comment.replies && comment.replies.length > 0 && !isCollapsed && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
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

interface CommentTreeProps {
  postId: number;
}

export default function CommentTree({ postId }: CommentTreeProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const headers: any = {};
      if (adminToken) {
        headers['x-admin-token'] = adminToken;
      }

      const response = await axios.post(`/api/comments/${postId}`, {
        content: newComment,
        author: isAnonymous ? null : author,
        email: isAnonymous ? null : email,
        isAnonymous,
        parentCommentId: null
      }, { headers });

      if (response.data.generatedName) {
        alert(`Welcome, ${response.data.generatedName}! 🎉`);
      } else if (response.data.isAuthor) {
        alert('Comment posted as Author! ✍️');
      }

      setNewComment('');
      setAuthor('');
      setEmail('');
      fetchComments();
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Comments ({comments.length})
      </h2>

      {/* New Comment Form */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="anonymous" className="text-sm text-slate-700 dark:text-slate-300">
              Post anonymously (get a funny name like &quot;Tesla Lion&quot;!)
            </label>
          </div>

          {!isAnonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required={!isAnonymous}
              />
              <input
                type="email"
                placeholder="Your email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          )}

          <textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-center text-slate-500 dark:text-slate-400 py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              postId={postId}
              depth={0}
              onReplySubmit={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
