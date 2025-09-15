/**
 * Local storage service for images when S3 is not available
 * This is a fallback solution that stores images in the public/uploads directory
 */

import fs from 'fs';
import path from 'path';

export interface LocalUploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

export class LocalStorageService {
  private static uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  private static ensureUploadsDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Upload an image file to local storage
   */
  static async uploadImage(file: File, folder: string = 'articles'): Promise<LocalUploadResult> {
    try {
      this.ensureUploadsDir();
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;
      
      // Create folder path
      const folderPath = path.join(this.uploadsDir, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      
      const filePath = path.join(folderPath, fileName);
      
      // Convert file to buffer and write to disk
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      
      // Generate the public URL
      const url = `/uploads/${folder}/${fileName}`;
      
      console.log('Local Storage: Successfully uploaded image:', { fileName, url });
      
      return {
        success: true,
        url,
        filename: fileName
      };
      
    } catch (error) {
      console.error('Local Storage: Upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Upload multiple images to local storage
   */
  static async uploadImages(files: File[], folder: string = 'articles'): Promise<LocalUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image from local storage
   */
  static async deleteImage(url: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlPath = url.replace('/uploads/', '');
      const filePath = path.join(this.uploadsDir, urlPath);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Local Storage: Successfully deleted image:', filePath);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Local Storage: Delete failed:', error);
      return false;
    }
  }

  /**
   * Check if local storage is available
   */
  static isAvailable(): boolean {
    try {
      this.ensureUploadsDir();
      return true;
    } catch (error) {
      console.error('Local Storage: Not available:', error);
      return false;
    }
  }
}
