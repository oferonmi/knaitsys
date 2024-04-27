import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
// import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";

import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

import { OpenAIEmbeddings } from "langchain/embeddings/openai";

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
    const loader = new CheerioWebBaseLoader(urlText);

    //load webpage data using Puppeteer. Still needs fix with extensive dependency issues
    // const loader = new PuppeteerWebBaseLoader(urlText);
    // const loader = new PuppeteerWebBaseLoader(urlText, {
    //   launchOptions: {
    //     headless: true,
    //   },
    //   gotoOptions: {
    //     waitUntil: "domcontentloaded",
    //   },
    //   /**  Pass custom evaluate , in this case you get page and browser instances */
    //   async evaluate(page, browser) {
    //     await page.waitForResponse(inputUrl);

    //     const result = await page.evaluate(() => document.body.innerHTML);
    //     await browser.close();
    //     return result;
    //   },
    // });
    const page_data = await loader.load(); // Text may need some cleaning
    console.log(JSON.stringify(page_data)); // comment later

    //TODO: Uncomment code below to splits  scapped webpage text into chunks, and embed them into a vector store for later retrieval.
    // const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    //   chunkSize: 256,
    //   chunkOverlap: 20,
    // });

    // // for webpage content chunking
    // const splitDocuments = await splitter.splitDocuments(page_data);

    // save in vector store
    // const pinecone = new Pinecone({
    //   apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY!,
    // });

    // const pineconeIndex = pinecone.Index(
    //   process.env.NEXT_PUBLIC_PINECONE_INDEX!
    // );

    // const vectorstore = await PineconeStore.fromDocuments(
    //   splitDocuments,
    //   new OpenAIEmbeddings(),
    //   {
    //     pineconeIndex,
    //     maxConcurrency: 5,
    //   }
    // );

    // const client = createClient(
    //   process.env.SUPABASE_URL!,
    //   process.env.SUPABASE_PRIVATE_KEY!
    // );

    // const vectorstore = await SupabaseVectorStore.fromDocuments(
    //   splitDocuments,
    //   new OpenAIEmbeddings(),
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
