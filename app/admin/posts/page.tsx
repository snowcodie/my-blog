'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FileEdit, Plus, Trash2, Edit2, Eye, Check, X, Image, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminSidebar from '@/app/components/AdminSidebar';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Post {
  id?: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  cover_image?: string;
  series_name?: string;
  series_part?: number;
  published: boolean;
  likes: number;
  views: number;
  comments_count?: number;
  created_at?: string;
}

interface NavSection {
  id: number;
  name: string;
  slug: string;
  active: boolean;
}

export default function PostsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [navSections, setNavSections] = useState<NavSection[]>([]);
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreatingNewSeries, setIsCreatingNewSeries] = useState(false);
  const [formData, setFormData] = useState<Post>({
    slug: '',
    title: '',
    content: '',
    excerpt: '',
    category: 'general',
    cover_image: '',
    series_name: '',
    series_part: undefined,
    published: false,
    likes: 0,
    views: 0,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsWidth, setCommentsWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: '#toolbar',
    },
  }), []);

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script', 'list', 'bullet', 'indent', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        setCommentsWidth(Math.max(280, Math.min(600, newWidth)));
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

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/admin/posts', {
        withCredentials: true,
      });
      if (response.status === 200) {
        setIsAuthenticated(true);
        fetchData();
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setAuthChecking(false);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await axios.get('/api/nav-sections');
      console.log('Active sections loaded:', response.data);
      console.log('First section - ID:', response.data[0]?.id, 'Slug:', response.data[0]?.slug, 'ID type:', typeof response.data[0]?.id);
      setNavSections(response.data);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [postsRes] = await Promise.all([
        axios.get('/api/admin/posts', { withCredentials: true }),
        fetchSections(), // Fetch sections separately
      ]);
      setPosts(postsRes.data);
      // Don't fetch series yet - will fetch when category is selected
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSeries = async (category?: string) => {
    try {
      console.log('Fetching series for category:', category);
      const url = category ? `/api/series?category=${category}` : '/api/series';
      console.log('API URL:', url);
      const response = await axios.get(url);
      const seriesData = response.data.map((s: any) => s.name);
      console.log(`Available series for category "${category}":`, seriesData);
      console.log('Full series data:', response.data);
      setAvailableSeries(seriesData);
    } catch (error) {
      console.error('Error fetching series:', error);
      setAvailableSeries([]);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    const initialCategory = navSections[0]?.id.toString() || 'general';
    console.log('handleAddNew - navSections:', navSections);
    console.log('handleAddNew - initialCategory:', initialCategory);
    setFormData({
      slug: '',
      title: '',
      content: '',
      excerpt: '',
      category: initialCategory,
      cover_image: '',
      published: false,
      likes: 0,
      views: 0,
    });
    setShowForm(true);
    // Fetch series for initial category
    console.log('handleAddNew - calling fetchAvailableSeries with:', initialCategory);
    fetchAvailableSeries(initialCategory);
  };

  const handleEdit = async (post: Post) => {
    // Fetch full post details including content
    try {
      const response = await axios.get(`/api/posts?slug=${post.slug}`, {
        withCredentials: true
      });
      const fullPost = response.data;
      
      console.log('Full post data from API:', fullPost);
      console.log('Cover image value:', fullPost.cover_image);
      
      // Convert category from slug to ID if needed
      let categoryValue = fullPost.category;
      const matchingSection = navSections.find(s => s.slug === fullPost.category || s.id.toString() === fullPost.category);
      if (matchingSection) {
        categoryValue = matchingSection.id.toString();
      }
      
      setEditingId(fullPost.id || null);
      setFormData({
        slug: fullPost.slug,
        title: fullPost.title,
        content: fullPost.content,
        excerpt: fullPost.excerpt,
        category: categoryValue,
        cover_image: fullPost.cover_image || '',
        series_name: fullPost.series_name,
        series_part: fullPost.series_part,
        published: fullPost.published,
        likes: fullPost.likes,
        views: fullPost.views,
      });

      // Check if editing a post with a series that's not in the available list
      if (fullPost.series_name && !availableSeries.includes(fullPost.series_name)) {
        setIsCreatingNewSeries(false); // It's an existing series, just not in dropdown
      } else {
        setIsCreatingNewSeries(false);
      }
      
      console.log('FormData set with cover_image:', fullPost.cover_image || '');
      setShowForm(true);
      
      // Fetch series for this post's category (use converted ID)
      fetchAvailableSeries(categoryValue);
    } catch (error) {
      console.error('Error fetching post details:', error);
      setMessage('Failed to load post details');
      setMessageType('error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setMessage('');
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Cover image must be less than 5MB');
      setMessageType('error');
      return;
    }

    setUploadingCover(true);
    console.log('Starting cover image upload, file size:', file.size);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        console.log('Cover image loaded, data URL length:', result.length);
        setFormData((prev) => ({ ...prev, cover_image: result }));
        setMessage('Cover image uploaded successfully');
        setMessageType('success');
      }
      setUploadingCover(false);
    };
    reader.onerror = () => {
      console.error('Failed to read cover image');
      setMessage('Failed to read cover image');
      setMessageType('error');
      setUploadingCover(false);
    };
    reader.readAsDataURL(file);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      setMessage('Title and content are required');
      setMessageType('error');
      return;
    }

    // Auto-generate slug if empty
    if (!formData.slug) {
      formData.slug = generateSlug(formData.title);
    }

    // Auto-generate excerpt if empty
    if (!formData.excerpt && formData.content) {
      const plainText = formData.content.replace(/<[^>]*>/g, '');
      formData.excerpt = plainText.substring(0, 150) + '...';
    }

    setSaving(true);
    setMessage('');

    console.log('Saving post with formData:', {
      ...formData,
      cover_image: formData.cover_image ? `[${formData.cover_image.substring(0, 50)}... (${formData.cover_image.length} chars)]` : 'null/empty'
    });
    console.log('CATEGORY VALUE BEING SENT:', formData.category, '(should be section ID, not slug)');

    try {
      if (editingId) {
        // Update existing post
        const response = await axios.put(`/api/posts/${editingId}`, formData, {
          withCredentials: true,
        });
        if (response.data.success) {
          setMessageType('success');
          setMessage('Post updated successfully!');
          await fetchData();
          await fetchSections(); // Refresh sections list
          handleCancel();
        }
      } else {
        // Create new post
        const response = await axios.post('/api/posts', formData, {
          withCredentials: true,
        });
        if (response.data.success) {
          setMessageType('success');
          setMessage('Post created successfully!');
          await fetchData();
          await fetchSections(); // Refresh sections list
          handleCancel();
        }
      }
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.response?.data?.error || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await axios.delete(`/api/posts/${id}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setMessageType('success');
        setMessage('Post deleted successfully!');
        await fetchData();
      }
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.response?.data?.error || 'Failed to delete post');
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-4 text-center">Access Denied</h1>
          <p className="text-slate-600 text-center mb-6">You must be logged in as admin.</p>
          <Link href="/admin" className="block text-center bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileEdit className="text-blue-600" size={32} />
                <h1 className="text-3xl font-bold text-slate-900">Blog Posts</h1>
              </div>
              {!showForm && (
                <button
                  onClick={handleAddNew}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={20} /> New Post
                </button>
              )}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="fixed inset-0 bg-slate-900 z-50 flex">
              {/* Main Editor Area */}
              <div className="flex-1 flex flex-col bg-white">
                {/* Floating Toolbar */}
                <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2 shadow-sm">
                  <div id="toolbar" className="flex flex-wrap gap-1 items-center flex-1">
                    <select className="ql-header" defaultValue="">
                      <option value="1">Heading 1</option>
                      <option value="2">Heading 2</option>
                      <option value="3">Heading 3</option>
                      <option value="">Normal</option>
                    </select>
                    
                    <button className="ql-bold" title="Bold"></button>
                    <button className="ql-italic" title="Italic"></button>
                    <button className="ql-underline" title="Underline"></button>
                    <button className="ql-strike" title="Strike"></button>
                    
                    <span className="w-px h-6 bg-slate-300 mx-1"></span>
                    
                    <select className="ql-color" title="Text Color"></select>
                    <select className="ql-background" title="Background"></select>
                    
                    <span className="w-px h-6 bg-slate-300 mx-1"></span>
                    
                    <button className="ql-list" value="ordered" title="Numbered List"></button>
                    <button className="ql-list" value="bullet" title="Bullet List"></button>
                    <button className="ql-indent" value="-1" title="Decrease Indent"></button>
                    <button className="ql-indent" value="+1" title="Increase Indent"></button>
                    
                    <span className="w-px h-6 bg-slate-300 mx-1"></span>
                    
                    <button className="ql-blockquote" title="Quote"></button>
                    <button className="ql-code-block" title="Code Block"></button>
                    
                    <span className="w-px h-6 bg-slate-300 mx-1"></span>
                    
                    <button className="ql-link" title="Insert Link"></button>
                    <button className="ql-image" title="Insert Image"></button>
                    <button className="ql-video" title="Insert Video"></button>
                    
                    <span className="w-px h-6 bg-slate-300 mx-1"></span>
                    
                    <button className="ql-clean" title="Clear Formatting"></button>
                  </div>

                  {/* Comments Toggle */}
                  <button
                    onClick={() => setCommentsOpen(!commentsOpen)}
                    className="ml-auto p-2 hover:bg-slate-200 rounded-lg transition text-slate-600"
                    title={commentsOpen ? 'Hide Comments' : 'Show Comments'}
                  >
                    💬 {commentsOpen ? 'Hide' : 'Show'}
                  </button>

                  {/* Sidebar Toggle */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-600"
                    title={sidebarOpen ? 'Hide Settings' : 'Show Settings'}
                  >
                    {sidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-600"
                    title="Close Editor"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    modules={quillModules}
                    formats={quillFormats}
                    className="h-full"
                    placeholder="Start writing your amazing content..."
                  />
                </div>
              </div>

              {/* Comments Panel */}
              {commentsOpen && (
                <>
                  {/* Resize Handle */}
                  <div
                    onMouseDown={() => setIsResizing(true)}
                    className="w-1 bg-slate-200 hover:bg-blue-500 cursor-col-resize transition-colors relative group"
                  >
                    <div className="absolute inset-y-0 -left-1 -right-1" />
                  </div>

                  <div 
                    className="bg-slate-50 border-l border-slate-200 overflow-y-auto flex flex-col"
                    style={{ width: `${commentsWidth}px` }}
                  >
                    <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
                      <h3 className="text-lg font-bold text-slate-900">Comments Preview</h3>
                      <p className="text-xs text-slate-500 mt-1">Preview how comments will appear on this post</p>
                    </div>
                    <div className="flex-1 p-4">
                      {editingId ? (
                        <div className="text-sm text-slate-600">
                          <p className="mb-2">Post ID: {editingId}</p>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-xs text-slate-500">Comments will appear here once the post is published and users start commenting.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-slate-600">Save the post first to see comments.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Right Sidebar - Post Metadata */}
              <div 
                className={`bg-white border-l border-slate-200 overflow-y-auto transition-all duration-300 ${
                  sidebarOpen ? 'w-80' : 'w-0'
                }`}
              >
                <div className={`p-6 space-y-6 ${sidebarOpen ? 'block' : 'hidden'}`}>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">
                      Post Settings
                    </h2>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setFormData({ 
                          ...formData, 
                          title,
                          slug: formData.slug || generateSlug(title)
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="My Awesome Blog Post"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="my-awesome-blog-post"
                    />
                  </div>

                  {/* Section */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Section *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const newCategory = e.target.value;
                        setFormData({ ...formData, category: newCategory, series_name: undefined, series_part: undefined });
                        // Fetch series for the new category
                        fetchAvailableSeries(newCategory);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {navSections.length === 0 ? (
                        <option value="general">General</option>
                      ) : (
                        navSections.map((section) => {
                          const optionValue = section.id.toString();
                          console.log(`Dropdown option - Name: ${section.name}, ID: ${section.id}, Value being set: ${optionValue}`);
                          return (
                            <option key={section.id} value={optionValue}>
                              {section.name}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                    <button
                      onClick={() => setFormData({ ...formData, published: !formData.published })}
                      className={`w-full px-3 py-2 rounded-lg font-semibold transition ${
                        formData.published
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {formData.published ? '✓ Published' : '○ Draft'}
                    </button>
                  </div>

                  {/* Series Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Series Name (Optional)</label>
                    <select
                      value={isCreatingNewSeries ? '__new__' : (formData.series_name || '')}
                      onChange={(e) => {
                        if (e.target.value === '__new__') {
                          setIsCreatingNewSeries(true);
                          setFormData({ ...formData, series_name: '' });
                        } else if (e.target.value === '') {
                          setIsCreatingNewSeries(false);
                          setFormData({ ...formData, series_name: undefined, series_part: undefined });
                        } else {
                          setIsCreatingNewSeries(false);
                          setFormData({ ...formData, series_name: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Series</option>
                      {/* Show current series if it exists but not in available list */}
                      {formData.series_name && !availableSeries.includes(formData.series_name) && (
                        <option value={formData.series_name}>{formData.series_name} (Current)</option>
                      )}
                      {availableSeries.map((series) => (
                        <option key={series} value={series}>{series}</option>
                      ))}
                      <option value="__new__">➕ Create New Series</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      {availableSeries.length > 0 
                        ? 'Select from existing series or create a new one'
                        : 'Create a new series to group related posts together'}
                    </p>
                  </div>

                  {/* New Series Name Input */}
                  {isCreatingNewSeries && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">New Series Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., ABAP Debugger, React Tutorial"
                        value={formData.series_name || ''}
                        onChange={(e) => setFormData({ ...formData, series_name: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  )}

                  {/* Series Part */}
                  {formData.series_name && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Part Number</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={formData.series_part || ''}
                        onChange={(e) => setFormData({ ...formData, series_part: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Enter which part this is in the series (e.g., 1, 2, 3...)
                      </p>
                    </div>
                  )}

                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Image</label>
                    <div className="space-y-3">
                      <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                        <Upload size={18} className="text-slate-500" />
                        <span className="text-sm text-slate-600">Upload (Max 5MB)</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.gif"
                          onChange={handleCoverUpload}
                          disabled={uploadingCover}
                          className="hidden"
                        />
                      </label>
                      {formData.cover_image && (
                        <div className="relative">
                          <img 
                            src={formData.cover_image} 
                            alt="Cover preview" 
                            className="w-full h-32 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            onClick={() => setFormData({ ...formData, cover_image: '' })}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Excerpt (Optional)</label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                      rows={4}
                      placeholder="Brief summary..."
                    />
                    <p className="text-xs text-slate-500 mt-1">Auto-generated if empty</p>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 transition flex items-center justify-center gap-2"
                  >
                    <Check size={20} /> {saving ? 'Saving...' : (editingId ? 'Update Post' : 'Create Post')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Posts List */}
          {!showForm && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {posts.length === 0 ? 'No posts yet' : `${posts.length} posts`}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    <FileEdit size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No blog posts found. Create your first one!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
                    >
                      {post.cover_image && (
                        <div className="h-48 overflow-hidden bg-slate-100">
                          <img 
                            src={post.cover_image} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-slate-900 line-clamp-2 flex-1">{post.title}</h3>
                          {post.published ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded ml-2 flex-shrink-0">Published</span>
                          ) : (
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded ml-2 flex-shrink-0">Draft</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">{post.category}</span>
                          <span className="flex items-center gap-1">❤️ {post.likes}</span>
                          <span className="flex items-center gap-1">👁️ {post.views}</span>
                          <span className="flex items-center gap-1">💬 {post.comments_count || 0}</span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/blog/${post.slug}`}
                            className="flex-1 text-center bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 transition flex items-center justify-center gap-1"
                          >
                            <Eye size={16} /> View
                          </Link>
                          <button
                            onClick={() => handleEdit(post)}
                            className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg hover:bg-blue-200 transition flex items-center justify-center gap-1"
                          >
                            <Edit2 size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(post.id!)}
                            className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
