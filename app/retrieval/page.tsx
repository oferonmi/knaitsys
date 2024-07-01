"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function RetrievalPage() {
  // sessions
  const { data: session, status } = useSession();

  const [readyToChat, setReadyToChat] = useState(false);
  const [apiEndPoint, setApiEndPoint] = useState(
    "/api/chat/retrieval/remote_retrieval"
  );

  return (
    <>
      {status === "authenticated" && (
        <ChatWindow
          endPoint={apiEndPoint}
          setEndPoint={setApiEndPoint}
          placeholder={
            "Ask questions about the content of the text/document uploaded."
          }
          emoji="🤖"
          titleText="Chat to your Document"
          readyToChat={readyToChat}
          setReadyToChat={setReadyToChat}
        ></ChatWindow>
      )}
      {status === "unauthenticated" && redirect("/auth/signIn")}
      {!readyToChat && <Footer />}
    </>
  );
}
