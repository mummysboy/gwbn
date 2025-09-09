import React from 'react';
import { 
  CogIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  CircleStackIcon,
  CloudIcon,
  KeyIcon,
  GlobeAltIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Container from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const settingsSections = [
    {
      title: 'General Settings',
      icon: CogIcon,
      description: 'Basic application configuration',
      items: [
        { name: 'Site Name', value: 'GWBN', type: 'text' },
        { name: 'Site Description', value: 'Mobile-first web application', type: 'textarea' },
        { name: 'Default Language', value: 'English', type: 'select' },
        { name: 'Timezone', value: 'UTC-5 (EST)', type: 'select' },
      ]
    },
    {
      title: 'Security Settings',
      icon: ShieldCheckIcon,
      description: 'Authentication and security configuration',
      items: [
        { name: 'Two-Factor Authentication', value: 'Enabled', type: 'toggle' },
        { name: 'Session Timeout', value: '30 minutes', type: 'select' },
        { name: 'Password Policy', value: 'Strong', type: 'select' },
        { name: 'Login Attempts', value: '5 attempts', type: 'select' },
      ]
    },
    {
      title: 'Database Settings',
      icon: CircleStackIcon,
      description: 'Database connection and configuration',
      items: [
        { name: 'Database Type', value: 'PostgreSQL', type: 'text' },
        { name: 'Connection Pool', value: '20 connections', type: 'select' },
        { name: 'Backup Frequency', value: 'Daily', type: 'select' },
        { name: 'Auto Migration', value: 'Enabled', type: 'toggle' },
      ]
    },
    {
      title: 'AWS Configuration',
      icon: CloudIcon,
      description: 'Amazon Web Services integration',
      items: [
        { name: 'Region', value: 'us-east-1', type: 'select' },
        { name: 'S3 Bucket', value: 'gwbn-storage', type: 'text' },
        { name: 'CloudFront CDN', value: 'Enabled', type: 'toggle' },
        { name: 'Lambda Functions', value: '3 active', type: 'text' },
      ]
    },
    {
      title: 'API Settings',
      icon: KeyIcon,
      description: 'API configuration and rate limiting',
      items: [
        { name: 'API Version', value: 'v1', type: 'text' },
        { name: 'Rate Limit', value: '1000 requests/hour', type: 'select' },
        { name: 'API Keys', value: '5 active keys', type: 'text' },
        { name: 'CORS Policy', value: 'Restricted', type: 'select' },
      ]
    },
    {
      title: 'Notifications',
      icon: BellIcon,
      description: 'Email and push notification settings',
      items: [
        { name: 'Email Notifications', value: 'Enabled', type: 'toggle' },
        { name: 'Push Notifications', value: 'Enabled', type: 'toggle' },
        { name: 'SMS Notifications', value: 'Disabled', type: 'toggle' },
        { name: 'Notification Frequency', value: 'Real-time', type: 'select' },
      ]
    },
  ];

  return (
    <div className="py-6">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure application settings and preferences
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Export Config
              </Button>
              <Button size="sm">
                <CogIcon className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <section.icon className="w-6 h-6 text-primary" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {section.description}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.type === 'toggle' ? (
                        <div className="flex items-center">
                          <span className={`text-sm ${item.value === 'Enabled' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {item.value}
                          </span>
                          <button className={`ml-2 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.value === 'Enabled' ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.value === 'Enabled' ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* System Information */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <GlobeAltIcon className="w-6 h-6 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                System Information
              </h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Application Version</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">v1.0.0</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Node.js Version</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">v18.17.0</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Database Version</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">PostgreSQL 15.3</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">7 days, 12 hours</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
