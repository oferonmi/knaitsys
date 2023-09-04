"use client"
import { useEffect, useRef, useState } from "react";
import ChatForm from "../../components/ChatForm";
// import Message from "../../components/Message";
import EmptyChatState from "../../components/EmptyChatState";
import { useChat } from "ai/react";


const Chat = () => {

    const bottomRef = useRef(null);

    // use LLM chat completion
    const { messages, input, handleInputChange, handleSubmit } = useChat({
      api: "/api/chat",
    });

    useEffect(() => {
        if (messages?.length > 0 ) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
      <>
        <div className="flex flex-col bg-teal-100">
          <div className="grow max-w-2xl mx-auto mt-4 sm:px-4">
            <div className="text-center"></div>

            {messages.length == 0 && <EmptyChatState />}

            <div className="flex flex-col text-sm sm:text-base text-gray-500 flex-1 gap-y-4 mt-1 gap-x-4 rounded-md bg-gray-50 py-5 px-5 pb-60">
              {messages.map((m) => (
                <div key={m.id}>
                  {m.role === "user" ? "User: " : "KAITO: "}
                  {m.content}
                </div>
              ))}

              <div ref={bottomRef} />
            </div>

            <ChatForm
              userInput={input}
              onChangeHandler={handleInputChange}
              onSubmitHandler={handleSubmit}
            />

            {/* <form onSubmit={handleSubmit}>
              <label>
                Say something...
                <input value={input} onChange={handleInputChange} />
              </label>
              <button type="submit">Send</button>
            </form> */}
          </div>
        </div>
      </>
    );
}

export default Chat;