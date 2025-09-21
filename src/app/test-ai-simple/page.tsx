'use client';

import React, { useState } from 'react';
import AIEnhancer from '@/components/publishing/AIEnhancer';

export default function TestAISimplePage() {
  const [transcript, setTranscript] = useState('This is a test transcript about local infrastructure improvements in Santa Barbara. The city council has announced plans for new bike lanes and road improvements.');
  const [enhancedTitle, setEnhancedTitle] = useState('');
  const [enhancedContent, setEnhancedContent] = useState('');

  const handleEnhanced = (title: string, content: string) => {
    console.log('Simple test: onEnhanced called with:', { title, content });
    setEnhancedTitle(title);
    setEnhancedContent(content);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          AI Enhancement Simple Test
        </h1>

        {/* Transcript Input */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Transcript
          </h2>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={6}
          />
        </div>

        {/* AIEnhancer Component */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            AI Enhancement
          </h2>
          <AIEnhancer 
            transcript={transcript}
            notes="Test notes for the article"
            onEnhanced={handleEnhanced}
          />
        </div>

        {/* Results */}
        {enhancedTitle && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Enhanced Results
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Title:</h3>
                <p className="text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">{enhancedTitle}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Content:</h3>
                <div className="text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg whitespace-pre-wrap">{enhancedContent}</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Instructions
          </h3>
          <ul className="text-blue-800 dark:text-blue-300 space-y-2">
            <li>• Modify the transcript above if desired</li>
            <li>• Click the &quot;Generate Article&quot; button</li>
            <li>• Check the browser console for debug information</li>
            <li>• The enhanced title and content should appear below</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
