"use server"

import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

// Create an OpenAI API client (that's edge friendly!)
const openAiConfig = {
    apiKey: process.env.OPENAI_API_KEY,
};
const openai = new OpenAI(openAiConfig);

const speech_file = path.resolve("./speech_output.mp3");

export async function POST(request: NextRequest) {

    if (!openAiConfig.apiKey) {
      return NextResponse.json(
        {
          error:
            "OpenAI API key not configured, please follow instructions in README.md",
        },
        { status: 500 }
      );
    }

    // Parse the request body
    const req = await request.json();

    // Extract the text data for coversion to speech from the request body
    const tts_text = req.text;

    // covert to audio
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "fable",
      input: tts_text,
    });
    
    console.log(speech_file);
    
    try{

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(speech_file, buffer);

    } catch(err) {

      console.log(err);

    }

    // Return audio response
    return NextResponse.json(
      { audio_file_path: speech_file }, 
      { status: 200 }
    );
}
