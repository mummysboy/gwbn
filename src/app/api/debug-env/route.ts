import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow this in development or with a secret key
  const debugKey = request.nextUrl.searchParams.get('key');
  
  if (process.env.NODE_ENV === 'production' && debugKey !== 'debug123') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const envInfo = {
    nodeEnv: process.env.NODE_ENV,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    openAIKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10) || 'not set',
    timestamp: new Date().toISOString(),
    platform: process.platform,
    vercel: !!process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV,
  };

  return NextResponse.json(envInfo);
}
