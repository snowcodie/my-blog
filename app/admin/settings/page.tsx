'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Settings, Save, Upload, X } from 'lucide-react';
import AdminSidebar from '@/app/components/AdminSidebar';

interface SiteSettings {
  id?: number;
  site_name: string;
  site_logo: string;
  site_favicon: string;
  site_favicon_dark: string;
  site_description: string;
  hero_title: string;
  hero_subtitle: string;
  hero_background: string;
}

// Compress image before converting to base64
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if needed
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function SettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'My Blog',
    site_logo: '',
    site_favicon: '',
    site_favicon_dark: '',
    site_description: '',
    hero_title: 'Welcome to My Blog',
    hero_subtitle: 'Explore my thoughts on software, mechanics, and travels',
    hero_background: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingFaviconDark, setUploadingFaviconDark] = useState(false);
  const [uploadingHeroBackground, setUploadingHeroBackground] = useState(false);

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
        fetchSettings();
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setAuthChecking(false);
    }
  };

  const fetchSettings = async () => {
    try {
      console.log('📥 Fetching settings from database...');
      const response = await axios.get('/api/settings');
      console.log('✓ Settings received:', {
        site_name: response.data.site_name,
        has_logo: !!response.data.site_logo,
        has_favicon: !!response.data.site_favicon,
        favicon_length: response.data.site_favicon?.length || 0,
        favicon_preview: response.data.site_favicon ? response.data.site_favicon.substring(0, 100) : 'empty'
      });
      setSettings(response.data);
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const compressed = await compressImage(file, 400, 0.8); // Logo: 400px max, 80% quality
      setSettings({ ...settings, site_logo: compressed });
      setUploadingLogo(false);
    } catch (error) {
      console.error('Error compressing image:', error);
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/x-icon', 'image/svg+xml', 'image/jpeg', 'image/gif', 'image/webp', 'image/vnd.microsoft.icon'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(png|ico|svg|jpg|jpeg|gif|webp)$/i)) {
      setMessage('Please upload a valid image file (PNG, ICO, SVG, JPG, GIF, or WebP)');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      e.target.value = '';
      return;
    }

    setUploadingFavicon(true);
    setMessage('');

    try {
      const compressed = await compressImage(file, 64, 0.9); // Favicon: 64px max, 90% quality
      
      if (!compressed || !compressed.startsWith('data:')) {
        setMessage('Failed to compress file. Please try again.');
        setMessageType('error');
        setUploadingFavicon(false);
        return;
      }
      
      console.log('✓ Favicon compressed successfully');
      console.log('📏 Compressed size:', compressed.length, 'characters');
      
      setSettings({ ...settings, site_favicon: compressed });
      setMessage('Favicon uploaded! Click "Save Settings" to apply.');
      setMessageType('success');
      setUploadingFavicon(false);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to compress file. Please try again.');
        setMessageType('error');
        setUploadingFavicon(false);
        e.target.value = '';
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setMessage('Error uploading favicon. Please try again.');
      setMessageType('error');
      setUploadingFavicon(false);
      e.target.value = '';
    }
  };

  const handleFaviconDarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/x-icon', 'image/svg+xml', 'image/jpeg', 'image/gif', 'image/webp', 'image/vnd.microsoft.icon'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(png|ico|svg|jpg|jpeg|gif|webp)$/i)) {
      setMessage('Please upload a valid image file (PNG, ICO, SVG, JPG, GIF, or WebP)');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      e.target.value = '';
      return;
    }

    setUploadingFaviconDark(true);
    setMessage('');

    try {
      const compressed = await compressImage(file, 64, 0.9); // Favicon: 64px max, 90% quality
      
      if (!compressed || !compressed.startsWith('data:')) {
        setMessage('Failed to compress file. Please try again.');
        setMessageType('error');
        setUploadingFaviconDark(false);
        return;
      }
      
      console.log('✓ Dark favicon compressed successfully');
      console.log('📏 Compressed size:', compressed.length, 'characters');
      
      setSettings({ ...settings, site_favicon_dark: compressed });
      setMessage('Dark favicon uploaded! Click "Save Settings" to apply.');
      setMessageType('success');
      setUploadingFaviconDark(false);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error reading file:', error);
      setMessage('Error uploading dark favicon. Please try again.');
      setMessageType('error');
      setUploadingFaviconDark(false);
      e.target.value = '';
    }
  };

  const handleHeroBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Hero background image must be less than 5MB');
      setMessageType('error');
      return;
    }

    setUploadingHeroBackground(true);
    try {
      const compressed = await compressImage(file, 1920, 0.75); // Hero: 1920px max, 75% quality
      if (compressed) {
        setSettings((prev) => ({ ...prev, hero_background: compressed }));
        setMessage('Hero background uploaded successfully');
        setMessageType('success');
      }
      setUploadingHeroBackground(false);
    } catch (error) {
      setMessage('Failed to compress hero background image');
      setMessageType('error');
      setUploadingHeroBackground(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!settings.site_name || settings.site_name.trim() === '') {
      setMessage('Site name is required');
      setMessageType('error');
      return;
    }

    setSaving(true);
    setMessage('Saving settings...');
    setMessageType('success');

    try {
      console.log('💾 Preparing to save settings...');
      console.log('📊 Settings data:', {
        site_name: settings.site_name,
        has_logo: !!settings.site_logo,
        logo_length: settings.site_logo?.length || 0,
        has_favicon: !!settings.site_favicon,
        favicon_length: settings.site_favicon?.length || 0,
        favicon_start: settings.site_favicon ? settings.site_favicon.substring(0, 50) : 'empty',
        description_length: settings.site_description?.length || 0
      });

      const response = await axios.put('/api/settings', settings, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📬 Save response:', response.data);

      if (response.data.success) {
        console.log('✓ Settings saved successfully');
        setMessageType('success');
        setMessage('Settings saved successfully! Page will refresh in 2 seconds...');
        
        // Reload page after 2 seconds to show new favicon
        setTimeout(() => {
          console.log('🔄 Reloading page to apply changes...');
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('Save failed');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      setMessageType('error');
      
      if (error.response?.status === 401) {
        setMessage('Session expired. Please log in again.');
      } else if (error.response?.status === 413) {
        setMessage('Files too large. Please use smaller images.');
      } else {
        setMessage(error.response?.data?.error || 'Failed to save settings. Please try again.');
      }
      
      setSaving(false);
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
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">Site Settings</h1>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - General Settings */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b">General Settings</h2>
                
                {/* Site Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="My Blog"
                  />
                  <p className="text-xs text-slate-500 mt-1">The main name of your blog</p>
                </div>

                {/* Site Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Site Description</label>
                  <textarea
                    value={settings.site_description}
                    onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="A personal blog built with Next.js"
              />
              <p className="text-xs text-slate-500 mt-1">Displayed in browser meta tags</p>
            </div>

              {/* Hero Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hero Section Title</label>
                <input
                  type="text"
                  value={settings.hero_title}
                  onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Welcome to My Blog"
                />
              </div>

              {/* Hero Subtitle */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hero Section Subtitle</label>
                <input
                  type="text"
                  value={settings.hero_subtitle}
                  onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explore my thoughts on software, mechanics, and travels"
                />
              </div>

              {/* Hero Background */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hero Background Image</label>
                <div className="space-y-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <Upload size={18} className="text-slate-500" />
                    <span className="text-sm text-slate-600">Upload (Max 5MB)</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleHeroBackgroundUpload}
                      disabled={uploadingHeroBackground}
                      className="hidden"
                    />
                  </label>
                  {settings.hero_background && (
                    <div className="relative">
                      <img 
                        src={settings.hero_background} 
                        alt="Hero background preview" 
                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        onClick={() => setSettings({ ...settings, hero_background: '' })}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">Optional: gradient used if empty</p>
              </div>
            </div>

            {/* Right Column - Brand Assets */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b">Brand Assets</h2>
              
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Site Logo</label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <Upload size={20} className="text-slate-500" />
                    <span className="text-sm text-slate-600">Upload Logo (PNG, JPG, SVG)</span>
                    <input
                      type="file"
                      accept=".svg,.png,.jpg,.jpeg,.gif,.webp"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                </div>
                {settings.site_logo && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <img src={settings.site_logo} alt="Logo preview" className="h-12 w-auto rounded" />
                    <button
                      onClick={() => setSettings({ ...settings, site_logo: '' })}
                      className="ml-auto text-red-600 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Recommended: 200-400px wide</p>
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Favicon (Light Theme)</label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <Upload size={20} className="text-slate-500" />
                    <span className="text-sm text-slate-600">Upload Favicon (PNG, ICO, SVG)</span>
                    <input
                      type="file"
                      accept=".ico,.png,.svg,.jpg,.jpeg,.gif,.webp"
                      onChange={handleFaviconUpload}
                      disabled={uploadingFavicon}
                      className="hidden"
                    />
                  </label>
                </div>
                {settings.site_favicon && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded border border-slate-200">
                      <img src={settings.site_favicon} alt="Favicon preview" className="w-6 h-6 object-contain" />
                    </div>
                    <span className="text-sm text-slate-600">Light theme favicon ready</span>
                    <button
                      onClick={() => setSettings({ ...settings, site_favicon: '' })}
                      className="ml-auto text-red-600 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Favicon Dark */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Favicon (Dark Theme)</label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition">
                    <Upload size={20} className="text-slate-500" />
                    <span className="text-sm text-slate-600">Upload Dark Favicon (PNG, ICO, SVG)</span>
                    <input
                      type="file"
                      accept=".ico,.png,.svg,.jpg,.jpeg,.gif,.webp"
                      onChange={handleFaviconDarkUpload}
                      disabled={uploadingFaviconDark}
                      className="hidden"
                    />
                  </label>
                </div>
                {settings.site_favicon_dark && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 flex items-center justify-center bg-slate-900 rounded border border-slate-200">
                      <img src={settings.site_favicon_dark} alt="Dark favicon preview" className="w-6 h-6 object-contain" />
                    </div>
                    <span className="text-sm text-slate-600">Dark theme favicon ready</span>
                    <button
                      onClick={() => setSettings({ ...settings, site_favicon_dark: '' })}
                      className="ml-auto text-red-600 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Optional: If not set, light favicon will be used</p>
            </div>
          </div>
        </div>
          </div>

        {/* Message and Save Button - Full Width */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-6 space-y-6">
          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 transition flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
