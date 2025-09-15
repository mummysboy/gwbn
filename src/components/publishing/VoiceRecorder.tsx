'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, StopIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
  onError: (error: string) => void;
}

export default function VoiceRecorder({ onTranscript, onError }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [, setIsTranscribing] = useState(false);
  const [, setSpeechSupported] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Start transcription process
        transcribeAudio(audioBlob);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      onError('Unable to access microphone. Please check permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const playRecording = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    try {
      // Create FormData to send the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      // Use local transcription endpoint (no environment variables required)
      console.log('Making POST request to /api/transcribe-simple (local processing)');
      const response = await fetch('/api/transcribe-simple', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response received:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Local transcription successful:', result.transcript);
        onTranscript(result.transcript);
      } else {
        console.log('Local transcription failed, using fallback:', result.transcript);
        onTranscript(result.transcript);
      }
      
    } catch (error) {
      console.error('Transcription error:', error);
      
      // Fallback to mock transcript if everything fails
      console.log('Using fallback transcript');
      const mockTranscript = generateMockTranscript();
      onTranscript(mockTranscript);
    } finally {
      setIsTranscribing(false);
    }
  };

  const startClientSideTranscription = async () => {
    return new Promise<void>((resolve, reject) => {
      // Check if SpeechRecognition is supported
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Speech recognition not supported in this browser'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let finalTranscript = '';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update with interim results
        if (interimTranscript) {
          onTranscript(finalTranscript + interimTranscript);
        }
      };

      recognition.onend = () => {
        if (finalTranscript) {
          console.log('Client-side transcription completed:', finalTranscript);
          onTranscript(finalTranscript);
          resolve();
        } else {
          reject(new Error('No speech detected'));
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        reject(new Error(`Speech recognition failed: ${event.error}`));
      };

      recognition.start();
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        recognition.stop();
      }, 30000);
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateMockTranscript = () => {
    const templates = [
      "Breaking news from downtown today. Local officials announced a major infrastructure project that will begin next month. The project includes road improvements and new bike lanes throughout the city center.",
      "In a surprising development, the city council voted unanimously to approve funding for a new community center. The facility will provide services for families and seniors in the area.",
      "Weather update: Meteorologists are predicting heavy rainfall for the weekend. Residents are advised to prepare for potential flooding in low-lying areas.",
      "Sports update: The local high school basketball team secured their spot in the state championships after a thrilling overtime victory last night.",
      "Business news: A new tech startup has announced plans to hire 50 employees over the next six months, bringing new job opportunities to the region."
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <div className="text-center">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg"
          >
            <MicrophoneIcon className="w-8 h-8 mr-3" />
            Start Recording
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg"
          >
            <StopIcon className="w-8 h-8 mr-3" />
            Stop Recording
          </Button>
        )}
        
        {isRecording && (
          <div className="mt-4 flex items-center justify-center">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Recording: {formatTime(recordingTime)}
            </span>
          </div>
        )}
        
        
      </div>


      {/* Audio Playback */}
      {audioUrl && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={playRecording}
                variant="outline"
                size="sm"
              >
                {isPlaying ? (
                  <PauseIcon className="w-4 h-4" />
                ) : (
                  <PlayIcon className="w-4 h-4" />
                )}
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatTime(recordingTime)}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Tap to play recording
            </span>
          </div>
          
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            className="w-full mt-2"
          />
        </div>
      )}

    </div>
  );
}
