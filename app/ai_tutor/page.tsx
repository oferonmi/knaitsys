'use client'

import { Suspense } from "react";
import AiTutorMain from "./AiTutorMain";
import { withAuth } from "@/components/HOC/withAuth"

function AiTutorPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-gray-100 mt-20">
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold font-mono mb-4 text-center">AI-Based Learning Assistant</h1>
            <p className="mb-8 text-center text-lg max-w-2xl mx-auto">
                Enhance your learning with personalized tutorials, adaptive quizzes, interactive visuals, and project-based guidance. Enter a topic or question to get started!
            </p>
            <Suspense fallback={<div>Loading...</div>}>
                <AiTutorMain />
            </Suspense>
        </div>
    </main>
  );
}

export default withAuth(AiTutorPage);
