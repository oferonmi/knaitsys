"use server";
import { OpenAI } from "openai";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";
import { NextRequest, NextResponse } from "next/server";

const execAsync = util.promisify(exec);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TEMP_DIR = path.resolve("./public/tmp");
// const TEMP_DIR = path.join(__dirname, "public", "tmp");

// Ensure the directory exists
if (!fs.existsSync(TEMP_DIR)) {
	fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// const AUDIO_PATHS = {
// 	input: `${TEMP_DIR}/input.webm`,
// 	output: `${TEMP_DIR}/output.mp3`,
// } as const;

const AUDIO_PATHS = {
	input: path.join(TEMP_DIR, "input.webm"),
	output: path.join(TEMP_DIR, "output.mp3"),
} as const;

async function convertAudioToMp3(audioBuffer: Buffer) {
	// Ensure temp directory exists
	// await fsPromises.mkdir(TEMP_DIR, { recursive: true });
	// write audio buffer to input file
	await fsPromises.writeFile(AUDIO_PATHS.input, audioBuffer);
	// convert audio to mp3
	await execAsync(`ffmpeg -i ${AUDIO_PATHS.input} ${AUDIO_PATHS.output}`);
	// read mp3 file
	const mp3Data = await fsPromises.readFile(AUDIO_PATHS.output);
	// delete input and output files
	await Promise.all([
		fsPromises.unlink(AUDIO_PATHS.input),
		fsPromises.unlink(AUDIO_PATHS.output),
	]);
	return mp3Data;
}

async function transcribeAudio(audioBuffers: Buffer[]) {
	// Ensure temp directory exists
	// await fsPromises.mkdir(TEMP_DIR, { recursive: true });
	// convert each audio buffer to mp3
	for (const audioBuffer of audioBuffers) {
		const mp3Data = await convertAudioToMp3(audioBuffer);
		// write mp3 data to output file
		await fsPromises.writeFile(AUDIO_PATHS.output, mp3Data);
	}
	// transcribe audio
	const transcription = await openai.audio.transcriptions.create({
		file: fs.createReadStream(AUDIO_PATHS.output),
		model: "whisper-1",
	});
	// delete output file
	await fsPromises.unlink(AUDIO_PATHS.output);
	// return transcription
	return transcription.text;
}

export async function POST(request: NextRequest) {
	if (!process.env.OPENAI_API_KEY) {
		return NextResponse.json(
			{ error: "OpenAI API key not configured" },
			{ status: 500 }
		);
	}

	try {
		// get audio files from form data
		const formData = await request.formData();
		//for debug purpose
		formData.forEach((value, key) => {
			console.log(key, value);
		});
		// for single audio file
		// const audioBlob = formData.get("file") as Blob;
		// for multiple audio files
		// const audioBlobs = formData.getAll("file") as Blob[];
		const audioBuffers: Buffer[] = [];
		const entries = Array.from(formData.entries());
		for (const [key, value] of entries) {
			if (typeof value === "object" && ("Blob" in value || "File" in value)) {
				const audioBlob = value as Blob | File;
				const arrayBuffer = await audioBlob.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				audioBuffers.push(buffer);
			}
		}
		
		// transcribe audio
		const transcript = await transcribeAudio(audioBuffers);
		return NextResponse.json({ transcript }, { status: 200 });
	} catch (error: any) {
		console.error("Transcription error:", error);
		return NextResponse.json(
			{ error: error.message || "Transcription failed" },
			{ status: 500 }
		);
	}
}
