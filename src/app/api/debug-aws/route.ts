import { NextResponse } from 'next/server';
import { awsConfig } from '@/lib/aws-config';

export async function GET() {
  try {
    const hasCredentials = !!(awsConfig.accessKeyId && awsConfig.secretAccessKey);
    
    return NextResponse.json({
      success: true,
      aws: {
        region: awsConfig.region,
        hasCredentials,
        accessKeyId: hasCredentials ? `${awsConfig.accessKeyId?.substring(0, 8)}...` : 'Not configured',
        secretAccessKey: hasCredentials ? 'Configured' : 'Not configured',
      },
      environment: {
        AWS_REGION: process.env.AWS_REGION,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set',
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set',
      }
    });
    
  } catch (error) {
    console.error('Debug AWS error:', error);
    return NextResponse.json(
      { error: 'Failed to debug AWS config' },
      { status: 500 }
    );
  }
}
