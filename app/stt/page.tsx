'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';

export default function STTPage() {
	const [isRecording, setIsRecording] = useState(false);
	const [transcript, setTranscript] = useState('The transcript of your recording appears here ...');
	const [isProcessing, setIsProcessing] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);

	async function startRecording(){
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;
			chunksRef.current = [];

			mediaRecorder.ondataavailable = (e) => {
				if (e.data.size > 0) {
				chunksRef.current.push(e.data);
				}
			};

			mediaRecorder.onstop = () => {
				setTimeout(async () => {
					try {
						const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
						await processAudio(audioBlob);
					} catch (error) {
						console.error('Error processing audio after stop:', error);
					}
				}, 2);
			};

			mediaRecorder.start();
			setIsRecording(true);
		} catch (error) {
			console.error('Error accessing microphone:', error);
		}
	}

	function stopRecording(){
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
		}
	}

	async function processAudio(audioBlob: Blob) {
		setIsProcessing(true);
		try {
			// Validate the blob
			if (!audioBlob || audioBlob.size === 0) {
				throw new Error('Invalid audio data');
			}

			const formData = new FormData();
			formData.append('file', audioBlob, 'audio.webm');

			const response = await fetch('/api/stt/whisper', {
				method: 'POST',
				body: formData,
				// Add timeout and headers
				headers: {
				'Accept': 'application/json',
				},
			});

			if (!response.ok) {
				const errorData = await response.text();
				throw new Error(`Server error: ${response.status} - ${errorData}`);
			}

			const data = await response.json();
			if (!data || !data.transcript) {
				throw new Error('Invalid response format');
			}

			setTranscript(data.transcript);
		} catch (error) {
			console.error('Error processing audio:', error);
			setTranscript('Error processing audio. Please try again.'); // User feedback
		} finally {
			setIsProcessing(false);
		}
	}

	return (
		<div className="container mx-auto px-4 py-8  h-screen">
			<h1 className="text-3xl md:text-3xl mb-6 text-gray-700 text-center pt-36">
				Speech to Text
			</h1>

			<div className="flex flex-col items-center gap-4">
				<Button
					onClick={isRecording ? stopRecording : startRecording}
					variant={isRecording ? "destructive" : "default"}
					className="w-16 h-16 rounded-full bg-kaito-brand-ash-green"
				>
				{isRecording ? (
					<Square className="h-6 w-6" />
				) : (
					<Mic className="h-6 w-6" />
				)}
				</Button>

				<p className="text-sm text-muted-foreground">
					{isRecording ? "Recording..." : "Click to start recording"}
				</p>

				{isProcessing && (
					<p className="text-sm text-muted-foreground">Processing audio...</p>
				)}

				{transcript && (
					<div className="mt-8 w-full max-w-2xl">
						<h2 className="text-lg font-semibold mb-2">Transcript:</h2>
						<div className="p-4 bg-muted rounded-lg">
						<p>{transcript}</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
