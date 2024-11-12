"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import "@/node_modules/bootstrap-icons/font/bootstrap-icons.css";

const AudioProcessorPage = () => {
  // sessions
  const { data: session, status } = useSession();

  const audioProcessorPageContent = (
    <div className="flex flex-col bg-teal-100 bg-cover bg-center items-center justify-center h-screen">
      <div className="font-mono text-3xl text-gray-700 max-w-2xl pb-5 mx-auto mt-4 sm:px-4">
        Audio Processor Tools.
      </div>

      <div className="mt-2 text-xl text-black">
        Tools to process and generate audio using a Natural Language Interface
        (NLI).
      </div>

      <div className="grid grid-flow-col justify-items-stretch place-items-center gap-4 max-w-2xl pb-5 mx-auto mt-4 sm:px-4 text-gray-700">
        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/tts">
            <i className="bi bi-body-text" style={{ fontSize: 32 }}></i>
            <i className="bi bi-arrow-right-short" style={{ fontSize: 32 }}></i>
            <i className="bi bi-soundwave" style={{ fontSize: 32 }}></i>
            <p>Text to Speech</p>
          </Link>
        </div>

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/stt">
            <i className="bi bi-soundwave" style={{ fontSize: 32 }}></i>
            <i className="bi bi-arrow-right-short" style={{ fontSize: 32 }}></i>
            <i className="bi bi-body-text" style={{ fontSize: 32 }}></i>
            <p>Speech to Text</p>
          </Link>
        </div>
      </div>
    </div>
  );

  return status === "authenticated" ? audioProcessorPageContent : redirect("/auth/signIn")
};

export default AudioProcessorPage;
