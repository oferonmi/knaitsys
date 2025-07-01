"use client";

import { useState, useEffect } from "react";

export interface QuizQuestion {
	question: string;
	type: "multiple-choice" | "fill-in-the-blank";
	options?: string[];
	explanation?: string;
}

export interface AiTutorOutputData {
	tutorial?: string;
	quiz?: { questions: QuizQuestion[] }; // Updated type for quiz
	visual?: string;
	project?: string;
}

export function AiTutorOutput({ outputData, onProgress }: { outputData?: AiTutorOutputData, onProgress?: (progress: { correct: number, total: number }) => void }) {
	const [userAnswers, setUserAnswers] = useState<Record<number, string | number>>({});
	const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});

	// Track correct answers for progress dashboard
	const [correctCount, setCorrectCount] = useState(0);
	const [totalCount, setTotalCount] = useState(0);

	// Update progress when feedback changes
	useEffect(() => {
		if (outputData?.quiz?.questions) {
			const total = outputData.quiz.questions.length;
			let correct = 0;
			outputData.quiz.questions.forEach((q, idx) => {
				if (showFeedback[idx]) {
					if (q.type === "multiple-choice") {
						const userAns = userAnswers[idx];
						const correctAns = (q as any).answer;
						if (typeof correctAns === "number") {
							if (userAns === correctAns) correct++;
							if (typeof userAns === "string" && q.options && q.options[correctAns] && userAns.trim().toLowerCase() === q.options[correctAns].trim().toLowerCase()) correct++;
						}
						if (typeof correctAns === "string") {
							if (typeof userAns === "string" && userAns.trim().toLowerCase() === correctAns.trim().toLowerCase()) correct++;
							if (typeof userAns === "number" && q.options && q.options[userAns] && q.options[userAns].trim().toLowerCase() === correctAns.trim().toLowerCase()) correct++;
						}
					}
					if (q.type === "fill-in-the-blank" && typeof userAnswers[idx] === "string" && (q as any).answer) {
						const userAns = userAnswers[idx].replace(/\s+/g, "").toLowerCase();
						const correctAns = (q as any).answer.replace(/\s+/g, "").toLowerCase();
						if (userAns.includes(correctAns) || correctAns.includes(userAns)) correct++;
					}
				}
			});
			setCorrectCount(correct);
			setTotalCount(total);
			if (onProgress) onProgress({ correct, total });
		}
	}, [showFeedback, userAnswers, outputData, onProgress]);

	if (!outputData) {
		return (
			<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-6 text-center text-gray-500 dark:text-gray-400">
				AI-generated tutorials, quizzes, visuals, and project suggestions will appear here.
			</div>
		);
	}

	const handleMCQChange = (qIdx: number, oIdx: number) => {
		setUserAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
	};

	const handleFillChange = (qIdx: number, value: string) => {
		setUserAnswers((prev) => ({ ...prev, [qIdx]: value }));
	};

	const handleSubmit = (qIdx: number, q: QuizQuestion) => {
		setShowFeedback((prev) => ({ ...prev, [qIdx]: true }));
	};

	return (
		<div className="space-y-6">
			{outputData.tutorial && (
				<section className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 text-black dark:text-white">
					<h2 className="text-xl font-bold mb-2">Tutorial</h2>
					<div
						className="prose dark:prose-invert max-w-none"
						dangerouslySetInnerHTML={{ __html: outputData.tutorial }}
					/>
				</section>
			)}
			{outputData.quiz && (
				<section className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 text-black dark:text-white">
					<h2 className="text-xl font-bold mb-2">Quiz</h2>
					{Array.isArray(outputData.quiz.questions) && outputData.quiz.questions.length > 0 ? (
						<div className="space-y-4">
							{outputData.quiz.questions.map((q: QuizQuestion, idx: number) => (
								<div key={idx} className="mb-4">
									<div className="font-semibold mb-2">{idx + 1}. {q.question}</div>
									{q.type === "multiple-choice" && (
										<div className="flex flex-col gap-2 ml-4">
											{(q.options as string[]).map((opt: string, oidx: number) => (
												<label key={oidx} className="flex items-center gap-2 cursor-pointer">
													<input
														type="radio"
														name={`quiz-q${idx}`}
														value={oidx}
														checked={userAnswers[idx] === oidx}
														onChange={() => handleMCQChange(idx, oidx)}
														className="accent-kaito-brand-ash-green"
														disabled={!!showFeedback[idx]}
													/>
													<span className="text-black dark:text-white">{opt}</span>
												</label>
											))}
										</div>
									)}
									{q.type === "fill-in-the-blank" && (
										<input
											type="text"
											className="border rounded px-2 py-1 w-64 mt-2 text-black dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
											placeholder="Your answer..."
											value={userAnswers[idx] ?? ""}
											onChange={e => handleFillChange(idx, e.target.value)}
											disabled={!!showFeedback[idx]}
										/>
									)}
									<button
										type="button"
										className="ml-2 px-3 py-1 rounded bg-kaito-brand-ash-green text-white font-semibold hover:bg-kaito-brand-ash-green/90 focus:outline-none focus:ring-2 focus:ring-kaito-brand-ash-green/60 mt-2"
										disabled={!!showFeedback[idx] || userAnswers[idx] === undefined || userAnswers[idx] === ""}
										onClick={() => handleSubmit(idx, q)}
									>
										Submit
									</button>
									{showFeedback[idx] && (
										<div className="text-sm mt-2 font-medium">
											{q.type === "multiple-choice" && (() => {
												// Accept both number and string representations, and handle answer as index or value
												const userAns = userAnswers[idx];
												const correctAns = (q as any).answer;
												// If answer is an index, check both index and value
												if (typeof correctAns === "number") {
													if (userAns === correctAns) return <span className="text-green-600">Correct! </span>;
													// If userAns is string, check if it matches the correct option value
													if (typeof userAns === "string" && q.options && q.options[correctAns] && userAns.trim().toLowerCase() === q.options[correctAns].trim().toLowerCase()) return <span className="text-green-600">Correct! </span>;
												}
												// If answer is a string, check value match (case-insensitive)
												if (typeof correctAns === "string") {
													if (typeof userAns === "string" && userAns.trim().toLowerCase() === correctAns.trim().toLowerCase()) return <span className="text-green-600">Correct! </span>;
													if (typeof userAns === "number" && q.options && q.options[userAns] && q.options[userAns].trim().toLowerCase() === correctAns.trim().toLowerCase()) return <span className="text-green-600">Correct! </span>;
												}
												return <span className="text-red-600">Incorrect. </span>;
											})()}
											{q.type === "fill-in-the-blank" && typeof userAnswers[idx] === "string" && (q as any).answer && (
												// Accept substring, ignore case, ignore whitespace, and allow partial match
												(() => {
													const userAns = userAnswers[idx].replace(/\s+/g, "").toLowerCase();
													const correctAns = (q as any).answer.replace(/\s+/g, "").toLowerCase();
													if (userAns.includes(correctAns) || correctAns.includes(userAns)) {
														return <span className="text-green-600">Correct! </span>;
													}
													return <span className="text-red-600">Incorrect. </span>;
												})()
											)}
											<span className="text-gray-500 dark:text-gray-400">Explanation: {q.explanation}</span>
										</div>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="text-gray-500 dark:text-gray-400">No quiz questions available.</div>
					)}
				</section>
			)}
			{outputData.visual && (
				<section className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 text-black dark:text-white">
					<h2 className="text-xl font-bold mb-2">Visual Explanation</h2>
					{/* Render visual (SVG, D3, etc.) here */}
					<div dangerouslySetInnerHTML={{ __html: outputData.visual }} />
				</section>
			)}
			{outputData.project && (
				<section className="rounded-lg bg-white text-black dark:text-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6">
					<h2 className="text-xl font-bold mb-2">Project Suggestion</h2>
					<div
						className="prose dark:prose-invert max-w-none"
						dangerouslySetInnerHTML={{ __html: outputData.project }}
					/>
				</section>
			)}
		</div>
	);
}
