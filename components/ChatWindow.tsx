"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useChat } from "ai/react";
import { useRef, useState, ReactElement } from "react";
import type { FormEvent } from "react";

import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { TextUploadForm } from "@/components/TextUploadForm";
import { EmbedPdfsForm } from "@/components/EmbedPdfsForm";

export function ChatWindow(props: {
  endpoint: string;
  placeholder?: string;
  titleText?: string;
  emoji?: string;
}) {
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

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

  const embedForm = showDocEmbedForm && (
    <EmbedPdfsForm setReadyToChat={setReadyToChat} />
  );
  const ingestForm = showIngestForm && (
    <TextUploadForm setReadyToChat={setReadyToChat} />
  );

  const emptyStateComponent = (
    <>
      <div className="p-4 md:p-8 rounded bg-[#25252d00] w-full max-h-[85%] overflow-hidden">
        <h1 className="text-3xl md:text-4xl mb-4 text-gray-500">
          Explore your document by Chatting to it.
        </h1>

        <p className="text-gray-500">
          Paste the a body of text in the textarea below and click upload or,
          upload the PDF of a document and click embed. Then try asking any
          question about the content of the uploaded text/document.
        </p>

        <br></br>

        {messages.length === 0 && embedForm}
        {messages.length === 0 && ingestForm}

        {showDocEmbedForm && (
          <button
            className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-4"
            type="button"
            onClick={() => {
              setShowIngestForm(true);
              setShowDocEmbedForm(false);
            }}
          >
            Text Upload
          </button>
        )}
        {showIngestForm && (
          <button
            className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-4 py-4"
            type="button"
            onClick={() => {
              setShowDocEmbedForm(true);
              setShowIngestForm(false);
            }}
          >
            PDF Upload
          </button>
        )}
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
        className="flex flex-col-reverse w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out"
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

      <div className="flex w-full sticky bottom-0">
        <form onSubmit={sendMessage} className="flex w-full flex-col">
          <div className="flex w-full m-auto px-20 py-10 ">
            <input
              className="grow mr-2 p-4 rounded-full border border-kaito-brand-ash-green"
              value={input}
              placeholder={placeholder ?? "What is truth?"}
              onChange={handleInputChange}
            />
            <button
              type="submit"
              className="shrink-0 px-4 py-4 bg-kaito-brand-ash-green text-gray-200 rounded-full w-14"
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
                  width="24"
                  height="24"
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
