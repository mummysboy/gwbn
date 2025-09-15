import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple test - just check if we can access process.env at all
    const testResults = {
      canAccessProcessEnv: typeof process !== 'undefined' && typeof process.env !== 'undefined',
      envObjectType: typeof process.env,
      envObjectKeys: process.env ? Object.keys(process.env).length : 0,
      hasRegion: process.env?.REGION ? 'YES' : 'NO',
      hasAccessKey: process.env?.ACCESS_KEY_ID ? 'YES' : 'NO',
      hasSecretKey: process.env?.SECRET_ACCESS_KEY ? 'YES' : 'NO',
      regionValue: process.env?.REGION || 'UNDEFINED',
      accessKeyLength: process.env?.ACCESS_KEY_ID?.length || 0,
      secretKeyLength: process.env?.SECRET_ACCESS_KEY?.length || 0,
    };

    // Test if we can create a simple AWS client
    let awsTest = null;
    try {
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      
      if (process.env.REGION && process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY) {
        new DynamoDBClient({
          region: process.env.REGION,
          credentials: {
            accessKeyId: process.env.ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
          },
        });
        awsTest = { success: true, method: 'explicit_credentials' };
      } else {
        awsTest = { success: false, error: 'Missing required environment variables' };
      }
    } catch (error) {
      awsTest = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Environment test completed',
      timestamp: new Date().toISOString(),
      testResults,
      awsTest,
      nextSteps: [
        testResults.canAccessProcessEnv ? 'Environment object is accessible' : 'Environment object is NOT accessible',
        testResults.hasRegion === 'YES' ? 'REGION is set' : 'REGION is NOT set',
        testResults.hasAccessKey === 'YES' ? 'ACCESS_KEY_ID is set' : 'ACCESS_KEY_ID is NOT set',
        testResults.hasSecretKey === 'YES' ? 'SECRET_ACCESS_KEY is set' : 'SECRET_ACCESS_KEY is NOT set',
        awsTest.success ? 'AWS client creation successful' : 'AWS client creation failed'
      ]
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Environment test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
