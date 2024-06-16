import { NextRequest, NextResponse } from "next/server";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { TokenTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";

export const runtime = "edge";

const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join("\n\n");
};

/**
 * This handler parses the web page content of a specified URL
 * and responds with a serialized copy of the text content in
 * as strings
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text;
    // console.log(typeof urlText);

    // create document object from string
    const plain_text_doc = new Document({ pageContent: text });

    // const splitter = new TokenTextSplitter({
    //   chunkSize: 10000,
    //   chunkOverlap: 250,
    // });

    // const split_docs = await splitter.splitDocuments(web_page_docs);

    return NextResponse.json(
      // { ok: true },
      // { data: combineDocumentsFn(web_page_docs) }, // TO DO: figure what data type this should be cast into
      // { data: combineDocumentsFn(split_docs) },
      //   { data: split_docs }, // May be temporary
      { data: plain_text_doc },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
