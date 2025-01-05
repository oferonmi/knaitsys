// import { deepseek } from '@ai-sdk/deepseek';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { convertToCoreMessages, streamText,} from 'ai';

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const deepseek = createDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY ?? '',
});

export async function POST(req: Request) {
	// Extract the `messages` from the body of the request
	const { messages } = await req.json();

	const result = await streamText({
		model: deepseek('deepseek-chat'),
		messages: convertToCoreMessages(messages),
	} as any);

	return result.toDataStreamResponse();
}

