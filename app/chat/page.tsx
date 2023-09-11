"use client"
import ChatForm from "../../components/ChatForm";
import ChatThread from "../../components/ChatThread";
import EmptyThreadState from "../../components/EmptyThreadState";
import { useChat } from "ai/react";


const Chat = () => {

    // use LLM chat completion
    const { messages, input, handleInputChange, handleSubmit } = useChat({
      api: "/api/chat",
    });

    return (
      <>
        <div className="flex flex-auto max-w-2xl pb-5 mx-auto mt-4 sm:px-4 grow">
          {messages.length == 0 && <EmptyThreadState />}

          {messages.length > 0 && <ChatThread messages={messages} />}

          <ChatForm
            userInput={input}
            onChangeHandler={handleInputChange}
            onSubmitHandler={handleSubmit}
          />
        </div>
      </>
    );
}

export default Chat;