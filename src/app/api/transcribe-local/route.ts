import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudioSimple } from '@/lib/transcription-service';

export async function POST(request: NextRequest) {
  try {
    console.log('Local Transcription API: Starting request');
    
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('Processing audio file:', {
      size: audioFile.size,
      type: audioFile.type,
      name: audioFile.name
    });

    // Use the new transcription service
    const result = await transcribeAudioSimple(audioFile);

    console.log('Transcription completed:', result.success ? 'successfully' : 'with fallback');

    return NextResponse.json({ 
      transcript: result.transcript,
      success: result.success,
      service: 'aws-transcribe-simple',
      audioInfo: {
        size: audioFile.size,
        type: audioFile.type,
        name: audioFile.name
      }
    });

  } catch (error) {
    console.error('Local transcription error:', error);
    
    return NextResponse.json({ 
      transcript: "I'm sorry, there was an issue processing the audio. Please try again.",
      success: false,
      error: 'Transcription service temporarily unavailable',
      service: 'error-fallback'
    }, { status: 500 });
  }
}
