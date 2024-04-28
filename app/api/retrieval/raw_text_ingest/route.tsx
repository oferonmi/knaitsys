import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// import { createClient } from "@supabase/supabase-js";
// import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

export const runtime = "edge";

/**
 * This handler takes input text, splits it into chunks, and embeds those chunks
 * into a vector store for later retrieval. See the following docs for more information:
 *
 * https://js.langchain.com/docs/modules/data_connection/document_transformers/text_splitters/recursive_text_splitter
 * https://js.langchain.com/docs/modules/data_connection/vectorstores/integrations/supabase
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    const text = body.text;

    // console.log(typeof text);

    // if (process.env.NEXT_PUBLIC_DEMO === "true") {
    //     return NextResponse.json(
    //     {
    //         error: [
    //         "Ingest is not supported in demo mode.",
    //         "Please set up your own version of the repo here: https://github.com/langchain-ai/langchain-nextjs-template",
    //         ].join("\n"),
    //     },
    //     { status: 403 },
    //     );
    // }

    try {
      const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
        chunkSize: 256,
        chunkOverlap: 20,
      });

      // for raw text chunking
      const splitDocuments = await splitter.createDocuments([text]);

      // const client = createClient(
      //     process.env.SUPABASE_URL!,
      //     process.env.SUPABASE_PRIVATE_KEY!,
      // );

      // const vectorstore = await SupabaseVectorStore.fromDocuments(
      //     splitDocuments,
      //     new OpenAIEmbeddings(),
      //     {
      //         client,
      //         tableName: "documents",
      //         queryName: "match_documents",
      //     },
      // );

      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

      const vectorstore = await PineconeStore.fromDocuments(
        splitDocuments,
        new OpenAIEmbeddings(),
        {
          pineconeIndex,
          maxConcurrency: 5,
        }
      );

      return NextResponse.json({ ok: true }, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}