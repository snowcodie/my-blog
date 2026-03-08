'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Zap, Code, MapPin } from 'lucide-react';
import Navbar from '@/app/components/Navbar';

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover_image?: string;
  likes: number;
  views: number;
  comments_count?: number;
  series_name?: string;
  series_part?: number;
  series_total?: number;
  created_at: string;
}



export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading] = useState(false);
  const [siteName, setSiteName] = useState('My Blog');
  const [heroTitle, setHeroTitle] = useState('Welcome to My Blog');
  const [heroSubtitle, setHeroSubtitle] = useState('Explore my thoughts on software, mechanics, and travels');
  const [heroBackground, setHeroBackground] = useState('');
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string>('');

  useEffect(() => {
    fetchPosts();
    fetchSettings();
  }, []);

  useEffect(() => {
    // Scroll to posts section when category changes
    if (activeCategory) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        const postsSection = document.getElementById('posts-section');
        if (postsSection) {
          postsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [activeCategory]);

  useEffect(() => {
    // Extract unique series names from posts
    if (posts.length > 0) {
      const seriesNames = new Set<string>();
      posts.forEach(post => {
        if (post.series_name) {
          seriesNames.add(post.series_name);
        }
      });
      setAvailableSeries(Array.from(seriesNames).sort());
    }
  }, [posts]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      const name = response.data.site_name || 'My Blog';
      setSiteName(name);
      setHeroTitle(response.data.hero_title || 'Welcome to My Blog');
      setHeroSubtitle(response.data.hero_subtitle || 'Explore my thoughts on software, mechanics, and travels');
      setHeroBackground(response.data.hero_background || '');
      // Update document title
      document.title = name;
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const [postsResponse, sectionsResponse] = await Promise.all([
        axios.get('/api/posts'),
        axios.get('/api/nav-sections')
      ]);
      setPosts(postsResponse.data || []);
      
      // Set initial active category from URL or first section
      const urlParams = new URLSearchParams(window.location.search);
      const categoryFromUrl = urlParams.get('category');
      if (categoryFromUrl) {
        setActiveCategory(categoryFromUrl);
      } else if (sectionsResponse.data && sectionsResponse.data.length > 0) {
        setActiveCategory(sectionsResponse.data[0].slug || sectionsResponse.data[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    }
  };

  const filteredPosts = posts.filter(post => {
    // Filter by category
    const matchesCategory = post.category === activeCategory;
    
    // Filter by series if one is selected
    if (selectedSeries === 'none') {
      // Show posts without series
      return matchesCategory && !post.series_name;
    } else if (selectedSeries) {
      // Show posts in selected series
      return matchesCategory && post.series_name === selectedSeries;
    }
    
    // No series filter - show all posts in category
    return matchesCategory;
  });

  // Group posts into series and individual posts
  const groupedContent = React.useMemo(() => {
    const seriesMap = new Map<string, Post[]>();
    const individualPosts: Post[] = [];

    filteredPosts.forEach(post => {
      if (post.series_name) {
        const existing = seriesMap.get(post.series_name) || [];
        existing.push(post);
        seriesMap.set(post.series_name, existing);
      } else {
        individualPosts.push(post);
      }
    });

    // Sort posts within each series by part number
    seriesMap.forEach((posts) => {
      posts.sort((a, b) => (a.series_part || 0) - (b.series_part || 0));
    });

    // Combine series and individual posts
    const result: Array<{ type: 'series', seriesName: string, posts: Post[] } | { type: 'post', post: Post }> = [];
    
    seriesMap.forEach((posts, seriesName) => {
      result.push({ type: 'series', seriesName, posts });
    });

    individualPosts.forEach(post => {
      result.push({ type: 'post', post });
    });

    return result;
  }, [filteredPosts]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <Navbar posts={posts} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Hero Section */}
      <div 
        className="text-white py-16 md:py-24 relative bg-gradient-to-br from-blue-600 to-blue-800 dark:from-slate-800 dark:to-slate-900"
        style={heroBackground ? {
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block bg-blue-500/20 dark:bg-cyan-500/20 p-4 rounded-full mb-6">
            <Zap size={48} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{heroTitle}</h1>
          <p className="text-lg md:text-2xl mb-8 text-blue-100 dark:text-slate-300">{heroSubtitle}</p>
        </div>
      </div>

      {/* Main Content */}
      <div id="posts-section" className="max-w-7xl mx-auto px-4 py-12">
        {/* Series Filter Section */}
        {availableSeries.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-purple-100 dark:border-purple-900">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filter by Series</h2>
              </div>
              
              <div className="flex-1 flex flex-wrap gap-2">
                {/* All Posts Button */}
                <button
                  onClick={() => setSelectedSeries('')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedSeries === ''
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  All Posts
                </button>
                
                {/* Non-Series Posts Button */}
                <button
                  onClick={() => setSelectedSeries('none')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedSeries === 'none'
                      ? 'bg-slate-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  📄 Single Posts
                </button>
                
                {/* Series Buttons */}
                {availableSeries.map((series) => (
                  <button
                    key={series}
                    onClick={() => setSelectedSeries(series)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedSeries === series
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700 border border-purple-200 dark:border-purple-900'
                    }`}
                  >
                    📚 {series}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Selected Filter Info */}
            {selectedSeries && (
              <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-900">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedSeries === 'none' 
                    ? 'Showing posts that are not part of any series' 
                    : `Showing all posts in the "${selectedSeries}" series`
                  }
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Blog Posts Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {groupedContent.map((item) => {
              if (item.type === 'series') {
                // Series Card - Layered UI
                const firstPost = item.posts[0];
                return (
                  <div key={`series-${item.seriesName}`} className="relative">
                    {/* Layered background cards */}
                    <div className="absolute top-2 left-2 right-2 h-full bg-purple-100 dark:bg-purple-900/30 rounded-xl border-2 border-purple-200 dark:border-purple-700"></div>
                    <div className="absolute top-1 left-1 right-1 h-full bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-100 dark:border-purple-800"></div>
                    
                    {/* Main card */}
                    <Link href={`/blog/${firstPost.slug}`}>
                      <article className="relative bg-white dark:bg-slate-900 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer h-full overflow-hidden group border-2 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500">
                        {/* Series Banner */}
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 text-white px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">📚</span>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide">Series</p>
                                <p className="text-base font-bold">{item.seriesName}</p>
                              </div>
                            </div>
                            <div className="bg-white/20 px-3 py-1 rounded-full">
                              <span className="text-xs font-bold">{item.posts.length} Parts</span>
                            </div>
                          </div>
                        </div>

                        {/* Cover Image */}
                        {firstPost.cover_image && (
                          <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <img 
                              src={firstPost.cover_image} 
                              alt={firstPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}

                        <div className="p-6 md:p-8 flex flex-col">
                          {/* Category Badge */}
                          <div className="mb-4">
                            <span className="inline-block bg-blue-100 dark:bg-cyan-900 text-blue-700 dark:text-cyan-200 px-3 py-1 rounded-full text-xs font-semibold">
                              {firstPost.category}
                            </span>
                          </div>

                          {/* First post title */}
                          <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                            Part 1: {firstPost.title}
                          </h2>
                          <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 text-sm md:text-base">{firstPost.excerpt}</p>
                          
                          {/* Series parts list */}
                          <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
                            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">All Parts:</p>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                              {item.posts.map((post) => (
                                <Link 
                                  key={post.id} 
                                  href={`/blog/${post.slug}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="block text-xs text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:underline truncate"
                                >
                                  <span className="font-medium">Part {post.series_part}:</span> {post.title}
                                </Link>
                              ))}
                            </div>
                          </div>

                          {/* Stats Row */}
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <span className="flex items-center gap-1.5">
                              ❤️ <span className="font-medium">{item.posts.reduce((sum, p) => sum + p.likes, 0)}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              💬 <span className="font-medium">{item.posts.reduce((sum, p) => sum + (p.comments_count || 0), 0)}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              👁️ <span className="font-medium">{item.posts.reduce((sum, p) => sum + p.views, 0)}</span>
                            </span>
                          </div>

                          <div className="flex justify-between items-center mt-4">
                            <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                              {formatDistanceToNow(new Date(firstPost.created_at), { addSuffix: true })}
                            </span>
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold group-hover:gap-3 transition-all">
                              Start Reading <ArrowRight size={18} />
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </div>
                );
              } else {
                // Individual Post Card
                const post = item.post;
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <article className="bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer h-full overflow-hidden group border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-cyan-400">
                      {/* Cover Image */}
                      {post.cover_image && (
                        <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img 
                            src={post.cover_image} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="p-6 md:p-8 flex flex-col">
                        {/* Category Badge */}
                        <div className="mb-4">
                          <span className="inline-block bg-blue-100 dark:bg-cyan-900 text-blue-700 dark:text-cyan-200 px-3 py-1 rounded-full text-xs font-semibold">
                            {post.category}
                          </span>
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition">
                          {post.title}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 text-sm md:text-base">{post.excerpt}</p>
                        
                        {/* Stats Row */}
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <span className="flex items-center gap-1.5">
                            ❤️ <span className="font-medium">{post.likes}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            💬 <span className="font-medium">{post.comments_count || 0}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            👁️ <span className="font-medium">{post.views || 0}</span>
                          </span>
                        </div>

                        {/* Published Date */}
                        <div className="text-xs text-slate-500 dark:text-slate-500 mb-3">
                          📅 Published {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </span>
                          <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-semibold group-hover:gap-3 transition-all">
                            Read More <ArrowRight size={18} />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              }
            })}
          </div>
        ) : (
          <>
            {/* Personal Bio Section */}
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 md:p-12 mb-12 border border-blue-100 dark:border-slate-700">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                  About Me
                </h2>
                
                <p className="text-lg text-slate-700 dark:text-slate-300 mb-8 text-center leading-relaxed">
                  Hi, I’m Lahiru. I’m someone who enjoys understanding how things work—whether it’s a machine, a motorcycle engine, a piece of software, or a complex business process. My interests span across mechanics, bikes, software development, SAP systems, and exploring how technology can improve real-world workflows. I enjoy building and experimenting with technologies like Spring Boot, Laravel, Next.js, Angular, PostgreSQL, and TypeScript, while also learning and exploring SAP and ABAP. I’m always curious about systems, problem solving, and learning new things. This blog is where I share things I learn along the way, including ideas, challenges, and insights from my journey through technology and continuous learning.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Interests */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="text-blue-600 dark:text-cyan-400" size={24} />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Interests</h3>
                    </div>
                    <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                      <li>Mechanics</li>
                      <li>Motorcycles</li>
                      <li>Software Engineering</li>
                      <li>SAP Systems</li>
                      <li>Business Processes</li>
                      <li>Learning New Technologies</li>
                    </ul>
                  </div>

                  {/* Skills */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="text-blue-600 dark:text-cyan-400" size={24} />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Skills</h3>
                    </div>
                    <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                      <li>Backend Development</li>
                      <li>API Development</li>
                      <li>Database Design</li>
                      <li>System Integration</li>
                      <li>Debugging</li>
                      <li>Business Process Understanding</li>
                    </ul>
                  </div>

                  {/* Technologies */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <Code className="text-blue-600 dark:text-cyan-400" size={24} />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Technical Skills</h3>
                    </div>
                    <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                      <li>Java</li>
                      <li>ABAP</li>
                      <li>SAP HANA</li>
                      <li>SQL</li>
                      <li>TypeScript</li>
                      <li>Spring Boot</li>
                      <li>Laravel</li>
                      <li>Next.js</li>
                      <li>Angular</li>
                      <li>PostgreSQL</li>
                    </ul>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Check out my latest posts below to see what I've been working on!
                  </p>
                </div>
              </div>
            </div>
            
            {/* Show Latest 4 Posts */}
            {posts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Latest Posts</h2>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {posts.slice(0, 4).map((post: Post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                      <article className={`bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer h-full overflow-hidden group ${
                        post.series_name 
                          ? 'border-2 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500' 
                          : 'border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-cyan-400'
                      }`}>
                        {/* Series Banner - Compact for Latest Posts */}
                        {post.series_name && (
                          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1.5 flex items-center justify-between text-xs">
                            <span className="font-bold">📚 {post.series_name}</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">{post.series_part}/{post.series_total}</span>
                          </div>
                        )}
                        
                        {/* Cover Image */}
                        {post.cover_image && (
                          <div className="h-40 overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <img 
                              src={post.cover_image} 
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}

                        <div className="p-4 flex flex-col">
                          {/* Category Badge */}
                          <div className="mb-3">
                            <span className="inline-block bg-blue-100 dark:bg-cyan-900 text-blue-700 dark:text-cyan-200 px-2 py-1 rounded-full text-xs font-semibold">
                              {post.category}
                            </span>
                          </div>

                          <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition">
                            {post.title}
                          </h2>
                          <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 text-sm">{post.excerpt}</p>
                          
                          {/* Stats Row */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <span className="flex items-center gap-1">
                              ❤️ <span className="font-medium">{post.likes}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              💬 <span className="font-medium">{post.comments_count || 0}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              👁️ <span className="font-medium">{post.views || 0}</span>
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 dark:text-slate-500 font-medium">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                            <div className="flex items-center gap-1 text-blue-600 dark:text-cyan-400 font-semibold group-hover:gap-2 transition-all">
                              <ArrowRight size={14} />
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400">© 2026 {siteName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
