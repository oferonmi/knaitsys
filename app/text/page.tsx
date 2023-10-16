"use client"
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  ClipBoardDataFullIcon,
  CardTextIcon
} from "@/components/Icons";

const TextProcessorPage = () => {
  // sessions
  const { data: session, status } = useSession();

  const textProcessorPageContent = (
    <div className="flex flex-col bg-teal-100 bg-cover bg-center items-center justify-center h-screen">
      <div className="font-mono text-3xl text-gray-700 max-w-2xl pb-5 mx-auto mt-4 sm:px-4">
        Text Processor Tools.
      </div>

      <div className="mt-2 text-xl text-black">
        Tools to process corpus of text using Natural Language Interface (NLI).
      </div>

      <div className="grid grid-flow-col justify-items-stretch place-items-center gap-4 max-w-2xl pb-5 mx-auto mt-4 sm:px-4 text-gray-700">
        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/summarizer">
            <CardTextIcon />
            <p>Summarizer</p>
          </Link>
        </div>

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/text">
            <ClipBoardDataFullIcon />
            <p>Docs Query</p>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      
      {status === "authenticated" && textProcessorPageContent};
      {status === "unauthenticated" && redirect("/auth/signIn")};
    </>
  );
};

export default TextProcessorPage;
