import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

import { SerpAPILoader } from "langchain/document_loaders/web/serpapi";

import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

export const runtime = "edge";

/**
 * This handler takes input text query which it passes to a web search loader,it then splits 
 * the result(or processed form of *result ) into chunks, and embeds *those chunks into a vector store for later retrieval. 
 * See the following docs for more *information:
 *
 * https://js.langchain.com/docs/modules/data_connection/document_transformers/text_splitters/recursive_text_splitter
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const searchQuery = body.text;

  // console.log(searchQuery);

  try {
    // Use SerpAPILoader to load web search results
    const loader = new SerpAPILoader({
      q: searchQuery,
      apiKey: process.env.NEXT_PUBLIC_SERPAPI_API_KEY!,
    });
    const search_result = await loader.load();
    console.log(search_result); // comment later

    //TODO: Loop through all or some list of Document.pageContent["links"] object in search_result_data, scrape page
    // and append content to text (compiled_search_data) to be chunked and embeddded into a vector store
    const compiled_search_data = search_result; // replace with scapped text from each result

    //TODO: Uncomment code below to splits  received text into chunks, and embed them into a vector store for later retrieval.
    // const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    //   chunkSize: 256,
    //   chunkOverlap: 20,
    // });

    // // for raw text chunking
    // const splitDocuments = await splitter.createDocuments([compiled_search_data]);

    // // save in vector store
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

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
