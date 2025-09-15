'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  content: string;
  images: string[];
  createdAt: Date;
  status: 'draft' | 'published';
  author?: string;
  category?: string;
  readTime?: number;
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [, setIsLoading] = useState(true);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/articles?status=published', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      
      if (data.success && data.articles) {
        // Convert date strings back to Date objects
        const articlesWithDates = data.articles.map((article: Article) => ({
          ...article,
          createdAt: new Date(article.createdAt)
        }));
        
        setArticles(articlesWithDates);
        setFeaturedArticle(articlesWithDates[0] || null);
      } else {
        console.error('Failed to fetch articles:', data.error);
        // Fallback to empty state
        setArticles([]);
        setFeaturedArticle(null);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      // Fallback to empty state
      setArticles([]);
      setFeaturedArticle(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Refresh data when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchArticles();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);


  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* WSJ-Style Header */}
      <header className="bg-white border-b border-gray-300 shadow-sm -mt-2">
        <div className="max-w-4xl mx-auto px-4 py-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <Image
                  src="/Golden West Business News.png"
                  alt="Golden West Business News"
                  width={600}
                  height={240}
                  className="h-32 w-auto mb-0 mx-auto"
                  priority
                />
                <div className="-mt-9">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Golden West Business News</p>
                </div>
              </div>
              <div className="absolute right-4 top-28 transform -translate-y-1/2">
                <p className="text-xs font-medium text-black">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* Featured Article */}
        {featuredArticle && (
          <section className="mb-8">
            <article className="border-b border-gray-200 pb-6">
              {/* Featured image */}
              {featuredArticle.images.length > 0 && (
                <div className="mb-4">
                  <img
                    src={featuredArticle.images[0]}
                    alt={featuredArticle.title}
                    className="w-full h-48 sm:h-64 object-cover"
                    style={{ width: '800px', height: '400px' }}
                  />
                </div>
              )}
              
              {/* Article content */}
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-600 uppercase tracking-wide">
                  <span className="font-semibold">{featuredArticle.category}</span>
                  <span>•</span>
                  <span>{getTimeAgo(featuredArticle.createdAt)}</span>
                </div>
                <Link href={`/article/${featuredArticle.id}`}>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-3 leading-tight hover:text-gray-600 transition-colors cursor-pointer">
                    {featuredArticle.title}
                  </h2>
                </Link>
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <span>By {featuredArticle.author}</span>
                  <span>•</span>
                  <span>{featuredArticle.readTime} min read</span>
                </div>
                <p className="text-gray-800 leading-relaxed text-sm sm:text-base">
                  {featuredArticle.content.substring(0, 200)}...
                </p>
              </div>
            </article>
          </section>
        )}

        {/* News Articles */}
        <div className="space-y-4">
          {articles.slice(1, 6).map((article) => (
            <article key={article.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex gap-4">
                {/* Article content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 text-xs text-gray-600 uppercase tracking-wide">
                    <span className="font-semibold">{article.category}</span>
                    <span>•</span>
                    <span>{getTimeAgo(article.createdAt)}</span>
                  </div>
                  <Link href={`/article/${article.id}`}>
                    <h3 className="text-base sm:text-lg font-bold text-black mb-2 leading-tight hover:text-gray-600 transition-colors cursor-pointer">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm leading-relaxed mb-2">
                    {article.content.substring(0, 120)}...
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>By {article.author}</span>
                    <span>•</span>
                    <span>{article.readTime} min read</span>
                  </div>
                </div>
                
                {/* Thumbnail image */}
                {article.images.length > 0 && (
                  <div className="flex-shrink-0">
                    <img
                      src={article.images[0]}
                      alt={article.title}
                      className="w-24 h-16 sm:w-28 sm:h-20 object-cover"
                      style={{ width: '120px', height: '80px' }}
                    />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              © 2024 Golden West Business News. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
