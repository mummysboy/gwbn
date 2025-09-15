import { NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3-service';

export async function GET() {
  try {
    const s3ConfigStatus = S3Service.getConfigStatus();
    const isConfigured = S3Service.isConfigured();
    
    // Check environment variables
    const envCheck = {
      REGION: !!process.env.REGION,
      ACCESS_KEY_ID: !!process.env.ACCESS_KEY_ID,
      SECRET_ACCESS_KEY: !!process.env.SECRET_ACCESS_KEY,
      NEXT_PUBLIC_S3_BUCKET_NAME: !!process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      NEXT_PUBLIC_S3_REGION: !!process.env.NEXT_PUBLIC_S3_REGION,
    };
    
    // Check platform detection
    const platformInfo = {
      isVercel: !!process.env.VERCEL,
      isAmplify: !!process.env.AMPLIFY_APP_ID,
      isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      nodeEnv: process.env.NODE_ENV,
    };
    
    // Generate recommendations
    const recommendations = [];
    
    if (!process.env.REGION) {
      recommendations.push('Set REGION environment variable (e.g., us-west-1)');
    }
    
    if (!process.env.ACCESS_KEY_ID) {
      recommendations.push('Set ACCESS_KEY_ID environment variable');
    }
    
    if (!process.env.SECRET_ACCESS_KEY) {
      recommendations.push('Set SECRET_ACCESS_KEY environment variable');
    }
    
    if (!process.env.NEXT_PUBLIC_S3_BUCKET_NAME) {
      recommendations.push('Set NEXT_PUBLIC_S3_BUCKET_NAME environment variable (e.g., gwbn-storage)');
    }
    
    if (!process.env.NEXT_PUBLIC_S3_REGION) {
      recommendations.push('Set NEXT_PUBLIC_S3_REGION environment variable (e.g., us-west-1)');
    }
    
    if (process.env.NEXT_PUBLIC_S3_BUCKET_NAME === 'your_bucket_name') {
      recommendations.push('Replace placeholder bucket name with actual bucket name');
    }
    
    if (platformInfo.isVercel) {
      recommendations.push('Check Vercel Environment Variables in project settings');
    }
    
    if (platformInfo.isAmplify) {
      recommendations.push('Check AWS Amplify Environment Variables in app settings');
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      uploadConfiguration: {
        s3Configured: isConfigured,
        s3ConfigStatus,
        environmentVariables: envCheck,
        platformInfo,
        recommendations: recommendations.length > 0 ? recommendations : ['Configuration looks good!'],
        status: isConfigured ? 'READY' : 'NEEDS_CONFIGURATION'
      }
    });
    
  } catch (error) {
    console.error('Upload config test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test upload configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
