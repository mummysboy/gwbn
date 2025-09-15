import { NextRequest, NextResponse } from 'next/server';
import { S3Service, UploadResult } from '@/lib/s3-service';
import { LocalStorageService, LocalUploadResult } from '@/lib/local-storage-service';

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

    // Log environment info for debugging
    const s3ConfigStatus = S3Service.getConfigStatus();
    console.log('Upload API: Environment check:', {
      isConfigured: S3Service.isConfigured(),
      configStatus: s3ConfigStatus,
      hasAccessKey: !!process.env.ACCESS_KEY_ID,
      hasSecretKey: !!process.env.SECRET_ACCESS_KEY,
      bucketName: 'gwbn-storage (hardcoded)',
      region: 'us-west-1 (hardcoded)',
      platform: process.env.VERCEL ? 'Vercel' : process.env.AMPLIFY_APP_ID ? 'Amplify' : 'Unknown'
    });

    // Try S3 first, fallback to local storage
    let result: UploadResult | LocalUploadResult;
    
    if (S3Service.isConfigured()) {
      console.log('Upload API: Attempting S3 upload');
      result = await S3Service.uploadImage(file, folder);
      
      if (!result.success) {
        console.error('S3 upload failed:', result.error);
        console.log('Upload API: Falling back to local storage due to S3 failure');
        result = await LocalStorageService.uploadImage(file, folder);
      }
    } else {
      console.log('Upload API: S3 not configured, using local storage');
      console.log('Upload API: S3 configuration issues:', {
        hasClient: s3ConfigStatus.hasClient,
        bucketName: s3ConfigStatus.bucketName,
        region: s3ConfigStatus.region,
        hasAWSCredentials: s3ConfigStatus.hasAWSCredentials,
        hasIAMRole: s3ConfigStatus.hasIAMRole,
        isLambda: s3ConfigStatus.isLambda
      });
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
            s3ConfigStatus,
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
