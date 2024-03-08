"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { Footer } from "@/components/Footer";
import { useState } from "react";

export default function RagPage() {

  return (
    <>
      <ChatWindow
        endpoint="/api/rag"
        placeholder={
          "Ask questions about the content of the text/document uploaded."
        }
        emoji="🤖"
        titleText="Chat to your Document"
      ></ChatWindow>
      <Footer />
    </>
  );
}
