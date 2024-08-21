import { NextRequest, NextResponse } from "next/server";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RecursiveCharacterTextSplitter,
  TokenTextSplitter,
} from "langchain/text_splitter";
import { loadSummarizationChain } from "langchain/chains";
import { Document } from "@langchain/core/documents";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";

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
  try {
    const body = await req.json();
    const urlText = body.text ?? "";
    // console.log(typeof urlText);

    // load webpage data using Cheerio
    const webPageLoader = new CheerioWebBaseLoader(urlText);
    const webPageDocs = await webPageLoader.load();
    // console.log(webPageDocs);

    const splitter = new TokenTextSplitter({
      chunkSize: 10000,
      chunkOverlap: 250,
    });

    const splitDocsForSummary = await splitter.splitDocuments(webPageDocs);
    // console.log(splitDocsForSummary);

    const llmModel = new ChatOpenAI({
      // modelName: "gpt-3.5-turbo-1106",
      temperature: 0,
    });

    // const llmModel = new ChatAnthropic({
    //   model: "claude-3-sonnet-20240229",
    //   temperature: 0.3,
    //   apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
    // });

    // const summarizeChain = loadSummarizationChain(llmModel, {
    //   type: "refine",
    //   verbose: true,
    //   questionPrompt: SUMMARY_PROMPT,
    //   refinePrompt: SUMMARY_REFINE_PROMPT,
    // });

    const summarizeChain = loadSummarizationChain(llmModel, {
      type: "map_reduce",
    });

    const textSummary = await summarizeChain.invoke({
      input_documents: splitDocsForSummary,
    });
    // console.log(textSummary);


    // get webpage content
    const serializedWebpageText = combineDocuments(webPageDocs);
    // console.log(serializedWebpageText);

    return NextResponse.json(
    //   { ok: true },
      { input_text: serializedWebpageText, output_text: textSummary.text, },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
