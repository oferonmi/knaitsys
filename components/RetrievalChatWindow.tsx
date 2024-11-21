"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "flowbite-react";

import { useChat } from "ai/react";
import { useRef, useState, useEffect, ReactElement } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";

import { useRouter, usePathname } from 'next/navigation';

import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { TextUploadForm } from "@/components/TextUploadForm";
import { EmbedPdfsForm } from "@/components/EmbedPdfsForm";
import { WebpageUploadForm } from "@/components/WebpageUploadForm";
import { SearchIndexUploadForm } from "@/components/SearchIndexUploadForm";
import { Footer } from "@/components/Footer";

export function RetrievalChatWindow(props: {
  endPoint: string;
  setEndPoint: Dispatch<SetStateAction<string>>;
  placeholder?: string;
  titleText?: string;
  emoji?: string;
  readyToChat: boolean;
  setReadyToChat: Dispatch<SetStateAction<boolean>>;
}) {
  
  const {
    endPoint,
    setEndPoint,
    placeholder,
    titleText = "An LLM",
    emoji,
    readyToChat,
    setReadyToChat,
  } = props;

  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const [showIngestForm, setShowIngestForm] = useState(true);
  const [showDocEmbedForm, setShowDocEmbedForm] = useState(false);
  const [showUrlEntryForm, setShowUrlEntryForm] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading: chatEndpointIsLoading,
    setMessages,
  } = useChat({
    api: endPoint,
    onResponse(response) {
      const sourcesHeader = response.headers.get("x-sources");
      const sources = sourcesHeader ? JSON.parse(atob(sourcesHeader)) : [];
      const messageIndexHeader = response.headers.get("x-message-index");

      if (sources.length && messageIndexHeader !== null) {
        setSourcesForMessages({
          ...sourcesForMessages,
          [messageIndexHeader]: sources,
        });
      }
    },
    onError: (e) => {
      toast(e.message, {
        theme: "dark",
      });
    },
  });

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messages?.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add("grow");
    }

    if (!messages.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (chatEndpointIsLoading) {
      return;
    }

    handleSubmit(e);
  };

  const embedForm = showDocEmbedForm && (
    <EmbedPdfsForm setReadyToChat={setReadyToChat} />
  );
  const ingestForm = showIngestForm && (
    <TextUploadForm setReadyToChat={setReadyToChat} />
  );
  const urlForm = showUrlEntryForm && (
    <WebpageUploadForm setReadyToChat={setReadyToChat} />
  );
  const searchForm = showSearchForm && (
    <SearchIndexUploadForm setReadyToChat={setReadyToChat} setEndPoint={setEndPoint}/>
  );

  const navSideBar = (
    <div
      // className={`flex ${
      //   showUrlEntryForm || showSearchForm ? "justify-center" : ""
      // } gap-2 px-4 md:px-8 grow-0`}
      className="flex grow-0 gap-2 ml-2.5 border-r border-slate-300 h-screen"
    >
      <ul>
        <li className="p-3">
          <Tooltip content="Upload Text" className="inline-flex">
            <button
              className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-3"
              type="button"
              onClick={() => {
                setShowIngestForm(true);
                setShowDocEmbedForm(false);
                setShowUrlEntryForm(false);
                setShowSearchForm(false);
              }}
            >
              <i className="bi bi-body-text"></i>
              <span className="sr-only">Paste text</span>
            </button>
          </Tooltip>
        </li>

        <li className="p-3">
          <Tooltip content="Upload PDF File" className="inline-flex">
            <button
              className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-3"
              type="button"
              onClick={() => {
                setShowDocEmbedForm(true);
                setShowIngestForm(false);
                setShowUrlEntryForm(false);
                setShowSearchForm(false);
              }}
            >
              <i className="bi bi-file-earmark-arrow-up"></i>
              <span className="sr-only">Upload PDF</span>
            </button>
          </Tooltip>
        </li>

        <li className="p-3">
          <Tooltip content="Upload a Webpage Content" className="inline-flex">
            <button
              className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-3"
              type="button"
              onClick={() => {
                setShowUrlEntryForm(true);
                setShowDocEmbedForm(false);
                setShowIngestForm(false);
                setShowSearchForm(false);
              }}
            >
              <i className="bi bi-globe2"></i>
              <span className="sr-only">Upload Webpage</span>
            </button>
          </Tooltip>
        </li>

        <li className="p-3">
          <Tooltip content="Upload Web Search Result" className="inline-flex">
            <button
              className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-3"
              type="button"
              onClick={() => {
                setShowSearchForm(true);
                setShowDocEmbedForm(false);
                setShowIngestForm(false);
                setShowUrlEntryForm(false);
              }}
            >
              <i className="bi bi-search"></i>
              <span className="sr-only">Upload Web Search Result</span>
            </button>
          </Tooltip>
        </li>

        <li className="p-3">
          <Tooltip content="Chat to Corpus" className="inline-flex">
            <button
              className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-3"
              type="button"
              onClick={() => {
                setReadyToChat(true);
              }}
            >
              <i className="bi bi-chat-text"></i>
              <span className="sr-only">Chat to Corpus</span>
            </button>
          </Tooltip>
        </li>
      </ul>
    </div>
  );

  const emptyStateComponent = (
    <>
      <div className="flex items-center top-0 bottom-0">
        {/* side bar */}
        {navSideBar}

        {/* main section */}
        <div className="flex flex-col p-4 md:p-8 bg-[#25252d00] overflow-hidden grow h-screen max-w-2xl mx-auto flex-auto">
          <h1 className="text-center text-3xl md:text-3xl mb-4 text-gray-700 ">
            Chat to your documents and the web.
          </h1>

          <p className="text-black text-lg text-center">
            Upload text corpuses using options on the left. A chat interface
            appears on successfull upload, so you can ask questions about the
            uploaded content.
          </p>

          <br></br>

          {messages.length === 0 && embedForm}
          {messages.length === 0 && ingestForm}
          {messages.length === 0 && urlForm}
          {messages.length === 0 && searchForm}
        </div>
      </div>
      {/* {!readyToChat && <Footer />} */}
    </>
  );

  const chatInterfaceComponent = (
    <>
      <div className="flex flex-col w-full">
        {/* Chat Thread */}
        <div
          className="flex flex-col-reverse w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out pb-40 text-black p-4 md:p-8"
          ref={messageContainerRef}
        >
          {messages.length > 0
            ? [...messages].reverse().map((m, i) => {
                const sourceKey = (messages.length - 1 - i).toString();
                return (
                  <ChatMessageBubble
                    key={m.id}
                    message={m}
                    aiEmoji={emoji}
                    sources={sourcesForMessages[sourceKey]}
                  ></ChatMessageBubble>
                );
              })
            : ""}
        </div>

        <div ref={bottomRef} />

        <div className=" fixed bottom-0 w-full">
          <form
            onSubmit={sendMessage}
            className=" border border-gray-300 rounded-lg shadow-xl  space-x-2 text-black mb-20 container flex max-w-3xl  p-5 pt-9 pb-9 w-1/2 mx-auto"
            id="chat-form"
          >
            <div className="flex w-full m-auto gap-2 ">
              <Tooltip content="Clear Chat Thread" className="inline-flex">
                <button
                  className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-6 py-5 mr-2 "
                  type="button"
                  onClick={() => {
                    setMessages([]);
                  }}
                >
                  <i className="bi bi-trash3-fill"></i>
                  <span className="sr-only">Clear Chat Thread</span>
                </button>
              </Tooltip>

              <Tooltip content="Upload Corpus" className="inline-flex">
                <button
                  className=" px-6 py-5 bg-kaito-brand-ash-green text-gray-200 rounded-full ml-2"
                  type="button"
                  onClick={() => {
                    setShowIngestForm(true);
                    setShowDocEmbedForm(false);
                    setShowUrlEntryForm(false);
                    setShowSearchForm(false);
                    setMessages([]);
                    setReadyToChat(false);
                  }}
                >
                  <i className="bi bi-upload"></i>
                  <span className="sr-only">Upload Corpus</span>
                </button>
              </Tooltip>

              <input
                className="grow px-4 py-1.5 rounded-full border border-kaito-brand-ash-green text-kaito-brand-ash-green focus:bg-white"
                id="chat-textbox"
                value={input}
                placeholder={placeholder ?? "What is truth?"}
                onChange={handleInputChange}
              />

              <button
                type="submit"
                className=" px-6 py-5 bg-kaito-brand-ash-green text-gray-200 rounded-full"
              >
                <div
                  role="status"
                  className={`${
                    chatEndpointIsLoading ? "" : "hidden"
                  } flex justify-center`}
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
                <div className={chatEndpointIsLoading ? "hidden" : ""}>
                  <i className="bi bi-send-fill"></i>
                  <span className="sr-only">Send Message</span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div 
        className={`w-full min-h-screen text-black ${readyToChat ? "border" : ""}`}
      >
        <h2
          className={`${
            readyToChat ? "" : "hidden"
          } text-2xl flex justify-center mt-2`}
        >
          {emoji} {titleText}
        </h2>

        {readyToChat ? (
          chatInterfaceComponent 
        ) : (
          emptyStateComponent
        )}

        <ToastContainer />
      </div>
      <div className="w-full bottom-0"><Footer /></div>
    </>
  );
}
