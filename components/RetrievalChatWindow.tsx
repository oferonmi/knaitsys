"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "flowbite-react";

import { useChat } from "ai/react";
import { useRef, useState, useEffect, ReactElement } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";

import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { TextUploadForm } from "@/components/TextUploadForm";
import { EmbedPdfsForm } from "@/components/EmbedPdfsForm";
import { WebpageUploadForm } from "@/components/WebpageUploadForm";
import { SearchIndexUploadForm } from "@/components/SearchIndexUploadForm";
import { Footer } from "@/components/Footer";

const toolTipsStyle = 'inline-flex bg-black'

export function RetrievalChatWindow(props: {
	endPoint: string;
	setEndPoint: Dispatch<SetStateAction<string>>;
	placeholder?: string;
	titleText?: string;
	emoji?: string;
	readyToChat: boolean;
	setReadyToChat: Dispatch<SetStateAction<boolean>>;
}) {
  
	const {
		endPoint,
		setEndPoint,
		placeholder,
		titleText = "An LLM",
		emoji,
		readyToChat,
		setReadyToChat,
	} = props;

	const messageContainerRef = useRef<HTMLDivElement | null>(null);
	// const router = useRouter();

	const [showIngestForm, setShowIngestForm] = useState(true);
	const [showDocEmbedForm, setShowDocEmbedForm] = useState(false);
	const [showUrlEntryForm, setShowUrlEntryForm] = useState(false);
	const [showSearchForm, setShowSearchForm] = useState(false);
	const [sourcesForMessages, setSourcesForMessages] = useState<
		Record<string, any>
	>({});

	const {
		messages,
		input,
		setInput,
		handleInputChange,
		handleSubmit,
		isLoading: chatEndpointIsLoading,
		setMessages,
	} = useChat({
		api: endPoint,
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

	const bottomRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (messages?.length > 0) {
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (messageContainerRef.current) {
			messageContainerRef.current.classList.add("grow");
		}

		if (!messages.length) {
			await new Promise((resolve) => setTimeout(resolve, 300));
		}

		if (chatEndpointIsLoading) {
			return;
		}

		handleSubmit(e);
	};

	const embedForm = showDocEmbedForm && (
		<EmbedPdfsForm setReadyToChat={setReadyToChat} />
	);
	const ingestForm = showIngestForm && (
		<TextUploadForm setReadyToChat={setReadyToChat} />
	);
	const urlForm = showUrlEntryForm && (
		<WebpageUploadForm setReadyToChat={setReadyToChat} />
	);
	const searchForm = showSearchForm && (
		<SearchIndexUploadForm setReadyToChat={setReadyToChat} setEndPoint={setEndPoint}/>
	);

	const navSideBar = (
		<div className="flex grow-0 gap-2 ml-2.5 border-r border-slate-300 h-screen">
			<ul>
				<li className="p-3">
					<Tooltip content="Upload Text" className={toolTipsStyle}>
						<button
							className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-3"
							type="button"
							onClick={() => {
								setShowIngestForm(true);
								setShowDocEmbedForm(false);
								setShowUrlEntryForm(false);
								setShowSearchForm(false);
							}}
						>
							<i className="bi bi-body-text"></i>
							<span className="sr-only">Paste text</span>
						</button>
					</Tooltip>
				</li>

				<li className="p-3">
					<Tooltip content="Upload PDF File" className={toolTipsStyle}>
						<button
							className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-3"
							type="button"
							onClick={() => {
								setShowDocEmbedForm(true);
								setShowIngestForm(false);
								setShowUrlEntryForm(false);
								setShowSearchForm(false);
							}}
						>
							<i className="bi bi-file-earmark-arrow-up"></i>
							<span className="sr-only">Upload PDF</span>
						</button>
					</Tooltip>
				</li>

				<li className="p-3">
					<Tooltip content="Upload a Webpage Content" className={toolTipsStyle}>
						<button
							className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-3"
							type="button"
							onClick={() => {
								setShowUrlEntryForm(true);
								setShowDocEmbedForm(false);
								setShowIngestForm(false);
								setShowSearchForm(false);
							}}
						>
							<i className="bi bi-globe2"></i>
							<span className="sr-only">Upload Webpage</span>
						</button>
					</Tooltip>
				</li>

				<li className="p-3">
					<Tooltip content="Upload Web Search Result" className={toolTipsStyle}>
						<button
							className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-3"
							type="button"
							onClick={() => {
								setShowSearchForm(true);
								setShowDocEmbedForm(false);
								setShowIngestForm(false);
								setShowUrlEntryForm(false);
							}}
						>
							<i className="bi bi-search"></i>
							<span className="sr-only">Upload Web Search Result</span>
						</button>
					</Tooltip>
				</li>

				<li className="p-3">
					<Tooltip content="Chat to Corpus" className={toolTipsStyle}>
						<button
							className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-3"
							type="button"
							onClick={() => {
								setReadyToChat(true);
							}}
						>
							<i className="bi bi-chat-text"></i>
							<span className="sr-only">Chat to Corpus</span>
						</button>
					</Tooltip>
				</li>
			</ul>
		</div>
	);

	const emptyStateComponent = (
		<>
			<div className="flex items-center top-0 bottom-0">
				{/* side bar */}
				{navSideBar}

				{/* main section */}
				<div className="flex flex-col p-4 md:p-8 bg-[#25252d00] overflow-hidden grow h-screen max-w-2xl mx-auto flex-auto">
					<h1 className="text-center text-3xl md:text-3xl mb-4 text-gray-700 ">
						Chat to your documents and the web.
					</h1>

					<p className="text-black text-lg text-center">
						Upload text corpuses using options on the left. A chat interface
						appears on successfull upload, so you can ask questions about the
						uploaded content.
					</p>

					<br></br>

					{messages.length === 0 && embedForm}
					{messages.length === 0 && ingestForm}
					{messages.length === 0 && urlForm}
					{messages.length === 0 && searchForm}
				</div>
			</div>
			{/* {!readyToChat && <Footer />} */}
		</>
	);

	const chatInterfaceComponent = (
		<>
			<div className="flex flex-col w-full">
				{/* Chat Thread */}
				<div
					className="flex flex-col-reverse w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out pb-40 text-black p-4 md:p-8"
					ref={messageContainerRef}
				>
					{messages.length > 0
					? [...messages].reverse().map((m, i) => {
						const sourceKey = (messages.length - 1 - i).toString();
						return (
						<ChatMessageBubble
							key={m.id}
							message={m}
							aiEmoji={emoji}
							sources={sourcesForMessages[sourceKey]}
						></ChatMessageBubble>
						);
					})
					: ""}
				</div>

				<div ref={bottomRef} />

				<div className=" fixed bottom-0 w-full">
					<form
						onSubmit={sendMessage}
						className=" border border-gray-300 rounded-lg shadow-xl  space-x-2 text-black mb-20 container flex max-w-3xl  p-5 pt-9 pb-9 w-1/2 mx-auto"
						id="chat-form"
					>
						<div className="flex w-full m-auto gap-2 ">
							<Tooltip content="Clear Chat Thread" className={toolTipsStyle}>
								<button
									className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-6 py-5 mr-2 "
									type="button"
									onClick={() => {
										setMessages([]);
									}}
								>
									<i className="bi bi-trash3-fill"></i>
									<span className="sr-only">Clear Chat Thread</span>
								</button>
							</Tooltip>

							<Tooltip content="Upload Corpus" className={toolTipsStyle}>
								<button
									className=" px-6 py-5 bg-kaito-brand-ash-green text-gray-200 rounded-full ml-2"
									type="button"
									onClick={() => {
										setShowIngestForm(true);
										setShowDocEmbedForm(false);
										setShowUrlEntryForm(false);
										setShowSearchForm(false);
										setMessages([]);
										setReadyToChat(false);
									}}
								>
									<i className="bi bi-upload"></i>
									<span className="sr-only">Upload Corpus</span>
								</button>
							</Tooltip>

							<input
								className="grow px-4 py-1.5 rounded-full border border-kaito-brand-ash-green text-kaito-brand-ash-green focus:bg-white"
								id="chat-textbox"
								value={input}
								placeholder={placeholder ?? "What is truth?"}
								onChange={handleInputChange}
							/>

							<button
								type="submit"
								className=" px-6 py-5 bg-kaito-brand-ash-green text-gray-200 rounded-full"
							>
								<div
									role="status"
									className={`${
										chatEndpointIsLoading ? "" : "hidden"
									} flex justify-center`}
								>
									<span className="flex items-center gap-2">
										<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
										</svg>
									</span>
									<span className="sr-only">Loading...</span>
								</div>
								<div className={chatEndpointIsLoading ? "hidden" : ""}>
									<i className="bi bi-send-fill"></i>
									<span className="sr-only">Send Message</span>
								</div>
							</button>
						</div>
					</form>
				</div>
			</div>
		</>
	);

	return (
		<main>
			<div className={`w-full min-h-screen text-black ${readyToChat ? "border" : ""}`}>
				<h2
					className={`${
						readyToChat ? "" : "hidden"
					} text-2xl flex justify-center mt-2`}
				>
					{emoji} {titleText}
				</h2>

				{readyToChat ? (
					chatInterfaceComponent 
				) : (
					emptyStateComponent
				)}

				<ToastContainer />
			</div>
			<div className="w-full bottom-0"><Footer /></div>
		</main>
	);
}
