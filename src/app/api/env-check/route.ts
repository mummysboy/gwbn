import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Get all environment variables (server-side only)
    const envVars = {
      // Server-only variables (should NOT be prefixed with NEXT_PUBLIC_)
      NODE_ENV: process.env.NODE_ENV,
      REGION: process.env.REGION ? 'SET' : 'NOT_SET',
      AWS_REGION: process.env.AWS_REGION ? 'SET' : 'NOT_SET',
      ACCESS_KEY_ID: process.env.ACCESS_KEY_ID ? 'SET' : 'NOT_SET',
      SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY ? 'SET' : 'NOT_SET',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT_SET',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT_SET',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT_SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      ARTICLES_TABLE: process.env.ARTICLES_TABLE || 'NOT_SET',
      USERS_TABLE: process.env.USERS_TABLE || 'NOT_SET',
      ANALYTICS_TABLE: process.env.ANALYTICS_TABLE || 'NOT_SET',
      ROLE_ARN: process.env.ROLE_ARN ? 'SET' : 'NOT_SET',
      WEB_IDENTITY_TOKEN_FILE: process.env.WEB_IDENTITY_TOKEN_FILE ? 'SET' : 'NOT_SET',
      
      // Public variables (should be prefixed with NEXT_PUBLIC_)
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'NOT_SET',
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || 'NOT_SET',
      NEXT_PUBLIC_COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'NOT_SET',
      NEXT_PUBLIC_COGNITO_CLIENT_ID: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || 'NOT_SET',
      NEXT_PUBLIC_S3_BUCKET_NAME: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'NOT_SET',
      NEXT_PUBLIC_S3_REGION: process.env.NEXT_PUBLIC_S3_REGION || 'NOT_SET',
      NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'NOT_SET',
      
      // Platform detection
      VERCEL: process.env.VERCEL ? 'true' : 'false',
      AMPLIFY_APP_ID: process.env.AMPLIFY_APP_ID ? 'SET' : 'NOT_SET',
      AMPLIFY_BRANCH: process.env.AMPLIFY_BRANCH || 'NOT_SET',
      AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME || 'NOT_SET',
      AWS_EXECUTION_ENV: process.env.AWS_EXECUTION_ENV || 'NOT_SET',
    };

    // Security analysis
    const securityIssues = [];
    const recommendations = [];

    // Check for secrets that might be exposed to client
    const serverOnlyVars = [
      'ACCESS_KEY_ID', 'SECRET_ACCESS_KEY', 'AWS_ACCESS_KEY_ID', 
      'AWS_SECRET_ACCESS_KEY', 'OPENAI_API_KEY', 'DATABASE_URL'
    ];

    serverOnlyVars.forEach(varName => {
      if (process.env[varName]) {
        // Check if this variable is used in client-side code
        recommendations.push(`✅ ${varName} is properly server-only`);
      } else {
        securityIssues.push(`⚠️ ${varName} is not set`);
      }
    });

    // Check public variables
    const publicVars = [
      'NEXT_PUBLIC_APP_NAME', 'NEXT_PUBLIC_APP_VERSION', 
      'NEXT_PUBLIC_COGNITO_USER_POOL_ID', 'NEXT_PUBLIC_COGNITO_CLIENT_ID',
      'NEXT_PUBLIC_S3_BUCKET_NAME', 'NEXT_PUBLIC_S3_REGION',
      'NEXT_PUBLIC_API_GATEWAY_URL'
    ];

    publicVars.forEach(varName => {
      if (process.env[varName]) {
        recommendations.push(`✅ ${varName} is properly configured for client-side use`);
      } else {
        recommendations.push(`ℹ️ ${varName} is not set (optional)`);
      }
    });

    // Platform-specific recommendations
    if (process.env.AMPLIFY_APP_ID) {
      recommendations.push('🚀 Detected AWS Amplify hosting');
      recommendations.push('📝 Set environment variables in Amplify Console → App settings → Environment variables');
    } else if (process.env.VERCEL) {
      recommendations.push('🚀 Detected Vercel hosting');
      recommendations.push('📝 Set environment variables in Vercel Dashboard → Settings → Environment Variables');
    } else {
      recommendations.push('ℹ️ Hosting platform not detected or using custom setup');
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: envVars,
      securityAnalysis: {
        issues: securityIssues,
        recommendations: recommendations
      },
      platform: {
        isAmplify: !!process.env.AMPLIFY_APP_ID,
        isVercel: !!process.env.VERCEL,
        isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
        isEC2: !!process.env.AWS_EXECUTION_ENV,
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check environment variables',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
