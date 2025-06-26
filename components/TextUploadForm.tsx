"use client";

import { useState, type FormEvent, Dispatch, SetStateAction } from "react";
import DEFAULT_RETRIEVAL_TEXT from "@/data/DefaultRetrievalText";
import { toast } from "react-toastify";
import { Tooltip } from "flowbite-react";
import { Loader2 } from 'lucide-react';

export function TextUploadForm(props: {
	setReadyToChat: Dispatch<SetStateAction<boolean>>;
}) {
	const { setReadyToChat } = props;
	const [isLoading, setIsLoading] = useState(false);
	const [document, setDocument] = useState(DEFAULT_RETRIEVAL_TEXT);

	// Pass on raw text to appropriate API for RAG ingestion
	const ingestRawText = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		const response = await fetch("/api/retrieval/raw_text_ingest", {
			method: "POST",
			body: JSON.stringify({
				text: document,
			}),
		});

		if (response.status === 200) {
			setDocument("Uploaded!");
			setReadyToChat(true);
			toast(`Text ingest successfull! Now try asking a question about the text you uploaded.`, {
				theme: "dark",
			});
		} else {
			const json = await response.json();
			if (json.error) {
				setDocument(json.error)
				toast(
					`Text ingest unsuccessfull! There was a problem ingesting your text: ${json.error}`,
					{
						theme: "dark",
					}
				);
			}
		}
		setIsLoading(false);
	};

	return (
		<>
			<h1 className="text-center text-lg mb-4 text-kaito-brand-ash-green dark:text-kaito-brand-ash-green">
				Paste text below, click upload and chat to it.
			</h1>

			<form
				onSubmit={ingestRawText}
				className="flex flex-col w-full mb-4 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 relative"
				id="raw-textarea-form"
			>
				<textarea
					className="w-full min-h-[100px] bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700 focus:border-transparent resize-none text-black dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 sm:leading-6 px-4 py-3"
					id="raw-text-injest"
					value={document}
					rows={14}
					onChange={(e) => setDocument(e.target.value)}
				/>

				<div className=" ">
					<Tooltip content="Ingest" className="inline-flex">
						<button
							type="submit"
							className="flex px-4 py-3 bg-kaito-brand-ash-green text-gray-200 rounded-full max-w-24 max-h-24 items-center shrink-0 absolute right-3 bottom-3 z-10 hover:bg-kaito-brand-ash-green/90 focus:outline-none focus:ring-4 focus:ring-kaito-brand-ash-green/50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-kaito-brand-ash-green dark:text-gray-100 dark:hover:bg-kaito-brand-ash-green/90 dark:focus:ring-kaito-brand-ash-green/60"
						>
							<div
								role="status"
								className={`${isLoading ? "" : "hidden"} flex justify-center`}
							>
								<Loader2 className="w-4 h-6 animate-spin text-white dark:text-gray-100" />
								<span className="sr-only">Loading...</span>
							</div>
							<span className={isLoading ? "hidden" : ""}>
								<i className="bi bi-upload"></i>
								<span className="sr-only">Upload</span>
							</span>
						</button>
					</Tooltip>
				</div>
			</form>
		</>
	);
}
