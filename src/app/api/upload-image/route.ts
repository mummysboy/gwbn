import { NextRequest, NextResponse } from 'next/server';
import { S3Service, UploadResult } from '@/lib/s3-service';
import { LocalStorageService, LocalUploadResult } from '@/lib/local-storage-service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'articles'; // Default folder

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

    // Attempt S3 upload first (using IAM roles, no explicit env vars needed)
    let result: UploadResult | LocalUploadResult;
    try {
      console.log('Upload API: Attempting S3 upload with IAM roles');
      result = await S3Service.uploadImage(file, folder);

      if (!result.success) {
        console.warn('S3 upload failed, falling back to local storage:', result.error);
        result = await LocalStorageService.uploadImage(file, folder);
      }
    } catch (s3Error) {
      console.error('S3 upload threw an error, falling back to local storage:', s3Error);
      result = await LocalStorageService.uploadImage(file, folder);
    }

    if (result.success) {
      const key = 'key' in result ? result.key : ('filename' in result ? result.filename : undefined);
      return NextResponse.json({
        success: true,
        url: result.url,
        key,
        storageType: 'key' in result ? 's3' : 'local'
      });
    } else {
      return NextResponse.json(
        {
          error: result.error || 'Upload failed',
          debug: {
            s3Configured: S3Service.isConfigured(),
            s3ConfigStatus: S3Service.getConfigStatus(),
            environment: process.env.NODE_ENV,
            platform: process.env.VERCEL ? 'Vercel' : process.env.AMPLIFY_APP_ID ? 'Amplify' : 'Unknown'
          }
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        debug: {
          s3Configured: S3Service.isConfigured(),
          s3ConfigStatus: S3Service.getConfigStatus()
        }
      },
      { status: 500 }
    );
  }
}