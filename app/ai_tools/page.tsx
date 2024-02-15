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
      </div>
    </div>
  );

  return(
    <>
      {status === "authenticated" && aiToolsSdkPgContent};
      {status === "unauthenticated" && redirect("/auth/signIn")};
    </>
  );
};

export default AiToolsPage;
