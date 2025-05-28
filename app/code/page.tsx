"use client";
import ChatForm from "@/components/ChatForm";
import ChatThread from "@/components/ChatThread";
import { Footer } from "@/components/Footer";
import { useChat } from "@ai-sdk/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Emoji from "@/components/Emoji";
import { Tooltip } from "flowbite-react";
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css';
import { withAuth } from "@/components/HOC/withAuth";

// Types
interface SourcesForMessages {
  	[key: string]: any;
}

// Constants
const DEFAULT_LLM_ROUTE = "/api/chat/remote_chat/anthropic";
const LLM_OPTIONS = [
	{ value: "multimodal/chat/openai", label: "GPT-4o-mini" },
	{ value: "chat/remote_chat/anthropic", label: "Claude-3-5-Haiku" },
] as const;

const CodebotPage = () => {
	const { status } = useSession();
	const [llmApiRoute, setLlmApiRoute] = useState(DEFAULT_LLM_ROUTE);
	const [sourcesForMessages, setSourcesForMessages] = useState<SourcesForMessages>({});

	const handleLlmApiChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const newRoute = event.target.value;
		setLlmApiRoute(newRoute ? `/api/${newRoute}` : DEFAULT_LLM_ROUTE);
	};

	const {
		messages,
		setMessages,
		input,
		handleInputChange,
		handleSubmit,
		isLoading: chatEndpointIsLoading,
	} = useChat({
		api: llmApiRoute,
		onResponse(response) {
		const sourcesHeader = response.headers.get("x-sources");
		const sources = sourcesHeader ? JSON.parse(atob(sourcesHeader)) : [];
		const messageIndexHeader = response.headers.get("x-message-index");

		if (sources.length && messageIndexHeader !== null) {
			setSourcesForMessages(prev => ({
				...prev,
				[messageIndexHeader]: sources,
			}));
		}
		},
		onError: (e) => {
			toast(e.message, { theme: "dark" });
		},
	});

	const EmptyThreadState = (
		<div className="mt-24  sm:mt-24 space-y-6 text-gray-500 text-base mx-8 sm:mx-4 sm:text-2xl leading-12 flex flex-col mb-12 sm:mb-24 h-screen">
			<p>
				<Emoji symbol="👋" label="waving hand" /> 
				Hello! Here you would find LLMs fine-tuned to answer queries related to coding tasks. 
				Choose any and make your queries to get help with software development.
			</p>
		</div>
	);

	if (status === "unauthenticated") {
		return redirect("/auth/signIn");
	}

	return (
		<main>
			<div className="flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden text-black min-h-screen">
				{messages.length === 0 && EmptyThreadState}

				{messages.length > 0 && (
				<ChatThread
					messages={messages}
					sysEmoji="🤖"
					sources={sourcesForMessages}
				/>
				)}

				<div className="fixed bottom-0 border border-gray-300 rounded-lg shadow-xl space-x-2 text-black mb-20 container flex max-w-3xl mx-auto my-auto p-5 pt-9 pb-9">
					<Tooltip content="Clear Chat Thread" className="inline-flex">
						<button
							className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-6 py-5 mr-2"
							type="button"
							onClick={() => setMessages([])}
						>
							<i className="bi bi-trash3-fill" />
						</button>
					</Tooltip>

					<select
						onChange={handleLlmApiChange}
						value={llmApiRoute.replace("/api/", "")}
						aria-label="Select LLM"
						className="inline-flex items-center py-1.5 px-2 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green mr-2"
						id="llm-selector"
						required
					>
						<option value="">--Select LLM--</option>
						{LLM_OPTIONS.map(({ value, label }) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</select>

					<ChatForm
						userInput={input}
						onChangeHandler={handleInputChange}
						onSubmitHandler={handleSubmit}
						isLoading={chatEndpointIsLoading}
					/>
				</div>
			</div>
			<div className="w-full bottom-0">
				<Footer />
			</div>
		</main>
	);
};

export default withAuth(CodebotPage);
