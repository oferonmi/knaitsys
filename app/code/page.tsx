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
  const [llmApiRoute, setLlmApiRoute] = useState(
    "/api/code_gen/codellama_II_fireworks"
  );
  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});

  const handleLlmApiChange = (event: { target: { value: any } }) => {
    setLlmApiRoute("/api/" + event.target.value);
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
        <Emoji symbol="👋" label="waving hand" /> Hello! Here you would find LLMs fine-tuned to answer queries related to coding tasks. Choose any and make you queries to get help with software development.
      </p>
    </div>
);

  return (
    <>
      {status === "authenticated" && (
        <>
          <div
            className="flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden text-black min-h-screen"
          >
            {messages.length == 0 && EmptyThreadState}

            {messages.length > 0 && (
              <ChatThread
                messages={messages}
                sysEmoji="🤖"
                sources={sourcesForMessages}
              />
            )}

            <div 
              className="fixed bottom-0 border border-gray-300 rounded-lg shadow-xl  space-x-2 text-black mb-20 container flex max-w-3xl mx-auto my-auto p-5 pt-9 pb-9"
            >
                <select
                  onChange={handleLlmApiChange}
                  className="inline-flex items-center py-1.5 px-2 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green mr-2 "
                  id="llm-selector"
                  required
                >
                  <option value="">--Select LLM--</option>
                  <option value="multimodal/chat/openai">GPT-4o-mini</option>
                  <option value="code_gen/codellama">
                    CodeLlama7B-Ollama
                  </option>
                  {/* <option value="code_gen/codellama_fireworks">
                    CodeLlama13B-Fwks
                  </option> */}
                  <option value="code_gen/qwen2.5coder">
                    Qwen2.5Coder-Ollama
                  </option>
                  {/* <option value="code_gen/codegemma">
                    CodeGemma-Ollama
                  </option> */}
                  {/* <option value="code_gen/starcoder_7b_int8">StarCoder-7b-Fwks</option> */}
                </select>

                <ChatForm
                  userInput={input}
                  onChangeHandler={handleInputChange}
                  onSubmitHandler={handleSubmit}
                  isLoading={chatEndpointIsLoading}
                />
            </div>
          </div>
          <div className="w-full bottom-0"><Footer /></div>
        </>
      )}
      {status === "unauthenticated" && redirect("/auth/signIn")}
    </>
  );
}

export default CodebotPage;
