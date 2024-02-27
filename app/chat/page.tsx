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

const ChatbotPage = () => {
  // sessions
  const { data: session, status } = useSession();

  //LLM engine API route
  const [llmApiRoute, setLlmApiRoute] = useState("/api/chat/openai");
  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});

  const handleLlmApiChange = (event: { target: { value: any } }) => {
    setLlmApiRoute("/api/chat/"+ event.target.value);
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
                <option value="openai">GPT-3.5</option>
                {/* <option value="replicate">Llama-2-Rplcte</option> */}
                <option value="llamaII_fireworks">Llama-2-70b-Fwks</option>
                <option value="qwen_72b_fireworks">Qwen-72b-Fwks</option>
                <option value="mixtral_MoE8x7B_Instruct_fireworks">
                  Mixtral-MoE8x7B-Fwks
                </option>
                <option value="langchain">LangChain</option>
                <option value="huggingface">OpenAssistant-HF</option>
                {/* <option value="anthropic">Claude-1</option> */}
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
}

export default ChatbotPage;