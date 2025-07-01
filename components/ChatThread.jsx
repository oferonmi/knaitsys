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
            className="flex flex-col w-full mb-4 overflow-y-auto transition-[flex-grow] ease-in-out pt-32 pb-40 text-black dark:text-gray-100"
            style={{ minHeight: '200px' }}
        >
            {messages.length > 0 ? (
                messages.map((m, i) => {
                    // Use index or id for sources if available, else fallback
                    const sourceKey = i.toString();
                    return (
                        <ChatMessageBubble
                            key={m.id}
                            message={m}
                            aiEmoji={sysEmoji}
                            sources={sources && sources[sourceKey]}
                        />
                    );
                })
            ) : (
                <div className="flex flex-1 items-center justify-center text-gray-400 h-32">
                    No messages yet. Start the conversation!
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
}

export default ChatThread;