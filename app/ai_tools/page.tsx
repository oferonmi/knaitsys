"use client"
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  ChatIcon,
  FileTextFillIcon,
  MicFullIcon,
  FilmIcon,
  ImagesIcon,
  BraceAsteriskIcon,
  CodeSlashIcon,
} from "@/components/Icons";

const AiToolsPage = () => {
  // sessions
  const { data: session, status } = useSession();

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
        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/text">
            <FileTextFillIcon />
            <p>Text</p>
          </Link>
        </div>

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/audio">
            <MicFullIcon />
            <p>Audio</p>
          </Link>
        </div>

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/#">
            <FilmIcon />
            <p>Video</p>
          </Link>
        </div>

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/#">
            <ImagesIcon />
            <p>Image</p>
          </Link>
        </div>

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/code">
            <CodeSlashIcon />
            <p>Code</p>
          </Link>
        </div>

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/#">
            <BraceAsteriskIcon />
            <p>Agent</p>
          </Link>
        </div>

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/#">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-16">
              <path stroke-linecap="round" stroke-linejoin="round" d="m20.893 13.393-1.135-1.135a2.252 2.252 0 0 1-.421-.585l-1.08-2.16a.414.414 0 0 0-.663-.107.827.827 0 0 1-.812.21l-1.273-.363a.89.89 0 0 0-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 0 1-1.81 1.025 1.055 1.055 0 0 1-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 0 1-1.383-2.46l.007-.042a2.25 2.25 0 0 1 .29-.787l.09-.15a2.25 2.25 0 0 1 2.37-1.048l1.178.236a1.125 1.125 0 0 0 1.302-.795l.208-.73a1.125 1.125 0 0 0-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 0 1-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 0 1-1.458-1.137l1.411-2.353a2.25 2.25 0 0 0 .286-.76m11.928 9.869A9 9 0 0 0 8.965 3.525m11.928 9.868A9 9 0 1 1 8.965 3.525" />
            </svg>
            </div>
            <div>
              <p>Simulation</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  return(
    <>
      {status === "authenticated" && aiToolsSdkPgContent}
      {status === "unauthenticated" && redirect("/auth/signIn")}
    </>
  );
};

export default AiToolsPage;
