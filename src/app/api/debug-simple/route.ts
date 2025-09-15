import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      REGION: process.env.REGION || 'NOT_SET',
      ACCESS_KEY_ID: process.env.ACCESS_KEY_ID ? 'SET' : 'NOT_SET',
      SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY ? 'SET' : 'NOT_SET',
      ARTICLES_TABLE: process.env.ARTICLES_TABLE || 'gwbn-articles',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
    };

    // Try to import AWS services
    let awsImportError = null;
    let awsConfigStatus = null;
    
    try {
      const { awsConfig, validateAWSConfig } = await import('@/lib/aws-config');
      awsConfigStatus = {
        region: awsConfig.region,
        hasAccessKey: !!awsConfig.accessKeyId,
        hasSecretKey: !!awsConfig.secretAccessKey,
        isValid: validateAWSConfig(),
      };
    } catch (error) {
      awsImportError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Try to create DynamoDB client
    let dynamoError = null;
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const client = new DynamoDBClient({
        region: process.env.REGION || 'us-east-1',
        credentials: process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY ? {
          accessKeyId: process.env.ACCESS_KEY_ID,
          secretAccessKey: process.env.SECRET_ACCESS_KEY,
        } : undefined,
      });
      
      // Test a simple operation
      const { DescribeTableCommand } = await import('@aws-sdk/client-dynamodb');
      await client.send(new DescribeTableCommand({ 
        TableName: process.env.ARTICLES_TABLE || 'gwbn-articles' 
      }));
      
      dynamoError = null; // Success
    } catch (error) {
      dynamoError = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      awsConfig: awsConfigStatus,
      awsImportError,
      dynamoError,
      recommendations: [
        !process.env.ACCESS_KEY_ID && !process.env.SECRET_ACCESS_KEY ? 'Set ACCESS_KEY_ID and SECRET_ACCESS_KEY' : null,
        !process.env.REGION ? 'Set REGION environment variable' : null,
        dynamoError ? 'Fix DynamoDB connection: ' + dynamoError : null,
      ].filter(Boolean),
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Debug endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
