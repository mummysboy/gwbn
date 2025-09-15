import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Lambda DynamoDB Test: Starting');
    
    // Test 1: Check environment
    const envInfo = {
      isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      region: process.env.AWS_REGION || 'NOT_SET',
      hasAwsRegion: !!process.env.AWS_REGION,
      lambdaFunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME || 'NOT_SET',
      executionEnv: process.env.AWS_EXECUTION_ENV || 'NOT_SET',
    };

    // Test 2: Try to create DynamoDB client with different approaches
    const clientTests = [];

    // Approach 1: Default credentials (IAM role)
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const client1 = new DynamoDBClient({
        region: process.env.AWS_REGION || 'us-west-1',
      });
      clientTests.push({ approach: 'default_credentials', success: true, error: null });
    } catch (error) {
      clientTests.push({ 
        approach: 'default_credentials', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }

    // Approach 2: Explicit region only
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const client2 = new DynamoDBClient({
        region: 'us-west-1',
      });
      clientTests.push({ approach: 'explicit_region_only', success: true, error: null });
    } catch (error) {
      clientTests.push({ 
        approach: 'explicit_region_only', 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }

    // Test 3: Try to describe a table
    let tableTest = null;
    try {
      const { DynamoDBClient, DescribeTableCommand } = await import('@aws-sdk/client-dynamodb');
      const client = new DynamoDBClient({
        region: process.env.AWS_REGION || 'us-west-1',
      });

      // Try different table names
      const tableNames = ['gwbn-articles', 'articles', 'Articles'];
      
      for (const tableName of tableNames) {
        try {
          const result = await client.send(new DescribeTableCommand({ TableName: tableName }));
          tableTest = {
            success: true,
            tableName,
            tableStatus: result.Table?.TableStatus,
            itemCount: result.Table?.ItemCount,
          };
          break;
        } catch (error) {
          if (error instanceof Error && error.name === 'ResourceNotFoundException') {
            continue; // Try next table name
          } else {
            throw error; // Re-throw other errors
          }
        }
      }
      
      if (!tableTest) {
        tableTest = {
          success: false,
          error: 'No tables found with any of the expected names',
          triedTables: tableNames,
        };
      }
    } catch (error) {
      tableTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : 'Unknown',
      };
    }

    // Test 4: Try to scan a table (if we found one)
    let scanTest = null;
    if (tableTest && tableTest.success) {
      try {
        const { DynamoDBDocumentClient, ScanCommand } = await import('@aws-sdk/lib-dynamodb');
        const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
        
        const client = new DynamoDBClient({
          region: process.env.AWS_REGION || 'us-west-1',
        });
        const docClient = DynamoDBDocumentClient.from(client);
        
        const result = await docClient.send(new ScanCommand({
          TableName: tableTest.tableName,
          Limit: 1, // Just get one item to test
        }));
        
        scanTest = {
          success: true,
          itemCount: result.Items?.length || 0,
          scannedCount: result.ScannedCount,
        };
      } catch (error) {
        scanTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: error instanceof Error ? error.name : 'Unknown',
        };
      }
    } else {
      scanTest = {
        success: false,
        error: 'Skipped - no table found',
      };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envInfo,
      clientTests,
      tableTest,
      scanTest,
      recommendations: [
        !envInfo.isLambda ? 'Not running on AWS Lambda' : null,
        !envInfo.hasAwsRegion ? 'AWS_REGION not set' : null,
        !tableTest?.success ? 'DynamoDB table not found or not accessible' : null,
        !scanTest?.success ? 'DynamoDB scan operation failed' : null,
        'Check Lambda IAM role has DynamoDB permissions',
        'Verify DynamoDB tables exist in us-west-1 region',
      ].filter(Boolean)
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Lambda DynamoDB test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
