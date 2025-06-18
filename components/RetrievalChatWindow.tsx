"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "flowbite-react";

import { useChat } from "@ai-sdk/react";
import { useRef, useState, useEffect, ReactElement } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";

import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { TextUploadForm } from "@/components/TextUploadForm";
import { EmbedPdfsForm } from "@/components/EmbedPdfsForm";
import { WebpageUploadForm } from "@/components/WebpageUploadForm";
import { SearchIndexUploadForm } from "@/components/SearchIndexUploadForm";
import { Footer } from "@/components/Footer";
import { RetrievalSideNav } from "./RetrievalSideNav";
import { Loader2 } from 'lucide-react';

const TEXTAREA_CONFIG = {
	minHeight: "100px",
	placeholder: "Got questions? Ask ...",
};

interface styleList {
	sideBar: string;
	toolTips: string;
	button: string;
}

const sideNavStyle : styleList = {
	sideBar: "flex grow-0 gap-2 ml-2.5 border-r border-slate-300 h-screen",
  	toolTips: 'inline-flex bg-black',
	button: "inline-flex border border-kaito-brand-ash-green hover:bg-kaito-brand-ash-green bg-white items-center font-medium hover:text-gray-200 text-kaito-brand-ash-green text-lg rounded-full px-4 py-3",
} as const

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

	const handleSetIngestForm = () => {
		setShowIngestForm(true);
		setShowDocEmbedForm(false);
		setShowUrlEntryForm(false);
		setShowSearchForm(false);
	};

	const handleSetDocEmbedForm = () => {
		setShowDocEmbedForm(true);
		setShowIngestForm(false);
		setShowUrlEntryForm(false);
		setShowSearchForm(false);
	};

	const handleSetUrlEntryForm = () => {
		setShowUrlEntryForm(true);
		setShowDocEmbedForm(false);
		setShowIngestForm(false);
		setShowSearchForm(false);
	};

	const handleSetSearchForm = () => {
		setShowSearchForm(true);
		setShowDocEmbedForm(false);
		setShowIngestForm(false);
		setShowUrlEntryForm(false);
	};

	const navSideBar = (
		<>
			<RetrievalSideNav
				onSetIngestForm={handleSetIngestForm}
				onSetDocEmbedForm={handleSetDocEmbedForm}
				onSetUrlEntryForm={handleSetUrlEntryForm}
				onSetSearchForm={handleSetSearchForm}
				onSetReadyToChat={() => setReadyToChat(true)}
			/>
		</>
  );

	const emptyStateComponent = (
		<>
			<div className="flex flex-col h-screen">
				{/* items-center top-0 bottom-0 */}
				<div className="flex h-screen">
					{/* side bar */}
					{navSideBar}
					{/* main section */}
					<div className="flex flex-col p-4 md:p-8 overflow-hidden grow h-screen max-w-2xl mx-auto flex-auto pb-10">
						<h1 className="text-center text-3xl md:text-3xl mb-4 text-gray-700 ">
							Chat to your documents and the web.
						</h1>

						<p className="text-black text-lg text-center">
							Upload text corpuses using options on the left, then ask questions about the
							uploaded content.
						</p>

						<br></br>

						{messages.length === 0 && embedForm}
						{messages.length === 0 && ingestForm}
						{messages.length === 0 && urlForm}
						{messages.length === 0 && searchForm}
					</div>
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
				className="flex flex-col-reverse w-full mb-4 grow overflow-auto transition-[flex-grow] ease-in-out pb-40 text-black p-4 md:p-8"
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
						/>
						);
					})
					: ""}
				</div>

				<div ref={bottomRef} />

				<div className="fixed bottom-0 left-0 right-0 flex justify-center items-center w-full px-4">
					<form
						onSubmit={sendMessage}
						className="text-black mb-20 w-full max-w-3xl relative"
						id="chat-form"
					>
						<div className="relative w-full">
							{/* Left-aligned buttons */}
							<div className="absolute left-3 bottom-3 flex gap-2 z-10">
								<Tooltip content="Clear Chat Thread" className={toolTipsStyle}>
									<button
										className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-3"
										type="button"
										onClick={() => setMessages([])}
									>
										<i className="bi bi-trash3-fill"></i>
										<span className="sr-only">Clear Chat Thread</span>
									</button>
								</Tooltip>

								<Tooltip content="Upload Corpus" className={toolTipsStyle}>
									<button
										className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-3"
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
							</div>

							<textarea
								autoComplete="off"
								autoFocus={false}
								name="prompt"
								className="w-full min-h-[100px] bg-white rounded-lg shadow-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-transparent resize-none text-kaito-brand-ash-green placeholder:text-gray-400 sm:leading-6 px-4 py-3"
								id="chat-textbox"
								required
								value={input}
								placeholder={placeholder ?? TEXTAREA_CONFIG.placeholder}
								style={{ minHeight: TEXTAREA_CONFIG.minHeight }}
								onChange={handleInputChange}
							/>

							{/* Right-aligned send button */}
							<button
								type="submit"
								className="absolute right-3 bottom-3 px-4 py-3 bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green text-gray-200 rounded-full z-10"
							>
								{chatEndpointIsLoading ? (
								<div role="status" className="flex justify-center">
									<Loader2 className="animate-spin w-4 h-6" />
									<span className="sr-only">Loading...</span>
								</div>
								) : (
								<>
									<i className="bi bi-send-fill"></i>
									<span className="sr-only">Send Message</span>
								</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</>
	);

	return (
		<main>
			<div
				className={`flex flex-col w-full min-h-screen pt-32 ${
					readyToChat ? "border" : ""
				}`}
			>
				<h2
					className={`${
						readyToChat ? "" : "hidden"
					} text-2xl flex justify-center mt-2`}
				>
					{emoji} {titleText}
				</h2>

				{readyToChat ? chatInterfaceComponent : emptyStateComponent}

				<ToastContainer />
			</div>
			<div className="w-full bottom-0">
				<Footer />
			</div>
		</main>
	);
}
