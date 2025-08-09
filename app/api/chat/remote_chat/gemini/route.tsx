import { google } from '@ai-sdk/google';
import { convertToCoreMessages, streamText } from 'ai';


// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
	// Extract the `messages` from the body of the request
	const { messages } = await req.json();

	const result = await streamText({
    model: google("gemini-2.5-flash"),
    // tools: {
    //   google_search: google.tools.googleSearch({}),
    // },
    messages: convertToCoreMessages(messages),
  } as any);

	return result.toDataStreamResponse();
}
