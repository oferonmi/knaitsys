import { createXai } from "@ai-sdk/xai";
import { convertToCoreMessages, streamText } from "ai";

const xai = createXai({
  // custom settings
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();

  const result = await streamText({
    model: xai("grok-beta"),
    messages: convertToCoreMessages(messages),
  } as any);

  return result.toDataStreamResponse();
}
