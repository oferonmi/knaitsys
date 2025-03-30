import { createFireworks } from '@ai-sdk/fireworks';
import { convertToCoreMessages, streamText } from "ai";
// import { OpenAIStream, StreamingTextResponse } from "ai";

// Create an OpenAI API client (that's edge friendly!)
// but configure it to point to fireworks.ai
const fireworks = createFireworks({
    apiKey: process.env.FIREWORKS_API_KEY ?? '',
    baseURL: "https://api.fireworks.ai/inference/v1",
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
    // Extract the `messages` from the body of the request
    const { messages } = await req.json();
        
    // Convert the response into a friendly text-stream
    const result = await streamText({
      model: fireworks("accounts/fireworks/models/qwq-32b"),
      messages: convertToCoreMessages(messages),
    } as any);

    return result.toDataStreamResponse();
}
