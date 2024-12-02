import { createAnthropic } from "@ai-sdk/anthropic";
import { convertToCoreMessages, streamText } from "ai";
import { AnthropicStream, StreamingTextResponse } from "ai";

const anthropic = createAnthropic({
  // custom settings
  baseURL: "https://api.anthropic.com/v1",
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Build a prompt from the messages
// function buildPrompt(
//   messages: { content: string; role: "system" | "user" | "assistant" }[]
// ) {
//   return (
//     messages
//       .map(({ content, role }) => {
//         if (role === "user") {
//           return `Human: ${content}`;
//         } else {
//           return `Assistant: ${content}`;
//         }
//       })
//       .join("\n\n") + "Assistant:"
//   );
// }

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();

  // const response = await fetch("https://api.anthropic.com/v1/complete", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "x-api-key": process.env.ANTHROPIC_API_KEY,
  //   },
  //   body: JSON.stringify({
  //     prompt: buildPrompt(messages),
  //     model: "claude-v1",
  //     max_tokens_to_sample: 300,
  //     temperature: 0.9,
  //     stream: true,
  //   }),
  // });

  // // Check for errors
  // if (!response.ok) {
  //   return new Response(await response.text(), {
  //     status: response.status,
  //   });
  // }

  const result = await streamText({
    model: anthropic("claude-3-5-haiku-20241022"),
    messages: convertToCoreMessages(messages),
  } as any);

  return result.toDataStreamResponse();

  // // Convert the response into a friendly text-stream
  // const stream = AnthropicStream(response);

  // // Respond with the stream
  // return new StreamingTextResponse(stream);
}
