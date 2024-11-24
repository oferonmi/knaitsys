"use server";
import { OpenAI } from "openai";
import fs from "fs";
import { promises as fsPromises } from "fs";
import { exec } from "child_process";
import util from "util";
import { NextRequest, NextResponse } from "next/server";

const execAsync = util.promisify(exec);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TEMP_DIR = "/tmp";
const AUDIO_PATHS = {
	input: `${TEMP_DIR}/input.webm`,
	output: `${TEMP_DIR}/output.mp3`,
} as const;

async function convertAudioToMp3(audioBuffer: Buffer) {
	await fsPromises.writeFile(AUDIO_PATHS.input, audioBuffer);
	await execAsync(`ffmpeg -i ${AUDIO_PATHS.input} ${AUDIO_PATHS.output}`);
	const mp3Data = await fsPromises.readFile(AUDIO_PATHS.output);
	await Promise.all([
		fsPromises.unlink(AUDIO_PATHS.input),
		fsPromises.unlink(AUDIO_PATHS.output),
	]);
	return mp3Data;
}

async function transcribeAudio(audioBuffers: Buffer[]) {
	for (const audioBuffer of audioBuffers) {
		const mp3Data = await convertAudioToMp3(audioBuffer);
		await fsPromises.writeFile(AUDIO_PATHS.output, mp3Data);
	}
	
	const transcription = await openai.audio.transcriptions.create({
		file: fs.createReadStream(AUDIO_PATHS.output),
		model: "whisper-1",
	});
	
	await fsPromises.unlink(AUDIO_PATHS.output);
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
		// const { audio: base64Audio } = await request.json();
		// const audioBuffer = Buffer.from(base64Audio, "base64");
		// const transcript = await transcribeAudio(audioBuffer);

		const formData = await request.formData();
		// for single audio file
		// const audioBlob = formData.get("file") as Blob;
		// for multiple audio files
		// const audioBlobs = formData.getAll("file") as Blob[];
		const audioBuffers: Buffer[] = [];
		const entries = Array.from(formData.entries());
		for (const [key, value] of entries) {
			if (typeof value === 'object' && ('Blob' in value  || 'File' in value )) {
				const audioBlob = value as Blob | File;
				const arrayBuffer = await audioBlob.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				audioBuffers.push(buffer);
			}
		}
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
