import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { SerpAPILoader } from "langchain/document_loaders/web/serpapi";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
// import { createClient } from "redis";
// import { RedisVectorStore } from "@langchain/redis";
// import fs from "node:fs/promises";
// import path from "node:path";
// import os from "node:os";
// import { connect } from "vectordb";
// import { LanceDB } from "@langchain/community/vectorstores/lancedb";

import { DocumentInterface } from "@langchain/core/documents";


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
    const searchResultPgloader = new SerpAPILoader({
      q: searchQuery,
      apiKey: process.env.NEXT_PUBLIC_SERPAPI_API_KEY!,
    });
    const search_result = await searchResultPgloader.load();
    // console.log(search_result.length); // comment later

    //Loop through all or some list of Document.pageContent["links"] object in search_result, scrape page and append content to text (search_res_docs) to be chunked and embeddded into a vector store

    let search_links_docs: Array<DocumentInterface> = [];
    let link_count: number = 0;

    if (search_result.length > 0) {
      for await (const sr of search_result) {
        let search_res_json = JSON.parse(sr["pageContent"]);
        // console.log(search_res_json.link);

        if (search_res_json.link != undefined) {
          const webPgLoader = new CheerioWebBaseLoader(search_res_json.link, {
            selector: "body",
          });
          const resPgDoc = await webPgLoader.load();
          // console.log(typeof resPgDoc);

          search_links_docs = search_links_docs.concat(resPgDoc);
          // console.log(search_links_docs.length);
          link_count++
        }

        // limit selected links to 5
        if (link_count > 5) {break};
      }

      // console.log(search_links_docs.length);

      // Split received text into chunks, and embed them into a vector store for later retrieval.
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
      });

      // for webpage content chunking
      const splitDocs = await splitter.splitDocuments(search_links_docs);

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

      const vectorstore = new PineconeStore(embeddings, {
        pineconeIndex,
        maxConcurrency: 5,
      });

      // const client = createClient({
      //   url: process.env.REDIS_URL ?? "redis://localhost:6379",
      // });
      // await client.connect();

      // const vectorstore = new RedisVectorStore(
      //   new OpenAIEmbeddings(),
      //   {
      //     redisClient: client,
      //     indexName: "kaitosys_corpus",
      //   }
      // );
      // await client.disconnect();

      // const dir = await fs.mkdtemp(path.join(os.tmpdir(), "lancedb-"));
      // const dir = path.join(os.tmpdir(), "local-lancedb-vectorstore");
      // console.log(dir);
      // await fs.mkdir(dir);
      // const db = await connect(dir);
      // const table = await db.createTable("vectors", [
      //   { vector: Array(1536), text: "sample", source: "a" },
      // ]);

      // const vectorstore = new LanceDB(new OpenAIEmbeddings(), { table });

      await vectorstore.addDocuments(splitDocs);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
