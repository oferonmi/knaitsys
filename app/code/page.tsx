"use client";
import ChatForm from "@/components/ChatForm";
import ChatThread from "@/components/ChatThread";
import EmptyThreadState from "@/components/EmptyThreadState";
import { Footer } from "@/components/Footer";
import { useChat } from "ai/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Emoji from "@/components/Emoji";

const CodebotPage = () => {
  // sessions
  const { data: session, status } = useSession();

  //LLM engine API route
  const [llmApiRoute, setLlmApiRoute] = useState("/api/chat/openai");
  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});

  const handleLlmApiChange = (event: { target: { value: any } }) => {
    setLlmApiRoute("/api/code_generation/" + event.target.value);
  };

  // use OpenAI chat completion
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: chatEndpointIsLoading,
  } = useChat({
    api: llmApiRoute,
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

  const EmptyThreadState = (
    <div className="mt-12 sm:mt-24 space-y-6 text-gray-500 text-base mx-8 sm:mx-4 sm:text-2xl leading-12 flex flex-col mb-12 sm:mb-24 h-screen">
      <p>
        <Emoji symbol="👋" label="waving hand" /> Hello! Here you would find LLMs fine-tuned to answer queries related to coding tasks. Choose one of them and
        post your message/questions in the chat box below, and get a response,
        that hopefully helps with your software development.
      </p>
    </div>
);

  return (
    <>
      {status === "authenticated" && (
        <div
          // className="flex flex-auto max-w-2xl pt-27 pb-5 mx-auto mt-4 sm:px-4 grow"
          className="flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden text-black"
        >
          {messages.length == 0 && EmptyThreadState}

          {messages.length > 0 && (
            <ChatThread
              messages={messages}
              sysEmoji="🥸"
              sources={sourcesForMessages}
            />
          )}

          <div className="z-10 fixed left-0 right-0 bottom-0 bg-gray-100 border-t-2 border-b-2">
            <div className="container flex max-w-3xl mx-auto my-auto p-5 pt-9 pb-9">
              {/* <label className="text-black" htmlFor="llm-selector">Select LLM: </label> */}
              <select
                onChange={handleLlmApiChange}
                className="inline-flex items-center py-1.5 px-2 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green mr-2 "
                id="llm-selector"
                required
              >
                <option value="">--Select LLM--</option>
                <option value="code_llamaII_70b_instruct">
                  Code-Llama2-70b-Fwks
                </option>
                <option value="starcoder_7b_int8">StarCoder-7b-Int8-Fwks</option>
              </select>

              <ChatForm
                userInput={input}
                onChangeHandler={handleInputChange}
                onSubmitHandler={handleSubmit}
                isLoading={chatEndpointIsLoading}
              />
            </div>
            <Footer />
          </div>
        </div>
      )}
      {status === "unauthenticated" && redirect("/auth/signIn")};
    </>
  );
};

export default CodebotPage;
