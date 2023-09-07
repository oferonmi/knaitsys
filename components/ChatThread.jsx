import { useEffect, useRef, useState } from "react";

const ChatThread = ({messages}) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        if (messages?.length > 0 ) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return(
        <div className="flex flex-col text-sm sm:text-base text-gray-700 flex-1 gap-y-4 mt-1 gap-x-4 rounded-md bg-gray-50 py-5 px-5 pb-60 grow">
            {messages.map((m) => (
            <div key={m.id}>
                <b>{m.role === "user" ? "You: " : "KAITO: "}</b>
                {m.content}
            </div>
            ))}

            <div ref={bottomRef} />
        </div>
    );
}

export default ChatThread;