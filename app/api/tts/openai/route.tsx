"use server"

import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

// Constants
const SPEECH_FILE_DIR = path.resolve("./public/audio");
const ALLOWED_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;

// Types
type Voice = typeof ALLOWED_VOICES[number];
interface TTSRequest {
    text: string;
    voice?: Voice;
}

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate speech
async function generateSpeech (text_chunk: string, voice: Voice): Promise<Buffer> {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice,
    input: text_chunk,
  });
  return Buffer.from(await mp3.arrayBuffer());
}

export async function POST(request: NextRequest) {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
            { error: "OpenAI API key not configured" },
            { status: 500 }
        );
    }

    try {
        // Parse and validate request
        const { text, voice = "fable" }: TTSRequest = await request.json();
        
        if (!text?.trim()) {
            return NextResponse.json(
                { error: "Text is required" },
                { status: 400 }
            );
        }

        // Ensure output directory exists
        await fs.promises.mkdir(SPEECH_FILE_DIR, { recursive: true });

        // Generate unique filename
        const filename = `tts-${Date.now()}.mp3`;
        const speechFile = path.join(SPEECH_FILE_DIR, filename);

        // Split text into chunks
        const textChunks = text.match(/(.{1,1000})/g) || [];
        
        // Generate audio for each chunk
        const buffers: Buffer[] = [];
        for (const chunk of textChunks) {
            const buffer = await generateSpeech(chunk, voice);
            buffers.push(buffer);
        }

        // Save audio file
        await fs.promises.writeFile(speechFile, buffers);

        // Return public URL
        return NextResponse.json({
            audioUrl: `/audio/${filename}`,
        });

    } catch (error) {
        console.error('TTS Error:', error);
        return NextResponse.json(
            { error: "Failed to generate speech" },
            { status: 500 }
        );
    }
}
