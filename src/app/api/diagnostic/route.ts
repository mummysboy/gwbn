import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('AWS Environment Diagnostic: Starting check');
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        AWS_REGION: process.env.AWS_REGION,
        REGION: process.env.REGION,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT_SET',
        ACCESS_KEY_ID: process.env.ACCESS_KEY_ID ? 'SET' : 'NOT_SET',
        SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY ? 'SET' : 'NOT_SET',
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT_SET',
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT_SET',
      },
      awsPlatform: {
        isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
        isEC2: !!process.env.AWS_EXECUTION_ENV,
        isAmplify: !!process.env.AMPLIFY_APP_ID,
        isECS: !!process.env.ECS_CONTAINER_METADATA_URI,
        lambdaFunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
        executionEnv: process.env.AWS_EXECUTION_ENV,
        amplifyAppId: process.env.AMPLIFY_APP_ID,
      },
      request: {
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
      }
    };

    console.log('AWS Environment Diagnostic:', diagnostics);

    return NextResponse.json({
      success: true,
      diagnostics,
      message: 'AWS environment diagnostic completed'
    });

  } catch (error) {
    console.error('AWS Environment diagnostic error:', error);
    
    return NextResponse.json(
      { 
        error: 'Diagnostic failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'POST method not supported for diagnostics',
      success: false
    },
    { status: 405 }
  );
}
