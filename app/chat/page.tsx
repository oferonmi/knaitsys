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
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css';

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

  const keyChatFormWidgets = (
    <>
      <select
        onChange={handleLlmApiChange}
        className="inline-flex items-center py-5 px-2 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green mr-2 "
        id="llm-selector"
        required
      >
        <option value="">--Select LLM--</option>
        <option value="chat/openai">GPT-3.5</option>
        <option value="multimodal/chat/openai">GPT-4o-mini</option>
        {/* <option value="replicate">Llama-2-Rplcte</option> */}
        <option value="chat/llama3_fireworks">Llama-3-Fwks</option>
        <option value="chat/llama3_groq">Llama-3-Groq</option>
        <option value="multimodal/chat/llama3_groq">Llama-3.2-Groq</option>
        {/* <option value="chat/qwen2_fireworks">Qwen-2-Fwks</option> */}
        <option value="chat/qwen2">Qwen-2-Ollama</option>
        <option value="chat/mixtral_MoE8x7B_Instruct_fireworks">
          Mixtral-MoE8x7B-Fwks
        </option>
        <option value="multimodal/chat/llava">Llava-Ollama</option>
        <option value="multimodal/chat/phi3">Phi3-Ollama</option>
        {/* <option value="chat/gemma_7b_instruct_fireworks">Gemma-7b-Fwks</option> */}
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
    </>
  );

  const landingSectionUI = (
    <div className="flex flex-col justify-center items-center md:p-8  min-h-screen max-w-3xl mx-auto my-auto ">
      <h1 className="text-center text-3xl md:text-3xl mb-4 text-gray-700">
        Query or Question a Gen AI Text Chatbot
      </h1>

      <p className="text-black text-lg text-center">
        Switch between LLMs by selecting each from the dropdown menu, then ask away.
      </p>

      <br></br>

      <div
        className="w-full max-w-3xl border border-gray-300 rounded-lg shadow-xl space-x-2 text-black flex justify-center items-center pt-9 pb-9 px-5"
      >
        {keyChatFormWidgets}
      </div>
    </div>
  );

  return (
    <>
      {status === "authenticated" && (
        <>
          {/* <div className="flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden text-black min-h-screen"> */}
            {messages.length == 0 && landingSectionUI}

            {messages.length > 0 && (
              <>
                <div className="flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden text-black min-h-screen">
                  <ChatThread
                    messages={messages}
                    sysEmoji="🤖"
                    sources={sourcesForMessages} 
                  />

                  <div
                    className="fixed bottom-0 border border-gray-300 rounded-lg shadow-xl  space-x-2 text-black mb-20 container flex max-w-3xl mx-auto my-auto p-5 pt-9 pb-9"
                  >
                    <Tooltip content="Clear Chat Thread" className="inline-flex">
                      <button
                        className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-6 py-5 mr-2"
                        type="button"
                        onClick={() => { setMessages([]); } }
                      >
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                    </Tooltip>

                    {/* main chat form widgets */}
                    {keyChatFormWidgets}
                  </div>
                </div>
              </>
            )}  
          {/* </div> */}
          <div className="w-full bottom-0"><Footer /></div>
        </>
      )}
      {status === "unauthenticated" && redirect("/auth/signIn")}
    </>
  );
}

export default ChatbotPage;