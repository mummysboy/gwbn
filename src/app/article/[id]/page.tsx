'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ClockIcon, 
  UserIcon, 
  EyeIcon,
  ShareIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
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

interface ArticleContentWithPhotosProps {
  content: string;
  images: string[];
  title: string;
  author?: string;
}

function ArticleContentWithPhotos({ content, images, title, author }: ArticleContentWithPhotosProps) {
  // Parse content into paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim().length > 0);
  
  // Create photo placement array
  const contentWithPhotos: (string | { type: 'photo'; src: string; alt: string; index: number })[] = [];
  let photoIndex = 0;
  
  // Add thumbnail photo at the beginning
  if (images.length > 0) {
    contentWithPhotos.push({
      type: 'photo',
      src: images[0],
      alt: `${title} - Thumbnail`,
      index: 0
    });
    photoIndex = 1;
  }
  
  // Process paragraphs and insert photos every 3 paragraphs
  paragraphs.forEach((paragraph, index) => {
    contentWithPhotos.push(paragraph);
    
    // Insert photo after every 3 paragraphs (but not after the last paragraph)
    if ((index + 1) % 3 === 0 && index < paragraphs.length - 1 && photoIndex < images.length) {
      contentWithPhotos.push({
        type: 'photo',
        src: images[photoIndex],
        alt: `${title} - Image ${photoIndex + 1}`,
        index: photoIndex
      });
      photoIndex++;
    }
  });
  
  return (
    <div className="body-text text-lg leading-relaxed text-black font-serif">
      {contentWithPhotos.map((item, index) => {
        if (typeof item === 'string') {
          // Render paragraph
          const isFirstParagraph = index === 0 || (index === 1 && contentWithPhotos[0].type === 'photo');
          return (
            <p 
              key={index} 
              className={`mb-4 ${isFirstParagraph ? 'first-letter:text-6xl first-letter:font-bold first-letter:text-black first-letter:mr-1 first-letter:float-left first-letter:leading-none' : ''}`}
            >
              {item}
            </p>
          );
        } else {
          // Render photo at the top of the content
          const isThumbnail = item.index === 0;
          const borderClass = isThumbnail ? 'border-2 border-black' : 'border border-gray-400';
          
          return (
            <div key={index} className="w-full mb-6">
              <div className={`${borderClass} max-w-md mx-auto`}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={400}
                  height={isThumbnail ? 500 : 300}
                  className="w-full h-auto"
                />
              </div>
            </div>
          );
        }
      })}
    </div>
  );
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }

    // Cleanup function to stop speech when component unmounts
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    // Fetch articles from API
    const fetchArticles = async () => {
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
          
          setAllArticles(articlesWithDates);
          
          const articleId = params.id as string;
          const foundArticle = articlesWithDates.find((a: Article) => a.id === articleId);
          if (foundArticle) {
            // Stop any current speech when changing articles
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              setIsPlaying(false);
              setIsPaused(false);
            }
            
            setArticle(foundArticle);
            setCurrentIndex(articlesWithDates.findIndex((a: Article) => a.id === articleId));
          }
        } else {
          console.error('Failed to fetch articles:', data.error);
          setAllArticles([]);
          setArticle(null);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        setAllArticles([]);
        setArticle(null);
      }
    };
    
    fetchArticles();
  }, [params.id]);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const navigateToArticle = (direction: 'prev' | 'next') => {
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allArticles.length - 1;
    } else {
      newIndex = currentIndex < allArticles.length - 1 ? currentIndex + 1 : 0;
    }
    
    const nextArticle = allArticles[newIndex];
    router.push(`/article/${nextArticle.id}`);
  };

  const speakText = (text: string) => {
    if (!speechSupported || !article) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = 0.9; // Slightly slower than normal
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Alex')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleVoiceRead = () => {
    if (!article) return;

    if (isPlaying) {
      if (isPaused) {
        pauseSpeech();
      } else {
        pauseSpeech();
      }
    } else {
      const textToSpeak = `${article.title}. ${article.content}`;
      speakText(textToSpeak);
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-black">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="headline-serif text-4xl md:text-5xl font-bold text-black mb-2">
              GWBN
            </Link>
            <div className="text-right">
              <p className="caption-text text-sm">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="caption-text text-xs">
                Vol. 1, No. 1
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="caption-text">Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="caption-text uppercase text-xs font-semibold text-accent">
                {article.category}
              </span>
              <span className="caption-text">•</span>
              <span className="caption-text">{getTimeAgo(article.createdAt)}</span>
            </div>
            
            <h1 className="headline-serif text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-gray-600" />
                <span className="caption-text">{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-gray-600" />
                <span className="caption-text">{article.readTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-600" />
                <span className="caption-text">{article.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Article Body with Inline Photos - Newspaper Style */}
          <div className="prose prose-lg max-w-none">
            {article.images && article.images.length > 0 ? (
              <ArticleContentWithPhotos 
                content={article.content} 
                images={article.images} 
                title={article.title}
                author={article.author}
              />
            ) : (
              <div className="body-text text-lg leading-relaxed text-black whitespace-pre-line font-serif">
                <div className="first-letter:text-6xl first-letter:font-bold first-letter:text-black first-letter:mr-1 first-letter:float-left first-letter:leading-none">
                  {article.content}
                </div>
              </div>
            )}
          </div>

          {/* Article Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors">
                  <ShareIcon className="w-4 h-4" />
                  <span className="caption-text">Share</span>
                </button>
                <button className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors">
                  <EyeIcon className="w-4 h-4" />
                  <span className="caption-text">Save</span>
                </button>
                {speechSupported && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleVoiceRead}
                      className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors"
                    >
                      {isPlaying ? (
                        isPaused ? (
                          <PlayIcon className="w-4 h-4" />
                        ) : (
                          <PauseIcon className="w-4 h-4" />
                        )
                      ) : (
                        <SpeakerWaveIcon className="w-4 h-4" />
                      )}
                      <span className="caption-text">
                        {isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Listen'}
                      </span>
                    </button>
                    {isPlaying && (
                      <button 
                        onClick={stopSpeech}
                        className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <StopIcon className="w-4 h-4" />
                        <span className="caption-text">Stop</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <p className="caption-text text-xs">
                  Published by Golden West Business News
                </p>
                <p className="caption-text text-xs">
                  © 2024 All rights reserved
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Navigation to Other Articles */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Previous Article */}
            <button
              onClick={() => navigateToArticle('prev')}
              className="group flex items-start gap-4 p-4 border border-gray-300 hover:border-black transition-colors text-left"
            >
              <div className="flex-shrink-0">
                <div className="w-20 h-16 bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={allArticles[currentIndex > 0 ? currentIndex - 1 : allArticles.length - 1]?.images[0] || ''}
                    alt={allArticles[currentIndex > 0 ? currentIndex - 1 : allArticles.length - 1]?.title || ''}
                    width={80}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowLeftIcon className="w-4 h-4 text-gray-500" />
                  <p className="caption-text text-xs text-gray-500">Previous Article</p>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors leading-tight">
                  {allArticles[currentIndex > 0 ? currentIndex - 1 : allArticles.length - 1]?.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {allArticles[currentIndex > 0 ? currentIndex - 1 : allArticles.length - 1]?.author} • {allArticles[currentIndex > 0 ? currentIndex - 1 : allArticles.length - 1]?.readTime} min read
                </p>
              </div>
            </button>

            {/* Next Article */}
            <button
              onClick={() => navigateToArticle('next')}
              className="group flex items-start gap-4 p-4 border border-gray-300 hover:border-black transition-colors text-left"
            >
              <div className="flex-shrink-0">
                <div className="w-20 h-16 bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={allArticles[currentIndex < allArticles.length - 1 ? currentIndex + 1 : 0]?.images[0] || ''}
                    alt={allArticles[currentIndex < allArticles.length - 1 ? currentIndex + 1 : 0]?.title || ''}
                    width={80}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="caption-text text-xs text-gray-500">Next Article</p>
                  <ArrowRightIcon className="w-4 h-4 text-gray-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors leading-tight">
                  {allArticles[currentIndex < allArticles.length - 1 ? currentIndex + 1 : 0]?.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {allArticles[currentIndex < allArticles.length - 1 ? currentIndex + 1 : 0]?.author} • {allArticles[currentIndex < allArticles.length - 1 ? currentIndex + 1 : 0]?.readTime} min read
                </p>
              </div>
            </button>
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
