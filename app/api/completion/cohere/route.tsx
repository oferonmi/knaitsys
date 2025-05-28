import { createCohere } from "@ai-sdk/cohere";
import { streamText } from "ai";

const cohere = createCohere({
    apiKey: process.env.COHERE_API_KEY ??'',
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { prompt }: { prompt: string } = await req.json();

    const result = streamText({
        model: cohere("command-r-plus"),
        prompt,
    });

    return result.toDataStreamResponse();
}