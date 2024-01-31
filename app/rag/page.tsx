"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { Footer } from "@/components/Footer";
import { useState } from "react";

export default function AgentsPage() {

  return (
    <>
      <ChatWindow
        endpoint="api/rag"
        placeholder={
          "Ask questions about the content of the document you've just uploaded."
        }
        emoji="🥸"
        titleText="Chat to your Document"
      ></ChatWindow>
      {/* <Footer /> */}
    </>
  );
}
