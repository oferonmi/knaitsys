"use client"
import ChatForm from "../../components/ChatForm";
import ChatThread from "../../components/ChatThread";
import EmptyThreadState from "../../components/EmptyThreadState";
import { useChat } from "ai/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const Chat = () => {
  // sessions
  const { data: session, status } = useSession();

  // use LLM chat completion
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  });

  return (
    <>
      {status === "authenticated" && (
        <div className="flex flex-auto max-w-2xl pb-5 mx-auto mt-4 sm:px-4 grow">
          {messages.length == 0 && <EmptyThreadState />}

          {messages.length > 0 && <ChatThread messages={messages} />}

          <ChatForm
            userInput={input}
            onChangeHandler={handleInputChange}
            onSubmitHandler={handleSubmit}
          />
        </div>
      )}
      {status === "unauthenticated" && redirect("/auth/signIn")};
    </>
  );
}

export default Chat;