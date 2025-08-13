import { createOpenAI } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const zai = createOpenAI({
    // custom settings
    baseURL: "https://api.z.ai/api/paas/v4/",
    apiKey: process.env.ZHIPU_API_KEY ?? '',
})

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: zai('glm-4.5'),
        messages: convertToCoreMessages(messages),
    } as any);

    return result.toDataStreamResponse();
}
