import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
	const { messages } = await req.json();

	const result = await streamText({
		model: openai('gpt-4-turbo'),
		// tools: {
		// 	web_search_preview: openai.tools.webSearchPreview({
		// 		// optional configuration:
		// 		searchContextSize: 'high',
		// 	}),
		// },
		// // Force web search tool:
		// toolChoice: { type: 'tool', toolName: 'web_search_preview' },
		messages: convertToCoreMessages(messages),
	} as any);

	return result.toDataStreamResponse();
}
