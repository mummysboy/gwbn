'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { 
  PhotoIcon, 
  XMarkIcon, 
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    await processFiles(fileArray);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Process files directly instead of creating fake event
      processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not a valid image file.`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Please choose a file smaller than 5MB.`);
          continue;
        }

        // Update progress
        const progress = ((i + 1) / files.length) * 100;
        setUploadProgress(progress);

        // Upload to S3
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'articles');

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success && result.url) {
          newImages.push(result.url);
        } else {
          console.error('Upload failed for file:', file.name, result.error);
          // If S3 upload fails, fall back to object URL for now
          if (result.error && result.error.includes('S3')) {
            console.warn('S3 not configured, using temporary object URL for:', file.name);
            const fallbackUrl = URL.createObjectURL(file);
            newImages.push(fallbackUrl);
          } else {
            alert(`Failed to upload ${file.name}: ${result.error || 'Unknown error'}`);
          }
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
      
      setIsUploading(false);
      setUploadProgress(0);

    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
        
        <div className="space-y-3">
          <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto" />
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Upload Images
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag and drop images here, or click to browse
            </p>
          </div>
          <Button variant="outline" size="sm">
            <PhotoIcon className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Uploaded Images ({images.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={openFileDialog}
            >
              <PhotoIcon className="w-4 h-4 mr-2" />
              Add More
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  style={{ width: '200px', height: '128px' }}
                />
                
                {/* Remove Button */}
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
                
                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between">
                    <span>Image {index + 1}</span>
                    <CheckCircleIcon className="w-3 h-3 text-green-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
          Image Guidelines:
        </h3>
        <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Supported formats: JPG, PNG, GIF, WebP</li>
          <li>• Maximum file size: 5MB per image</li>
          <li>• Recommended resolution: 1200x800px or higher</li>
          <li>• You can upload up to 10 images per article</li>
        </ul>
      </div>

      {/* Error Handling */}
      {images.length >= 10 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800 dark:text-yellow-300">
              Maximum of 10 images reached. Remove some images to add more.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
