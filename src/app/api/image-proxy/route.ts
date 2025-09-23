import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { error: 'Missing key parameter' },
        { status: 400 }
      );
    }

    // Generate a fresh signed URL for the S3 object (valid for 1 hour)
    const signedUrl = await S3Service.getSignedUrl(key, 3600);
    
    if (!signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate signed URL' },
        { status: 500 }
      );
    }

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl);
    
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
