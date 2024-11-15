"use server";
import { OpenAI } from "openai";
import fs from "fs";
import { exec } from "child_process";
import util from "util";
import { NextRequest, NextResponse } from "next/server";

// Promisify the exec function from child_process
const execAsync = util.promisify(exec);

// Create an OpenAI API client (that's edge friendly!)
const openAiConfig = {
	apiKey: process.env.OPENAI_API_KEY,
};
const openai = new OpenAI(openAiConfig);


// This function handles POST requests to the /api/speech2text/whisper route
export async function POST(request: NextRequest) {
	// Check if the OpenAI API key is configured
	if (!openAiConfig.apiKey) {
   		return NextResponse.json(
      		{
        		error: "OpenAI API key not configured, please follow instructions in README.md",
      		},
     		{ status: 500 }
    	);
	}	
  
  	// Parse the request body
  	const req = await request.json();
  
  	// Extract the audio data from the request body
  	const base64Audio = req.audio;
  
  	// Convert the Base64 audio data back to a Buffer
  	const audio = Buffer.from(base64Audio, "base64");
  
  	try {
    	// Convert the audio data to text
    	const text = await transcribeAudio(audio);
    
    	// Return the transcribed text in the response
    	return NextResponse.json({ transcript: text }, { status: 200 });
    
  	} catch (error: any) { 
    	// Handle any errors that occur during the request
    	if (error.response) {
      		console.error(error.response.status, error.response.data);
      		return NextResponse.json(
        		{ error: error.response.data }, 
        		{ status: 500 }
      		);
    	} else {
      		console.error(`Error with OpenAI API request: ${error.message}`);
      		return NextResponse.json(
        		{ error: "An error occurred during your request." },
        		{ status: 500 }
      		);
    	}
  	}
}

// Function for converting audio data to text using the OpenAI API
const transcribeAudio = async (audioData: Buffer) => {
	// Convert the audio data to MP3 format
	const mp3AudioData = await convertAudioToMp3(audioData);

	// Write the MP3 audio data to a file
	const inputMp3Path = "/tmp/output.mp3";
	fs.writeFileSync(inputMp3Path, mp3AudioData);

	// Transcribe the audio
	const transcription = await openai.audio.transcriptions.create({
		file: fs.createReadStream(inputMp3Path),
		model: "whisper-1",
	});

	// Delete the temporary file
	fs.unlinkSync(inputMp3Path);

	// output transcribed text
	return transcription.text;
};

// Function for converting audio data to MP3 format using ffmpeg
const convertAudioToMp3 = async (audioData: Buffer) => {
	// Write the audio data to a file
	const inputPath = "/tmp/input.webm";
	fs.writeFileSync(inputPath, audioData);

	// Convert the audio to MP3 using ffmpeg
	const outputPath = "/tmp/output.mp3";
	await execAsync(`ffmpeg -i ${inputPath} ${outputPath}`);

	// Read the converted audio data
	const mp3AudioData = fs.readFileSync(outputPath);

	// Delete the temporary files
	fs.unlinkSync(inputPath);
	fs.unlinkSync(outputPath);
	return mp3AudioData;
};
