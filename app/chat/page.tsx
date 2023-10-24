"use client"
import ChatForm from "@/components/ChatForm";
import ChatThread from "@/components/ChatThread";
import EmptyThreadState from "@/components/EmptyThreadState";
import { Footer } from "@/components/Footer";
import { useChat } from "ai/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";

const ChatbotPage = () => {
  // sessions
  const { data: session, status } = useSession();

  //LLM engine API route
  const [llmApiRoute, setLlmApiRoute] = useState("/api/chat/openai");

  const handleLlmApiChange = (event: { target: { value: any } }) => {
    setLlmApiRoute("/api/chat/"+ event.target.value);
  };

  // use OpenAI chat completion
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: llmApiRoute,
  });

  return (
    <>
      {status === "authenticated" && (
        <div className="flex flex-auto max-w-2xl pt-27 pb-5 mx-auto mt-4 sm:px-4 grow">
          {messages.length == 0 && <EmptyThreadState />}

          {messages.length > 0 && <ChatThread messages={messages} />}

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
                <option value="fireworksai">Llama-2-Fwks</option>
                <option value="huggingface">OpenAssistant-HF</option>
                {/* <option value="anthropic">Claude-1</option> */}
              </select>

              <ChatForm
                userInput={input}
                onChangeHandler={handleInputChange}
                onSubmitHandler={handleSubmit}
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