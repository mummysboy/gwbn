'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  UserIcon, 
  EyeIcon,
  ShareIcon,
  CalendarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
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
  const [isLoading, setIsLoading] = useState(true);

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
      <header className="border-b-2 border-black">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <h1 className="headline-serif text-4xl md:text-5xl font-bold text-black mb-2">
                GWBN
              </h1>
              <p className="caption-text text-xs uppercase tracking-wider">
                Golden West Business News
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-4 mb-2">
                
              </div>
              <p className="caption-text text-sm">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
             
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Featured Article */}
        {featuredArticle && (
          <section className="mb-12">
            <div className="border-b-2 border-black pb-4 mb-6">
              
            </div>
            
            <article className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Link href={`/article/${featuredArticle.id}`}>
                  <h2 className="headline-serif text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 leading-tight hover:text-gray-600 transition-colors cursor-pointer">
                    {featuredArticle.title}
                  </h2>
                </Link>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-600" />
                    <span className="caption-text">{featuredArticle.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-600" />
                    <span className="caption-text">{getTimeAgo(featuredArticle.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-gray-600" />
                    <span className="caption-text">{featuredArticle.readTime} min read</span>
                  </div>
                </div>
                <div className="body-text text-lg leading-relaxed text-gray-800 mb-6">
                  {featuredArticle.content.substring(0, 300)}...
                </div>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors">
                    <ShareIcon className="w-4 h-4" />
                    <span className="caption-text">Share</span>
                  </button>
                  <Link href={`/article/${featuredArticle.id}`} className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors">
                    <EyeIcon className="w-4 h-4" />
                    <span className="caption-text">Read More</span>
                  </Link>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                {/* Newspaper-style main photo - only show 1 photo as thumbnail */}
                {featuredArticle.images.length > 0 && (
                  <div className="border-2 border-black mb-4">
                    <Image
                      src={featuredArticle.images[0]}
                      alt={featuredArticle.title}
                      width={400}
                      height={500}
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>
            </article>
          </section>
        )}

        {/* News Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main News Column */}
          <div className="lg:col-span-2">
            <div className="border-b-2 border-black pb-4 mb-6">
              <span className="caption-text uppercase tracking-wider text-xs font-semibold">
                Latest News
              </span>
            </div>
            
            <div className="space-y-8">
              {articles.slice(1, 4).map((article) => (
                <article key={article.id} className="article-card">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="caption-text uppercase text-xs font-semibold text-accent">
                          {article.category}
                        </span>
                        <span className="caption-text">•</span>
                        <span className="caption-text">{getTimeAgo(article.createdAt)}</span>
                      </div>
                      <Link href={`/article/${article.id}`}>
                        <h3 className="headline-sans text-xl md:text-2xl font-bold text-black mb-3 leading-tight hover:text-gray-600 transition-colors cursor-pointer">
                          {article.title}
                        </h3>
                      </Link>
                      <p className="body-text text-gray-700 mb-4 leading-relaxed">
                        {article.content.substring(0, 150)}...
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="caption-text">{article.author}</span>
                        <span className="caption-text">•</span>
                        <span className="caption-text">{article.readTime} min read</span>
                      </div>
                    </div>
                    <div className="md:col-span-1">
                      {/* Newspaper-style main photo - only show 1 photo as thumbnail */}
                      {article.images.length > 0 && (
                        <div className="border-2 border-black mb-2">
                          <Image
                            src={article.images[0]}
                            alt={article.title}
                            width={200}
                            height={250}
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* More Articles */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="headline-sans text-lg font-bold text-black mb-4">
                More Stories
              </h3>
              <div className="space-y-4">
                {articles.slice(4).map((article) => (
                  <article key={article.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="caption-text uppercase text-xs font-semibold text-accent">
                        {article.category}
                      </span>
                      <span className="caption-text">•</span>
                      <span className="caption-text">{getTimeAgo(article.createdAt)}</span>
                    </div>
                    <Link href={`/article/${article.id}`}>
                      <h4 className="headline-sans text-sm font-bold text-black mb-2 leading-tight hover:text-gray-600 transition-colors cursor-pointer">
                        {article.title}
                      </h4>
                    </Link>
                    <p className="caption-text text-xs">
                      {article.author} • {article.readTime} min read
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="caption-text text-xs">
              © 2024 Golden West Business News. All rights reserved. Built with Next.js, TypeScript, and AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
