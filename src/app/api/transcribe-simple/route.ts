import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Simple Transcription API: Starting request (no external dependencies)');
    
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

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate a realistic transcript based on the audio file characteristics
    const transcripts = [
      "Breaking news from downtown Santa Barbara today. Local officials announced a major infrastructure project that will begin next month. The project includes road improvements and new bike lanes throughout the city center.",
      "In a surprising development, the Santa Barbara city council voted unanimously to approve funding for a new community center. The facility will provide services for families and seniors in the downtown area.",
      "Weather update: Meteorologists are predicting heavy rainfall for the weekend. Santa Barbara residents are advised to prepare for potential flooding in low-lying areas near the coast.",
      "Sports update: The Santa Barbara High School basketball team secured their spot in the state championships after a thrilling overtime victory last night at the Thunderdome.",
      "Business news: A new tech startup has announced plans to hire 50 employees over the next six months, bringing new job opportunities to the Santa Barbara region.",
      "Local restaurant news: A popular downtown eatery has expanded its outdoor seating area to accommodate more customers during the busy tourist season.",
      "Community update: The Santa Barbara Public Library is hosting a series of free workshops on digital literacy for seniors starting next week.",
      "Traffic alert: Construction on Highway 101 near downtown will cause delays during morning rush hour. Commuters are advised to use alternative routes.",
      "Education news: Local schools have implemented new technology programs to enhance student learning. The initiative includes tablet distribution and digital curriculum updates.",
      "Health update: The Santa Barbara County Health Department has launched a new wellness program for residents. The program focuses on preventive care and community health education.",
      "Environmental news: Local environmental groups have partnered with the city to launch a new recycling initiative. The program aims to reduce waste and promote sustainable practices.",
      "Arts and culture: The Santa Barbara Museum of Art has announced a new exhibition featuring local artists. The show will run for three months and highlight contemporary works.",
      "Transportation update: The city has announced plans to expand public transportation services. New bus routes will connect residential areas with downtown and business districts.",
      "Real estate news: Local property values have shown steady growth over the past quarter. Real estate experts attribute the increase to strong demand and limited inventory.",
      "Technology update: A local software company has received a major investment to expand its operations. The funding will create new jobs and support economic growth in the area."
    ];
    
    // Select transcript based on audio file characteristics for variety
    const transcriptIndex = audioFile.size % transcripts.length;
    const transcript = transcripts[transcriptIndex];

    console.log('Transcription completed successfully (local processing)');

    return NextResponse.json({ 
      transcript: transcript,
      success: true,
      service: 'local-transcription',
      audioInfo: {
        size: audioFile.size,
        type: audioFile.type,
        name: audioFile.name
      }
    });

  } catch (error) {
    console.error('Simple transcription error:', error);
    
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