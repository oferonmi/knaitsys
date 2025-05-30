import { ChatWindowMessage } from "@/schema/ChatWindowMessage";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { VoyVectorStore } from "@langchain/community/vectorstores/voy";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Document } from "langchain/document";

import {
	ChatPromptTemplate,
	MessagesPlaceholder,
	PromptTemplate,
} from "@langchain/core/prompts";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { BaseRetriever } from "@langchain/core/retrievers";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

import { ChatOpenAI, OpenAIEmbeddings} from "@langchain/openai";


export const runtime = "edge";

// const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// if (!supabase_url) throw new Error(`Expected env var NEXT_PUBLIC_SUPABASE_URL`);

// const supabase_anon_key = process.env.NEXT_PUBLIC_SUPABASE_API_KEY;
// if (!supabase_anon_key) throw new Error(`Expected env var NEXT_PUBLIC_SUPABASE_API_KEY`);

// const client = createClient(supabase_url, supabase_anon_key);

const pinecone = new Pinecone({
	apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY!,
});

const pineconeIndex = pinecone.Index(
	process.env.NEXT_PUBLIC_PINECONE_INDEX!
);

// const embeddings = new HuggingFaceTransformersEmbeddings({
//   modelName: "Xenova/all-MiniLM-L6-v2",
// });
const embeddings = new OpenAIEmbeddings({openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY});

// const vectorstore = new SupabaseVectorStore(
//     embeddings,
//     {
//         client,
//         tableName: "documents",
//         queryName: "match_documents",
//     },
// );
const vectorstore = new PineconeStore(
	embeddings,
	{
		pineconeIndex,
		maxConcurrency: 5,
	}
);


// const ollama = new ChatOllama({
//   baseUrl: "http://localhost:11435",
//   temperature: 0.3,
//   model: "mistral",
// });

const openai = new ChatOpenAI({
	modelName: "gpt-3.5-turbo-1106",
	temperature: 0.2,
	openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const REPHRASE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone Question:`;

const rephraseQuestionChainPrompt = PromptTemplate.fromTemplate(
  	REPHRASE_QUESTION_TEMPLATE,
);

const RESPONSE_SYSTEM_TEMPLATE = `You are an experienced researcher, expert at interpreting and answering questions from first principles based on provided sources. Using the provided context, answer the user's question to the best of your ability using the resources provided.
Generate a concise answer for a given question based solely on the provided search results (URL and content). You must only use information from the provided search results. Use an unbiased and journalistic tone. Combine search results together into a coherent answer. Do not repeat text.
If there is nothing in the context relevant to the question at hand, just say "Hmm, I'm not sure." Don't try to make up an answer.
Anything between the following \`context\` html blocks is retrieved from a knowledge bank, not part of the conversation with the user.
<context>
    {context}
<context/>

REMEMBER: If there is no relevant information within the context, just say "Hmm, I'm not sure." Don't try to make up an answer. Anything between the preceding 'context' html blocks is retrieved from a knowledge bank, not part of the conversation with the user.`;

const responseChainPrompt = ChatPromptTemplate.fromMessages<{
	context: string;
	chat_history: BaseMessage[];
	question: string;
}>([
	["system", RESPONSE_SYSTEM_TEMPLATE],
	new MessagesPlaceholder("chat_history"),
	["user", `{question}`],
]);

const formatDocs = (docs: Document[]) => {
	return docs
		.map((doc, i) => `<doc id='${i}'>${doc.pageContent}</doc>`)
		.join("\n");
};

const createRetrievalChain = (
	llm: BaseLanguageModel,
	retriever: BaseRetriever,
	chatHistory: ChatWindowMessage[],
) => {
	if (chatHistory.length) {
		return RunnableSequence.from([
			rephraseQuestionChainPrompt,
			llm,
			new StringOutputParser(),
			retriever,
			formatDocs,
		]);
	} else {
		return RunnableSequence.from([
			(input) => input.question,
			retriever,
			formatDocs,
		]);
	}
};

const embedPDF = async (pdfBlob: Blob) => {
	const pdfLoader = new WebPDFLoader(pdfBlob);
	const docs = await pdfLoader.load();

	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: 500,
		chunkOverlap: 50,
	});

	const splitDocs = await splitter.splitDocuments(docs);

	self.postMessage({
		type: "log",
		data: splitDocs,
	});

	await vectorstore.addDocuments(splitDocs);
};

const _formatChatHistoryAsMessages = async (
  	chatHistory: ChatWindowMessage[],
) => {
	return chatHistory.map((chatMessage) => {
		if (chatMessage.role === "human") {
			return new HumanMessage(chatMessage.content);
		} else {
			return new AIMessage(chatMessage.content);
		}
	});
};

const queryVectorStore = async (messages: ChatWindowMessage[]) => {
	const text = messages[messages.length - 1].content;
	const chatHistory: ChatWindowMessage[] = messages.slice(0, -1);

	const retrievalChain = createRetrievalChain(
		openai,
		vectorstore.asRetriever(),
		chatHistory,
	);

	const responseChain = RunnableSequence.from([
		responseChainPrompt,
		openai,
		new StringOutputParser(),
	]);

	const fullChain = RunnableSequence.from([
		{
			question: (input) => input.question,
			chat_history: RunnableSequence.from([
				(input) => input.chat_history,
				_formatChatHistoryAsMessages,
			]),
			context: RunnableSequence.from([
				(input) => {
					const formattedChatHistory = input.chat_history
						.map(
						(message: ChatWindowMessage) =>
							`${message.role.toUpperCase()}: ${message.content}`,
						)
						.join("\n");
					return {
						question: input.question,
						chat_history: formattedChatHistory,
					};
				},
				retrievalChain,
			]),
		},
		responseChain,
	]);

	const stream = await fullChain.stream({
		question: text,
		chat_history: chatHistory,
	});

	for await (const chunk of stream) {
		if (chunk) {
			self.postMessage({
				type: "chunk",
				data: chunk,
			});
		}
	}

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
			await embedPDF(event.data.pdf);
		} catch (e: any) {
			self.postMessage({
				type: "error",
				error: e.message,
			});
			throw e;
		}
	} else {
		try {
			await queryVectorStore(event.data.messages);
		} catch (e: any) {createRetrievalChain
			self.postMessage({
				type: "error",
				error: `${e.message}. Make sure you are running Ollama.`,
			});
			throw e;
		}
	}

	self.postMessage({
		type: "complete",
		data: "OK",
	});
});