import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { loadSummarizationChain } from "langchain/chains";

import { SerpAPILoader } from "@langchain/community/document_loaders/web/serpapi";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

import { Document, DocumentInterface } from "@langchain/core/documents";


export const runtime = "edge";

const SUMMARY_TEMPLATE = `
You are an expert at summarizing text documents.
Your goal is to create a summary of provided text.
Below you find the text of a document:
--------
{text}
--------

The document text will also be used as the basis for a question and answer bot.
Provide some examples questions and answers that could be asked about the document. Make these questions very specific.

Total output will be a summary of the text document and a list of example questions the user could ask of the document.

SUMMARY AND QUESTIONS:
`;

const SUMMARY_PROMPT = PromptTemplate.fromTemplate(SUMMARY_TEMPLATE);

const SUMMARY_REFINE_TEMPLATE = `
You are an expert at summarizing text documents.
Your goal is to create a summary of provided text.
We have provided an existing summary up to a certain point: {existing_answer}

Below you find the text of a document:
--------
{text}
--------

Given the new context, refine the summary and example questions.
The text of the document will also be used as the basis for a question and answer bot.
Provide some examples questions and answers that could be asked about the body of text. Make
these questions very specific.
If the context isn't useful, return the original summary and questions.
Total output will be a summary of the text document and a list of example questions the user could ask of the document.

SUMMARY AND QUESTIONS:
`;

const SUMMARY_REFINE_PROMPT = PromptTemplate.fromTemplate(
  SUMMARY_REFINE_TEMPLATE
);

const combineDocuments = (docs: Document[]) => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join("\n\n");
};


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

        //Loop through all or some list of Document.pageContent["links"] object in search_result, scrape page and append content to text (search_links_docs) to be chunked.

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

                // limit selected links to 1
                if (link_count > 1) {break};
            }

            // console.log(search_links_docs.length);

            // Split received text into chunks, and embed them into a vector store for later retrieval.
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 500,
                chunkOverlap: 50,
            });

            // for search result page content for chunking
            const splitDocsForSummary = await splitter.splitDocuments(search_links_docs);

            const llmModel = new ChatOpenAI({
                // modelName: "gpt-3.5-turbo-1106",
                temperature: 0,
            });

            const summarizeChain = loadSummarizationChain(llmModel, {
                type: "map_reduce",
            });

            const textSummary = await summarizeChain.invoke({
                 input_documents: splitDocsForSummary,
            });
            // console.log(textSummary);

            // get search indices page content
            const serializedSearchIndicesPageText = combineDocuments(search_links_docs);
            // console.log(serializedSearchIndicesPageText);

            return NextResponse.json(
             //{ ok: true }, 
                { input_text: serializedSearchIndicesPageText, output_text: textSummary.text, },
                { status: 200 }
            );
        } else {

            return NextResponse.json(
                //{ ok: true }, 
                { input_text: "No search result.", output_text: "Cannot provide summary of blank search result. ", },
                { status: 200 }
            );
        }
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
