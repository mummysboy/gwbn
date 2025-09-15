import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Client-side Transcription API: Starting request');
    
    // This endpoint provides instructions for client-side transcription
    // as a fallback when server-side transcription fails
    
    const clientSideInstructions = {
      fallbackMethod: 'browser-speech-recognition',
      instructions: {
        step1: 'Use browser SpeechRecognition API as fallback',
        step2: 'Check if SpeechRecognition is supported',
        step3: 'Configure language and continuous recognition',
        step4: 'Handle results and errors gracefully'
      },
      code: `
        // Check if SpeechRecognition is supported
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          
          recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript;
            }
            onTranscript(transcript);
          };
          
          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            onError('Speech recognition failed: ' + event.error);
          };
          
          recognition.start();
        } else {
          onError('Speech recognition not supported in this browser');
        }
      `,
      supportedBrowsers: [
        'Chrome (desktop and mobile)',
        'Safari (iOS 14.5+)',
        'Edge (Chromium-based)',
        'Firefox (limited support)'
      ]
    };

    return NextResponse.json({
      success: true,
      method: 'client-side-fallback',
      instructions: clientSideInstructions,
      message: 'Client-side transcription instructions provided'
    });

  } catch (error) {
    console.error('Client-side transcription error:', error);
    
    return NextResponse.json(
      { 
        error: 'Client-side transcription failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}
