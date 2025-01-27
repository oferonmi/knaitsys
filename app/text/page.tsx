"use client"

import { withAuth } from "@/components/HOC/withAuth"
import {type ToolList, ToolsList} from "@/components/ToolsList"
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css'

const textTools: ToolList[] = [
	{
		id: 'chat',
		title: 'Chat Interface',
		description: 'Chat with / ask questions from several LLM AI models',
		icon: 'bi bi-chat-dots',
		path: '/chat'
	},
	{
		id: 'summarize',
		title: 'Summarization Interface',
		description: 'Summarize text from various document sources',
		icon: 'bi bi-card-text',
		path: '/summarizer'
	},
	{
		id: 'retrieval',
		title: 'Document Q&A Interface',
		description: 'Ask questions about content of uploaded documents',
		icon: 'bi bi-question-circle',
		path: '/retrieval'
	}
]

const pageStyles = {
	container: "flex flex-col min-h-screen",
	main: "flex-grow bg-cover bg-center",
	content: "container mx-auto px-4 py-8",
	heading: "text-3xl font-bold text-gray-800 mb-6",
	description: "text-lg text-gray-600 mb-8"
} as const

function TextToolsPage() {
	return (
		<div className={pageStyles.container}>
			<main className={pageStyles.main}>
				<div className={pageStyles.content}>
					<h1 className={pageStyles.heading}>Text Tools</h1>
					<p className={pageStyles.description}>
						Select a text processing tool to begin
					</p>
					<ToolsList  tools={textTools}/>
				</div>
			</main>
		</div>
	)
}

export default withAuth(TextToolsPage)
