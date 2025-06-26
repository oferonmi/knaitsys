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
		<div className="container mx-auto p-4 max-w-2xl h-screen bg-white dark:bg-gray-900">
			<h1 className="text-3xl md:text-3xl mb-6 text-gray-700 dark:text-gray-100 text-center pt-36">
				Convert Text to Speech
			</h1>

			<p className="text-kaito-brand-ash-green dark:text-kaito-brand-ash-green/80 text-lg text-center mb-4">
				Type in your text. Click Convert. Audio appears below.
				{/* You can ask follow up questions. */}
			</p>

			<Card className="border-b-kaito-brand-ash-green border-x-kaito-brand-ash-green bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg">
				<Textarea
					placeholder="Enter text to convert to speech..."
					value={text}
					onChange={(e) => setText(e.target.value)}
					className="min-h-[250px] m-0 mb-4 bg-white dark:bg-gray-900 border border-t-kaito-brand-ash-green dark:border-t-kaito-brand-ash-green/80"
				/>

				<div className="flex justify-end gap-4 ">
					<Button
						onClick={handleSubmit}
						disabled={isLoading || !text.trim()}
						className="text-gray-200 dark:text-gray-100 bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green dark:bg-kaito-brand-ash-green/80 dark:hover:bg-kaito-brand-ash-green/60 py-5 px-5 mr-4 mb-4"
					>
						{/* {isLoading ? "Converting..." : "Convert"} */}
						{isLoading ? (
						<span className="flex items-center gap-2">
							<svg className="animate-spin h-4 w-4 text-gray-700 dark:text-gray-100" viewBox="0 0 24 24">
							<circle
								className="opacity-25 dark:opacity-40"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
								fill="none"
							></circle>
							<path
								className="opacity-75 dark:opacity-90"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
							</svg>
							Converting...
						</span>
						) : (
						"Convert"
						)}
					</Button>
				</div>

				{audioUrl && (
					<div className="mx-4 my-4">
						<audio
							controls
							src={audioUrl}
							className="w-full rounded-full border border-kaito-brand-ash-green dark:border-kaito-brand-ash-green/80"
						>
							Your browser does not support the audio element.
						</audio>
					</div>
				)}
			</Card>
		</div>
	);
}
