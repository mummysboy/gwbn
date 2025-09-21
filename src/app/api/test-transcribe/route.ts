import { NextResponse } from 'next/server';
import { testTranscribeConnection } from '@/lib/transcription-service';

export async function GET() {
  try {
    console.log('Testing AWS Transcribe connection...');
    
    const result = await testTranscribeConnection();
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString(),
      service: 'aws-transcribe-test'
    });

  } catch (error) {
    console.error('AWS Transcribe test error:', error);
    
    return NextResponse.json({ 
      success: false,
      message: `AWS Transcribe test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
      service: 'aws-transcribe-test-error'
    }, { status: 500 });
  }
}
