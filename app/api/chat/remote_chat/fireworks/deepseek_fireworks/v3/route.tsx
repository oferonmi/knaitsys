import { convertToCoreMessages, generateText, streamText } from "ai";
import { createFireworks } from "@ai-sdk/fireworks";

const fireworks = createFireworks({
    apiKey: process.env.FIREWORKS_API_KEY ?? "",
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    // Extract the `messages` from the body of the request
    const { messages } = await req.json();

    //Model URl
    const llm = fireworks("accounts/fireworks/models/deepseek-v3");

    const result = await streamText({
        model: llm,
        messages: convertToCoreMessages(messages),
    });

    return result.toDataStreamResponse();
}
