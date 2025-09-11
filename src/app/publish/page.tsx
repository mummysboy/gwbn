'use client';

import React, { useState } from 'react';
import { Container } from '@/components/layout/Container';
import VoiceRecorder from '@/components/publishing/VoiceRecorder';
import TranscriptEditor from '@/components/publishing/TranscriptEditor';
import AIEnhancer from '@/components/publishing/AIEnhancer';
import ImageUploader from '@/components/publishing/ImageUploader';
import { 
  MicrophoneIcon, 
  DocumentTextIcon, 
  PhotoIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

export default function PublishPage() {
  const [currentStep, setCurrentStep] = useState<'record' | 'edit' | 'enhance' | 'publish'>('record');
  const [transcript, setTranscript] = useState('');
  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const handleTranscript = (newTranscript: string) => {
    console.log('Received transcript:', newTranscript);
    setTranscript(newTranscript);
    if (newTranscript.trim()) {
      setCurrentStep('edit');
    }
  };

  const handleTranscriptChange = (newTranscript: string) => {
    setTranscript(newTranscript);
  };

  const handleEnhanced = (title: string, content: string) => {
    console.log('=== HANDLE ENHANCED CALLED ===');
    console.log('handleEnhanced called with:', { title, content });
    console.log('Title length:', title?.length);
    console.log('Content length:', content?.length);
    console.log('Setting articleTitle to:', title);
    console.log('Setting articleContent to:', content?.substring(0, 100) + '...');
    
    // Debug: Check if title and content are swapped
    console.log('DEBUG - Title value:', JSON.stringify(title));
    console.log('DEBUG - Content value:', JSON.stringify(content));
    console.log('DEBUG - Title looks like content?', title?.length > 100);
    console.log('DEBUG - Content looks like title?', content?.length < 100 && content?.includes(':'));
    
    console.log('About to set state...');
    setArticleTitle(title);
    setArticleContent(content);
    console.log('State set successfully');
    
    console.log('State should be updated now');
    
    if (content.trim()) {
      console.log('Moving to publish step');
      setCurrentStep('publish');
    }
    console.log('=== HANDLE ENHANCED COMPLETE ===');
  };


  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handlePublish = async () => {
    if (!articleTitle.trim() || !articleContent.trim()) {
      setError('Please provide a title and content before publishing.');
      return;
    }

    try {
      setIsPublished(true);
      setError('');

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: articleTitle,
          content: articleContent,
          images: [], // TODO: Add image support
          author: 'Staff Reporter',
          category: 'Business'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Success - reset form after delay
        setTimeout(() => {
          setTranscript('');
          setArticleTitle('');
          setArticleContent('');
          setCurrentStep('record');
          setIsPublished(false);
        }, 3000);
      } else {
        setError('Failed to publish article: ' + (data.error || 'Unknown error'));
        setIsPublished(false);
      }
    } catch (error) {
      console.error('Error publishing article:', error);
      setError('Failed to publish article. Please try again.');
      setIsPublished(false);
    }
  };

  const steps = [
    { id: 'record', label: 'Record', icon: MicrophoneIcon, description: 'Record your voice' },
    { id: 'edit', label: 'Edit', icon: DocumentTextIcon, description: 'Edit transcript' },
    { id: 'enhance', label: 'Generate', icon: SparklesIcon, description: 'Generate article' },
    { id: 'publish', label: 'Publish', icon: ArrowRightIcon, description: 'Publish article' },
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <Container>
      <div className="min-h-screen py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Article
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Record your voice and edit the transcript
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors
                      ${status === 'completed' 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : status === 'current'
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                      }
                    `}>
                      {status === 'completed' ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${
                        status === 'current' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.label}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`
                      w-16 h-0.5 mx-4
                      ${status === 'completed' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 dark:text-red-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Voice Recording */}
          {currentStep === 'record' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Record Your Voice
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Speak your article content and watch it transform into text
                </p>
              </div>
              
              <VoiceRecorder
                onTranscript={handleTranscript}
                onError={handleError}
              />
            </div>
          )}

          {/* Step 2: Transcript Editing */}
          {currentStep === 'edit' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Edit Your Transcript
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Review and refine the generated text
                </p>
              </div>
              
              <TranscriptEditor
                transcript={transcript}
                onTranscriptChange={handleTranscriptChange}
                placeholder="Edit your transcript here..."
                maxLength={5000}
              />
              
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => setCurrentStep('record')}
                  variant="outline"
                >
                  Back to Recording
                </Button>
                <Button
                  onClick={() => setCurrentStep('enhance')}
                  disabled={!transcript.trim()}
                >
                  Generate Article
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: AI Enhancement */}
          {currentStep === 'enhance' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Generate Article with AI
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Let AI transform your transcript into a professional newspaper article
                </p>
              </div>
              
              <AIEnhancer
                transcript={transcript}
                notes={notes}
                onEnhanced={handleEnhanced}
              />
              
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => setCurrentStep('edit')}
                  variant="outline"
                >
                  Back to Editing
                </Button>
                <Button
                  onClick={() => setCurrentStep('publish')}
                  disabled={!articleContent.trim()}
                >
                  Continue to Publishing
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Publishing */}
          {currentStep === 'publish' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Publish Your Article
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Add images and publish your content
                </p>
              </div>
              
              {/* Article Title Input */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Article Title
                </h3>
                <div className="space-y-2">
                  <label htmlFor="article-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title:
                  </label>
                  <input
                    id="article-title"
                    type="text"
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    placeholder="Enter your article title..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-semibold"
                  />
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 text-xs text-gray-500">
                      Debug: articleTitle = "{articleTitle}"
                    </div>
                  )}
                </div>
              </div>

              {/* Article Content Input */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Article Content
                </h3>
                <div className="space-y-2">
                  <label htmlFor="article-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Content:
                  </label>
                  <textarea
                    id="article-content"
                    value={articleContent}
                    onChange={(e) => setArticleContent(e.target.value)}
                    placeholder="Enter your article content..."
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-vertical"
                  />
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <div>Debug: articleContent length: {articleContent.length}, transcript length: {transcript.length}</div>
                      <div>articleContent preview: "{articleContent.substring(0, 100)}..."</div>
                      <button 
                        onClick={() => {
                          setArticleTitle('Test Title');
                          setArticleContent('Test content for debugging');
                        }}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                      >
                        Test Set Content
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Preview */}
              {(articleTitle || articleContent) && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Article Preview
                  </h3>
                  
                  {/* Article Title Preview */}
                  {articleTitle && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title Preview:
                      </label>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                          {articleTitle}
                        </h1>
                      </div>
                    </div>
                  )}
                  
                  {/* Article Content Preview */}
                  {articleContent && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Content Preview:
                      </label>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                          {articleContent}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Image Uploader */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Add Images
                </h3>
                <ImageUploader />
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => setCurrentStep('enhance')}
                  variant="outline"
                >
                  Back to Generation
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={isPublished}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isPublished ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      Published!
                    </>
                  ) : (
                    <>
                      <ArrowRightIcon className="w-5 h-5 mr-2" />
                      Publish Article
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
