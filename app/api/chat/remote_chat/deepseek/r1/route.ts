import { createDeepSeek } from '@ai-sdk/deepseek';
import { convertToCoreMessages, streamText } from 'ai';

const deepseek = createDeepSeek({
    // custom settings
    baseURL: "https://api.deepseek.com/v1",
    apiKey: process.env.DEEPSEEK_API_KEY ?? '',
});

// Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        model: deepseek('deepseek-reasoner'),
        messages: convertToCoreMessages(messages),
    } as any);

    return result.toDataStreamResponse();
}