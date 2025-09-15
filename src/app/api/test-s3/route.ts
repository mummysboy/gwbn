import { NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3-service';

export async function GET() {
  try {
    // Check if S3 is configured
    if (!S3Service.isConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'S3 is not properly configured',
        config: S3Service.getConfigStatus(),
        recommendations: [
          'Set NEXT_PUBLIC_S3_BUCKET_NAME environment variable',
          'Set NEXT_PUBLIC_S3_REGION environment variable',
          'Ensure AWS credentials are configured',
          'Verify S3 bucket exists'
        ]
      }, { status: 400 });
    }

    // Try to upload a small test file
    const testContent = 'This is a test file for S3 connectivity';
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
    
    const result = await S3Service.uploadImage(testFile, 'test');
    
    if (result.success) {
      // Clean up the test file
      if (result.key) {
        await S3Service.deleteImage(result.key);
      }
      
      return NextResponse.json({
        success: true,
        message: 'S3 connectivity test passed',
        config: S3Service.getConfigStatus(),
        testResult: {
          uploaded: true,
          url: result.url,
          cleanedUp: true
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'S3 upload test failed',
        config: S3Service.getConfigStatus(),
        testResult: {
          uploaded: false,
          error: result.error
        }
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('S3 test error:', error);
    return NextResponse.json({
      success: false,
      error: 'S3 test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      config: S3Service.getConfigStatus()
    }, { status: 500 });
  }
}
