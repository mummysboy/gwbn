'use client';

import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface Article {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  views: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ContentPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);

  useEffect(() => {
    // Simulate loading articles data
    const loadArticles = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockArticles: Article[] = [
        {
          id: '1',
          title: 'Local Business Expansion Creates 200 New Jobs',
          content: 'In a significant boost to the local economy, TechCorp announced today...',
          status: 'published',
          publishedAt: '2024-01-15T10:30:00Z',
          views: 1250,
          wordCount: 450,
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          title: 'City Council Approves New Infrastructure Plan',
          content: 'The city council voted unanimously yesterday to approve...',
          status: 'published',
          publishedAt: '2024-01-14T14:20:00Z',
          views: 980,
          wordCount: 380,
          createdAt: '2024-01-14T13:00:00Z',
          updatedAt: '2024-01-14T14:20:00Z'
        },
        {
          id: '3',
          title: 'Tech Startup Secures $5M Funding Round',
          content: 'Local startup InnovateNow has successfully closed...',
          status: 'draft',
          views: 0,
          wordCount: 320,
          createdAt: '2024-01-13T16:45:00Z',
          updatedAt: '2024-01-13T16:45:00Z'
        },
        {
          id: '4',
          title: 'Community Center Opens Downtown Location',
          content: 'The new community center officially opened its doors...',
          status: 'published',
          publishedAt: '2024-01-12T11:15:00Z',
          views: 720,
          wordCount: 290,
          createdAt: '2024-01-12T10:00:00Z',
          updatedAt: '2024-01-12T11:15:00Z'
        },
        {
          id: '5',
          title: 'Local Restaurant Wins National Award',
          content: 'Downtown Bistro has been recognized nationally...',
          status: 'archived',
          publishedAt: '2024-01-11T09:30:00Z',
          views: 650,
          wordCount: 275,
          createdAt: '2024-01-11T08:00:00Z',
          updatedAt: '2024-01-11T09:30:00Z'
        }
      ];
      
      setArticles(mockArticles);
      setLoading(false);
    };

    loadArticles();
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <ClockIcon className="w-4 h-4 text-yellow-600" />;
      case 'archived':
        return <XCircleIcon className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(filteredArticles.map(article => article.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on articles:`, selectedArticles);
    // Implement bulk actions here
    setSelectedArticles([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <DocumentTextIcon className="w-8 h-8 mr-3 text-blue-600" />
            Content Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and organize your published articles and drafts
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published' | 'archived')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedArticles.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedArticles.length} article{selectedArticles.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction('publish')}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => handleBulkAction('archive')}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Archive
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Articles List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Articles ({filteredArticles.length})
              </h2>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {selectedArticles.length === filteredArticles.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredArticles.map((article) => (
              <div key={article.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedArticles.includes(article.id)}
                    onChange={() => handleSelectArticle(article.id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                        {article.title}
                      </h3>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                          {getStatusIcon(article.status)}
                          <span className="ml-1 capitalize">{article.status}</span>
                        </span>
                      </div>
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {article.content}
                    </p>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {article.publishedAt ? formatDate(article.publishedAt) : 'Not published'}
                      </div>
                      <div className="flex items-center">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        {article.views} views
                      </div>
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-4 h-4 mr-1" />
                        {article.wordCount} words
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="px-6 py-12 text-center">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No articles match your current filters'
                  : 'No articles found. Create your first article to get started!'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
