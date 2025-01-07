'use client';

import "@/node_modules/bootstrap-icons/font/bootstrap-icons.css";
import { withAuth } from "@/components/HOC/withAuth"
import {type ToolList, ToolsList} from "@/components/ToolsList"

const audioTools: ToolList[] = [
	{
		id: 'tts',
		title: 'Text to Speech',
		description: 'Convert text to audio format.',
		icon: 'bi bi-speaker-fill',
		path: '/tts'
	},
	{
		id: 'stt',
		title: 'Speech to Text',
		description: 'Transcribe audio to text.',
		icon: 'bi bi-mic',
		path: '/stt'
	}
]

const pageStyles = {
	container: "flex flex-col min-h-screen",
	main: "flex-grow bg-teal-100 bg-cover bg-center",
	content: "container mx-auto px-4 py-8",
	heading: "text-3xl font-bold text-gray-800 mb-6",
	description: "text-lg text-gray-600 mb-8"
} as const

function AudioToolsPage(){
	return (	
		<div className={pageStyles.container}>
			<main className={pageStyles.main}>
				<div className={pageStyles.content}>
					<h1 className={pageStyles.heading}>Audio Tools</h1>
					<p className={pageStyles.description}>
						Select an audio tool to begin
					</p>
					<ToolsList  tools={audioTools}/>
				</div>
			</main>
		</div>		
	)
}

export default withAuth(AudioToolsPage);
