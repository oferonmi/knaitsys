import { useState, type FormEvent, Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

export function WebpageUploadForm(props: {
	setReadyToChat: Dispatch<SetStateAction<boolean>>;
}){
	const { setReadyToChat } = props;
	const [isLoading, setIsLoading] = useState(false);
	const [inputUrl, setInputUrl] = useState("");

	// Pass on URL to appropriate API for page scrapping and RAG ingestion
	const ingestWebPage = async (e: FormEvent<HTMLFormElement>)  => {
		e.preventDefault();
		setIsLoading(true);

		//API request for URL RAG
		const response = await fetch("/api/retrieval/webpage_ingest", {
			method: "POST",
			body: JSON.stringify({
				text: inputUrl,
			}),
		});

		if (response.status === 200) {
			setReadyToChat(true);
			toast(
				`Webpage ingest successfull! Now try asking a question about the text you uploaded.`,
				{
				theme: "dark",
				}
			);
		} else {
			const json = await response.json();
			if (json.error) {
				toast(
				`Webpage ingest unsuccessfull! There was a problem ingesting your text: ${json.error}`,
				{
					theme: "dark",
				}
				);
			}
		}
		setIsLoading(false);
	}

	return (
		<main>
			<h1 className="text-center text-lg mb-4 text-kaito-brand-ash-green">
				Type in the address of a web page, click upload and chat with the
				content of the web page.
			</h1>

			<form
				className="w-full flex space-x-2 relative"
				id="url-form"
				onSubmit={ingestWebPage}
			>
				<input
					type="text"
					autoComplete="off"
					autoFocus={false}
					name="url_input_bar"
					className="flex-grow block w-full rounded-full border py-5 pr-16 text-kaito-brand-ash-green border-gray-200 shadow-md focus:border-kaito-brand-ash-green placeholder:text-gray-400 sm:leading-6 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-transparent resize-none"
					placeholder="  Type in the URL of the webpage you want to explore"
					required={true}
					onChange={(e) => setInputUrl(e.target.value)}
				/>

				<button
					className="bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-5 absolute right-1 top-1/2 transform -translate-y-1/2 h-[calc(100%-8px)]"
					type="submit"
				>
					<div
						role="status"
						className={`${isLoading ? "" : "hidden"} flex justify-center`}
					>
						<Loader2 className="w-4 h-6 animate-spin text-white" />
						<span className="sr-only">Loading...</span>
					</div>
					<span className={isLoading ? "hidden" : ""}>
						<i className="bi bi-send-fill"></i>
						<span className="sr-only">Send</span>
					</span>
				</button>
			</form>
		</main>
	);
}