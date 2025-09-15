import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test 1: Basic environment check
    const hasRegion = !!process.env.REGION;
    const hasAccessKey = !!process.env.ACCESS_KEY_ID;
    const hasSecretKey = !!process.env.SECRET_ACCESS_KEY;
    
    if (!hasRegion) {
      return NextResponse.json({
        success: false,
        error: 'Missing REGION environment variable',
        test: 'environment_check',
        details: 'Set REGION=us-east-1 (or your AWS region)'
      }, { status: 400 });
    }

    if (!hasAccessKey || !hasSecretKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing AWS credentials',
        test: 'credentials_check',
        details: 'Set ACCESS_KEY_ID and SECRET_ACCESS_KEY environment variables'
      }, { status: 400 });
    }

    // Test 2: Try to create DynamoDB client
    let client;
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      client = new DynamoDBClient({
        region: process.env.REGION,
        credentials: {
          accessKeyId: process.env.ACCESS_KEY_ID!,
          secretAccessKey: process.env.SECRET_ACCESS_KEY!,
        },
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create DynamoDB client',
        test: 'client_creation',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Test 3: Try to describe the articles table
    try {
      const { DescribeTableCommand } = await import('@aws-sdk/client-dynamodb');
      const tableName = process.env.ARTICLES_TABLE || 'gwbn-articles';
      
      const result = await client.send(new DescribeTableCommand({ 
        TableName: tableName 
      }));
      
      return NextResponse.json({
        success: true,
        message: 'All tests passed!',
        tests: {
          environment: 'passed',
          credentials: 'passed', 
          client_creation: 'passed',
          table_access: 'passed'
        },
        tableInfo: {
          name: result.Table?.TableName,
          status: result.Table?.TableStatus,
          itemCount: result.Table?.ItemCount
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('ResourceNotFoundException')) {
        return NextResponse.json({
          success: false,
          error: 'DynamoDB table does not exist',
          test: 'table_existence',
          details: `Table '${process.env.ARTICLES_TABLE || 'gwbn-articles'}' not found. Run: node scripts/setup-dynamodb.js`,
          suggestion: 'Create the table using the setup script'
        }, { status: 404 });
      }
      
      if (errorMessage.includes('AccessDenied') || errorMessage.includes('UnauthorizedOperation')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient DynamoDB permissions',
          test: 'permissions_check',
          details: errorMessage,
          suggestion: 'Add DynamoDB permissions to your IAM role/user'
        }, { status: 403 });
      }

      return NextResponse.json({
        success: false,
        error: 'DynamoDB operation failed',
        test: 'table_access',
        details: errorMessage
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Test endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
