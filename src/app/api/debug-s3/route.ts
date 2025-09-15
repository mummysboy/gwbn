import { NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3-service';

export async function GET() {
  try {
    const configStatus = S3Service.getConfigStatus();
    const isConfigured = S3Service.isConfigured();
    
    return NextResponse.json({
      success: true,
      isConfigured,
      config: configStatus,
      environment: {
        NEXT_PUBLIC_S3_BUCKET_NAME: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'NOT_SET',
        NEXT_PUBLIC_S3_REGION: process.env.NEXT_PUBLIC_S3_REGION || 'NOT_SET',
        REGION: process.env.REGION || 'NOT_SET',
        ACCESS_KEY_ID: process.env.ACCESS_KEY_ID ? 'SET (length: ' + process.env.ACCESS_KEY_ID.length + ')' : 'NOT_SET',
        SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY ? 'SET (length: ' + process.env.SECRET_ACCESS_KEY.length + ')' : 'NOT_SET',
        ROLE_ARN: process.env.ROLE_ARN ? 'SET' : 'NOT_SET',
        WEB_IDENTITY_TOKEN_FILE: process.env.WEB_IDENTITY_TOKEN_FILE ? 'SET' : 'NOT_SET',
        AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME ? 'SET' : 'NOT_SET',
      },
      hosting: {
        platform: process.env.VERCEL ? 'Vercel' : process.env.AMPLIFY_APP_ID ? 'AWS Amplify' : 'Unknown',
        vercel: !!process.env.VERCEL,
        amplify: !!process.env.AMPLIFY_APP_ID,
        lambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      },
      recommendations: [
        !process.env.NEXT_PUBLIC_S3_BUCKET_NAME ? 'Set NEXT_PUBLIC_S3_BUCKET_NAME environment variable' : null,
        !process.env.NEXT_PUBLIC_S3_REGION ? 'Set NEXT_PUBLIC_S3_REGION environment variable' : null,
        !process.env.ACCESS_KEY_ID && !process.env.ROLE_ARN ? 'Set ACCESS_KEY_ID and SECRET_ACCESS_KEY, or configure IAM role' : null,
        process.env.NEXT_PUBLIC_S3_BUCKET_NAME === 'your_bucket_name' ? 'Replace placeholder bucket name with actual bucket name' : null,
        process.env.NEXT_PUBLIC_S3_BUCKET_NAME === 'gwbn-storage' ? 'Ensure S3 bucket "gwbn-storage" exists and has proper permissions' : null,
        process.env.VERCEL ? 'Check Vercel Environment Variables in project settings' : null,
        process.env.AMPLIFY_APP_ID ? 'Check AWS Amplify Environment Variables in app settings' : null,
      ].filter(Boolean)
    });
    
  } catch (error) {
    console.error('Debug S3 error:', error);
    return NextResponse.json(
      { error: 'Failed to debug S3 config', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
