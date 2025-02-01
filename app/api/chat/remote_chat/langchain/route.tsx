import { NextRequest } from "next/server";
import { Message as VercelChatMessage, convertToCoreMessages, streamText } from "ai";

import { ChatOpenAI } from "@langchain/openai";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

import { openai } from '@ai-sdk/openai';

export const runtime = "edge";

/**
 * Basic memory formatter that stringifies and passes
 * message history directly into the model.
 */
const formatMessage = (message: VercelChatMessage) => {
  	return `${message.role}: ${message.content}`;
};

const TEMPLATE = `You are a helpful assistant who explains concept from first principles.
 
Current conversation:
{chat_history}
 
User: {input}
AI:`;

/*
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function POST(req: NextRequest) {
    const body = await req.json();
    const messages = body.messages ?? [];
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    
    const model = new ChatOpenAI({
     	temperature: 0.8,
		streaming: true,
    });

    /**
     * Chat models stream message chunks rather than bytes, so this
     * output parser handles serialization and encoding.
     */
    const outputParser = new BytesOutputParser();

    /*
    * Can also initialize as:
    *
    * import { RunnableSequence } from "langchain/schema/runnable";
    * const chain = RunnableSequence.from([prompt, model, outputParser]);
    */
    const chain = prompt.pipe(model).pipe(outputParser);

    const stream = await chain.stream({
    	chat_history: formattedPreviousMessages.join("\n"),
    	input: currentMessageContent,
    });

    // return new StreamingTextResponse(stream);
	return new Response(stream);
	// const response = await stream.collect();

	// const result = await streamText({
	// 	model: openai('gpt-3.5-turbo'),
	// 	messages: convertToCoreMessages(messages),
	// } as any);

	// return result.toDataStreamResponse();
}
