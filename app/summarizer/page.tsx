"use client";
import { useState, useRef } from "react";
import { useCompletion } from "ai/react";
import Emoji from "../../components/Emoji";
import { Footer } from "../../components/Footer";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const Summarizer = () => {
  const { data:session, status } = useSession();

  const [showTextInput, setShowTextInput] = useState(true);
  const [showFileInput, setShowFileInput] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const inputSectionRef = useRef(null);

  // icons
  const clipIcon = (
    <svg
      className="w-4 h-4"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 12 20"
    >
      <path
        stroke="currentColor"
        stroke-linejoin="round"
        stroke-width="2"
        d="M1 6v8a5 5 0 1 0 10 0V4.5a3.5 3.5 0 1 0-7 0V13a2 2 0 0 0 4 0V6"
      />
    </svg>
  );

  const cloudUploadIcon = (
    // dark:text-gray-400
    <svg
      className="w-8 h-8 mb-4 text-gray-500"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 16"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
      />
    </svg>
  );

  const textBodyIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-body-text"
      viewBox="0 0 16 16"
    >
      <path
        fill-rule="evenodd"
        d="M0 .5A.5.5 0 0 1 .5 0h4a.5.5 0 0 1 0 1h-4A.5.5 0 0 1 0 .5Zm0 2A.5.5 0 0 1 .5 2h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm9 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5Zm-9 2A.5.5 0 0 1 .5 4h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5Zm5 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5Zm7 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5Zm-12 2A.5.5 0 0 1 .5 6h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5Zm8 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5Zm-8 2A.5.5 0 0 1 .5 8h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5Zm7 0a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm-7 2a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5Z"
      />
    </svg>
  );

  const linkIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-link-45deg"
      viewBox="0 0 16 16"
    >
      <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
      <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
    </svg>
  );

  // text AI completion function call
  const {
    completion,
    input,
    stop,
    isLoading,
    handleInputChange,
    handleSubmit,
  } = useCompletion({
    api: "/api/completion",
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
  const getUrlPgContent = (e: { target: { value: any; }; }) => {
    const urlInput = document.getElementById("urlInput");

    const url_pg_content_holder = document.getElementById(
      "url_pg_content_holder"
    );

    const cheerio = require("cheerio");

    fetch(urlInput?.value)
      .then((response: { text: () => any }) => response.text())
      .then((html: any) => {
        const $ = cheerio.load(html);
        const title = $("h1").text() + $("h2").text() + $("h3").text();
        const paragraph = $("p").text();

        // console.log("Title:", title);
        // console.log("Paragraph:", paragraph);
        url_pg_content_holder.value = title + "\n" + paragraph;
        url_pg_content_holder.disabled = true;
        // url_pg_content_holder.textContent = title + "\n" + paragraph;
        console.log(url_pg_content_holder?.value);
      })
      .catch((error: any) => {
        console.error("Error:", error);
      });
  }

  // input section form specifications
  const summarizerCtrlButtons = (
    <div className="justify-left mt-2 space-x-6">
      <button
        className="inline-flex items-center py-1.5 px-3 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md focus:ring-4 focus:ring-teal-200  hover:bg-kaito-brand-ash-green"
        type="submit"
        disabled={isLoading}
      >
        {/* dark:focus:ring-teal-900 */}
        Start summary
      </button>
      <button
        className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-md px-3 py-1.5"
        type="button"
        onClick={stop}
      >
        Stop summary
      </button>
    </div>
  );

  // direct text input form
  const textInputFormSpec = (
    <form className="w-full flex flex-col" onSubmit={handleSubmit}>
      <div className="w-full mb-4 border border-kaito-brand-ash-green rounded-lg bg-gray-50">
        {/* dark:bg-gray-700 dark:border-gray-600 */}
        <div className="px-4 py-2 bg-white rounded-t-lg ">
          {/* dark:bg-gray-800 */}
          <textarea
            id="textInput"
            rows="4"
            className="w-full px-0 text-sm text-kaito-brand-ash-green bg-white border-0  focus:ring-0 focus:ring-inset focus:ring-kaito-brand-ash-green"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste or upload the file of the text you want to summarize..."
            required
          ></textarea>
          {/* dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 */}
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-t ">
          {/* dark:border-gray-600 */}
          {summarizerCtrlButtons}
          <div className="flex pl-0 space-x-1 sm:pl-2">
            <button
              type="button"
              className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-kaito-brand-ash-green  "
              onClick={handleFileInputSelection}
            >
              {/* dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 */}
              {clipIcon}
              <span className="sr-only">Attach file</span>
            </button>

            <button
              type="button"
              className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-kaito-brand-ash-green  "
              onClick={handleUrlInputSelection}
            >
              {/* dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 */}
              {linkIcon}
              <span className="sr-only">paste URL of webpage to summarize</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );

  // text file input form
  const fileInputFormSpec = (
    <form
      className="w-full flex flex-col border border-kaito-brand-ash-green rounded-lg bg-gray-50"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 cursor-pointer bg-gray-50  hover:bg-gray-100 "
        >
          {/* dark:hover:bg-bray-800 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 */}
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {cloudUploadIcon}
            <p className="mb-2 text-sm text-gray-500 ">
              {/* dark:text-gray-400 */}
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 ">
              {/* dark:text-gray-400 */}
              DOC, DOCX, TXT or PDF
            </p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" />
        </label>
      </div>

      <div className="flex items-center justify-between px-3 py-2 border-t ">
        {/* dark:border-gray-600 */}
        {summarizerCtrlButtons}
        <div className="flex pl-0 space-x-1 sm:pl-2">
          <button
            type="button"
            className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-kaito-brand-ash-green  "
            onClick={handleTextInputSelection}
          >
            {/* dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 */}
            {textBodyIcon}
            <span className="sr-only">Paste text</span>
          </button>

          <button
            type="button"
            className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-kaito-brand-ash-green  "
            onClick={handleUrlInputSelection}
          >
            {/* dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 */}
            {linkIcon}
            <span className="sr-only">paste URL of webpage to summarize</span>
          </button>
        </div>
      </div>
    </form>
  );

  const urlInputBox = (
    <>
      <input
        type="url"
        id="urlInput"
        className="bg-white hover:bg-gray-50 text-kaito-brand-ash-green text-sm rounded-t-lg focus:ring-gray-200 focus:border-gray-200 block w-full p-2.5"
        placeholder="Type in URL of webpage to summarize. Example: https//www.***.com"
        onChange={getUrlPgContent}
        required
      />
    </>
  );

  const urlInputFormSpec = (
    <form
      className="w-full flex flex-col border border-kaito-brand-ash-green rounded-lg"
      onSubmit={handleSubmit}
    >
      {urlInputBox}
      {/* <input
        id="url_pg_content_holder"
        type="hidden"
        value={input}
        onChange={handleInputChange}
      /> */}
      {/* dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 */}
      <textarea
        id="url_pg_content_holder"
        rows="4"
        className="w-full px-0 text-sm text-kaito-brand-ash-green bg-gray-100 focus:ring-0 ring-inset focus:ring-inset ring-kaito-brand-ash-green focus:ring-kaito-brand-ash-green"
        value={input}
        onChange={handleInputChange}
        placeholder="  Preview of webpage content appears here ..."
        disabled={true}
      ></textarea>

      <div className="flex items-center justify-between px-3 py-2 border-t ">
        {summarizerCtrlButtons}
        <div className="flex pl-0 space-x-1 sm:pl-2">
          <button
            type="button"
            className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-kaito-brand-ash-green  "
            onClick={handleTextInputSelection}
          >
            {/* dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 */}
            {textBodyIcon}
            <span className="sr-only">Paste text</span>
          </button>

          <button
            type="button"
            className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-kaito-brand-ash-green  "
            onClick={handleFileInputSelection}
          >
            {/* dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 */}
            {clipIcon}
            <span className="sr-only">Attach file</span>
          </button>
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
                  {clipIcon}
                </div>{" "}
                for file upload,{" "}
                <div className="inline-flex text-2xl font-extrabold">
                  {textBodyIcon}
                </div>{" "}
                button for direct text input or {" "}
                <div className="inline-flex text-2xl font-extrabold">{linkIcon}</div>{" "} button for URL of webpage you want to summarize.
              </div>
            </div>
          )};

          {completion.length > 0 && (
            <output className="flex flex-col text-sm sm:text-base text-gray-700 flex-1 gap-y-4 mt-1 gap-x-4 rounded-md bg-gray-50 py-5 px-5 pb-60 grow">
              {completion}
            </output>
          )}

          <footer className="z-10 fixed left-0 right-0 bottom-0 bg-slate-100 border-t-2 border-b-2">
            <div className="container max-w-2xl mx-auto my-auto p-5 pt-9 pb-9">
              {showTextInput && textInputFormSpec}
              {showFileInput && fileInputFormSpec}
              {showUrlInput && urlInputFormSpec}
            </div>
            <Footer />
          </footer>
        </div>
      )}

      {status === "unauthenticated" && redirect("/auth/signIn")};
    </>
  );
};

export default Summarizer;
