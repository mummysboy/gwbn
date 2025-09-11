'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  EyeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalViews: number;
  totalUsers: number;
  totalArticles: number;
  viewsGrowth: number;
  usersGrowth: number;
  articlesGrowth: number;
  topArticles: Array<{
    id: string;
    title: string;
    views: number;
    publishedAt: string;
  }>;
  viewsByDay: Array<{
    date: string;
    views: number;
  }>;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockData: AnalyticsData = {
        totalViews: 12450,
        totalUsers: 892,
        totalArticles: 156,
        viewsGrowth: 12.5,
        usersGrowth: 8.3,
        articlesGrowth: 15.2,
        topArticles: [
          { id: '1', title: 'Local Business Expansion Creates 200 New Jobs', views: 1250, publishedAt: '2024-01-15' },
          { id: '2', title: 'City Council Approves New Infrastructure Plan', views: 980, publishedAt: '2024-01-14' },
          { id: '3', title: 'Tech Startup Secures $5M Funding Round', views: 875, publishedAt: '2024-01-13' },
          { id: '4', title: 'Community Center Opens Downtown Location', views: 720, publishedAt: '2024-01-12' },
          { id: '5', title: 'Local Restaurant Wins National Award', views: 650, publishedAt: '2024-01-11' }
        ],
        viewsByDay: [
          { date: '2024-01-01', views: 450 },
          { date: '2024-01-02', views: 520 },
          { date: '2024-01-03', views: 480 },
          { date: '2024-01-04', views: 610 },
          { date: '2024-01-05', views: 580 },
          { date: '2024-01-06', views: 720 },
          { date: '2024-01-07', views: 680 }
        ]
      };
      
      setAnalyticsData(mockData);
      setLoading(false);
    };

    loadAnalytics();
  }, [timeRange]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <span className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> : <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />}
        {Math.abs(growth).toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <ChartBarIcon className="w-8 h-8 mr-3 text-blue-600" />
                Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Track your content performance and audience engagement
              </p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {analyticsData && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(analyticsData.totalViews)}
                    </p>
                    {formatGrowth(analyticsData.viewsGrowth)}
                  </div>
                  <EyeIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(analyticsData.totalUsers)}
                    </p>
                    {formatGrowth(analyticsData.usersGrowth)}
                  </div>
                  <UserGroupIcon className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(analyticsData.totalArticles)}
                    </p>
                    {formatGrowth(analyticsData.articlesGrowth)}
                  </div>
                  <DocumentTextIcon className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Top Articles */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Articles</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {analyticsData.topArticles.map((article, index) => (
                  <div key={article.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {article.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Published {new Date(article.publishedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <EyeIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatNumber(article.views)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Views Chart Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Views Over Time</h2>
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Chart visualization would be implemented here
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Consider integrating Chart.js or Recharts for data visualization
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
