'use client';

import React, { useState } from 'react';
import AIEnhancer from '@/components/publishing/AIEnhancer';
import { Button } from '@/components/ui/Button';

export default function AIEnhancementTest() {
  const [testTranscript, setTestTranscript] = useState('');
  const [enhancedTitle, setEnhancedTitle] = useState('');
  const [enhancedContent, setEnhancedContent] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleEnhanced = (title: string, content: string) => {
    addTestResult(`onEnhanced called with title: "${title}" and content length: ${content?.length}`);
    setEnhancedTitle(title);
    setEnhancedContent(content);
  };

  const runDirectAPITest = async () => {
    addTestResult('Starting direct API test...');
    
    try {
      const response = await fetch('/api/generate-article-working', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: 'This is a test transcript about local infrastructure improvements in Santa Barbara',
          notes: 'Test notes for the article'
        }),
      });
      
      const result = await response.json();
      addTestResult(`API Response: success=${result.success}, title="${result.title}", content length=${result.content?.length}`);
      
      if (result.success) {
        addTestResult('Direct API test PASSED');
      } else {
        addTestResult('Direct API test FAILED');
      }
    } catch (error) {
      addTestResult(`Direct API test ERROR: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setEnhancedTitle('');
    setEnhancedContent('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        AI Enhancement Feature Debug Test
      </h1>

      {/* Test Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Test Controls
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test Transcript
            </label>
            <textarea
              value={testTranscript}
              onChange={(e) => setTestTranscript(e.target.value)}
              placeholder="Enter a test transcript here..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={4}
            />
          </div>

          <div className="flex space-x-4">
            <Button onClick={runDirectAPITest}>
              Test Direct API
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>
        </div>
      </div>

      {/* AIEnhancer Component Test */}
      {testTranscript && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            AIEnhancer Component Test
          </h2>
          <AIEnhancer 
            transcript={testTranscript}
            notes="Test notes for debugging"
            onEnhanced={handleEnhanced}
          />
        </div>
      )}

      {/* Results Display */}
      {enhancedTitle && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Enhanced Results
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Title:</h3>
              <p className="text-gray-700 dark:text-gray-300">{enhancedTitle}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Content:</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{enhancedContent}</p>
            </div>
          </div>
        </div>
      )}

      {/* Test Results Log */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Test Results Log
        </h2>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No test results yet. Run a test to see results here.</p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
