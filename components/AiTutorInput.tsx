"use client";
import { useState } from "react";

type AiTutorInputProps = {
	userInput: string;
	setUserInput: (value: string) => void;
	setOutputData: (data: any) => void;
};

export function AiTutorInput({ userInput, setUserInput, setOutputData }: AiTutorInputProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	interface AiTutorApiResponse {
		// Adjust this interface to match the actual response structure
		[key: string]: any;
	}

	interface SubmitEvent extends React.FormEvent<HTMLFormElement> {}

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const res = await fetch("/api/ai-tutor/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt: userInput }),
			});
			if (!res.ok) throw new Error("Failed to generate content");
			const data: AiTutorApiResponse = await res.json();
			setOutputData(data);
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("An unknown error occurred");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
			<label htmlFor="ai-tutor-input" className="font-semibold">Enter a topic, question, or keyword:</label>
			<textarea
				id="ai-tutor-input"
				className="w-full min-h-[80px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-black dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-kaito-brand-ash-green"
				value={userInput}
				onChange={e => setUserInput(e.target.value)}
				placeholder="e.g. Newton's Laws, Python for loops, Photosynthesis..."
				required
			/>
			<button
				type="submit"
				className="self-end px-6 py-2 rounded-full bg-kaito-brand-ash-green text-white font-semibold hover:bg-kaito-brand-ash-green/90 focus:outline-none focus:ring-2 focus:ring-kaito-brand-ash-green/60 disabled:opacity-50"
				disabled={loading}
			>
				{loading ? "Generating..." : "Generate"}
			</button>
			{error && <div className="text-red-500">{error}</div>}
		</form>
	);
}
