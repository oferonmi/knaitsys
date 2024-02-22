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

  // Ask Fireworks for a streaming chat completion using Llama 2 70b model
  // @see https://fireworks.ai/models/fireworks/llama-v2-70b-code-instruct
  const response = await fireworks.chat.completions.create({
    // model: "accounts/fireworks/models/llama-v2-70b-code-instruct",
    model: "accounts/fireworks/models/llama-v2-34b-code-instruct",
    stream: true,
    max_tokens: 1000,
    messages,
    // messages + `You a very experienced software developer with knowlege of various programming languages. Provide just code or script response to text. Remove any response that is not directly relevant to the answer. If answers contains programming scripts or code, enclose them within the HTML \<code\>\<\/code\> tag like described next.
    // <code>
    //   {programming scripts or code}
    // </code> `,
  });

  // Convert the response into a friendly text-stream.
  const stream = OpenAIStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}
