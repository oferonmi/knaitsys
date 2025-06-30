"use client";
import React, { useState } from "react";

// Placeholder types
type AggregatedItem = {
    title: string;
    source: string;
    url: string;
    summary: string;
};

type ResearchAnalysis = {
    keyInsights: string[];
    novelDirections: string[];
    openQuestions: string[];
};

export default function ResearcherPage() {
    const [topic, setTopic] = useState("");
    const [loading, setLoading] = useState(false);
    const [aggregated, setAggregated] = useState<AggregatedItem[]>([]);
    const [analysis, setAnalysis] = useState<ResearchAnalysis | null>(null);
    const [error, setError] = useState("");
    const [showReport, setShowReport] = useState(false);

    // Placeholder for AI aggregation and analysis
    async function handleResearch() {
        setLoading(true);
        setError("");
        setAggregated([]);
        setAnalysis(null);
        try {
            const res = await fetch("/api/researcher", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic }),
            });
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            setAggregated(data.aggregated || []);
            setAnalysis(data.analysis || null);
        } catch (e) {
            setError("Failed to aggregate research. Try again.");
        } finally {
            setLoading(false);
        }
    }

    // Report/visualization builder modal
    function handleBuildReport() {
        setShowReport(true);
    }
    function handleCloseReport() {
        setShowReport(false);
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen w-full bg-white">
            <div className="w-full max-w-3xl ">
                <h1 className="text-3xl font-bold mb-6 mt-20 text-center">AI-Based Research Hub</h1>
                <form
                    className="flex flex-col md:flex-row gap-4 mb-6 justify-center items-center"
                    onSubmit={e => { e.preventDefault(); handleResearch(); }}
                >
                    <input
                        className="flex-1 border border-gray-300 focus:border-kaito-brand-ash-green focus:ring-2 focus:ring-kaito-brand-ash-green/30 focus:outline-none rounded-full px-6 py-2 text-lg transition-colors duration-150 shadow-sm bg-white placeholder-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:placeholder-gray-500"
                        placeholder="Enter research topic (e.g. quantum computing)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={loading}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center bg-kaito-brand-ash-green text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-kaito-brand-ash-green/90 disabled:opacity-50 transition-colors duration-150 dark:bg-kaito-brand-ash-green dark:hover:bg-kaito-brand-ash-green/80"
                        disabled={!topic || loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                                Analyzing...
                            </span>
                        ) : "Research"}
                    </button>
                </form>
                {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
                {aggregated.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">Aggregated Sources</h2>
                        <ul className="space-y-3">
                            {aggregated.map((item, idx) => (
                                <li key={idx} className="border rounded p-3 bg-gray-50">
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-bold text-kaito-brand-ash-green  hover:underline">{item.title}</a>
                                    <span className="ml-2 text-xs text-gray-500">[{item.source}]</span>
                                    <div className="mt-1 text-gray-700">{item.summary}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {analysis && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">Key Insights</h2>
                        <ul className="list-disc ml-6 mb-4">
                            {analysis.keyInsights.map((insight, idx) => (
                                <li key={idx}>{insight}</li>
                            ))}
                        </ul>
                        <h2 className="text-xl font-semibold mb-2">Novel Research Directions</h2>
                        <ul className="list-disc ml-6 mb-4">
                            {analysis.novelDirections.map((dir, idx) => (
                                <li key={idx}>{dir}</li>
                            ))}
                        </ul>
                        <h2 className="text-xl font-semibold mb-2">Open Research Questions</h2>
                        <ul className="list-disc ml-6">
                            {analysis.openQuestions.map((q, idx) => (
                                <li key={idx}>{q}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {(aggregated.length > 0 || analysis) && (
                    <div className="flex justify-center mt-4 mb-4">
                        <button
                            className="bg-kaito-brand-ash-green text-white px-5 py-2 rounded-lg font-semibold hover:bg-kaito-brand-ash-green/90 transition-colors duration-150 dark:bg-kaito-brand-ash-green dark:hover:bg-kaito-brand-ash-green/80"
                            onClick={handleBuildReport}
                        >
                            Build Report / Visualization
                        </button>
                    </div>
                )}
            </div>
            {showReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg max-w-2xl w-full p-8 relative">
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold"
                            onClick={handleCloseReport}
                            aria-label="Close"
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-center">Research Report & Visualization</h2>
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Topic:</h3>
                            <div className="mb-2 text-lg">{topic}</div>
                            <h3 className="font-semibold mb-2">Key Insights:</h3>
                            <ul className="list-disc ml-6 mb-2">
                                {analysis?.keyInsights.map((insight, idx) => (
                                    <li key={idx}>{insight}</li>
                                ))}
                            </ul>
                            <h3 className="font-semibold mb-2">Novel Research Directions:</h3>
                            <ul className="list-disc ml-6 mb-2">
                                {analysis?.novelDirections.map((dir, idx) => (
                                    <li key={idx}>{dir}</li>
                                ))}
                            </ul>
                            <h3 className="font-semibold mb-2">Open Research Questions:</h3>
                            <ul className="list-disc ml-6 mb-2">
                                {analysis?.openQuestions.map((q, idx) => (
                                    <li key={idx}>{q}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Aggregated Sources:</h3>
                            <ul className="space-y-2">
                                {aggregated.map((item, idx) => (
                                    <li key={idx} className="border rounded p-2 bg-gray-50 dark:bg-gray-800">
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">{item.title}</a>
                                        <span className="ml-2 text-xs text-gray-500">[{item.source}]</span>
                                        <div className="mt-1 text-gray-700 dark:text-gray-200">{item.summary}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Visualization placeholder */}
                        <div className="mt-6 text-center">
                            <span className="inline-block bg-kaito-brand-ash-green/10 text-kaito-brand-ash-green px-4 py-2 rounded-full font-semibold">Visualization coming soon</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
