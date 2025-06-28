"use client";

import { useState } from "react";

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

export function AiTutorOutput({ outputData }: { outputData?: AiTutorOutputData }) {
	const [userAnswers, setUserAnswers] = useState<Record<number, string | number>>({});
	const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});

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
				<section className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6">
					<h2 className="text-xl font-bold mb-2">Tutorial</h2>
					<div
						className="prose dark:prose-invert max-w-none"
						dangerouslySetInnerHTML={{ __html: outputData.tutorial }}
					/>
				</section>
			)}
			{outputData.quiz && (
				<section className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6">
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
													<span>{opt}</span>
												</label>
											))}
										</div>
									)}
									{q.type === "fill-in-the-blank" && (
										<input
											type="text"
											className="border rounded px-2 py-1 w-64 mt-2 dark:text-black"
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
											{q.type === "multiple-choice" &&
												Number(userAnswers[idx]) === Number((q as any).answer) ? (
												<span className="text-green-600">Correct! </span>
											) : q.type === "multiple-choice" ? (
												<span className="text-red-600">Incorrect. </span>
											) : null}
											{q.type === "fill-in-the-blank" && typeof userAnswers[idx] === "string" &&
												(q as any).answer &&
												userAnswers[idx].toLowerCase().includes((q as any).answer.toLowerCase()) ? (
												<span className="text-green-600">Correct! </span>
											) : q.type === "fill-in-the-blank" ? (
												<span className="text-red-600">Incorrect. </span>
											) : null}
											<span className="text-gray-500">Explanation: {q.explanation}</span>
										</div>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="text-gray-500">No quiz questions available.</div>
					)}
				</section>
			)}
			{outputData.visual && (
				<section className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6">
					<h2 className="text-xl font-bold mb-2">Visual Explanation</h2>
					{/* Render visual (SVG, D3, etc.) here */}
					<div dangerouslySetInnerHTML={{ __html: outputData.visual }} />
				</section>
			)}
			{outputData.project && (
				<section className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6">
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
