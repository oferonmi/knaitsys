// import { deepseek } from '@ai-sdk/deepseek';
import { convertToCoreMessages, streamText } from "ai";
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOllama } from "ollama-ai-provider";


const ollama = createOllama({
  baseURL: "http://127.0.0.1:11434/api", //NOTE: Use a different URL prefix for API calls, e.g., to use proxy servers.
});


// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const deepseek = createDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY ?? '',
});

export async function POST(req: Request) {
	// Extract the `messages` from the body of the request
	const { messages } = await req.json();

	const result = await streamText({
		// model: deepseek('deepseek-chat'),
		model: ollama("deepseek-r1"),
		messages: convertToCoreMessages(messages),
	} as any);

	return result.toDataStreamResponse();
}

