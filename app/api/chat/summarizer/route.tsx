import { NextRequest, NextResponse } from "next/server";
import {
  Message as VercelChatMessage,
  StreamingTextResponse,
  createStreamDataTransformer,
} from "ai";

import { PromptTemplate } from "@langchain/core/prompts";
import { TokenTextSplitter } from "langchain/text_splitter"; //"@langchain/textsplitters";
import { loadSummarizationChain } from "langchain/chains";
import { Document } from "@langchain/core/documents";
import { ChatOpenAI} from "@langchain/openai";

export const runtime = "edge";

// const combineDocumentsFn = (docs: Document[]) => {
//   const serializedDocs = docs.map((doc) => doc.pageContent);
//   return serializedDocs.join("\n\n");
// };

const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
  const formattedDialogueTurns = chatHistory.map((message) => {
    if (message.role === "user") {
      return `Human: ${message.content}`;
    } else if (message.role === "assistant") {
      return `Assistant: ${message.content}`;
    } else {
      return `${message.role}: ${message.content}`;
    }
  });
  return formattedDialogueTurns.join("\n");
};

const summaryTemplate = `
You are an expert in summarizing text documents.
Your goal is to create a summary of a body of text.
Below you find the text of a document:
--------
{text}
--------

The document text will also be used as the basis for a question and answer bot.
Provide some examples questions and answers that could be asked about the document. Make these questions very specific.

Total output will be a summary of the text document and a list of example questions the user could ask of the document.

SUMMARY AND QUESTIONS:
`;

const SUMMARY_PROMPT = PromptTemplate.fromTemplate(summaryTemplate);

const summaryRefineTemplate = `
You are an expert in summarizing text documents.
Your goal is to create a summary of a body of text.
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
  summaryRefineTemplate
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text;
    // console.log(typeof text);

    const messages = body.messages ?? [];
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;

    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo-1106",
      temperature: 0.2,
    });

    const summarizeChain = loadSummarizationChain(model, {
      type: "refine",
      verbose: true,
      questionPrompt: SUMMARY_PROMPT,
      refinePrompt: SUMMARY_REFINE_PROMPT,
    });

    // const page_summary = await summarizeChain.invoke(docsSummary);
    // console.log(page_summary);
    const stream = await summarizeChain.stream({
      question: currentMessageContent,
      chat_history: formatVercelMessages(previousMessages),
    });

    // let resolveWithDocuments: (value: Document[]) => void;
    // const documentPromise = new Promise<Document[]>((resolve) => {
    //   resolveWithDocuments = resolve;
    // });

    // const documents = await documentPromise;
    // const serializedSources = Buffer.from(
    //   JSON.stringify(
    //     documents.map((doc) => {
    //       return {
    //         pageContent: doc.pageContent.slice(0, 50) + "...",
    //         metadata: doc.metadata,
    //       };
    //     }),
    //   ),
    // ).toString("base64");

    return new StreamingTextResponse(
      stream.pipeThrough(createStreamDataTransformer()), 
      // {
      //   headers: {
      //     "x-message-index": (previousMessages.length + 1).toString(),
      //     "x-sources": serializedSources,
      //   },
      // }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}