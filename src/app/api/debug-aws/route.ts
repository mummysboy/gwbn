import { NextResponse } from 'next/server';
import { validateAWSConfig, getAWSConfigStatus } from '@/lib/aws-config';

export async function GET() {
  try {
    const configStatus = getAWSConfigStatus();
    const isValid = validateAWSConfig();
    
    return NextResponse.json({
      success: true,
      isValid,
      config: configStatus,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        REGION: process.env.REGION,
        ACCESS_KEY_ID: process.env.ACCESS_KEY_ID ? 'Set' : 'Not set',
        SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY ? 'Set' : 'Not set',
        ARTICLES_TABLE: process.env.ARTICLES_TABLE || 'gwbn-articles',
        USERS_TABLE: process.env.USERS_TABLE || 'gwbn-users',
        ANALYTICS_TABLE: process.env.ANALYTICS_TABLE || 'gwbn-analytics',
      },
      hosting: {
        platform: process.env.VERCEL ? 'Vercel' : process.env.AMPLIFY_APP_ID ? 'AWS Amplify' : 'Unknown',
        vercel: !!process.env.VERCEL,
        amplify: !!process.env.AMPLIFY_APP_ID,
      },
      recommendations: isValid ? [] : [
        'Set ACCESS_KEY_ID and SECRET_ACCESS_KEY environment variables',
        'Ensure DynamoDB tables exist in the correct region',
        'Verify IAM permissions for DynamoDB access',
        'Check that REGION matches your DynamoDB region'
      ]
    });
    
  } catch (error) {
    console.error('Debug AWS error:', error);
    return NextResponse.json(
      { error: 'Failed to debug AWS config', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
