"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { Footer } from "@/components/Footer";
import { useState } from "react";

export default function RagPage() {
  const [readyToChat, setReadyToChat] = useState(false);

  return (
    <>
      <ChatWindow
        endpoint="/api/rag"
        placeholder={
          "Ask questions about the content of the text/document uploaded."
        }
        emoji="🤖"
        titleText="Chat to your Document"
        readyToChat={readyToChat}
        setReadyToChat={setReadyToChat}
      ></ChatWindow>
      {!readyToChat && <Footer />}
    </>
  );
}
