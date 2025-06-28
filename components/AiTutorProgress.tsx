"use client";

interface AiTutorProgressProps {
	progress: any; // Replace 'any' with a more specific type if available
}

export function AiTutorProgress({ progress }: AiTutorProgressProps) {
	// Placeholder: Replace with real progress dashboard
	return (
		<div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 mb-8">
			<h2 className="text-lg font-bold mb-2">Progress Dashboard</h2>
			<div className="text-gray-600 dark:text-gray-300">
				{progress && typeof progress.correct === "number" && typeof progress.total === "number" ? (
					<div className="flex flex-col items-center">
						<p className="text-xl font-semibold mb-2">
							Quiz Progress: {progress.correct} / {progress.total} correct
						</p>
						<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
							<div
								className="bg-kaito-brand-ash-green h-4 rounded-full transition-all"
								style={{ width: `${progress.total > 0 ? (progress.correct / progress.total) * 100 : 0}%` }}
							></div>
						</div>
					</div>
				) : (
					<p>Track your learning progress here.</p>
				)}
			</div>
		</div>
	);
}
