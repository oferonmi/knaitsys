"use client"
import { useEffect, useRef, useState } from "react";
import ChatForm from "../../components/ChatForm";
import Message from "../../components/Message";
// import { useCompletion } from "ai/react";

const Chat = () => {
    const bottomRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState(null);

    const [systemPrompt, setSystemPrompt] = useState(
        "You are a helpful assistant who explains concept from first principles."
    );

    //TODO Temporal. Remove once implemented
    const [input, setInput] = useState("");
    const completion = "";

    const generatePrompt = (messages: any[]) => {
        return (
            messages.map((message) =>
                message.isUser ? `[INST] ${message.text} [/INST]` : `${message.text}`
            )
            .join("\n")
        );
    };


    const handleSubmit = async (userMessage: any) => {

        const messageHistory = [...messages];

        // apppend user message.
        // messageHistory.push({
        //     text: userMessage,
        //     isUser: true,
        // });

        // Generate initial prompt
        let prompt = `${generatePrompt(messageHistory)}\n`;
    
        setMessages(messageHistory);

        //TODO generate response from prompt
    
    };

    useEffect(() => {
        if (messages?.length > 0 || completion?.length > 0) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, completion]);

    return (
        <>
            <main className="max-w-2xl pb-5 mx-auto mt-0 mb-0 sm:px-4">
                <div className="text-center"></div>

                <ChatForm prompt={input} setPrompt={setInput} onSubmit={handleSubmit} />

                {error && <div>{error}</div>}

                <article className="pb-24">
                    {messages.map((message, index) => (
                        <Message
                            key={`message-${index}`}
                            message={message.text}
                            isUser={message.isUser}
                        />
                    ))}
                    <Message message={completion} isUser={false} />
                    <div ref={bottomRef} />
                </article>
            </main>
        </>
    );
}

export default Chat;