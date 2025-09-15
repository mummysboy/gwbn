import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3-service';
import { LocalStorageService } from '@/lib/local-storage-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'articles';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Try S3 first, fallback to local storage
    let result;
    
    if (S3Service.isConfigured()) {
      console.log('Upload API: Attempting S3 upload');
      result = await S3Service.uploadImage(file, folder);
    } else {
      console.log('Upload API: S3 not configured, using local storage');
      result = await LocalStorageService.uploadImage(file, folder);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        url: result.url,
        key: 'key' in result ? result.key : ('filename' in result ? result.filename : undefined)
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
