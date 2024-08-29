import { convertToCoreMessages, streamText } from "ai";
import { createOllama } from 'ollama-ai-provider';
//import { ollama } from 'ollama-ai-provider';

const ollama = createOllama({
    baseURL: 'http://127.0.0.1:11434/api', //NOTE: Use a different URL prefix for API calls, e.g., to use proxy servers.
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    // Extract the `messages` from the body of the request
    const { messages } = await req.json();

    const llm = ollama('llava');

    const result = await streamText({
        model: llm,
        messages: convertToCoreMessages(messages),
    });

    return result.toDataStreamResponse();
}