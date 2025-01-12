'use client';

import { useRef,useState, useEffect, type FormEvent, Dispatch, SetStateAction, useCallback } from "react";
import { toast } from "react-toastify";
import { Tooltip } from "flowbite-react";
import { useDropzone } from "react-dropzone";

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
				className="flex flex-col w-full mb-4 border border-kaito-brand-ash-green rounded-lg bg-gray-50"
			>
				<label
					{...getRootProps({
						htmlFor: "dropzone-file",
						className:
						"grow items-center justify-center  cursor-pointer bg-white border-x-0 border-t-0 border-b border-gray-200 rounded-t-lg  hover:bg-gray-50",
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

				<div className="inline-flex justify-end mt-2 space-x-6 items-center px-3 py-2 ">
					<Tooltip content="Ingest">
						<button
							type="submit"
							className="flex shrink-0 px-5 py-4 bg-kaito-brand-ash-green text-gray-200 rounded-full max-h-24 max-w-24 items-center"
						>
							<div
								role="status"
								className={`${
								isLoading ? "" : "hidden"
								} flex item-center justify-center`}
							>
								{/* loading animation */}
								<span className="flex items-center gap-2">
									<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
									</svg>
								</span>
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
