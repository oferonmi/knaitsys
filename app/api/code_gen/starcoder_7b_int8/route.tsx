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
const { prompt } = await req.json();

// Ask Fireworks for a streaming chat completion using StarCoder 7b model
// @see https://fireworks.ai/models/fireworks/starcoder-7b-w8a16
const response = await fireworks.completions.create({
  model: "accounts/fireworks/models/starcoder-7b",
  // model: "accounts/fireworks/models/starcoder-16b",
  stream: true,
  max_tokens: 1024,
  prompt: `You are a very experienced software developer. Reply to ${prompt} with direct answers.`,
  // `You are a very experienced software developer with knowledge of various programming languages. Provide just code or script response to text. Remove any response that is not directly relevant to the answer.
  // Text:${prompt}`,
});

// Convert the response into a friendly text-stream.
const stream = OpenAIStream(response);

// Respond with the stream
return new StreamingTextResponse(stream);
}
