'use client';

import React, { useState, useEffect } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface TranscriptEditorProps {
  transcript: string;
  onTranscriptChange: (transcript: string) => void;
  onSave?: (transcript: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export default function TranscriptEditor({ 
  transcript, 
  onTranscriptChange, 
  onSave,
  placeholder = "Edit your transcript here...",
  maxLength = 5000
}: TranscriptEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(transcript);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    console.log('TranscriptEditor received transcript:', transcript);
    setEditedTranscript(transcript);
  }, [transcript]);

  useEffect(() => {
    const words = editedTranscript.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(editedTranscript.length);
  }, [editedTranscript]);

  const handleSave = () => {
    onTranscriptChange(editedTranscript);
    if (onSave) {
      onSave(editedTranscript);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTranscript(transcript);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
  };

  const formatText = (text: string) => {
    // Basic formatting for better readability
    return text
      .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Add space after sentences
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  };

  const autoFormat = () => {
    const formatted = formatText(editedTranscript);
    setEditedTranscript(formatted);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <DocumentTextIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transcript Editor
          </h3>
        </div>
        
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          {maxLength && (
            <span className={charCount > maxLength * 0.9 ? 'text-orange-500' : ''}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
        
        {isEditing && (
          <Button
            onClick={autoFormat}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Auto-format
          </Button>
        )}
      </div>

      {/* Editor */}
      <div className="relative">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         resize-none"
              maxLength={maxLength}
            />
            
            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="flex items-center bg-green-600 hover:bg-green-700"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-32">
            {transcript ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {transcript}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No transcript available. Start recording to generate one.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editing Tips */}
      {isEditing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Editing Tips:
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
            <li>• Use Ctrl/Cmd + Enter to save quickly</li>
            <li>• Press Escape to cancel changes</li>
            <li>• Use "Auto-format" to clean up spacing and punctuation</li>
            <li>• Edit naturally - the AI enhancer will polish the final version</li>
          </ul>
        </div>
      )}

      {/* Character Limit Warning */}
      {maxLength && charCount > maxLength * 0.9 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
          <p className="text-sm text-orange-800 dark:text-orange-300">
            {charCount > maxLength 
              ? `⚠️ Character limit exceeded by ${charCount - maxLength} characters`
              : `⚠️ Approaching character limit (${Math.round((charCount / maxLength) * 100)}% used)`
            }
          </p>
        </div>
      )}
    </div>
  );
}
