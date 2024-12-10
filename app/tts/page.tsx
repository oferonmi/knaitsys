'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export default function TTSPage() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    try {
        const response = await fetch('/api/tts/openai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

        const data = await response.json();
        setAudioUrl(data.audioUrl);
    } catch (error) {
        console.error('Error generating speech:', error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl h-screen">
      <h1 className="text-3xl md:text-3xl mb-6 text-gray-700 text-center">
        Convert Text to Speech
      </h1>

      <Card className="p-4 border-kaito-brand-ash-green">
        <Textarea
          placeholder="Enter text to convert to speech..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[400px] mb-4"
        />

        <div className="flex justify-end gap-4 ">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !text.trim()}
            className="text-gray-200 bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green"
          >
            {isLoading ? "Converting..." : "Convert to Speech"}
          </Button>
        </div>

        {audioUrl && (
          <div className="mt-4">
            <audio
              controls
              src={audioUrl}
              className="w-full rounded-full border border-kaito-brand-ash-green"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </Card>
    </div>
  );
}
