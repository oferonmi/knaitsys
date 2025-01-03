"use client";

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
    <>
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
