"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "flowbite-react";

import { useChat } from "ai/react";
import { useRef, useState, useEffect, ReactElement } from "react";
import type { FormEvent } from "react";

// import { useRouter } from "next/router";
import { useRouter, usePathname } from 'next/navigation';

import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { TextUploadForm } from "@/components/TextUploadForm";
import { EmbedPdfsForm } from "@/components/EmbedPdfsForm";
import { Footer } from "@/components/Footer";

export function ChatWindow(props: {
  endpoint: string;
  placeholder?: string;
  titleText?: string;
  emoji?: string;
}) {
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const {
    endpoint,
    placeholder,
    titleText = "An LLM",
    emoji,
  } = props;

  const [readyToChat, setReadyToChat] = useState(false);
  const [showIngestForm, setShowIngestForm] = useState(true);
  const [showDocEmbedForm, setShowDocEmbedForm] = useState(!showIngestForm);
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
    api: endpoint,
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

  const embedForm = showDocEmbedForm && (
    <EmbedPdfsForm setReadyToChat={setReadyToChat} />
  );
  const ingestForm = showIngestForm && (
    <TextUploadForm setReadyToChat={setReadyToChat} />
  );

  const emptyStateComponent = (
    <>
      <div className="flex flex-col w-full">
        <div className="p-4 md:p-8 rounded bg-[#25252d00] w-full max-h-[85%] overflow-hidden">
          <h1 className="text-3xl md:text-4xl mb-4 text-gray-700">
            Explore your document by Chatting to it.
          </h1>

          <p className="text-black text-xl">
            Paste the a body of text in the textarea below or upload the PDF of
            a document (click PDF Upload) and click upload. A chat interface
            appears with successfull upload, try asking any question about the
            content of the uploaded text/document.
          </p>

          <br></br>

          {messages.length === 0 && embedForm}
          {messages.length === 0 && ingestForm}
        </div>

        <div className="flex gap-2 px-4 md:px-8 w-full">
          <Tooltip content="Chat with Corpus" className="inline-flex">
            <button
              className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-5 py-5 ml-2"
              type="button"
              onClick={() => {
                setReadyToChat(true);
              }}
            >
              {/* Chat with Corpus */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-chat-text"
                viewBox="0 0 16 16"
              >
                <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105" />
                <path d="M4 5.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8m0 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5" />
              </svg>
            </button>
          </Tooltip>

          {showDocEmbedForm && (
            <Tooltip content="Upload Text" className="inline-flex">
              <button
                className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-5 py-5"
                type="button"
                onClick={() => {
                  setShowIngestForm(true);
                  setShowDocEmbedForm(false);
                }}
              >
                {/* Text Upload */}
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
                    d="M0 .5A.5.5 0 0 1 .5 0h4a.5.5 0 0 1 0 1h-4A.5.5 0 0 1 0 .5m0 2A.5.5 0 0 1 .5 2h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m9 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-9 2A.5.5 0 0 1 .5 4h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m5 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m7 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-12 2A.5.5 0 0 1 .5 6h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5m8 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-8 2A.5.5 0 0 1 .5 8h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m7 0a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-7 2a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"
                  />
                </svg>
              </button>
            </Tooltip>
          )}

          {showIngestForm && (
            <Tooltip content="Upload PDF File" className="inline-flex">
              <button
                className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-5 py-5"
                type="button"
                onClick={() => {
                  setShowDocEmbedForm(true);
                  setShowIngestForm(false);
                }}
              >
                {/* PDF Upload */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-file-earmark-arrow-up"
                  viewBox="0 0 16 16"
                >
                  <path d="M8.5 11.5a.5.5 0 0 1-1 0V7.707L6.354 8.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 7.707z" />
                  <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                </svg>
              </button>
            </Tooltip>
          )}
        </div>
        {/* {!readyToChat && <Footer />} */}
      </div>
    </>
  );

  async function sendMessage(e: FormEvent<HTMLFormElement>) {

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
  }

  const textUploadComponent = (
    <>
      {messages.length === 0 && emptyStateComponent}
      {messages.length === 0 && embedForm}
      {messages.length === 0 && ingestForm}
    </>
  );

  const chatInterfaceComponent = (
    <>
      <div
        className="flex flex-col-reverse w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out pb-20"
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

        {/* <div ref={bottomRef} /> */}
      </div>
      <div ref={bottomRef} />

      <div
        // className="flex w-full sticky bottom-0"
        className="z-10 fixed left-0 right-0 bottom-0 bg-gray-100 border-t-2 border-b-2"
      >
        <div className="container flex max-w-3xl mx-auto my-auto p-5 pt-9 pb-9">
          <form
            onSubmit={sendMessage}
            // className="flex w-full flex-col"
            className="w-full flex space-x-2"
          >
            <div className="flex w-full m-auto gap-2">
              <Tooltip content="Upload Corpus" className="inline-flex">
                <button
                  className=" px-5 py-5 bg-kaito-brand-ash-green text-gray-200 rounded-full ml-2"
                  type="button"
                  onClick={() => {
                    setShowIngestForm(true);
                    setShowDocEmbedForm(false);
                    setMessages([]);
                    setReadyToChat(false);
                  }}
                >
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
                </button>
              </Tooltip>

              <input
                className="grow px-4 py-1.5 rounded-full border border-kaito-brand-ash-green text-kaito-brand-ash-green"
                value={input}
                placeholder={placeholder ?? "What is truth?"}
                onChange={handleInputChange}
              />
              <button
                type="submit"
                className=" px-5 py-5 bg-kaito-brand-ash-green text-gray-200 rounded-full"
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
                <span className={chatEndpointIsLoading ? "hidden" : ""}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-send-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
                  </svg>
                </span>
              </button>
            </div>
          </form>
        </div>
        {readyToChat && <Footer />}
      </div>
    </>
  );

  return (
    <div
      className={`flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden text-black ${
        readyToChat ? "border" : ""
      }`}
    >
      <h2 className={`${readyToChat ? "" : "hidden"} text-2xl`}>
        {emoji} {titleText}
      </h2>

      {readyToChat ? chatInterfaceComponent : emptyStateComponent}

      <ToastContainer />
    </div>
  );
}
