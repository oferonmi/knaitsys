"use client";

import { useState, type FormEvent, Dispatch, SetStateAction } from "react";
import DEFAULT_RETRIEVAL_TEXT from "@/data/DefaultRetrievalText";
import { toast } from "react-toastify";
import { Tooltip } from "flowbite-react";

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
      <h1 className="text-center text-lg mb-4 text-kaito-brand-ash-green">
        Paste text below, click upload and chat to it.
      </h1>

      <form
        onSubmit={ingestRawText}
        className="flex w-full"
        id="raw-textarea-form"
      >
        <textarea
          className="grow  mr-8 p-4 resize rounded-md border"
          id="raw-text-injest"
          value={document}
          rows={14}
          onChange={(e) => setDocument(e.target.value)}
        ></textarea>

        <Tooltip content="Ingest" className="inline-flex">
          <button
            type="submit"
            className="flex px-4 py-4 bg-kaito-brand-ash-green text-gray-200 rounded-full  max-w-24 max-h-24 items-center shrink-0 "
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
              {/* Upload */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-upload"
                viewBox="0 0 16 16"
              >
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
              </svg>
            </span>
          </button>
        </Tooltip>
      </form>
    </>
  );
}
