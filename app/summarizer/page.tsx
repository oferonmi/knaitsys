"use client";

import { useState, useRef, type FormEvent, useCallback, useEffect } from "react";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "flowbite-react";
import { useDropzone } from "react-dropzone";
import copy from 'copy-to-clipboard';
import { withAuth } from "@/components/HOC/withAuth";

interface styleList {
  sideBar: string;
  toolTips: string;
  button: string;
}

const sideNavStyle: styleList = {
  sideBar: "flex grow-0 gap-2 ml-2.5 mt-4 border-r border-slate-300 h-screen",
  toolTips: "inline-flex bg-black",
  button:
    "inline-flex border border-kaito-brand-ash-green hover:bg-kaito-brand-ash-green bg-white items-center font-medium hover:text-gray-200 text-kaito-brand-ash-green text-lg rounded-full px-4 py-3",
} as const;

const toolTipsStyle = "inline-flex bg-black";

const SummarizerPage = () => {
	const [loading, setLoading] = useState(false);

	const [inputType, setInputType] = useState("text");
	const [selectedPDF, setSelectedPDF] = useState<File | null>(null);
	const [uploadedFiles, setUploadedFiles] = useState<FileList | []>([]);
	const [summarizedText, setSummarizedText] = useState("");
	const [inputTextCorpus, setInputTextCorpus] = useState("");
	const [inputUrl, setInputUrl] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [copyIcon, setCopyIcon] = useState(<i className="bi bi-copy"></i>)

	const onDrop = useCallback((acceptedFiles: any) => {
		// Do something with the files
		setUploadedFiles(acceptedFiles);
		setSelectedPDF(acceptedFiles[0]);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (summarizedText?.length > 0) {
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [summarizedText]);

	const worker = useRef<Worker | null>(null);

	// We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted.
	useEffect(() => {
		if (!worker.current) {
			// Create the worker if it does not yet exist.
			worker.current = new Worker(
				new URL(
					'@/app/api/summarizer/pdf_summary/worker.ts',
					import.meta.url
				),
				{
					type: "module",
				}
			);
			setLoading(false);
		}
	}, []);

	//process raw text
	const summarizeRawText = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		// pass input to API that handles text summarization
		const response = await fetch("/api/summarizer/plain_text_summary", {
			method: "POST",
			body: JSON.stringify({
				text: inputTextCorpus,
			}),
		});

		const response_json = await response.json();

		if (response.status === 200) {
			// set summarized text state
			// console.log(response_json.text);
			setSummarizedText(response_json.text)

			// toast(
			//   `Text summarized successfully!`,
			//   {
			//     theme: "dark",
			//   }
			// );
			setLoading(false);
		} else {
			if (response_json.error) {
				// console.log(response_json.error)
				toast(
					`Unable to summarise text: ${response_json.error}`,
					{
						theme: "dark",
					}
				);
			}
			setLoading(false);
		}
	};

	//extract and process text from a url input
	const summarizeWebPage = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// console.log(inputUrl);
		setLoading(true);

		// API call to summarize web page content of provided URL
		const response = await fetch("/api/summarizer/webpage_summary", {
			method: "POST",
			body: JSON.stringify({
				text: inputUrl,
			}),
		});

		const json_resp = await response.json();

		if (response.status === 200) {
			// console.log("Success!");

			// set input text content state
			// console.log(json_resp.input_text);
			setInputTextCorpus(json_resp.input_text);

			// set summarized text state
			// console.log(json_resp.output_text);
			setSummarizedText(json_resp.output_text);

			// toast(`Web page summarized successfully!`, {
			//   theme: "dark",
			// });

			setLoading(false);
		} else {
			if (json_resp.error) {
				console.log(json_resp.error);
				// toast(`Unable to summarize web page content : ${json_resp.error}`, {
				//   theme: "dark",
				// });
			}
			setLoading(false);
		}
	};
	
	// exract and process PDF file content
	const summarizePDF = async (e: FormEvent<HTMLFormElement>) => {
		// e.preventDefault();

		// // API call to PDF file summarizer
		// setLoading(true);

		// // file blob
		// const fileBlob = new Blob([JSON.stringify(selectedPDF)], {
		//   type: "text/plain; charset=utf8",
		// });

		// // API call to summarize web page content of provided URL
		// const response = await fetch("/api/summarizer/pdf_summary", {
		//   method: "POST",
		//   body: fileBlob, //formData,
		//   // body: JSON.stringify({
		//   //   pdf: selectedPDF, //formData, pdfFile,
		//   // }),
		// });

		// const json_resp = await response.json();

		// if (response.status === 200) {
		//   // console.log("Success!");

		//   // set input text content state
		//   // console.log(json_resp.input_text);
		//   // setInputTextCorpus(json_resp.input_text);

		//   // set summarized text state
		//   // console.log(json_resp.output_text);
		//   // setSummarizedText(json_resp.output_text);

		//   // toast(`PDF summarized successfully!`, {
		//   //   theme: "dark",
		//   // });

		//   setLoading(false);
		// } else {
		//   if (json_resp.error) {
		//     console.log(json_resp.error);
		//     // toast(`Unable to summarize PDF content : ${json_resp.error}`, {
		//     //   theme: "dark",
		//     // });
		//   }
		//   setLoading(false);
		// }

		e.preventDefault();
	
		if (selectedPDF === null) {
			toast(`You must select a file to summarize.`, {
				theme: "dark",
			});
			return;
		}

		setLoading(true);

		worker.current?.postMessage({ pdf: selectedPDF });

		const onMessageReceived = (e: any) => {
			switch (e.data.type) {
				case "log":
					console.log(e.data);
					break;
				case "error":
					worker.current?.removeEventListener("message", onMessageReceived);
					setLoading(false);
					console.log(e.data.error);
					toast(`There was an issue summarizing your PDF: ${e.data.error}`, {
						theme: "dark",
					});
					break;
				case "input_text":
					// set input text content state
					setInputTextCorpus(e.data.input_text);
					// console.log(e.data.input_text);
					break;
				case "output_text":
					// set summarized text state
					setSummarizedText(e.data.output_text);
					// console.log(e.data.output_text);
					break;
				case "complete":
					worker.current?.removeEventListener("message", onMessageReceived);

				setLoading(false);

				// toast(`Summarization of PDF successful!`, {
				//   theme: "dark",
				// });
				break;
			}
		}
		worker.current?.addEventListener("message", onMessageReceived);
	}

	//process search result pages
	const summarizeSearchResult = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		//API request for URL RAG
		const response = await fetch("/api/summarizer/search_index_summary", {
			method: "POST",
			body: JSON.stringify({
				text: searchQuery,
			}),
		});

		const json_resp = await response.json();

		if (response.status === 200) {
			// console.log("Success!");

			// set input text content state
			// console.log(json_resp.input_text);
			setInputTextCorpus(json_resp.input_text);

			// set summarized text state
			// console.log(json_resp.output_text);
			setSummarizedText(json_resp.output_text);

			// toast(`search index pages summarized successfully!`, {
			//   theme: "dark",
			// });

			//setLoading(false);
		} else {
			if (json_resp.error) {
				console.log(json_resp.error);
				// toast(`Unable to summarize search index pages content : ${json_resp.error}`, {
				//   theme: "dark",
				// });
			}
		}
		setLoading(false);
	};

	// input section form specifications
	const summarizerCtrlButtons = (
		<div className="flex flex-row">
			<div className="flex ml-auto space-x-3">
				<div>
					<button
						className="items-center py-3 px-4 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-full hover:bg-kaito-brand-ash-green"
						type="submit"
					>
						<div
							role="status"
							className={`${loading ? "" : "hidden"} flex justify-center`}
						>
							{/* Loading wheel animation  */}
							<Loader2 className="animate-spin w-4 h-6" />
							<span className="sr-only">Loading...</span>
						</div>

						{/* Send icon*/}
						<div className={`${loading ? "hidden" : ""}`}>
							<i className="bi bi-send-fill"></i>
							<span className="sr-only">Send</span>
						</div>
					</button>
				</div>
			</div>
		</div>
  	);

	// summary page home button
	const homeButton = (
		<div className="flex ml-auto space-x-3">
			<button
				className="items-center py-3 px-4 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-full hover:bg-kaito-brand-ash-green"
				type="button"
				onClick={() => {
					// setInputTextCorpus("");
					setSummarizedText("");
				}}
			>
				<i className="bi bi-house-fill"></i>
				<span className="sr-only">Home</span>
			</button>
		</div>
	);

	// raw text input form
	const textInputForm = (
		<form className="w-full flex flex-col" onSubmit={summarizeRawText}>
			<div className="w-full mb-4 border border-kaito-brand-ash-green rounded-lg bg-gray-50">
				<div className="px-2 py-2 bg-white rounded-t-lg ">
					<textarea
						id="textInput"
						rows={13}
						className="w-full px-0 text-sm text-black bg-white border-0  focus:ring-0 focus:ring-inset focus:ring-kaito-brand-ash-green"
						value={inputTextCorpus}
						onChange={(e) => setInputTextCorpus(e.target.value)}
						placeholder="Paste in the text you want to summarize..."
						required
					></textarea>
				</div>

				<div className=" px-3 py-2 border-t ">
					{summarizerCtrlButtons}
				</div>
			</div>
		</form>
	);

	// text file input form
	const fileInputForm = (
		<form
			id="pdfUploadForm"
			onSubmit={summarizePDF}
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
						<p className="text-xs text-gray-500 ">
							{selectedPDF.name} file attached
						</p>
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
			</label>

			<div className="px-3 py-2 ">{summarizerCtrlButtons}</div>
		</form>
	);

	const urlInputBox = (
		<>
			<input
				type="url"
				id="urlInput"
				className="flex-grow block w-full rounded-full border py-1.5 text-kaito-brand-ash-green border-kaito-brand-ash-green focus:border-kaito-brand-ash-green placeholder:text-gray-400 sm:leading-6"
				placeholder="Enter URL (http:// address) of webpage to summarize."
				value={inputUrl}
				onChange={(e) => setInputUrl(e.target.value)}
				required
			/>
		</>
	);

	// URL input form
	const urlInputForm = (
		<form className="w-full flex space-x-2" onSubmit={summarizeWebPage}>
			<input
				type="url"
				id="urlInput"
				className="flex-grow block w-full rounded-full border py-1.5 text-kaito-brand-ash-green border-kaito-brand-ash-green focus:border-kaito-brand-ash-green placeholder:text-gray-400 sm:leading-6"
				placeholder="Enter URL (http:// address) of webpage to summarize."
				value={inputUrl}
				onChange={(e) => setInputUrl(e.target.value)}
				required
			/>

			<button
				className="items-center py-4 px-5 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-full hover:bg-kaito-brand-ash-green"
				type="submit"
			>
				<div
					role="status"
					className={`${loading ? "" : "hidden"} flex justify-center`}
				>
					{/* Loading wheel animation  */}
					<Loader2 className="animate-spin w-5 h-6" />
					<span className="sr-only">Loading...</span>
				</div>

				{/* Send icon*/}
				<div className={`${loading ? "hidden" : ""}`}>
					<i className="bi bi-send-fill"></i>
					<span className="sr-only">Send</span>
				</div>
			</button>
		</form>
	);

	// search indices page form
	const searchInputForm = (
		<>
			<h1 className="text-center text-lg mb-4 text-kaito-brand-ash-green">
				Enter your search query, send and recieve summary of the search result
				pages.
			</h1>

			<form
				className="flex w-full space-x-2"
				id="search-form"
				onSubmit={summarizeSearchResult}
			>
				<input
					type="text"
					autoComplete="off"
					autoFocus={false}
					name="url_input_bar"
					className="flex-grow block w-full rounded-full border py-4 text-kaito-brand-ash-green border-kaito-brand-ash-green focus:border-kaito-brand-ash-green placeholder:text-gray-400 sm:leading-6"
					placeholder="  Search"
					required={true}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<button
					className="bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-5 py-4"
					type="submit"
				>
					<div
						role="status" className={`${loading ? "" : "hidden"} flex justify-center`}
					>
						{/* Loading wheel animation  */}
						<Loader2 className="animate-spin w-5 h-6" />
						<span className="sr-only">Loading...</span>
					</div>
					<span className={loading ? "hidden" : ""}>
						<i className="bi bi-send-fill"></i>
						<span className="sr-only">Send</span>
					</span>
				</button>
			</form>
		</>
	);

	const SideNavBar = (
		<>
			<div className={sideNavStyle.sideBar}>
				<ul>
					<li className="p-3">
						<Tooltip content="Upload Text" className={sideNavStyle.toolTips}>
							<button
								type="button"
								className={sideNavStyle.button}
								onClick={() => {
								setInputType("text");
								}}
							>
								<i className="bi bi-body-text"></i>
								<span className="sr-only">Paste text</span>
							</button>
						</Tooltip>
					</li>

					<li className="p-3">
						<Tooltip content="Upload PDF" className={sideNavStyle.toolTips}>
							<button
								type="button"
								className={sideNavStyle.button}
								onClick={() => {
								setInputType("file");
								}}
							>
								<i className="bi bi bi-file-earmark-arrow-up"></i>
								<span className="sr-only">Upload PDF</span>
							</button>
						</Tooltip>
					</li>

					<li className="p-3">
						<Tooltip content="Enter Webpage Address" className={sideNavStyle.toolTips}>
							<button
								type="button"
								className={sideNavStyle.button}
								onClick={() => {
								setInputType("url");
								}}
							>
								<i className="bi bi-globe2"></i>
								<span className="sr-only">Paste webpage URL</span>
							</button>
						</Tooltip>
					</li>

					<li className="p-3">
						<Tooltip content="Enter Search Query" className={sideNavStyle.toolTips}>
							<button
								type="button"
								className={sideNavStyle.button}
								onClick={() => {
								setInputType("search");
								}}
							>
								<i className="bi bi-search"></i>
								<span className="sr-only">Type in your search query</span>
							</button>
						</Tooltip>
					</li>
				</ul>
			</div>
		</>
  	);

	// Display section for orignal input text
	const origTextDisplay = (
		<form className="w-full flex flex-col " onSubmit={summarizeRawText}>
			<div className="w-full h-dvh border-r border-gray-100 bg-gray-50">
				<textarea
					id="textInput"
					// rows={40}
					className="w-full mb-0 px-4 py-4 text-sm text-black bg-white bg-opacity-60 border-0  focus:ring-0 focus:ring-inset focus:ring-kaito-brand-ash-green h-screen" //h-[75%]
					value={inputTextCorpus}
					onChange={(e) => setInputTextCorpus(e.target.value)}
					placeholder="Paste in the text you want to summarize..."
				></textarea>

				<div className="fixed bottom-0">
					<div 
						className=" border border-gray-300 rounded-full shadow-xl space-x-2 text-black flex flex-row items-center mb-20 px-3 py-3"
					>
						<div>{homeButton}</div>
						{/* <div className="flex-1 text-kaito-brand-ash-green">Edit orignal text above ☝️ and resend, if disatisfied with generated summary.</div> */}
						<div>{summarizerCtrlButtons}</div>
					</div>
				</div>
			</div>  
		</form>
	);

	// Summary Flash Card component interface
	const cardColorHexArr = [
		"bg-[#cba3e0]",
		"bg-[#d2ccf2]",
		"bg-[#c8a8d5]",
		"bg-[#e4a8b9]",
		"bg-[#db96b9]",
		"bg-[#afd1e2]",
		"bg-[#feff9c]",
		"bg-[#96b7a5]",
	];

	// let cardColorHex = cardColorHexArr[0];
	let cardColorHex = cardColorHexArr[Math.floor(Math.random() * cardColorHexArr.length)];
	// console.log(cardColorHex);

	const FlashCard = (
		<div className="flex flex-col h-screen">
			{/* Summarization Flashcard component */}
			<h2 className="text-black text-2xl flex justify-center mt-2">
				Summary Flash Card
			</h2>

			<div className="flex flex-col w-full mt-4 mb-4 overflow-auto transition-[flex-grow] ease-in-out pb-40 text-black">
				{/* Summary Flash Card */}
				{summarizedText.length > 0 ? (
					<>
						<div
							className={`${cardColorHex}  text-black rounded px-4 py-2 max-w-[80%] mb-8 ml-auto mr-auto mt-auto flex border-1 border-gray-150`}
						>
							<span className="whitespace-pre-wrap flex flex-col">
								{summarizedText}
							</span>
							<Tooltip content="Copy to clipboard" className={toolTipsStyle}>
								<button
									className="ml-2 mb-auto"
									type="button"
									onClick={() => {
										copy(summarizedText);
										setCopyIcon(<i className="bi bi-check2-square"></i>);
										setTimeout(() => {
										setCopyIcon(<i className="bi bi-copy"></i>);
										}, 400);
									}}
								>
									{copyIcon}
								</button>
							</Tooltip>
						</div>
					</>
				) : (
					""
				)}
				{/* <div ref={bottomRef} /> */}
			</div>
		</div>
  	);

	return (
		<main>
			<div className="flex flex-col pt-24 ">
				{/* landing page section */}
				{summarizedText.length == 0 && (
					<div className="flex h-screen">
						{/* side bar */}
						{SideNavBar}

						{/* main section */}
						<div className="flex flex-col p-4 md:p-8 bg-[#25252d00] overflow-hidden grow h-screen max-w-2xl mx-auto flex-auto">
							<h1 className="text-center text-3xl md:text-3xl mb-4 text-gray-700">
								Summarize your documents, web pages and search indices pages.
							</h1>

							<p className="text-black text-lg text-center">
								Specify text source on the left. Send and get a summary. 
								{/* You can ask follow up questions. */}
							</p>

							<br></br>

							<div className="container max-w-2xl ">
								{inputType === "text" && textInputForm}
								{inputType === "file" && fileInputForm}
								{inputType === "url" && urlInputForm}
								{inputType === "search" && searchInputForm}
							</div>
						</div>
						<ToastContainer />
					</div>
				)}

				{/* Summarization Flashcard component */}
				{summarizedText && (
					<div className="flex flex-col h-screen">
						<div className="flex flex-row h-fit">
							<div className="flex-1">{origTextDisplay}</div>
							<div className="flex-1">{FlashCard}</div>
						</div>
						<div className="flex-auto">
							<Footer />
						</div>
					</div>
				)}

				{/* <ToastContainer /> */}
				{summarizedText.length == 0 && <Footer />}
			</div>
		</main>
	);
}

export default withAuth(SummarizerPage);
