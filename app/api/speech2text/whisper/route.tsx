import { OpenAI} from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import fs from "fs";
import { exec } from "child_process";
import { NextResponse } from "next/server";

// Promisify the exec function from child_process
const util = require('util');
const execAsync = util.promisify(exec);

// Create an OpenAI API client (that's edge friendly!)
const openAiConfig = {
    apiKey: process.env.OPENAI_API_KEY,
};
const openai = new OpenAI(openAiConfig);

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

// This function handles POST requests to the /api/speechToText route
export async function POST(request) {
    // Check if the OpenAI API key is configured
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
    const req = await request.json()

    // Extract the audio data from the request body
    const base64Audio = req.audio;

    // Convert the Base64 audio data back to a Buffer
    const audio = Buffer.from(base64Audio, 'base64');
    try {
        // Convert the audio data to text
        const text = await transcribeAudio(audio);
        // Return the transcribed text in the response
        return NextResponse.json({result: text}, {status:200});
    } catch(error) {
        // Handle any errors that occur during the request
        if (error.response) {
            console.error(error.response.status, error.response.data);
            return NextResponse.json({ error: error.response.data }, {status:500});
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
            return NextResponse.json({ error: "An error occurred during your request." }, {status:500});
        }
    }
}

// This function converts audio data to text using the OpenAI API
const transcribeAudio = async(audioData: Blob) => {
    // Convert the audio data to MP3 format
    const mp3AudioData = await convertAudioToMp3(audioData);

    // Write the MP3 audio data to a file
    const outputPath = '/tmp/output.mp3';
    fs.writeFileSync(outputPath, mp3AudioData);

    // Transcribe the audio
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: "whisper-1",
    });

    // Delete the temporary file
    fs.unlinkSync(outputPath);

    // output transcribed text
    return transcription;
}

// This function converts audio data to MP3 format using ffmpeg
const convertAudioToMp3 = async (audioData) => {
    // Write the audio data to a file
    const inputPath = '/tmp/input.webm';
    fs.writeFileSync(inputPath, audioData);
    
    // Convert the audio to MP3 using ffmpeg
    const outputPath = '/tmp/output.mp3';
    await execAsync(`ffmpeg -i ${inputPath} ${outputPath}`);

    // Read the converted audio data
    const mp3AudioData = fs.readFileSync(outputPath);

    // Delete the temporary files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
    return mp3AudioData;
}

// export async function POST(data: FormData) {
    
//     const response = await fetch("https://api.openai.com/v1/audio/transcriptions",{
//         method: "POST",
//         body: data,
//         headers: {
//             Authorization: `Bearer ${apiKey}`,
//         },
//     });

//     // Convert the response into a friendly text-stream
//     const stream = OpenAIStream(response);
//     // Respond with the stream
//     return new StreamingTextResponse(stream);
// }