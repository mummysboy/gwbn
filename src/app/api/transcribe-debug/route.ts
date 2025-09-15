import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Transcription Debug API: Starting diagnostic');
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT_SET',
        AWS_REGION: process.env.AWS_REGION || 'NOT_SET',
        REGION: process.env.REGION || 'NOT_SET',
      },
      awsPlatform: {
        isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
        isEC2: !!process.env.AWS_EXECUTION_ENV,
        isAmplify: !!process.env.AMPLIFY_APP_ID,
        isECS: !!process.env.ECS_CONTAINER_METADATA_URI,
        isVercel: !!process.env.VERCEL,
        lambdaFunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
        executionEnv: process.env.AWS_EXECUTION_ENV,
        amplifyAppId: process.env.AMPLIFY_APP_ID,
      },
      transcription: {
        simpleEndpoint: '/api/transcribe-simple',
        directEndpoint: '/api/transcribe-direct',
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        keyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      },
      request: {
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
      }
    };

    console.log('Transcription Debug Diagnostic:', diagnostics);

    return NextResponse.json({
      success: true,
      diagnostics,
      recommendations: [
        process.env.OPENAI_API_KEY ? '✅ OpenAI API key is configured' : '❌ OpenAI API key is missing - add OPENAI_API_KEY to environment variables',
        '✅ Transcription debug endpoint is working',
        '🔧 Try the client-side speech recognition fallback if server endpoints fail',
        '📋 Check AWS CloudWatch logs for detailed error messages'
      ],
      message: 'Transcription debug diagnostic completed'
    });

  } catch (error) {
    console.error('Transcription Debug error:', error);
    
    return NextResponse.json(
      { 
        error: 'Transcription debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { 
      error: 'POST method not supported for transcription debug',
      success: false
    },
    { status: 405 }
  );
}
