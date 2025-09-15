import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, using fallback');
      const fallbackTranscripts = [
        "Breaking news from downtown today. Local officials announced a major infrastructure project that will begin next month. The project includes road improvements and new bike lanes throughout the city center.",
        "In a surprising development, the city council voted unanimously to approve funding for a new community center. The facility will provide services for families and seniors in the area.",
        "Weather update: Meteorologists are predicting heavy rainfall for the weekend. Residents are advised to prepare for potential flooding in low-lying areas.",
        "Sports update: The local high school basketball team secured their spot in the state championships after a thrilling overtime victory last night.",
        "Business news: A new tech startup has announced plans to hire 50 employees over the next six months, bringing new job opportunities to the region."
      ];
      
      const randomTranscript = fallbackTranscripts[Math.floor(Math.random() * fallbackTranscripts.length)];
      
      return NextResponse.json({ 
        transcript: randomTranscript,
        success: false,
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.',
        fallback: true,
        service: 'mock-fallback'
      });
    }

    // Initialize OpenAI client only when the function is called
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
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

    // Transcribe the audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioForOpenAI,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text'
    });

    return NextResponse.json({ 
      transcript: transcription,
      success: true,
      service: 'openai-whisper'
    });

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Return a fallback response if OpenAI fails
    const fallbackTranscripts = [
      "Breaking news from downtown today. Local officials announced a major infrastructure project that will begin next month. The project includes road improvements and new bike lanes throughout the city center.",
      "In a surprising development, the city council voted unanimously to approve funding for a new community center. The facility will provide services for families and seniors in the area.",
      "Weather update: Meteorologists are predicting heavy rainfall for the weekend. Residents are advised to prepare for potential flooding in low-lying areas.",
      "Sports update: The local high school basketball team secured their spot in the state championships after a thrilling overtime victory last night.",
      "Business news: A new tech startup has announced plans to hire 50 employees over the next six months, bringing new job opportunities to the region."
    ];
    
    const randomTranscript = fallbackTranscripts[Math.floor(Math.random() * fallbackTranscripts.length)];
    
    return NextResponse.json({ 
      transcript: randomTranscript,
      success: false,
      error: 'OpenAI transcription failed, using fallback',
      fallback: true,
      service: 'mock-fallback'
    });
  }
}
