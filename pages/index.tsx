import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight } from 'lucide-react';

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  likes: number;
  created_at: string;
}

export async function getStaticProps() {
  try {
    const response = await axios.get('http://localhost:3000/api/posts');
    return {
      props: {
        posts: response.data,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      props: {
        posts: [],
      },
    };
  }
}

interface HomeProps {
  posts: Post[];
}

const Home: React.FC<HomeProps> = ({ posts }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">My Blog</h1>
          <Link href="/admin" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Welcome to My Blog</h1>
          <p className="text-xl text-gray-600">Thoughts, ideas, and insights shared with you</p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="p-6 flex flex-col h-full">
                  <h2 className="text-2xl font-bold mb-2 text-gray-900">{post.title}</h2>
                  <p className="text-gray-600 mb-4 flex-grow">{post.excerpt}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    <span>❤️ {post.likes}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 font-semibold mt-4">
                    Read More <ArrowRight size={18} />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
