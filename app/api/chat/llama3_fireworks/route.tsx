import { createOpenAI } from '@ai-sdk/openai'
import { convertToCoreMessages, generateText, streamText } from 'ai'

const fireworks = createOpenAI({
  apiKey: process.env.FIREWORKS_API_KEY ?? '',
  baseURL: 'https://api.fireworks.ai/inference/v1'
})

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    // Extract the `messages` from the body of the request
    const { messages } = await req.json();

    //Model URl
    const llm = fireworks('accounts/fireworks/models/llama-v3-8b-instruct');

    const result = await streamText({
        model: llm,
        messages: convertToCoreMessages(messages),
    });

    return result.toDataStreamResponse();
}

