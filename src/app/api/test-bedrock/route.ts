import { NextRequest, NextResponse } from 'next/server';
import { testBedrockConnection } from '@/lib/bedrock-utils';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Bedrock connection...');
    
    const result = await testBedrockConnection();
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString(),
      service: 'bedrock-test'
    });

  } catch (error) {
    console.error('Bedrock test error:', error);
    
    return NextResponse.json({ 
      success: false,
      message: `Bedrock test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
      service: 'bedrock-test-error'
    }, { status: 500 });
  }
}
