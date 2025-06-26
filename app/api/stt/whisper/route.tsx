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

const TEMP_DIR = path.join(process.cwd(), process.env.TEMP_DIR || "tmp");

async function ensureDirectoryExists(dirPath: string): Promise<void> {
	try {
		await fsPromises.access(dirPath);
	} catch {
		await fsPromises.mkdir(dirPath, { recursive: true });
	}
}

async function checkFFmpeg(): Promise<boolean> {
	try {
		await execAsync("ffmpeg -version");
		return true;
	} catch (error) {
		console.error("FFmpeg is not installed or not in PATH:", error);
		return false;
	}
}

async function convertAudioToMp3(audioBuffer: Buffer): Promise<string> {
	await ensureDirectoryExists(TEMP_DIR);
	const timestamp = Date.now() + Math.random();
	const inputPath = path.join(TEMP_DIR, `input-${timestamp}.webm`);
	const outputPath = path.join(TEMP_DIR, `output-${timestamp}.mp3`);
	try {
		await fsPromises.writeFile(inputPath, audioBuffer);
		await execAsync(`ffmpeg -y -i "${inputPath}" "${outputPath}"`);
		return outputPath;
	} catch (error) {
		console.error("Error in convertAudioToMp3:", error);
		throw new Error("Audio conversion failed");
	} finally {
		try {
			await fsPromises.unlink(inputPath).catch(() => {});
		} catch {}
	}
}

async function processFormDataAudio(formData: FormData): Promise<Buffer[]> {
	const audioBuffers: Buffer[] = [];
	const entries = Array.from(formData.entries());
	if (entries.length === 0) {
		throw new Error("No audio files provided in form data");
	}
	for (const [key, value] of entries) {
		if (!(value instanceof Blob)) continue;
		if (!value.type.startsWith("audio/")) continue;
		const arrayBuffer = await value.arrayBuffer();
		audioBuffers.push(Buffer.from(arrayBuffer));
	}
	if (audioBuffers.length === 0) {
		throw new Error("No valid audio files found in form data");
	}
	return audioBuffers;
}

async function transcribeAudio(audioBuffers: Buffer[]): Promise<string> {
	await ensureDirectoryExists(TEMP_DIR);
	const tempMp3Files: string[] = [];
	try {
		// Convert all audio buffers to mp3 files
		for (const audioBuffer of audioBuffers) {
			const mp3Path = await convertAudioToMp3(audioBuffer);
			tempMp3Files.push(mp3Path);
		}
		// For now, only transcribe the first file (OpenAI Whisper API does not support multi-file natively)
		const transcription = await openai.audio.transcriptions.create({
			file: fs.createReadStream(tempMp3Files[0]),
			model: "whisper-1",
		});
		return transcription.text;
	} catch (error) {
		console.error("Error in transcribeAudio: ", error);
		throw new Error("Transcription failed");
	} finally {
		// Clean up all temp mp3 files
		await Promise.all(
			tempMp3Files.map(async (file) => {
				try {
					await fsPromises.unlink(file);
				} catch {}
			})
		);
	}
}

export async function POST(request: NextRequest) {
	if (!process.env.OPENAI_API_KEY) {
		return NextResponse.json(
			{ error: "OpenAI API key not configured" },
			{ status: 500 }
		);
	}
	const ffmpegAvailable = await checkFFmpeg();
	if (!ffmpegAvailable) {
		return NextResponse.json(
			{ error: "FFmpeg is not installed or not accessible" },
			{ status: 500 }
		);
	}
	try {
		const formData = await request.formData();
		const audioBuffers = await processFormDataAudio(formData);
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
