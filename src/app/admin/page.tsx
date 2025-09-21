'use client';

import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ShareIcon,
  ChartBarIcon, 
  UsersIcon, 
  CogIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Container from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import VoiceRecorder from '@/components/publishing/VoiceRecorder';
import ImageUploader from '@/components/publishing/ImageUploader';
import AIEnhancer from '@/components/publishing/AIEnhancer';
import { getDefaultAuthor, calculateReadTime } from '@/lib/utils';
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

export default function AdminDashboard() {
  const [transcript, setTranscript] = useState('');
  const [enhancedContent, setEnhancedContent] = useState('');
  const [title, setTitle] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Debug: Log state changes
  console.log('AdminDashboard render - title:', title, 'enhancedContent length:', enhancedContent?.length);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<'publish' | 'dashboard'>('publish');
  const [notes, setNotes] = useState('');
  const [analyticsData, setAnalyticsData] = useState<{
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    totalViews: number;
    recentActivities: Array<{
      id: number;
      type: string;
      message: string;
      time: string;
      icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    }>;
    stats?: {
      totalArticles: number;
      publishedArticles: number;
      draftArticles: number;
      totalViews: number;
      publishedToday: number;
      systemHealth: number;
    };
  } | null>(null);

  // Fetch articles and analytics from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch articles and analytics in parallel
        const [articlesResponse, analyticsResponse] = await Promise.all([
          fetch('/api/articles?status=published'),
          fetch('/api/analytics?type=dashboard')
        ]);
        
        const articlesData = await articlesResponse.json();
        const analyticsData = await analyticsResponse.json();
        
        if (articlesData.success && articlesData.articles) {
          // Convert date strings back to Date objects
          const articlesWithDates = articlesData.articles.map((article: Article) => ({
            ...article,
            createdAt: new Date(article.createdAt)
          }));
          
          setArticles(articlesWithDates);
        } else {
          console.error('Failed to fetch articles:', articlesData.error);
          setArticles([]);
        }
        
        // Store analytics data for use in stats
        if (analyticsData.success) {
          setAnalyticsData(analyticsData);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Real data for dashboard
  const stats = [
    {
      name: 'Total Articles',
      value: analyticsData?.stats?.totalArticles?.toString() || articles.length.toString(),
      change: '+2',
      changeType: 'positive',
      icon: DocumentTextIcon,
    },
    {
      name: 'Published Today',
      value: analyticsData?.stats?.publishedToday?.toString() || '0',
      change: '+100%',
      changeType: 'positive',
      icon: ChartBarIcon,
    },
    {
      name: 'Total Views',
      value: analyticsData?.stats?.totalViews?.toLocaleString() || '0',
      change: '+12%',
      changeType: 'positive',
      icon: UsersIcon,
    },
    {
      name: 'System Health',
      value: `${analyticsData?.stats?.systemHealth || 99.9}%`,
      change: '+0.1%',
      changeType: 'positive',
      icon: CheckCircleIcon,
    },
  ];

  const recentActivities = analyticsData?.recentActivities || [
    {
      id: 1,
      type: 'article_published',
      message: 'No recent activity',
      time: 'N/A',
      icon: DocumentTextIcon,
    },
  ];

  const handleTranscript = (newTranscript: string) => {
    setTranscript(newTranscript);
  };


  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
  };

  const handleError = (error: string) => {
    alert(error);
  };

  const handleEnhanced = (title: string, content: string) => {
    console.log('=== ADMIN HANDLE ENHANCED CALLED ===');
    console.log('Admin handleEnhanced called with:', { title, content });
    console.log('Title length:', title?.length);
    console.log('Content length:', content?.length);
    console.log('Current title state before update:', title);
    console.log('Current enhancedContent state before update length:', enhancedContent?.length);
    
    // Set the title and content properly
    setTitle(title);
    setEnhancedContent(content);
    
    console.log('Admin state updated - title:', title);
    console.log('Admin state updated - content length:', content?.length);
    console.log('=== ADMIN HANDLE ENHANCED COMPLETE ===');
  };

  const publishArticle = async () => {
    if (!title.trim() || !enhancedContent.trim()) {
      alert('Please provide a title and content before publishing.');
      return;
    }

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: enhancedContent,
          images,
          author: getDefaultAuthor(),
          category: 'Business'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add the new article to local state
        const newArticle: Article = {
          ...data.article,
          createdAt: new Date(data.article.createdAt)
        };
        setArticles(prev => [newArticle, ...prev]);
        
        // Reset form
        setTitle('');
        setTranscript('');
        setEnhancedContent('');
        setImages([]);
        
        alert('Article published successfully!');
      } else {
        alert('Failed to publish article: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error publishing article:', error);
      alert('Failed to publish article. Please try again.');
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state only after successful API deletion
        setArticles(prev => prev.filter(article => article.id !== id));
        alert('Article deleted successfully!');
      } else {
        alert('Failed to delete article: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article. Please try again.');
    }
  };

  const editArticle = (article: Article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setEnhancedContent(article.content);
    setImages(article.images);
  };

  const saveEdit = () => {
    if (!editingArticle) return;
    
    setArticles(prev => prev.map(article => 
      article.id === editingArticle.id 
        ? { 
            ...article, 
            title, 
            content: enhancedContent, 
            images,
            author: getDefaultAuthor(),
            readTime: calculateReadTime(enhancedContent)
          }
        : article
    ));
    
    setEditingArticle(null);
    setTitle('');
    setEnhancedContent('');
    setImages([]);
  };

  const cancelEdit = () => {
    setEditingArticle(null);
    setTitle('');
    setEnhancedContent('');
    setImages([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Container>
    <div className="py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your content and monitor system performance
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('publish')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'publish'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                  Publishing
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'dashboard'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ChartBarIcon className="w-4 h-4 inline mr-2" />
                  Dashboard
                </button>
              </nav>
            </div>
          </div>

          {/* Publishing Tab */}
          {activeTab === 'publish' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Publishing Interface */}
              <div className="space-y-6">
                {/* Voice Recording */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Voice Recording
                  </h2>
                  <VoiceRecorder 
                    onTranscript={handleTranscript}
                    onError={handleError}
                  />
                </div>

                {/* Recorded Interview */}
                {transcript && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Recorded Interview
                    </h2>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {transcript}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                {transcript && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Notes
                    </h2>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your notes about the interview here..."
                      className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Use this space to add your thoughts, observations, or additional context about the interview.
                    </div>
                  </div>
                )}

                {/* AI Article Generation */}
                {transcript && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      AI Article Generation
                    </h2>
                    <AIEnhancer 
                      transcript={transcript}
                      notes={notes}
                      onEnhanced={handleEnhanced}
                    />
                  </div>
                )}

                {/* Article Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Article Details
                    </h2>
                    <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                      <span className="text-xs font-medium text-blue-800 dark:text-blue-300">
                        By {getDefaultAuthor()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>Note:</strong> All articles published through this system will be automatically attributed to Maria R. Daniel as the author.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter article title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content
                      </label>
                      <textarea
                        value={enhancedContent}
                        onChange={(e) => setEnhancedContent(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="AI-enhanced content will appear here..."
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Images
                      </label>
                      <ImageUploader 
                        images={images}
                        onImagesChange={handleImagesChange}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {editingArticle ? (
                        <>
                          <Button onClick={saveEdit} className="flex-1">
                            <CheckIcon className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={cancelEdit} className="flex-1">
                            <XMarkIcon className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button onClick={publishArticle} className="w-full">
                          <DocumentTextIcon className="w-4 h-4 mr-2" />
                          Publish Article
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Published Articles */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Published Articles
                  </h2>
                  
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading articles...
                        </div>
                      </div>
                    ) : (
                      articles.map((article) => (
                      <div key={article.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Link href={`/article/${article.id}`}>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm hover:text-blue-600 transition-colors cursor-pointer">
                              {article.title}
                            </h3>
                          </Link>
                          <div className="flex gap-2">
                            <button
                              onClick={() => editArticle(article)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteArticle(article.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {article.content.substring(0, 100)}...
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{article.createdAt.toLocaleDateString()}</span>
                          <div className="flex items-center gap-2">
                            <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">
                              {article.status}
                            </span>
                            <Link href={`/article/${article.id}`} className="p-1 text-blue-600 hover:text-blue-800">
                              <EyeIcon className="w-3 h-3" />
                            </Link>
                            <button className="p-1 text-gray-600 hover:text-gray-800">
                              <ShareIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                    )}
                    
                    {!loading && articles.length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No articles published yet. Record your voice and create your first article!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    from last month
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Debug Panel */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              Debug Panel
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Title:</strong> {title || 'Empty'}
              </div>
              <div>
                <strong>Enhanced Content Length:</strong> {enhancedContent?.length || 0}
              </div>
              <div>
                <strong>Transcript Length:</strong> {transcript?.length || 0}
              </div>
              <div>
                <strong>Images Count:</strong> {images?.length || 0}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Activities
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="p-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <activity.icon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {activity.message}
                          </p>
                          <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="outline" fullWidth>
                    View All Activities
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Quick Actions
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                      <Button fullWidth onClick={() => setActiveTab('publish')}>
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        Create Article
                      </Button>
                      <Button variant="outline" fullWidth>
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button variant="outline" fullWidth>
                    <CogIcon className="w-4 h-4 mr-2" />
                    System Settings
                  </Button>
                  <Button variant="outline" fullWidth>
                    <ChartBarIcon className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    System Status
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">AI Service</span>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Voice Recording</span>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Image Upload</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                    </div>
                  </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          </div>
        </Container>
    </div>
  );
}
