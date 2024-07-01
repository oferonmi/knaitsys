"use client";
import { useState, useRef, FormEvent, useCallback, useEffect } from "react";
import { useChat, useCompletion } from "ai/react";
import Emoji from "@/components/Emoji";
import { Footer } from "@/components/Footer";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { 
  ClipIcon, 
  CloudUploadIcon, 
  TextBodyIcon, 
  LinkIcon, 
  SendIcon, 
  StopIcon 
} from "@/components/Icons";
import { ToastContainer, toast } from "react-toastify";
import { Tooltip } from "flowbite-react";
import { useDropzone } from "react-dropzone";
import { Document } from "@langchain/core/documents";

const SummarizerPage = () => {
  const { data: session, status } = useSession();

  const [inputType, setInputType] = useState("text");
  const [selectedPDF, setSelectedPDF] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileList | []>([]);
  const [summarizedText, setSummarizedText] = useState("");
  const [inputTextCorpus, setInputTextCorpus] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  // const [apiEndpoint, setApiEndpoint] = useState("/api/chat/summarizer"); //useState("/api/completion/fireworksai");

  // const [sourcesForMessages, setSourcesForMessages] = useState<
  //   Record<string, any>
  // >({});

  // const inputSectionRef = useRef(null);

  // const handleApiEndpointChange = (event: { target: { value: any } }) => {
  //   setApiEndpoint("/api/completion/" + event.target.value);
  // };

  // text OpenAI completion function call
  // const {
  //   completion,
  //   input,
  //   setInput,
  //   stop,
  //   isLoading,
  //   handleInputChange,
  //   handleSubmit,
  // } = useCompletion({
  //   api: apiEndpoint,
  //   onError: (e) => {
  //     toast(e.message, {
  //       theme: "dark",
  //     });
  //   },
  // });

  // const {
  //   messages,
  //   input,
  //   setInput,
  //   handleInputChange,
  //   handleSubmit,
  //   isLoading,
  //   stop,
  // } = useChat({
  //   api: apiEndpoint,
  //   onResponse(response) {
  //     const sourcesHeader = response.headers.get("x-sources");
  //     const sources = sourcesHeader ? JSON.parse(atob(sourcesHeader)) : [];
  //     const messageIndexHeader = response.headers.get("x-message-index");

  //     if (sources.length && messageIndexHeader !== null) {
  //       setSourcesForMessages({
  //         ...sourcesForMessages,
  //         [messageIndexHeader]: sources,
  //       });
  //     }
  //   },
  //   onError: (e) => {
  //     toast(e.message, {
  //       theme: "dark",
  //     });
  //   },
  // });

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

  // useEffect(() => {
  //   if (completion?.length > 0) {
  //     bottomRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [completion]);

  // function for serialized string copy of an array of Document object
  // const combineDocumentsFn = (docs: Document[]) => {
  //   const serializedDocs = docs.map((doc) => doc.pageContent);
  //   return serializedDocs.join("\n\n");
  // };

  //process raw text
  const processRawText = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    }
  };

  //extract and process text from a url input
  const processWebPageContent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log(inputUrl);
    // setIsLoading(true);

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
    } else {
      if (json_resp.error) {
        console.log(json_resp.error);
        // toast(`Unable to summarize web page content : ${json_resp.error}`, {
        //   theme: "dark",
        // });
      }
    }
  };

  // extract and process text content of uploaded PDF
  const processFileContent = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //TO DO: API call to a langchain based document/file loader. returns file content as serialized strings
    // handleSubmit(e);
  };

  // input section form specifications
  const summarizerCtrlButtons = (
    <div className="flex flex-row">
      {/*className="flex flex-row"*/}
      {/* <div className="flex mt-2 mr-auto">
        <select
          onChange={handleApiEndpointChange}
          className="inline-flex items-center py-1.5 px-2 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green mr-2 "
          id="llm-selector"
          required
        >
          <option value="">--Select LLM--</option>
          <option value="openai">GPT-3.5</option>
          <option value="fireworksai">Llama-2-Fwks</option>
          <option value="cohere">Co:here</option>
          <option value="huggingface">OpenAssistant-HF</option>
        </select>
      </div> */}

      <div className="flex mt-2 ml-auto space-x-3">
        <div>
          <button
            className=" bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-4"
            type="button"
            // onClick={stop}
          >
            <StopIcon />
          </button>
        </div>

        <div>
          <button
            className="items-center py-4 px-4 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-full hover:bg-kaito-brand-ash-green"
            type="submit"
            // disabled={isLoading}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );

  // raw text input form
  const textInputForm = (
    <form className="w-full flex flex-col" onSubmit={processRawText}>
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

        <div className=" px-3 py-2 border-t ">{summarizerCtrlButtons}</div>
      </div>
    </form>
  );

  // text file input form
  const fileInputForm = (
    // <form className="w-full flex flex-col" onSubmit={getFileContent}>
    <form
      onSubmit={processFileContent}
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
          <CloudUploadIcon />
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
      </label>

      <div className="px-3 py-2 ">{summarizerCtrlButtons}</div>
    </form>
  );

  const urlInputBox = (
    <>
      <input
        type="url"
        id="urlInput"
        className="bg-white hover:bg-gray-50 text-kaito-brand-ash-green text-sm rounded-t-lg w-full border-x-0 border-t-0 border-b "
        placeholder="Type in the URL (http:// address) of webpage you want to summarize."
        value={inputUrl}
        onChange={(e) => setInputUrl(e.target.value)}
        required
      />
    </>
  );

  const urlInputForm = (
    <form className="w-full flex flex-col" onSubmit={processWebPageContent}>
      <div className="w-full mb-4 border border-kaito-brand-ash-green rounded-lg bg-gray-50">
        <div className=" bg-white rounded-t-lg">
          {urlInputBox}

          <textarea
            id="pg_content_disp"
            rows={12}
            className="w-full mb-4 text-sm text-black bg-white border-0 focus:ring-0 focus:ring-inset  focus:ring-kaito-brand-ash-green"
            value={inputTextCorpus}
            // onChange={(e) => setInputTextCorpus(e.target.value)}
            placeholder="  Preview of webpage content appears here ..."
            disabled={true}
          ></textarea>
        </div>

        <div className="px-3 py-2 border-t ">{summarizerCtrlButtons}</div>
      </div>
    </form>
  );

  const SideNavBar = (
    <>
      <div className="flex grow-0 gap-2 ml-2.5 border-r border-slate-300 h-screen">
        <ul>
          <li className="p-3">
            <Tooltip content="Upload Text" className="inline-flex">
              <button
                type="button"
                className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-4 "
                onClick={() => {
                  setInputType("text");
                }}
              >
                <TextBodyIcon />
                <span className="sr-only">Paste text</span>
              </button>
            </Tooltip>
          </li>

          <li className="p-3">
            <Tooltip content="Upload PDF" className="inline-flex">
              <button
                type="button"
                className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-4 "
                onClick={() => {
                  setInputType("file");
                }}
              >
                <ClipIcon />
                <span className="sr-only">Attach file</span>
              </button>
            </Tooltip>
          </li>

          <li className="p-3">
            <Tooltip content="Enter Webpage Address" className="inline-flex">
              <button
                type="button"
                className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-4 "
                onClick={() => {
                  setInputType("url");
                }}
              >
                <LinkIcon />
                <span className="sr-only">
                  paste URL of webpage to summarize
                </span>
              </button>
            </Tooltip>
          </li>
          {/* <li className="p-3"></li> */}
        </ul>
      </div>
    </>
  );

  // Summary Flash Card component interface
  let cardColorHexArr = [
    "bg-[#cba3e0]",
    "bg-[#d2ccf2]",
    "bg-[#c8a8d5]",
    "bg-[#e4a8b9]",
    "bg-[#db96b9]",
    "bg-[#afd1e2]",
    "bg-[#feff9c]",
  ];

  // let cardColorHex = cardColorHexArr[0];
  let cardColorHex = cardColorHexArr[Math.floor(Math.random() * cardColorHexArr.length)];
  // console.log(cardColorHex);

  const FlashCard = (
    <div className="flex flex-col">
      {/* Summarization Flashcard component */}
      <h2 className="text-black text-2xl flex justify-center mt-2">
        Summary Flash Card
      </h2>

      <div className="flex flex-col w-full mt-4 mb-4 overflow-auto transition-[flex-grow] ease-in-out pb-40 text-black">
        {summarizedText.length > 0 ? (
          <div
            className={`${cardColorHex}  text-black rounded px-4 py-2 max-w-[80%] mb-8 ml-auto mr-auto mt-auto flex border-1 border-gray-150`}
            // className="bg-[#c8a8d5] text-black rounded px-4 py-2 max-w-[80%] mb-8 ml-auto mr-auto mt-auto flex border-1 border-gray-300"
          >
            <span className="whitespace-pre-wrap flex flex-col">
              {summarizedText}
            </span>
          </div>
        ) : (
          ""
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );

  return (
    <>
      {status === "authenticated" && (
        <div className="flex h-screen">
          {/* Summarization Flashcard component */}
          {summarizedText && FlashCard}

          {/* landing page section */}
          {summarizedText.length == 0 && (
            <>
              {/* side bar */}
              {SideNavBar}

              {/* main section */}
              <div className="flex flex-col p-4 md:p-8 bg-[#25252d00] overflow-hidden grow h-screen max-w-2xl mx-auto flex-auto">
                <h1 className="text-center text-3xl md:text-3xl mb-4 text-gray-700">
                  Summarize your documents and web pages.
                </h1>

                <p className="text-black text-lg text-center">
                  Specify text source on the left. Get a summary. You can ask
                  follow up questions.
                </p>

                <br></br>

                <div className="container max-w-2xl ">
                  {inputType === "text" && textInputForm}
                  {inputType === "file" && fileInputForm}
                  {inputType === "url" && urlInputForm}
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {status === "unauthenticated" && redirect("/auth/signIn")}
      <Footer />
      <ToastContainer />
    </>
  );
}

export default SummarizerPage;
