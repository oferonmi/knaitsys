import { createAnthropic } from "@ai-sdk/anthropic";
import { convertToCoreMessages, streamText } from "ai";

const anthropic = createAnthropic({
  // custom settings
  baseURL: "https://api.anthropic.com/v1",
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();

  const result = await streamText({
    model: anthropic("claude-3-5-haiku-20241022"),
    messages: convertToCoreMessages(messages),
  } as any);

  return result.toDataStreamResponse();
}
