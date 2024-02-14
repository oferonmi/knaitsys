import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Create an OpenAI API client (that's edge friendly!)
// but configure it to point to fireworks.ai
const fireworks = new OpenAI({
  apiKey: process.env.FIREWORKS_API_KEY || "",
  baseURL: "https://api.fireworks.ai/inference/v1",
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();

  // Ask Fireworks for a streaming chat completion using Qwen 72b chat model
  // @see https://fireworks.ai/models/fireworks/qwen-72b-chat
  const response = await fireworks.chat.completions.create({
    model: "accounts/fireworks/models/qwen-72b-chat",
    stream: true,
    max_tokens: 1000,
    messages,
  });

  // Convert the response into a friendly text-stream.
  const stream = OpenAIStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}
