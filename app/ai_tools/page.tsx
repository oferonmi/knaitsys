"use client"
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const AiTools = () => {
  // sessions
  const { data: session, status } = useSession();

  // icons
  const chatIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      fill="currentColor"
      className="bi bi-chat-text-fill"
      viewBox="0 0 16 16"
    >
      <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4z" />
    </svg>
  );

  const fileIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      fill="currentColor"
      className="bi bi-file-earmark-text-fill"
      viewBox="0 0 16 16"
    >
      <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1h-4z" />
    </svg>
  );

  const micIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      fill="currentColor"
      className="bi bi-mic-fill"
      viewBox="0 0 16 16"
    >
      <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z" />
      <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" />
    </svg>
  );

  const videoIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      fill="currentColor"
      className="bi bi-film"
      viewBox="0 0 16 16"
    >
      <path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z" />
    </svg>
  );

  const imagesIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      fill="currentColor"
      className="bi bi-images"
      viewBox="0 0 16 16"
    >
      <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
      <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z" />
    </svg>
  );

  const softwareIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      fill="currentColor"
      className="bi bi-braces-asterisk"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M1.114 8.063V7.9c1.005-.102 1.497-.615 1.497-1.6V4.503c0-1.094.39-1.538 1.354-1.538h.273V2h-.376C2.25 2 1.49 2.759 1.49 4.352v1.524c0 1.094-.376 1.456-1.49 1.456v1.299c1.114 0 1.49.362 1.49 1.456v1.524c0 1.593.759 2.352 2.372 2.352h.376v-.964h-.273c-.964 0-1.354-.444-1.354-1.538V9.663c0-.984-.492-1.497-1.497-1.6ZM14.886 7.9v.164c-1.005.103-1.497.616-1.497 1.6v1.798c0 1.094-.39 1.538-1.354 1.538h-.273v.964h.376c1.613 0 2.372-.759 2.372-2.352v-1.524c0-1.094.376-1.456 1.49-1.456v-1.3c-1.114 0-1.49-.362-1.49-1.456V4.352C14.51 2.759 13.75 2 12.138 2h-.376v.964h.273c.964 0 1.354.444 1.354 1.538V6.3c0 .984.492 1.497 1.497 1.6ZM7.5 11.5V9.207l-1.621 1.621-.707-.707L6.792 8.5H4.5v-1h2.293L5.172 5.879l.707-.707L7.5 6.792V4.5h1v2.293l1.621-1.621.707.707L9.208 7.5H11.5v1H9.207l1.621 1.621-.707.707L8.5 9.208V11.5h-1Z"
      />
    </svg>
  );

  const aiToolsSdkPgContent = (
    <div className="flex flex-col bg-teal-100 bg-cover bg-center items-center justify-center h-screen">
      <div className="font-mono text-3xl text-gray-700 max-w-2xl pb-5 mx-auto mt-4 sm:px-4">
        AI Tools kit.
      </div>

      <div className="mt-2 text-xl text-black">
        Choose your preferred Natural Language Interface (NLI) for your
        knowledge work.
      </div>

      <div className="grid grid-flow-col justify-items-stretch place-items-center gap-4 max-w-2xl pb-5 mx-auto mt-4 sm:px-4 text-gray-700">
        <div className="border-hidden border-2 hover:border-dotted border-gray-700 rounded-md text-center justify-self-center">
          <Link href="/chat">
            {chatIcon}
            <p>Chat</p>
          </Link>
        </div>
        <div className="border-hidden border-2 hover:border-dotted border-gray-700 rounded-md text-center justify-self-center">
          <Link href="/summarizer">
            {fileIcon}
            <p>Summarizer</p>
          </Link>
        </div>
        <div className="border-hidden border-2 hover:border-dotted border-gray-700 rounded-md text-center justify-self-center">
          {micIcon}
          <p>Audio</p>
        </div>
        <div className="border-hidden border-2 hover:border-dotted border-gray-700 rounded-md text-center justify-self-center">
          {videoIcon}
          <p>Videos</p>
        </div>
        <div className="border-hidden border-2 hover:border-dotted border-gray-700 rounded-md text-center justify-self-center">
          {imagesIcon}
          <p>Images</p>
        </div>
        <div className="border-hidden border-2 hover:border-dotted border-gray-700 rounded-md text-center justify-self-center">
          {softwareIcon}
          <p>Agent</p>
        </div>
      </div>
    </div>
  );

  return <>{session ? aiToolsSdkPgContent : redirect("/auth/signIn")}</>;
};

export default AiTools;
