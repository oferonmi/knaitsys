'use client'

import Link from 'next/link'
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css'
import { withAuth } from "@/components/HOC/withAuth"

const tools = [
	{ name: "AI Tutor", path: "/ai_tutor", icon: "bi-person-video2" },
	// { name: "Audio Assistant", path: "/audio", icon: "bi-soundwave" },
	{ name: "Chat Assistant", path: "/chat", icon: "bi-chat-dots-fill" },
	// { name: "Code Assistant", path: "/ide", icon: "bi bi-file-code-fill" },
	{ name: "Multimodal Assistant", path: "/multimodal", icon: "bi-disc-fill" },
	{ name: "Retrieval Assistant", path: "/retrieval", icon: "bi-search" },
	// { name: "Simulator", path: "/simulator", icon: "bi-cpu-fill" },
	{ name: "Speech-to-Text (STT)", path: "/stt", icon: "bi-mic-fill" },
	{ name: "Summarizer", path: "/summarizer", icon: "bi-file-earmark-text" },
	{ name: "Text-to-Speech (TTS)", path: "/tts", icon: "bi-volume-up-fill" },
];

function AiToolsPage() {
	return (
		<main className="max-w-4xl mx-auto py-10 px-4 mt-12">
			<h1 className="text-3xl font-bold font-mono mb-6">AI-based Tools</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{tools.map((tool) => (
					<Link href={tool.path} key={tool.name}>
						<div className="border-hidden border-8 hover:border-solid border-kaito-brand-ash-green rounded-md text-center hover:text-white hover:bg-kaito-brand-ash-green dark:hover:text-gray-900 dark:hover:bg-kaito-brand-ash-green transition-all text-kaito-brand-ash-green dark:text-gray-100 p-6 cursor-pointer">
						<i className={`bi ${tool.icon}`} style={{ fontSize: 48 }}></i>
						<p className="text-lg mt-2">{tool.name}</p>
						</div>
					</Link>
				))}
			</div>
		</main>
	);
}

export default withAuth(AiToolsPage)
