import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
    const { prompt }: { prompt: string } = await req.json();

    const result = streamText({
        model: anthropic("claude-3-haiku-20240307"),
        prompt,
    });

    return result.toDataStreamResponse();
}