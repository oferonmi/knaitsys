import { useState, type FormEvent, Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

export function SearchIndexUploadForm(props: {
	setReadyToChat: Dispatch<SetStateAction<boolean>>;
	setEndPoint: Dispatch<SetStateAction<string>>;
}) {
	const { setReadyToChat, setEndPoint } = props;
	const [isLoading, setIsLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	// Pass on search query to appropriate API for loading web search result
	// and passing it on (or processed form of it?) for RAG ingestion
	const ingestSearchResult = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		//API request for URL RAG
		const response = await fetch("/api/retrieval/search_index_ingest", {
			method: "POST",
			body: JSON.stringify({
				text: searchQuery,
			}),
		});

		if (response.status === 200) {
			setEndPoint("/api/chat/retrieval/local_retrieval");
			setReadyToChat(true);
			toast(
				`Search engine result page ingest successfull! Now try asking a question about search results.`,
				{
					theme: "dark",
				}
			);
		} else {
			const json = await response.json();
			if (json.error) {
				toast(
					`Search engine result page ingest unsuccessfull! There was a problem : ${json.error}`,
					{
						theme: "dark",
					}
				);
			}
		}
		setIsLoading(false);
	};

	const searchFormInterface = (
		<main>
			<h1 className="text-center text-lg mb-4 text-kaito-brand-ash-green dark:text-kaito-brand-ash-green">
				Enter your search query, click upload and chat with search results.
			</h1>

			<form
				className="flex w-full space-x-2 relative"
				id="search-form"
				onSubmit={ingestSearchResult}
			>
				<input
					type="text"
					autoComplete="off"
					autoFocus={false}
					name="url_input_bar"
					className="flex-grow block w-full rounded-full border py-5 pr-16 text-kaito-brand-ash-green dark:text-kaito-brand-ash-green border-gray-200 dark:border-gray-700 shadow-md bg-white dark:bg-gray-900 focus:border-kaito-brand-ash-green placeholder:text-gray-400 dark:placeholder:text-gray-500 sm:leading-6 focus:outline-none focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700 focus:border-transparent resize-none"
					placeholder="  Search"
					required={true}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<button
					className="bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 dark:text-gray-100 dark:bg-kaito-brand-ash-green dark:hover:bg-kaito-brand-ash-green rounded-full px-5 absolute right-1 top-1/2 transform -translate-y-1/2 h-[calc(100%-8px)]"
					type="submit"
				>
					<div
						role="status"
						className={`${isLoading ? "" : "hidden"} flex justify-center`}
					>
						<Loader2 className="w-4 h-6 animate-spin text-white dark:text-gray-100" />
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

	return searchFormInterface;
}