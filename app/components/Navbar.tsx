'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Moon, Sun, Menu, X } from 'lucide-react';
import axios from 'axios';

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  likes: number;
  created_at: string;
}

interface NavSection {
  id?: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  active: boolean;
}

interface SiteSettings {
  site_name: string;
  site_logo: string;
  site_favicon: string;
  site_description: string;
}

interface NavbarProps {
  posts: Post[];
  activeCategory: string;
  onCategoryChange?: (category: string) => void;
}

export default function Navbar({ activeCategory, onCategoryChange }: NavbarProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navSections, setNavSections] = useState<NavSection[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    site_name: 'My Blog',
    site_logo: '',
    site_favicon: '',
    site_description: '',
  });
  const [loading, setLoading] = useState(false); // Changed from true to false

  useEffect(() => {
    setMounted(true);
    // Get initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    setTheme(savedTheme || 'light');

    // Fetch site settings and nav sections
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Try to load from cache first
      const cachedNav = localStorage.getItem('navSections');
      const cachedSettings = localStorage.getItem('siteSettings');
      const cacheTime = localStorage.getItem('navCacheTime');
      
      // Use cache if it's less than 5 minutes old
      const isCacheValid = cacheTime && (Date.now() - parseInt(cacheTime)) < 5 * 60 * 1000;
      
      if (isCacheValid && cachedNav && cachedSettings) {
        setSiteSettings(JSON.parse(cachedSettings));
        setNavSections(JSON.parse(cachedNav));
        return; // Skip API call if cache is valid
      }

      // Fetch from API in background
      const [settingsRes, navRes] = await Promise.all([
        axios.get('/api/settings'),
        axios.get('/api/nav-sections'),
      ]);

      setSiteSettings(settingsRes.data);
      setNavSections(navRes.data);
      
      // Cache the results
      localStorage.setItem('navSections', JSON.stringify(navRes.data));
      localStorage.setItem('siteSettings', JSON.stringify(settingsRes.data));
      localStorage.setItem('navCacheTime', Date.now().toString());
    } catch (error) {
      console.error('Error fetching navbar data:', error);
      // Try to use stale cache on error
      const cachedNav = localStorage.getItem('navSections');
      const cachedSettings = localStorage.getItem('siteSettings');
      if (cachedNav && cachedSettings) {
        setSiteSettings(JSON.parse(cachedSettings));
        setNavSections(JSON.parse(cachedNav));
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) {
    return null; // Don't render until mounted to avoid hydration issues
  }

  return (
    <nav className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-md sticky top-0 z-50 transition-all duration-300 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Single Line Navigation */}
        <div className="flex justify-between items-center py-3 sm:py-4 gap-4">
          {/* Logo & Site Name - Left */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity group flex-shrink-0">
            <div className="relative">
              {siteSettings.site_logo ? (
                <img src={siteSettings.site_logo} alt="Logo" className="h-6 sm:h-8 w-auto" />
              ) : (
                <BookOpen className="text-blue-600 dark:text-cyan-400" size={20} />
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent line-clamp-1">
                {siteSettings.site_name}
              </h1>
            </div>
          </Link>

          {/* Sections - Center (scrollable on mobile) */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 md:gap-2 flex-nowrap">
              {navSections.length > 0 ? (
                navSections.map((section) => {
                  const isActive = activeCategory === section.slug;

                  return (
                    <Link
                      key={section.id}
                      href={`/?category=${section.slug}`}
                      onClick={(e) => {
                        if (typeof onCategoryChange === 'function') {
                          e.preventDefault();
                          onCategoryChange(section.slug);
                        }
                      }}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap text-xs sm:text-sm flex-shrink-0 group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-cyan-600 dark:to-cyan-700 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title={section.description}
                    >
                      {section.icon && (section.icon.startsWith('data:') || section.icon.startsWith('/')) ? (
                        <img 
                          src={section.icon} 
                          alt={section.name} 
                          className={`w-4 h-4 sm:w-5 sm:h-5 object-contain ${!isActive ? 'group-hover:scale-110' : ''} transition-transform`}
                          style={{ filter: isActive ? 'brightness(0) invert(1)' : 'none' }}
                        />
                      ) : (
                        <BookOpen size={16} className={`${isActive ? 'text-white' : 'text-slate-900 dark:text-white'} ${!isActive ? 'group-hover:scale-110' : ''} transition-transform`} />
                      )}
                      <span className="hidden sm:inline">{section.name}</span>
                    </Link>
                  );
                })
              ) : null}
            </div>
          </div>

          {/* Theme Toggle & Admin - Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105"
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            >
              {theme === 'light' ? (
                <Moon className="text-slate-900 dark:text-white" size={18} />
              ) : (
                <Sun className="text-slate-900 dark:text-white" size={18} />
              )}
            </button>

            {/* Admin Button */}
            {/* <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-cyan-600 dark:to-cyan-700 text-white px-3 sm:px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold text-xs sm:text-sm group"
              title="Admin panel"
            >
              <Code2 size={16} className="text-white group-hover:rotate-12 transition-transform" />
              <span>Admin</span>
            </Link> */}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="text-slate-900 dark:text-white" size={20} />
              ) : (
                <Menu className="text-slate-900 dark:text-white" size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Admin Link */}
        {/* {isMobileMenuOpen && (
          <div className="pb-3 sm:hidden border-t border-slate-200 dark:border-slate-700 pt-3">
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-cyan-600 dark:to-cyan-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-semibold text-sm"
            >
              <Code2 size={18} />
              Admin Panel
            </Link>
          </div>
        )} */}
      </div>

      {/* Hide scrollbar in sections scroll */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </nav>
  );
}
