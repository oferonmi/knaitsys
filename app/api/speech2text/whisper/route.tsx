import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Create an OpenAI API client (that's edge friendly!)
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Whisper API key.
const apiKey = process.env.OPENAI_API_KEY;


// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(data: FormData) {
    
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions",{
        method: "POST",
        body: data,
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
}