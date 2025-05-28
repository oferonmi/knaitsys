import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

import { OpenAIEmbeddings } from "@langchain/openai";

import { useState } from "react";

export const runtime = "edge";

/**
 * This handler takes URL which it passes to a web loader to scape text from URL page. It then splits 
 * the result into chunks, and embeds *those chunks into a vector store for later retrieval. 
 * See the following docs for more *information:
 *
 * https://js.langchain.com/docs/modules/data_connection/document_transformers/text_splitters/recursive_text_splitter
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const urlText = body.text;

  // console.log(typeof urlText);

  try {
    // load webpage data using Cheerio
    const webPageLoader = new CheerioWebBaseLoader(urlText);
    const web_page_data = await webPageLoader.load(); // Text may need some cleaning

    // const web_page_text = web_page_data[0]["pageContent"];
    // console.log(web_page_text); // comment later

    //TODO: Uncomment code below to splits  scapped webpage text into chunks, and embed them into a vector store for later retrieval.
    const splitter = new RecursiveCharacterTextSplitter(
      {
        chunkSize: 500,
        chunkOverlap: 50,
      }
    );

    // for webpage content chunking
    const splitDocs = await splitter.splitDocuments(web_page_data);

    // save in vector store
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });

    const pinecone = new Pinecone({
      apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY!,
    });

    const pineconeIndex = pinecone.Index(
      process.env.NEXT_PUBLIC_PINECONE_INDEX!
    );

    const vectorstore = new PineconeStore(
      embeddings, 
      {
        pineconeIndex,
        maxConcurrency: 5,
      }
    );

    await vectorstore.addDocuments(splitDocs);

    // const client = createClient(
    //   process.env.SUPABASE_URL!,
    //   process.env.SUPABASE_PRIVATE_KEY!
    // );

    // const vectorstore = await SupabaseVectorStore.fromDocuments(
    //   splitDocuments,
    //   embeddings,
    //   {
    //     client,
    //     tableName: "documents",
    //     queryName: "match_documents",
    //   }
    // );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
