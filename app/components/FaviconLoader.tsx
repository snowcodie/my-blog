'use client';

import { useEffect } from 'react';

export default function FaviconLoader() {
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        console.log('✓ Settings fetched');
        const favicon = data?.site_favicon;
        
        if (!favicon || typeof favicon !== 'string' || !favicon.startsWith('data:')) {
          console.log('ℹ No custom favicon set, using default');
          return;
        }
        
        console.log('✓ Custom favicon found, length:', favicon.length);
        
        // Remove all existing favicon links
        const existingLinks = document.querySelectorAll(
          'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
        );
        existingLinks.forEach(link => link.remove());
        
        // Extract MIME type from data URI
        const mimeMatch = favicon.match(/data:([^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/x-icon';
        
        // Create new favicon link with timestamp to bust cache
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = mimeType;
        link.href = favicon + '?t=' + Date.now();
        
        document.head.appendChild(link);
        console.log('✓ Favicon updated successfully');
        
      } catch (error) {
        console.error('✗ Error loading favicon:', error);
      }
    };

    loadFavicon();
  }, []);

  return null;
}
