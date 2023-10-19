"use client";
import { useState, useRef } from "react";
import { useCompletion } from "ai/react";
import Emoji from "@/components/Emoji";
import { Footer } from "@/components/Footer";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {scrapeUsingCheerio, scrapeUsingPuppeteer} from "@/components/WebScraper";
import { 
  ClipIcon, 
  CloudUploadIcon, 
  TextBodyIcon, 
  LinkIcon, 
  SendIcon, 
  StopIcon 
} from "@/components/Icons";

const SummarizerPage = () => {
  const { data:session, status } = useSession();

  const [showTextInput, setShowTextInput] = useState(true);
  const [showFileInput, setShowFileInput] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const inputSectionRef = useRef(null);

  const [llmApiRoute, setLlmApiRoute] = useState("/api/completion/fireworksai");

  const handleLlmApiChange = (event: { target: { value: any } }) => {
    setLlmApiRoute("/api/completion/" + event.target.value);
  };

  // text OpenAI completion function call
  const {
    completion,
    input,
    stop,
    isLoading,
    handleInputChange,
    handleSubmit,
  } = useCompletion({
    api: llmApiRoute,
  });

  // handle button for input selection
  const handleFileInputSelection = () => {
    setShowFileInput(true);
    setShowTextInput(false);
    setShowUrlInput(false);
  };

  const handleTextInputSelection = () => {
    setShowTextInput(true);
    setShowFileInput(false);
    setShowUrlInput(false);
  };

  const handleUrlInputSelection = () => {
    setShowUrlInput(true);
    setShowTextInput(false);
    setShowFileInput(false);
  };


  //extract text from a url input
  const getUrlPgContent = () => {
    const urlInput = document.getElementById("urlInput");

    const pg_content_disp = document.getElementById("pg_content_disp");

    const url = urlInput?.textContent;

    pg_content_disp.value = scrapeUsingCheerio(url);
    // pg_content_disp.value = scrapeUsingPuppeteer(url);
    pg_content_disp.disabled = true;
  }

  // input section form specifications
  const summarizerCtrlButtons = (
    <div className="justify-left mt-2 space-x-6">
      {/* <label className="text-black" htmlFor="llm-selector">Select LLM: </label> */}
      <select
        onChange={handleLlmApiChange}
        className="inline-flex items-center py-1.5 px-2 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green mr-2 "
        id="llm-selector"
        required
      >
        <option value="">--Select LLM--</option>
        <option value="openai">GPT-3.5</option>
        <option value="fireworksai">Llama-2-Fwks</option>
        {/* <option value="replicate">Llama-2-Rplte</option> */}
        <option value="cohere">Co:here</option>
        <option value="huggingface">OpenAssistant-HF</option>
        {/* <option value="anthropic">Claude-2</option> */}
      </select>

      <button
        className="inline-flex items-center py-1.5 px-3 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green"
        type="submit"
        disabled={isLoading}
      >
        <SendIcon />
      </button>
      <button
        className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-md px-3 py-1.5"
        type="button"
        onClick={stop}
      >
        <StopIcon />
      </button>
    </div>
  );

  // direct text input form
  const textInputForm = (
    <form className="w-full flex flex-col" onSubmit={handleSubmit}>
      <div className="w-full mb-4 border border-kaito-brand-ash-green rounded-lg bg-gray-50">
        <div className="px-2 py-2 bg-white rounded-t-lg ">
          <textarea
            id="textInput"
            rows="4"
            className="w-full px-0 text-sm text-kaito-brand-ash-green bg-white border-0  focus:ring-0 focus:ring-inset focus:ring-kaito-brand-ash-green"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste or upload the file of the text you want to summarize..."
            required
          ></textarea>
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-t ">
          {summarizerCtrlButtons}
          <div className="flex pl-0 space-x-1 sm:pl-2">
            <button
              type="button"
              className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-white hover:bg-kaito-brand-ash-green  "
              onClick={handleFileInputSelection}
            >
              <ClipIcon />
              <span className="sr-only">Attach file</span>
            </button>

            <button
              type="button"
              className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-white hover:bg-kaito-brand-ash-green  "
              onClick={handleUrlInputSelection}
            >
              <LinkIcon />
              <span className="sr-only">paste URL of webpage to summarize</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );

  // text file input form
  const fileInputForm = (
    <form className="w-full flex flex-col" onSubmit={handleSubmit}>
      <div className="w-full mb-4 border border-kaito-brand-ash-green rounded-lg bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full cursor-pointer bg-white  hover:bg-gray-50 rounded-t-lg"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <CloudUploadIcon />
              <p className="mb-2 text-sm text-gray-500 ">
                <span className="font-semibold">Click to upload</span> or drag and
                drop
              </p>
              <p className="text-xs text-gray-500 ">
                DOC, DOCX, TXT or PDF
              </p>
            </div>
            <input id="dropzone-file" type="file" className="hidden" />
          </label>
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-t ">
          {summarizerCtrlButtons}
          <div className="flex pl-0 space-x-1 sm:pl-2">
            <button
              type="button"
              className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-white hover:bg-kaito-brand-ash-green  "
              onClick={handleTextInputSelection}
            >
              <TextBodyIcon />
              <span className="sr-only">Paste text</span>
            </button>

            <button
              type="button"
              className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-white hover:bg-kaito-brand-ash-green  "
              onClick={handleUrlInputSelection}
            >
              <LinkIcon />
              <span className="sr-only">paste URL of webpage to summarize</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );

  const urlInputBox = (
    <>
      <input
        type="url"
        id="urlInput"
        className="bg-white hover:bg-gray-50 text-kaito-brand-ash-green text-sm rounded-t-lg border border-b-kaito-brand-gray focus:ring-gray-200 focus:border-gray-200 block w-full p-2.5"
        placeholder="Type in URL of webpage to summarize. Example: https//www.***.com"
        onChange={getUrlPgContent}
        required
      />
    </>
  );

  const urlInputForm = (
    <form className="w-full flex flex-col" onSubmit={handleSubmit}>
      <div className="w-full mb-4 border border-kaito-brand-ash-green rounded-lg bg-gray-50">
        <div className=" bg-white rounded-t-lg">
          {urlInputBox}

          <textarea
            id="pg_content_disp"
            rows="4"
            className="w-full px-0 text-sm text-kaito-brand-ash-green bg-white border-0 focus:ring-0 focus:ring-inset  focus:ring-kaito-brand-ash-green"
            value={input}
            onChange={handleInputChange}
            placeholder="  Preview of webpage content appears here ..."
            disabled={true}
          ></textarea>
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-t ">
          {summarizerCtrlButtons}
          <div className="flex pl-0 space-x-1 sm:pl-2">
            <button
              type="button"
              className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-white hover:bg-kaito-brand-ash-green  "
              onClick={handleTextInputSelection}
            >
              {/* dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 */}
              <TextBodyIcon />
              <span className="sr-only">Paste text</span>
            </button>

            <button
              type="button"
              className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-white hover:bg-kaito-brand-ash-green  "
              onClick={handleFileInputSelection}
            >
              {/* dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 */}
              <ClipIcon />
              <span className="sr-only">Attach file</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );

  return (
    <>
      {status === "authenticated" && (
        <div className="flex flex-auto max-w-2xl pb-5 mx-auto mt-4 sm:px-4 grow">
          {completion.length == 0 && (
            <div className="mt-12 sm:mt-24 space-y-6 text-gray-500 text-base mx-8 sm:mx-4 sm:text-2xl leading-12 flex flex-col mb-12 sm:mb-24 h-screen">
              <div>
                <Emoji symbol="👋" label="waving hand" /> Hello! Paste in your
                text or upload a text file and get a summary of the text
                content. Click button{" "}
                <div className="inline-flex text-2xl font-extrabold">
                  <ClipIcon />
                </div>{" "}
                for file upload,{" "}
                <div className="inline-flex text-2xl font-extrabold">
                  <TextBodyIcon />
                </div>{" "}
                button for direct text input or{" "}
                <div className="inline-flex text-2xl font-extrabold">
                  <LinkIcon />
                </div>{" "}
                button for URL of webpage you want to summarize.
              </div>
            </div>
          )}
          
          {completion.length > 0 && (
            <output className="flex flex-col text-sm sm:text-base text-gray-700 flex-1 gap-y-4 mt-1 gap-x-4 rounded-md bg-gray-50 py-5 px-5 pb-80 grow">
              {completion}
            </output>
          )}
          <div className="z-10 fixed left-0 right-0 bottom-0 bg-gray-100 border-t-2 border-b-2">
            <div className="container max-w-2xl mx-auto my-auto p-5 pt-9 pb-9">
              {showTextInput && textInputForm}
              {showFileInput && fileInputForm}
              {showUrlInput && urlInputForm}
            </div>
            <Footer />
          </div>
        </div>
      )}
      {status === "unauthenticated" && redirect("/auth/signIn")};
    </>
  );
}

export default SummarizerPage;
