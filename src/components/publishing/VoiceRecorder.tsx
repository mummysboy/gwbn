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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
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
        
        // Simulate transcription
        setTimeout(() => {
          const mockTranscript = generateMockTranscript();
          onTranscript(mockTranscript);
        }, 1000);
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

      {/* Recording Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
          Recording Tips:
        </h3>
        <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Speak clearly and at a moderate pace</li>
          <li>• Hold your device steady while recording</li>
          <li>• Find a quiet environment for best results</li>
          <li>• Keep recordings under 5 minutes for optimal processing</li>
        </ul>
      </div>
    </div>
  );
}
