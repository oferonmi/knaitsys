import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RecursiveCharacterTextSplitter,
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

const llmModel = new ChatOpenAI({
    // modelName: "gpt-3.5-turbo-1106",
    temperature: 0,
    openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const summarizePDF = async (pdfBlob: Blob) => {
    // load data from PDF file
    const pdfLoader = new WebPDFLoader(pdfBlob);
    const pdfDocs = await pdfLoader.load();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
    });

    const splitDocsForSummary = await splitter.splitDocuments(pdfDocs);
    // console.log(splitDocsForSummary);

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

    // get file content
    const serializedPDFText = combineDocuments(pdfDocs);
    // console.log(serializedPDFText);

    self.postMessage({
        type: "log",
        data: `Summary successful!`,
    });

    self.postMessage({
        type: "output_text",
        output_text: textSummary.text,
    });

    self.postMessage({
        type: "input_text",
        input_text: serializedPDFText,
    });

    self.postMessage({
        type: "complete",
        data: "OK",
    });
    
};

// Listen for messages from the main thread
self.addEventListener("message", async (event: any) => {
    self.postMessage({
        type: "log",
        data: `Received data!`,
    });

    if (event.data.pdf) {
        try {
            await summarizePDF(event.data.pdf);
        } catch (e: any) {
            self.postMessage({
                type: "error",
                error: e.message,
            });
            throw e;
        }
    } 

    self.postMessage({
        type: "complete",
        data: "OK",
    });
});
