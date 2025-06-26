'use client';

import { useRef,useState, useEffect, type FormEvent, Dispatch, SetStateAction, useCallback } from "react";
import { toast } from "react-toastify";
import { Tooltip } from "flowbite-react";
import { useDropzone } from "react-dropzone";
import { Loader2 } from 'lucide-react';

export function EmbedPdfsForm(props: {
  	setReadyToChat: Dispatch<SetStateAction<boolean>>;
}) {
	const { setReadyToChat } = props;

	const [isLoading, setIsLoading] = useState(true);
	const [selectedPDF, setSelectedPDF] = useState<File | null>(null);
	const [uploadedFiles, setUploadedFiles] = useState<FileList | []>([]);

	const onDrop = useCallback((acceptedFiles:any) => {
		// Do something with the files
		setUploadedFiles(acceptedFiles);
		setSelectedPDF(acceptedFiles[0]);
		
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({onDrop});

	const worker = useRef<Worker | null>(null);

	// We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted.
	useEffect(() => {
		if (!worker.current) {
			// Create the worker if it does not yet exist.
			worker.current = new Worker(
				// new URL("../app/worker.ts", import.meta.url),
				new URL(
					"@/app/api/retrieval/pdf_ingest/worker.ts",
					import.meta.url
				),
				{
					type: "module",
				}
			);
			setIsLoading(false);
		}
	}, []);

	async function embedPDF(e: FormEvent<HTMLFormElement>) {
		// console.log(e);
		// console.log(selectedPDF);
		e.preventDefault();
		// const reader = new FileReader();
		if (selectedPDF === null) {
			toast(`You must select a file to embed.`, {
				theme: "dark",
			});
			return;
		}
		setIsLoading(true);
		worker.current?.postMessage({ pdf: selectedPDF });
		const onMessageReceived = (e: any) => {
			switch (e.data.type) {
				case "log":
					console.log(e.data);
					break;
				case "error":
					worker.current?.removeEventListener("message", onMessageReceived);
					setIsLoading(false);
					console.log(e.data.error);
					toast(`There was an issue embedding your PDF: ${e.data.error}`, {
						theme: "dark",
					});
					break;
				case "complete":
					worker.current?.removeEventListener("message", onMessageReceived);
					setIsLoading(false);
					setReadyToChat(true);
					toast(
						`Embedding successful! Now try asking a question about your PDF.`,
						{
						theme: "dark",
						}
					);
					break;
			}
		};
		worker.current?.addEventListener("message", onMessageReceived);
	}

	return (
		<main>
			<h1 className="text-center text-lg  mb-4 text-kaito-brand-ash-green">
				Upload your PDF file, click upload and chat to it.
			</h1>

			<form
				onSubmit={embedPDF}
				className="flex flex-col w-full mb-4 border border-gray-200 rounded-lg shadow-md bg-gray-50 relative"
			>
				<label
				{...getRootProps({
					htmlFor: "dropzone-file",
					className:
					"grow items-center justify-center cursor-pointer bg-white dark:bg-gray-900 border-x-0 border-t-0 border-b border-gray-200 dark:border-gray-700 rounded-t-lg hover:bg-gray-50 dark:hover:bg-gray-800",
				})}
				>
				<div className="flex flex-col items-center justify-center pt-24 pb-28">
					<i className="bi bi-file-earmark-arrow-up text-gray-500 text-4xl"></i>
					<div className="mb-2 text-sm text-gray-500 ">
						<span className="font-semibold">
							{isDragActive ? (
								<p>Drop the files here ...</p>
							) : (
								<p>Click to upload or drag and drop</p>
							)}
						</span>
					</div>
					{selectedPDF === null ? (
						<p className="text-xs text-gray-500 ">PDF files</p>
					) : (
						<p>{selectedPDF.name} file attached</p>
					)}
				</div>
				<input
					{...getInputProps({
					id: "dropzone-file",
					// type: "file",
					// accept: "pdf",
					// className: "text-black hidden ",
					// onChange: (e) =>
					//   e.target.files ? setSelectedPDF(e.target.files[0]) : null,
					})}
				></input>

				{/* <ul>
							{uploadedFiles.map((file) => (
							<li key={file.name}>{file.name}</li>
							))}
						</ul> */}
				</label>

				<div className="">
					<Tooltip content="Ingest">
						<button
							type="submit"
							className="flex px-4 py-3 bg-kaito-brand-ash-green text-gray-200 rounded-full  max-w-24 max-h-24 items-center shrink-0 absolute right-3 bottom-3 z-10 hover:bg-kaito-brand-ash-green/90 focus:outline-none focus:ring-4 focus:ring-kaito-brand-ash-green/50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<div
								role="status"
								className={`${
								isLoading ? "" : "hidden"
								} flex item-center justify-center`}
							>
								{/* loading animation */}
								<Loader2 className="w-4 h-6 animate-spin text-white" />
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
		</main>
	);
}
