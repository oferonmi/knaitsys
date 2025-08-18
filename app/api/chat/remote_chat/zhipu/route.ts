import { createOpenAI } from '@ai-sdk/openai';
import { UIMessage, convertToModelMessages, convertToCoreMessages, streamText } from 'ai';

// Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// const zai = createOpenAI({
//     // custom settings
//     baseURL: "https://api.z.ai/api/paas/v4/",
//     apiKey: process.env.ZHIPU_API_KEY ?? '',
// })

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
        model: "zai/glm-4.5",
        messages: convertToCoreMessages(messages),
        providerOptions: {
            zai: {
                thinking: {
                    type: 'disabled',
                }
            }
        }
    } as any);
    
    const reader = result.toDataStream().getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Process chunk (value)
        console.log("Stream chunk:", value);
    }

    return result.toDataStreamResponse();
    // return result.toUIMessageStreamResponse();
}
