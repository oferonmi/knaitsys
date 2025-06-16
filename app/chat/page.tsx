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

const DEFAULT_LLM_ROUTE = "/api/chat/remote_chat/gemini";

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

	const LlmChatFormMainWidgets = (
		<>
			<ChatForm
				userInput={input}
				onChangeHandler={handleInputChange}
				onSubmitHandler={handleSubmit}
				llmApiEndpoint={llmApiRoute}
				onLlmApiEndpointChange={handleLlmApiChange}
				isLoading={chatEndpointIsLoading}
			/>
		</>
	);

	const landingSectionUI = (
		<div className="flex flex-col justify-center items-center md:p-8  min-h-screen w-full mx-auto my-auto overflow-hidden text-black">
			<h1 className="text-center text-3xl md:text-3xl mb-4 text-gray-700">
				Query or Question an AI Chatbot
			</h1>
			<p className="text-black text-lg text-center">
				Switch between LLMs by selecting each from the dropdown menu, then ask
				away.
			</p>

			<br></br>

			<div className="w-full max-w-3xl flex justify-center items-center">
				{LlmChatFormMainWidgets}
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
						className="fixed bottom-0 mb-20 container flex max-w-3xl mx-auto my-auto"
					>
						<Tooltip content="Clear Chat Thread" className="inline-flex bg-black  ">
							<button
								className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-3 mr-2  absolute right-60  bottom-3 z-10"
								type="button"
								onClick={() => { setMessages([]); } }
							>
								<i className="bi bi-trash3-fill"></i>
							</button>
						</Tooltip>

						{/* main chat form widgets */}
						{LlmChatFormMainWidgets}
					</div>
				</div>
			)}  
			<div className="w-full bottom-0"><Footer /></div>
		</main>
	);
}

export default withAuth(ChatbotPage);