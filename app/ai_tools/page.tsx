"use client"
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css';

const AiToolsPage = () => {
  // sessions
  const { data: session, status } = useSession();

  const aiToolsSdkPgContent = (
    <div className="flex flex-col bg-teal-100 bg-cover bg-center items-center justify-center h-screen">
      <div className="font-mono text-3xl text-gray-700 max-w-2xl pb-5 mx-auto mt-4 sm:px-4">
        AI Tools kit.
      </div>

      <div className="mt-2 text-xl text-black">
        Choose your preferred Natural Language Interface (NLI) mode for your
        knowledge work.
      </div>

      <div className="grid grid-flow-col justify-items-stretch place-items-center gap-4 max-w-2xl pb-5 mx-auto mt-4 sm:px-4 text-gray-700">
        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/text">
            <i className="bi bi-file-text-fill" style={{ fontSize: 64 }}></i>
            <p>Text</p>
          </Link>
        </div>

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/audio">
            <i className="bi bi-soundwave" style={{ fontSize: 64 }}></i>
            <p>Audio</p>
          </Link>
        </div>

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/multimodal">
            <i className="bi bi-disc-fill" style={{ fontSize: 64 }}></i>
            <p>Multimodal</p>
          </Link>
        </div>

        {/* <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/audio">
            <i className="bi bi-mic-fill" style={{fontSize: 64}}></i>
            <p>Audio</p>
          </Link>
        </div>

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/#">
            <i className="bi bi-film" style={{fontSize: 64}}></i>
            <p>Video</p>
          </Link>
        </div>

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/#">
            <i className="bi bi-images" style={{fontSize: 64}}></i>
            <p>Image</p>
          </Link>
        </div> */}

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/code">
            <i className="bi bi-file-code-fill" style={{ fontSize: 64 }}></i>
            <p>Code</p>
          </Link>
        </div>

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/#">
            <i className="bi bi-robot" style={{ fontSize: 64 }}></i>
            <p>Agent</p>
          </Link>
        </div>

        <div className="border-hidden border-8 hover:border-dotted border-kaito-brand-ash-green rounded-md text-center justify-self-center hover:text-white hover:bg-kaito-brand-ash-green">
          <Link href="/#">
            <i
              className="bi bi-globe-europe-africa"
              style={{ fontSize: 64 }}
            ></i>
            <p>Simulation</p>
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
