import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!
});

async function generateLearningContent({ prompt }: { prompt: string }) {
    // Compose a system prompt to instruct Gemini to return a JSON object with all required fields
    const systemPrompt = `
    You are an AI learning assistant. Given a topic or question, generate a JSON object with the following fields:
    - tutorial: A structured, personalized tutorial (HTML, 500-1000 words) for a beginner, with real-world examples, analogies, and step-by-step explanations. Cite credible sources. List sources cited as a number list.
    - quiz: An object with an array of 5-10 adaptive questions (multiple-choice and fill-in-the-blank), each with answer and explanation.
    - visual: An SVG string that visually explains the topic.
    - project: An HTML string suggesting a hands-on project with step-by-step guide and sample code.
    Return ONLY a valid JSON object, no extra text.
    Topic: ${prompt}`;

    const model = google('gemini-2.0-flash', {useSearchGrounding: true});
    const result = await generateText({
        model: model,
        prompt: systemPrompt
    });
    // const response = await result.response;
    // Try to parse the first code block as JSON
    let jsonString = result.text;
    // Remove markdown code block if present
    if (jsonString.startsWith("```json")) {
        jsonString = jsonString.replace(/^```json/, "").replace(/```$/, "").trim();
    }
    const data = JSON.parse(jsonString);
    return data;
}

const InputSchema = z.object({
    prompt: z.string().min(2),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prompt } = InputSchema.parse(body);
        const data = await generateLearningContent({ prompt });
        return NextResponse.json(data);
    } catch (err) {
        const errorMessage = typeof err === "object" && err !== null && "message" in err
            ? (err as { message: string }).message
            : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
}
