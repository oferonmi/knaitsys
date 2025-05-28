import { streamText } from "ai";
import { createFireworks } from "@ai-sdk/fireworks";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { prompt }: { prompt: string } = await req.json(); 

    const fireworks = createFireworks({
      apiKey: process.env.FIREWORKS_API_KEY ?? "",
    });

    const result = streamText({
        model: fireworks("accounts/fireworks/models/firefunction-v1"),
        prompt,
    });

    return result.toDataStreamResponse();
}
