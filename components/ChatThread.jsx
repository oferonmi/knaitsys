import { useEffect, useRef, useState } from "react";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import Emoji from "./Emoji";

const ChatThread = ({messages, sysEmoji, sources}) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        if (messages?.length > 0 ) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return(
        <div 
            className="flex flex-col w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out pt-32 pb-40 text-black"
        >
            {messages.length > 0
                ? [...messages].map((m, i) => {
                    const sourceKey = (messages.length - 1 - i).toString();
                    return (
                        <ChatMessageBubble
                            key={m.id}
                            message={m}
                            aiEmoji={sysEmoji}
                            sources={sources[sourceKey]}
                        ></ChatMessageBubble>
                    );
                })
            : ""}

            <div ref={bottomRef} />
        </div>
    );
}

export default ChatThread;