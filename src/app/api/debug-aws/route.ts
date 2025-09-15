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
        AWS_REGION: process.env.AWS_REGION,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set',
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set',
        DYNAMODB_ARTICLES_TABLE: process.env.DYNAMODB_ARTICLES_TABLE || 'gwbn-articles',
        DYNAMODB_USERS_TABLE: process.env.DYNAMODB_USERS_TABLE || 'gwbn-users',
        DYNAMODB_ANALYTICS_TABLE: process.env.DYNAMODB_ANALYTICS_TABLE || 'gwbn-analytics',
      },
      hosting: {
        platform: process.env.VERCEL ? 'Vercel' : process.env.AWS_AMPLIFY_APP_ID ? 'AWS Amplify' : 'Unknown',
        vercel: !!process.env.VERCEL,
        amplify: !!process.env.AWS_AMPLIFY_APP_ID,
      },
      recommendations: isValid ? [] : [
        'Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables',
        'Ensure DynamoDB tables exist in the correct region',
        'Verify IAM permissions for DynamoDB access',
        'Check that AWS_REGION matches your DynamoDB region'
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
