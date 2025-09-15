import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      REGION: process.env.REGION || 'NOT_SET',
      ACCESS_KEY_ID: process.env.ACCESS_KEY_ID ? 'SET' : 'NOT_SET',
      SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY ? 'SET' : 'NOT_SET',
      ARTICLES_TABLE: process.env.ARTICLES_TABLE || 'gwbn-articles',
      USERS_TABLE: process.env.USERS_TABLE || 'gwbn-users',
      ANALYTICS_TABLE: process.env.ANALYTICS_TABLE || 'gwbn-analytics',
    };

    // Check hosting platform
    const platformInfo = {
      vercel: !!process.env.VERCEL,
      amplify: !!process.env.AMPLIFY_APP_ID,
      netlify: !!process.env.NETLIFY,
      vercelUrl: process.env.VERCEL_URL,
      vercelBranch: process.env.VERCEL_GIT_COMMIT_REF,
      amplifyAppId: process.env.AMPLIFY_APP_ID,
      amplifyBranch: process.env.AMPLIFY_BRANCH,
    };

    // Check IAM role indicators
    const iamInfo = {
      hasRoleArn: !!process.env.ROLE_ARN,
      hasWebIdentityToken: !!process.env.WEB_IDENTITY_TOKEN_FILE,
      hasAwsSessionToken: !!process.env.AWS_SESSION_TOKEN,
      hasAwsAccessKeyId: !!process.env.AWS_ACCESS_KEY_ID,
      hasAwsSecretAccessKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    };

    // Try to create AWS client
    let awsClientTest = null;
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      
      // Try with explicit credentials first
      if (process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY) {
        const client = new DynamoDBClient({
          region: process.env.REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
          },
        });
        awsClientTest = { method: 'explicit_credentials', success: true };
      } else {
        // Try with default credentials (IAM role)
        const client = new DynamoDBClient({
          region: process.env.REGION || 'us-east-1',
        });
        awsClientTest = { method: 'default_credentials', success: true };
      }
    } catch (error) {
      awsClientTest = { 
        method: 'failed', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    // Try to test DynamoDB connection
    let dynamoTest = null;
    try {
      const { DynamoDBClient, DescribeTableCommand } = await import('@aws-sdk/client-dynamodb');
      
      const client = new DynamoDBClient({
        region: process.env.REGION || 'us-east-1',
        credentials: process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY ? {
          accessKeyId: process.env.ACCESS_KEY_ID,
          secretAccessKey: process.env.SECRET_ACCESS_KEY,
        } : undefined,
      });

      const tableName = process.env.ARTICLES_TABLE || 'gwbn-articles';
      const result = await client.send(new DescribeTableCommand({ TableName: tableName }));
      
      dynamoTest = {
        success: true,
        tableName,
        tableStatus: result.Table?.TableStatus,
        itemCount: result.Table?.ItemCount,
      };
    } catch (error) {
      dynamoTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : 'Unknown',
      };
    }

    // Generate recommendations
    const recommendations = [];
    
    if (!process.env.REGION) {
      recommendations.push('Set REGION environment variable (e.g., us-east-1)');
    }
    
    if (!process.env.ACCESS_KEY_ID && !process.env.SECRET_ACCESS_KEY && !iamInfo.hasRoleArn) {
      recommendations.push('Set ACCESS_KEY_ID and SECRET_ACCESS_KEY, or configure IAM role');
    }
    
    if (platformInfo.vercel) {
      recommendations.push('Check Vercel Environment Variables in project settings');
    }
    
    if (platformInfo.amplify) {
      recommendations.push('Check AWS Amplify Environment Variables in app settings');
    }
    
    if (dynamoTest && !dynamoTest.success) {
      if (dynamoTest.errorType === 'ResourceNotFoundException') {
        recommendations.push('Create DynamoDB tables in production region');
      } else if (dynamoTest.errorType === 'AccessDeniedException') {
        recommendations.push('Add DynamoDB permissions to production IAM role');
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      platform: platformInfo,
      iam: iamInfo,
      awsClient: awsClientTest,
      dynamoDB: dynamoTest,
      recommendations,
      debugInfo: {
        allEnvVars: Object.keys(process.env).filter(key => 
          key.includes('AWS') || key.includes('REGION') || key.includes('TABLE')
        ).reduce((obj, key) => {
          obj[key] = process.env[key] ? 'SET' : 'NOT_SET';
          return obj;
        }, {} as Record<string, string>)
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Production debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
