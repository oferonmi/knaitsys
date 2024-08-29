"use client"
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
import { Tooltip } from "flowbite-react";

const ChatbotPage = () => {
  // sessions
  const { data: session, status } = useSession();

  //LLM engine API route
  const [llmApiRoute, setLlmApiRoute] = useState("/api/chat/openai");
  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});

  const handleLlmApiChange = (event: { target: { value: any } }) => {
    setLlmApiRoute("/api/"+ event.target.value);
  };

  // use OpenAI chat completion
  const {
    messages,
    setMessages,
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

  return (
    <>
      {status === "authenticated" && (
        <div className="flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden text-black">
          {messages.length == 0 && <EmptyThreadState />}

          {messages.length > 0 && (
            <ChatThread
              messages={messages}
              sysEmoji="🤖"
              sources={sourcesForMessages}
            />
          )}

          <div className="z-10 fixed left-0 right-0 bottom-0 bg-gray-100 bg-opacity-60 border-t-2 border-b-1">
            <div className="container flex max-w-3xl mx-auto my-auto p-5 pt-9 pb-9">
              <Tooltip content="Clear Chat Thread" className="inline-flex">
                <button
                  className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-5 py-5 mr-2"
                  type="button"
                  onClick={() => {setMessages([]);}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                  </svg>
                </button>
              </Tooltip>

              {/* <label className="text-black" htmlFor="llm-selector">Select LLM: </label> */}
              <select
                onChange={handleLlmApiChange}
                className="inline-flex items-center py-1.5 px-2 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green mr-2 "
                id="llm-selector"
                required
              >
                <option value="">--Select LLM--</option>
                <option value="chat/openai">GPT-3.5</option>
                <option value="multimodal/chat/openai">GPT-4o-mini</option>
                {/* <option value="replicate">Llama-2-Rplcte</option> */}
                <option value="chat/llamaIII_fireworks">Llama-3-Fwks</option>
                <option value="chat/llamaIII_groq">Llama-3-Groq</option>
                {/* <option value="chat/qwen_72b_fireworks">Qwen-72b-Fwks</option> */}
                <option value="chat/mixtral_MoE8x7B_Instruct_fireworks">
                  Mixtral-MoE8x7B-Fwks
                </option>
                <option value="multimodal/chat/llava">Llava-Ollama</option>
                <option value="multimodal/chat/phi3">Phi3-Ollama</option>
                {/* <option value="chat/gemma_7b_instruct_fireworks">
                  Gemma-7b-Fwks
                </option> */}
                {/* <option value="chat/langchain">LangChain</option> */}
                <option value="chat/huggingface">OpenAssistant-HF</option>
                {/* <option value="chat/anthropic">Claude-1</option> */}
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
      {status === "unauthenticated" && redirect("/auth/signIn")}
    </>
  );
}

export default ChatbotPage;