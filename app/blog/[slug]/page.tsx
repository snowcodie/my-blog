'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, Eye, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import CommentTree from '@/app/components/CommentTree';
import Navbar from '@/app/components/Navbar';
import { getUserToken } from '@/lib/userToken';

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
  series_name?: string;
  series_part?: number;
  series_total?: number;
  created_at: string;
}

interface SeriesPost {
  id: number;
  slug: string;
  title: string;
  series_part: number;
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [seriesPosts, setSeriesPosts] = useState<SeriesPost[]>([]);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(true);
  const [commentsWidth, setCommentsWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [hideTimer, setHideTimer] = useState<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMouseOverNavbar, setIsMouseOverNavbar] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [params.slug]);

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // Auto-hide navbar after 3 seconds for both mobile and desktop, but not if mouse is over navbar
    const timer = setTimeout(() => {
      if (!isMouseOverNavbar) {
        setNavbarVisible(false);
      }
    }, 3000);
    setHideTimer(timer);

    const handleScroll = () => {
      // Only show on scroll for mobile
      if (isMobile) {
        setNavbarVisible(true);
        if (hideTimer) clearTimeout(hideTimer);
        const newTimer = setTimeout(() => {
          if (!isMouseOverNavbar) {
            setNavbarVisible(false);
          }
        }, 3000);
        setHideTimer(newTimer);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Show navbar when mouse is near top (within 100px) for both mobile and desktop
      if (e.clientY < 100) {
        setNavbarVisible(true);
        if (hideTimer) clearTimeout(hideTimer);
        const newTimer = setTimeout(() => {
          if (!isMouseOverNavbar) {
            setNavbarVisible(false);
          }
        }, 3000);
        setHideTimer(newTimer);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMobile, isMouseOverNavbar]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        setCommentsWidth(Math.max(300, Math.min(700, newWidth)));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts?slug=${params.slug}`);
      setPost(response.data);
      setLikes(response.data.likes);
      
      // Check if user has already liked this post
      const userToken = getUserToken();
      const likeStatusResponse = await axios.get(
        `/api/posts/${response.data.id}/like?userToken=${userToken}`
      );
      setHasLiked(likeStatusResponse.data.hasLiked);

      // Fetch series posts if this post is part of a series
      if (response.data.series_name) {
        fetchSeriesPosts(response.data.series_name);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeriesPosts = async (seriesName: string) => {
    try {
      const response = await axios.get(`/api/posts?series=${encodeURIComponent(seriesName)}`);
      setSeriesPosts(response.data);
    } catch (error) {
      console.error('Error fetching series posts:', error);
    }
  };

  const handleLike = async () => {
    if (!post || hasLiked) return;
    
    try {
      const userToken = getUserToken();
      const response = await axios.post(`/api/posts/${post.id}/like`, { userToken });
      
      if (response.data.success) {
        setLikes(response.data.likes);
        setHasLiked(true);
      }
    } catch (error: any) {
      if (error.response?.data?.hasLiked) {
        setHasLiked(true);
      }
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!post) {
    return <div className="min-h-screen flex items-center justify-center">Post not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      {/* Auto-hiding Navbar */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          navbarVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        onMouseEnter={() => setIsMouseOverNavbar(true)}
        onMouseLeave={() => setIsMouseOverNavbar(false)}
      >
        <Navbar posts={[]} activeCategory="" onCategoryChange={undefined as any} />
      </div>

      {/* Main Layout */}
      <div className="flex flex-1">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Comment Toggle Button - Fixed Position */}
          <button
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="fixed top-20 right-4 z-40 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2"
            title={commentsOpen ? 'Hide Comments' : 'Show Comments'}
          >
            <MessageCircle size={20} />
            {!commentsOpen && <span className="text-sm font-medium">{post?.comments_count || 0}</span>}
          </button>

          {/* Post Header */}
          <article className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden mb-8">
          {/* Cover Image */}
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

            {/* Series Navigation */}
            {post.series_name && seriesPosts.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4 mb-6 border border-blue-200 dark:border-slate-500">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wide">
                      📚 Series: {post.series_name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Part {post.series_part} of {post.series_total}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {post.series_part && post.series_part > 1 && (
                      <a
                        href={`/blog/${seriesPosts.find(p => p.series_part === post.series_part! - 1)?.slug}`}
                        className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-700 transition text-sm font-semibold"
                      >
                        <ChevronLeft size={16} /> Prev
                      </a>
                    )}
                    {post.series_part && post.series_total && post.series_part < post.series_total && (
                      <a
                        href={`/blog/${seriesPosts.find(p => p.series_part === post.series_part! + 1)?.slug}`}
                        className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-700 transition text-sm font-semibold"
                      >
                        Next <ChevronRight size={16} />
                      </a>
                    )}
                  </div>
                </div>
                {/* Series Posts List */}
                <div className="space-y-1">
                  {seriesPosts.map((seriesPost) => (
                    <a
                      key={seriesPost.id}
                      href={`/blog/${seriesPost.slug}`}
                      className={`block px-3 py-2 rounded text-sm transition ${
                        seriesPost.slug === post.slug
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="font-semibold">Part {seriesPost.series_part}:</span> {seriesPost.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Post Stats */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Eye size={20} />
                <span>{post.views} views</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <ThumbsUp size={20} />
                <span>{likes} likes</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <MessageCircle size={20} />
                <span>{post.comments_count || 0} comments</span>
              </div>
            </div>

            {/* Post Content */}
            <div 
              className="prose prose-lg dark:prose-invert mb-6 max-w-none
                [&_*]:!text-slate-900 dark:[&_*]:!text-slate-100
                [&_a]:!text-blue-600 dark:[&_a]:!text-blue-400 [&_a]:!underline hover:[&_a]:!text-blue-700
                [&_code]:!text-purple-600 dark:[&_code]:!text-purple-400 [&_code]:!bg-slate-100 dark:[&_code]:!bg-slate-800 [&_code]:!px-1 [&_code]:!py-0.5 [&_code]:!rounded
                [&_pre]:!bg-slate-900 [&_pre]:!text-slate-100 [&_pre]:!p-4 [&_pre]:!rounded-lg [&_pre]:!overflow-x-auto
                [&_pre_code]:!bg-transparent [&_pre_code]:!text-slate-100 [&_pre_code]:!p-0
                [&_h1]:!text-3xl [&_h1]:!font-bold [&_h1]:!mb-4 [&_h1]:!mt-8
                [&_h2]:!text-2xl [&_h2]:!font-bold [&_h2]:!mb-3 [&_h2]:!mt-6
                [&_h3]:!text-xl [&_h3]:!font-bold [&_h3]:!mb-2 [&_h3]:!mt-4
                [&_h4]:!text-lg [&_h4]:!font-semibold [&_h4]:!mb-2 [&_h4]:!mt-3
                [&_p]:!mb-4 [&_p]:!leading-relaxed
                [&_ul]:!list-disc [&_ul]:!ml-6 [&_ul]:!mb-4 [&_ul]:!space-y-2
                [&_ol]:!list-decimal [&_ol]:!ml-6 [&_ol]:!mb-4 [&_ol]:!space-y-2
                [&_li]:!mb-1 [&_li]:!leading-relaxed
                [&_blockquote]:!border-l-4 [&_blockquote]:!border-blue-500 [&_blockquote]:!pl-4 [&_blockquote]:!py-2 [&_blockquote]:!my-4 [&_blockquote]:!bg-slate-50 dark:[&_blockquote]:!bg-slate-800/50 [&_blockquote]:!italic
                [&_table]:!w-full [&_table]:!border-collapse [&_table]:!mb-4
                [&_th]:!bg-slate-100 dark:[&_th]:!bg-slate-800 [&_th]:!border [&_th]:!border-slate-300 dark:[&_th]:!border-slate-600 [&_th]:!p-2 [&_th]:!font-semibold
                [&_td]:!border [&_td]:!border-slate-300 dark:[&_td]:!border-slate-600 [&_td]:!p-2
                [&_img]:!rounded-lg [&_img]:!my-4 [&_img]:!max-w-full [&_img]:!h-auto
                [&_hr]:!my-6 [&_hr]:!border-slate-300 dark:[&_hr]:!border-slate-700
                [&_strong]:!font-bold [&_em]:!italic
                [&_mark]:!bg-yellow-200 dark:[&_mark]:!bg-yellow-900 [&_mark]:!px-1"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={hasLiked}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                hasLiked 
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <ThumbsUp size={20} className={hasLiked ? 'fill-current' : ''} />
              <span>{hasLiked ? 'Already liked' : 'Like this post'}</span>
            </button>
          </div>
        </article>
        </div>
      </div>

      {/* Comments Sidebar */}
      {commentsOpen && (
        <>
          {/* Resize Handle */}
          <div
            onMouseDown={() => setIsResizing(true)}
            className="w-1 bg-slate-200 dark:bg-slate-700 hover:bg-purple-500 cursor-col-resize transition-colors relative"
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>

          {/* Comments Panel */}
          <div 
            className="bg-white dark:bg-slate-800 overflow-y-auto shadow-xl border-l border-slate-200 dark:border-slate-700"
            style={{ width: `${commentsWidth}px` }}
          >
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageCircle size={24} />
                Comments ({post.comments_count || 0})
              </h2>
            </div>
            <div className="p-4">
              {post && <CommentTree postId={post.id} />}
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
