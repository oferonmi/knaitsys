import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { SerpAPILoader } from "langchain/document_loaders/web/serpapi";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

// import { compile } from "html-to-text";
import { RecursiveUrlLoader } from "langchain/document_loaders/web/recursive_url";

import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";

import { useEffect, useState } from "react";
import { Document } from "langchain/document";


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

  // const [searchResult, setSearchResult] = useState(null);

  try {
    // Use SerpAPILoader to load web search results
    const searchResultPgloader = new SerpAPILoader({
      q: searchQuery,
      apiKey: process.env.NEXT_PUBLIC_SERPAPI_API_KEY!,
    });
    const search_result = await searchResultPgloader.load();
    // console.log(search_result); // comment later

    //TODO: Loop through all or some list of Document.pageContent["links"] object in search_result_data, scrape page
    // and append content to text (compiled_search_data) to be chunked and embeddded into a vector store
    // const compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;
    let search_res_docs: any = [];
    
    if (search_result.length > 0) {
      search_result.map(async (sr) => {
        let search_res_json = JSON.parse(sr["pageContent"]);
        // console.log(search_res_json.link);

        if (search_res_json.link != undefined){
          const webPgLoader = new CheerioWebBaseLoader(search_res_json.link, {
            selector: "body",
          });
          const resPgContent = await webPgLoader.load();
          console.log(resPgContent);
          // search_res_docs.push(await webPgLoader.load());
        }
        // const recusvUrlLoader = new RecursiveUrlLoader(sr.pageContent.link.toString(), {
        //   extractor: compiledConvert,
        //   maxDepth: 1,
        // });

        // const compiled_search_data = await recusvUrlLoader.load();
      });
    }

    // console.log(search_res_docs);

    // const compiled_search_data = search_result; // replace with scapped text from each result

    //TODO: Uncomment code below to splits  received text into chunks, and embed them into a vector store for later retrieval.
    // const splitter = new RecursiveCharacterTextSplitter({
    //   chunkSize: 500,
    //   chunkOverlap: 50,
    // });

    // // for webpage content chunking
    // const splitDocs = await splitter.splitDocuments(compiled_search_data);

    // // save in vector store
    // const embeddings = new OpenAIEmbeddings({
    //   openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    // });

    // const pinecone = new Pinecone({
    //   apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY!,
    // });

    // const pineconeIndex = pinecone.Index(
    //   process.env.NEXT_PUBLIC_PINECONE_INDEX!
    // );

    // const vectorstore = new PineconeStore(embeddings, {
    //   pineconeIndex,
    //   maxConcurrency: 5,
    // });

    // await vectorstore.addDocuments(splitDocs);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
