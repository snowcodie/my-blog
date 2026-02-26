'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';
import { LayoutDashboard, Settings, Navigation, FileEdit, LogOut, Menu, X, MessageCircle, BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post('/api/admin/logout', {}, { withCredentials: true });
      router.push('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/admin/posts',
      label: 'Posts',
      icon: FileEdit,
    },
    {
      href: '/admin/series',
      label: 'Series',
      icon: BookOpen,
    },
    {
      href: '/admin/comments',
      label: 'Comments',
      icon: MessageCircle,
    },
    {
      href: '/admin/nav-sections',
      label: 'Nav Sections',
      icon: Navigation,
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 rounded-lg bg-slate-100"
      >
        {isMobileOpen ? (
          <X className="text-slate-900" size={24} />
        ) : (
          <Menu className="text-slate-900" size={24} />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-lg border-r border-slate-200 transition-transform duration-300 z-30 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
          <p className="text-sm text-slate-600">Blog Manager</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  active
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <IconComponent size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
