import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Transcription test endpoint working',
    timestamp: new Date().toISOString(),
    service: 'test-endpoint'
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    return NextResponse.json({
      message: 'Test transcription endpoint received audio',
      audioSize: audioFile?.size || 0,
      audioType: audioFile?.type || 'unknown',
      timestamp: new Date().toISOString(),
      service: 'test-endpoint'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Test endpoint error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
