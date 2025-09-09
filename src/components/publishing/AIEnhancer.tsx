'use client';

import React, { useState } from 'react';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface AIEnhancerProps {
  transcript: string;
  onEnhanced: (enhancedContent: string) => void;
}

export default function AIEnhancer({ transcript, onEnhanced }: AIEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementType, setEnhancementType] = useState<'news' | 'blog' | 'social'>('news');
  const [enhancedContent, setEnhancedContent] = useState('');

  const enhanceContent = async () => {
    if (!transcript.trim()) return;
    
    setIsEnhancing(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const enhanced = generateEnhancedContent(transcript, enhancementType);
    setEnhancedContent(enhanced);
    onEnhanced(enhanced);
    setIsEnhancing(false);
  };

  const generateEnhancedContent = (text: string, type: string) => {
    const baseContent = text;
    
    switch (type) {
      case 'news':
        return `BREAKING NEWS: ${baseContent}

In a significant development that has captured local attention, recent events have unfolded that promise to reshape our community landscape. The developments come at a time when local stakeholders have been eagerly awaiting positive momentum.

Key highlights from the situation include:
• Immediate impact on local residents and businesses
• Potential for long-term economic benefits
• Community response and engagement

Local officials have expressed optimism about the developments, noting that this represents a significant step forward for the region. Community leaders are encouraging residents to stay informed as more details become available.

The story continues to develop, and we will provide updates as new information emerges. This is a developing story that our team is monitoring closely.

[This content has been enhanced by AI to provide professional news formatting and structure]`;

      case 'blog':
        return `# ${baseContent}

## What This Means for Our Community

The recent developments in our area represent more than just news—they represent opportunity. As someone who has been following local events closely, I'm excited to share what this means for all of us.

### The Big Picture

This isn't just another announcement. It's a reflection of our community's growth and the forward-thinking approach of our local leaders. The implications extend far beyond the immediate headlines.

### Why This Matters

• **Economic Impact**: Local businesses stand to benefit significantly
• **Community Development**: Enhanced services and infrastructure
• **Future Opportunities**: This sets a precedent for future initiatives

### Looking Ahead

As we move forward, it's important to stay engaged and informed. These developments are just the beginning of what promises to be an exciting chapter in our community's story.

*What are your thoughts on these developments? Share your perspective in the comments below.*

[This content has been enhanced by AI to create an engaging blog post format]`;

      case 'social':
        return `🚨 BREAKING: ${baseContent}

This is HUGE news for our community! 🎉

Here's what you need to know:
✅ Major development announced
✅ Community impact expected
✅ Timeline: Coming soon

This is exactly the kind of progress we've been hoping for. Our local leaders are really stepping up! 💪

What do you think about this? Drop a comment below! 👇

#LocalNews #CommunityUpdate #BreakingNews #Progress

[This content has been enhanced by AI for social media engagement]`;

      default:
        return baseContent;
    }
  };

  const enhancementTypes = [
    { id: 'news', label: 'News Article', description: 'Professional news format' },
    { id: 'blog', label: 'Blog Post', description: 'Engaging blog style' },
    { id: 'social', label: 'Social Media', description: 'Social media optimized' },
  ];

  return (
    <div className="space-y-6">
      {/* Enhancement Type Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Choose Enhancement Style
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {enhancementTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setEnhancementType(type.id as 'news' | 'blog' | 'social')}
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                enhancementType === type.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-medium text-sm">{type.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {type.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Enhancement Button */}
      <div className="text-center">
        <Button
          onClick={enhanceContent}
          disabled={isEnhancing || !transcript.trim()}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg"
        >
          {isEnhancing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Enhancing with AI...
            </>
          ) : (
            <>
              <SparklesIcon className="w-6 h-6 mr-3" />
              Enhance with AI
            </>
          )}
        </Button>
      </div>

      {/* Enhancement Status */}
      {isEnhancing && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <div className="text-purple-800 dark:text-purple-300">
              <div className="font-medium">AI is working its magic...</div>
              <div className="text-sm">Analyzing content and enhancing structure</div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Content Preview */}
      {enhancedContent && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-green-800 dark:text-green-300">
              Content Enhanced Successfully!
            </h3>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-h-60 overflow-y-auto">
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {enhancedContent}
            </pre>
          </div>
        </div>
      )}

      {/* AI Features Info */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          AI Enhancement Features:
        </h3>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Professional formatting and structure</li>
          <li>• Engaging headlines and subheadings</li>
          <li>• Contextual information and background</li>
          <li>• Call-to-action elements</li>
          <li>• SEO-optimized content</li>
        </ul>
      </div>
    </div>
  );
}
