import { NextRequest, NextResponse } from 'next/server';
import { S3Service, UploadResult } from '@/lib/s3-service';

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

    // Upload to S3
    console.log('Upload API: Attempting S3 upload');
    const result: UploadResult = await S3Service.uploadImage(file, folder);

    if (result.success) {
      return NextResponse.json({
        success: true,
        url: result.url,
        key: result.key,
        storageType: 's3'
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