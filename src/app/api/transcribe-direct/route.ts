import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// Cache for the OpenAI API key to avoid repeated calls to Secrets Manager
let cachedApiKey: string | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getOpenAIApiKey(): Promise<string> {
  // Return cached key if still valid
  if (cachedApiKey && Date.now() - lastFetchTime < CACHE_DURATION) {
    return cachedApiKey;
  }

  try {
    console.log('Fetching OpenAI API key from AWS Secrets Manager');
    
    const secretsClient = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-west-1',
    });

    const command = new GetSecretValueCommand({
      SecretId: 'gwbn-openai-api-key', // You'll need to create this secret
    });

    const response = await secretsClient.send(command);
    
    if (response.SecretString) {
      const secretData = JSON.parse(response.SecretString);
      cachedApiKey = secretData.apiKey;
      lastFetchTime = Date.now();
      
      console.log('Successfully retrieved OpenAI API key from Secrets Manager');
      return cachedApiKey!;
    } else {
      throw new Error('No secret string found in Secrets Manager response');
    }
  } catch (error) {
    console.error('Failed to retrieve OpenAI API key from Secrets Manager:', error);
    
    // Fallback: try to get from environment variable
    if (process.env.OPENAI_API_KEY) {
      console.log('Using OpenAI API key from environment variable');
      cachedApiKey = process.env.OPENAI_API_KEY;
      lastFetchTime = Date.now();
      return cachedApiKey;
    }
    
    throw new Error('OpenAI API key not available in Secrets Manager or environment variables');
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Direct Transcription API: Starting request');
    
    // Get OpenAI API key
    const apiKey = await getOpenAIApiKey();
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log('Processing audio file with OpenAI Whisper:', {
      size: audioFile.size,
      type: audioFile.type,
      name: audioFile.name
    });

    // Convert the audio file to a format OpenAI can process
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });
    
    // Create a File object for OpenAI API
    const audioForOpenAI = new File([audioBlob], 'audio.webm', {
      type: 'audio/webm'
    });

    // Transcribe the audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioForOpenAI,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text'
    });

    console.log('OpenAI transcription completed successfully');

    return NextResponse.json({ 
      transcript: transcription,
      success: true,
      service: 'openai-whisper-direct',
      audioInfo: {
        size: audioFile.size,
        type: audioFile.type,
        name: audioFile.name
      }
    });

  } catch (error) {
    console.error('Direct transcription error:', error);
    
    return NextResponse.json(
      { 
        error: 'Transcription failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}
