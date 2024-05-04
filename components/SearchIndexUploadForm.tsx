import { useState, type FormEvent, Dispatch, SetStateAction } from "react";
import { SendIcon } from "@/components/Icons";
import { toast } from "react-toastify";

export function SearchIndexUploadForm(props: {
  setReadyToChat: Dispatch<SetStateAction<boolean>>;
}) {
  const { setReadyToChat } = props;
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
    <>
      <h1 className="text-center  mb-4 text-kaito-brand-ash-green">
          Enter your search query, click upload and chat with search results.
      </h1>

      <form className="flex w-full space-x-2" id="search-form" onSubmit={ingestSearchResult}>
        <input
          type="text"
          autoComplete="off"
          autoFocus={false}
          name="url_input_bar"
          className="flex-grow block w-full rounded-full border py-1.5 text-kaito-brand-ash-green border-kaito-brand-ash-green focus:border-kaito-brand-ash-green placeholder:text-gray-400 sm:leading-6"
          placeholder="  Search"
          required={true}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-5 py-5"
          type="submit"
        >
          <div
            role="status"
            className={`${isLoading ? "" : "hidden"} flex justify-center`}
          >
            <svg
              aria-hidden="true"
              className="w-6 h-6 text-white animate-spin dark:text-white fill-kaito-brand-ash-green"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
          <span className={isLoading ? "hidden" : ""}>
            <SendIcon />
          </span>
        </button>
      </form>
    </>
  );

  return searchFormInterface;
}