import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    console.log('Fallback Transcription API: Starting request');
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured for fallback endpoint');
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured. This endpoint requires OPENAI_API_KEY environment variable.',
          success: false,
          debug: {
            hasOpenAIKey: !!process.env.OPENAI_API_KEY,
            nodeEnv: process.env.NODE_ENV,
            awsRegion: process.env.AWS_REGION,
            platform: {
              isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
              isAmplify: !!process.env.AMPLIFY_APP_ID,
              isVercel: !!process.env.VERCEL
            }
          }
        },
        { status: 500 }
      );
    }

    // Initialize OpenAI client with explicit configuration
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000, // 30 second timeout
    });

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('Processing audio file with OpenAI Whisper (fallback):', {
      size: audioFile.size,
      type: audioFile.type,
      name: audioFile.name
    });

    // Validate file size (OpenAI has a 25MB limit)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25MB.' },
        { status: 400 }
      );
    }

    // Convert the audio file to a format OpenAI can process
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });
    
    // Create a File object for OpenAI API
    const audioForOpenAI = new File([audioBlob], 'audio.webm', {
      type: 'audio/webm'
    });

    // Transcribe the audio using OpenAI Whisper with error handling
    const transcription = await openai.audio.transcriptions.create({
      file: audioForOpenAI,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text'
    });

    console.log('OpenAI transcription completed successfully (fallback)');

    return NextResponse.json({ 
      transcript: transcription,
      success: true,
      service: 'openai-whisper-fallback',
      audioInfo: {
        size: audioFile.size,
        type: audioFile.type,
        name: audioFile.name
      },
      debug: {
        endpoint: '/api/transcribe-fallback',
        timestamp: new Date().toISOString(),
        platform: {
          isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
          isAmplify: !!process.env.AMPLIFY_APP_ID,
          isVercel: !!process.env.VERCEL
        }
      }
    });

  } catch (error) {
    console.error('Fallback transcription error:', error);
    
    // Provide detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(
      { 
        error: 'Transcription failed',
        details: errorDetails,
        success: false,
        debug: {
          endpoint: '/api/transcribe-fallback',
          hasOpenAIKey: !!process.env.OPENAI_API_KEY,
          nodeEnv: process.env.NODE_ENV
        }
      },
      { status: 500 }
    );
  }
}
