import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Create an OpenAI API client (that's edge friendly!)
// but configure it to point to fireworks.ai
const fireworks = new OpenAI({
  apiKey: process.env.FIREWORKS_API_KEY || "",
  baseURL: "https://api.fireworks.ai/inference/v1/completions",
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
// Extract the `messages` from the body of the request
const { prompt } = await req.json();

// Ask Fireworks for a streaming chat completion using StarCoder 7b model
// @see https://fireworks.ai/models/fireworks/starcoder-7b-w8a16
const response = await fireworks.completions.create({
  model: "accounts/fireworks/models/starcoder-7b-w8a16",
  stream: true,
  max_tokens: 150,
  prompt,
});

// Convert the response into a friendly text-stream.
const stream = OpenAIStream(response);

// Respond with the stream
return new StreamingTextResponse(stream);
}
