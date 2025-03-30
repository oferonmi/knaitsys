"use client"
import ChatForm from "@/components/ChatForm";
import ChatThread from "@/components/ChatThread";
import { Footer } from "@/components/Footer";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "flowbite-react";
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css';
import { withAuth } from "@/components/HOC/withAuth";

// Add type for LLM API routes to improve type safety and maintainability
type LlmRoute = {
	value: string;
	label: string;
	isMultimodal?: boolean;
};

const LLM_OPTIONS: LlmRoute[] = [
	{ value: "chat/remote_chat/openai", label: "GPT-3.5" },
	{ value: "multimodal/remote_chat/openai", label: "GPT-4o-mini", isMultimodal: true },
	{ value: "chat/remote_chat/fireworks/llama3_fireworks", label: "Llama-3-Fwks" },
	{value: "chat/remote_chat/fireworks/qwen2_fireworks", label: "Qwen-2-Fwks" },
	{
		value: "multimodal/remote_chat/groq/llama3_groq",
		label: "Llama-3.2-Groq",
		isMultimodal: true,
	},
	{ value: "chat/remote_chat/anthropic", label: "Claude-3.5-Haiku" },
	{
		value: "chat/remote_chat/fireworks/mixtral_MoE8x7B_Instruct_fireworks",
		label: "Mixtral-MoE8x7B-Fwks",
	},
	{ value: "chat/remote_chat/xai", label: "Grok-2" },
	{
		value: "chat/remote_chat/gemini",
		label: "Gemini-1.5-Flash",
		isMultimodal: true,
	},
	{ value: "chat/local_chat/deepseek", label: "Deepseek-r1" },
	{ value: "chat/remote_chat/fireworks/deepseek_fireworks/r1", label: "Deepseek-r1-Fwks" },
	{ value: "chat/remote_chat/fireworks/deepseek_fireworks/v3", label: "Deepseek-v3-Fwks" },
	{ value: "chat/local_chat/qwen2", label: "Qwen-2.5" },
	{ value: "multimodal/local_chat/llava", label: "Llava", isMultimodal: true },
	{ value: "multimodal/local_chat/phi3", label: "Phi3" },
];

const DEFAULT_LLM_ROUTE = "/api/chat/remote_chat/anthropic";

const ChatbotPage = () => {
	//LLM engine API route
	const [llmApiRoute, setLlmApiRoute] = useState<string>(DEFAULT_LLM_ROUTE);
	const [sourcesForMessages, setSourcesForMessages] = useState<
		Record<string, any>
	>({});

	const handleLlmApiChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const newRoute = event.target.value;
		setLlmApiRoute(newRoute ? `/api/${newRoute}` : DEFAULT_LLM_ROUTE);
	};

	// use OpenAI chat completion
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
				setSourcesForMessages({
				...sourcesForMessages,
				[messageIndexHeader]: sources,
				});
			}
		},
		onError: (e) => {
			toast(e.message, {
				theme: "dark",
			});
		},
	});

	const LlmSelector = () => (
		<select
			onChange={handleLlmApiChange}
			value={llmApiRoute.replace("/api/", "")}
			className="inline-flex items-center py-5 px-2 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green mr-2"
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
	);

	const ChatFormWidgets = (
		<>
			<LlmSelector />
			<ChatForm
				userInput={input}
				onChangeHandler={handleInputChange}
				onSubmitHandler={handleSubmit}
				isLoading={chatEndpointIsLoading}
			/>
		</>
	);

	const landingSectionUI = (
		<div className="flex flex-col justify-center items-center md:p-8  min-h-screen max-w-3xl mx-auto my-auto ">
			<h1 className="text-center text-3xl md:text-3xl mb-4 text-gray-700">
				Query or Question a Gen AI Text Chatbot
			</h1>

			<p className="text-black text-lg text-center">
				Switch between LLMs by selecting each from the dropdown menu, then ask away.
			</p>

			<br></br>

			<div
				className="w-full max-w-3xl border border-gray-300 rounded-lg shadow-xl space-x-2 text-black flex justify-center items-center pt-9 pb-9 px-5"
			>
				{ChatFormWidgets}
			</div>
		</div>
	);

	return (
		<main>
			{messages.length == 0 && landingSectionUI}

			{messages.length > 0 && (
				<div className="flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden text-black min-h-screen">
					<ChatThread
						messages={messages}
						sysEmoji="🤖"
						sources={sourcesForMessages} 
					/>

					<div
						className="fixed bottom-0 border border-gray-300 rounded-lg shadow-xl  space-x-2 text-black mb-20 container flex max-w-3xl mx-auto my-auto p-5 pt-9 pb-9"
					>
						<Tooltip content="Clear Chat Thread" className="inline-flex bg-black">
							<button
								className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-6 py-5 mr-2"
								type="button"
								onClick={() => { setMessages([]); } }
							>
								<i className="bi bi-trash3-fill"></i>
							</button>
						</Tooltip>

						{/* main chat form widgets */}
						{ChatFormWidgets}
					</div>
				</div>
			)}  
			<div className="w-full bottom-0"><Footer /></div>
		</main>
	);
}

export default withAuth(ChatbotPage);