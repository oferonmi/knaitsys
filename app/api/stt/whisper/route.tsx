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

// temp directory path
const TEMP_DIR = path.join(process.cwd(), process.env.TEMP_DIR || "tmp");

async function ensureDirectoryExists(dirPath: string) {
  try {
    await fsPromises.access(dirPath);
  } catch {
    await fsPromises.mkdir(dirPath, { recursive: true });
  }
}

async function checkFFmpeg() {
	try {
		await execAsync('ffmpeg -version');
		console.log('FFmpeg is available');
		return true;
	} catch (error) {
		console.error('FFmpeg is not installed or not in PATH:', error);
		return false;
	}
}

async function convertAudioToMp3(audioBuffer: Buffer) {
	// Ensure temp directory exists
	await ensureDirectoryExists(TEMP_DIR);

	const timestamp = Date.now();
	const inputPath = path.join(TEMP_DIR, `input-${timestamp}.webm`);
	const outputPath = path.join(TEMP_DIR, `output-${timestamp}.mp3`);

	try {
		// write audio buffer to input file
		await fsPromises.writeFile(inputPath, audioBuffer);
		// convert audio to mp3
		await execAsync(`ffmpeg -i "${inputPath}" "${outputPath}"`);
		// read mp3 file
		const mp3Data = await fsPromises.readFile(outputPath);
		return mp3Data;
	} catch (error) {
    	console.error('Error in convertAudioToMp3:', error);
    	throw error;
	} finally {
		// Clean up files even if there's an error
		try {
			await Promise.all([
			fs.existsSync(inputPath) &&
				fsPromises.unlink(inputPath),
			fs.existsSync(outputPath) &&
				fsPromises.unlink(outputPath),
			]);
		} catch (error) {
			console.error("Error cleaning up temporary files:", error);
		}
	}
}

async function transcribeAudio(audioBuffers: Buffer[]) {
	try {
		await ensureDirectoryExists(TEMP_DIR);
		const timestamp = Date.now();
		const outputPath = path.join(TEMP_DIR, `final-${timestamp}.mp3`);

		// Process each audio buffer
		for (const audioBuffer of audioBuffers) {
			const mp3Audio = await convertAudioToMp3(audioBuffer);
			console.log("", mp3Audio); //for debug purpose. Remove after fix.
			//TO DO: It seems file is not created. Find out why.
			await fsPromises.writeFile(outputPath, mp3Audio);
		}

		// Transcribe
		const transcription = await openai.audio.transcriptions.create({
			file: fs.createReadStream(outputPath),
			model: "whisper-1",
		});

		// Cleanup
		await fsPromises.unlink(outputPath).catch(() => {});

		return transcription.text;
	} catch (error) {
		console.error("Error in transcribeAudio:", error);
		throw error;
	}
}

export async function POST(request: NextRequest) {
	// Check API key configured
	if (!process.env.OPENAI_API_KEY) {
		return NextResponse.json(
			{ error: "OpenAI API key not configured" },
			{ status: 500 }
		);
	}

	// Add FFmpeg check
	const ffmpegAvailable = await checkFFmpeg();
	if (!ffmpegAvailable) {
		return NextResponse.json(
			{ error: "FFmpeg is not installed or not accessible" },
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
