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
		// console.log('FFmpeg is available');
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

async function processFormDataAudio(formData: FormData): Promise<Buffer[]> {
    const audioBuffers: Buffer[] = [];
    const entries = Array.from(formData.entries());
    
    if (entries.length === 0) {
        throw new Error('No audio files provided in form data');
    }

    for (const [key, value] of entries) {
        try {
            if (!(value instanceof Blob)) {
                console.warn(`Skipping entry '${key}': Expected Blob/File, got ${typeof value}`);
                continue;
            }

            // Optional: Check file type
            if (!value.type.startsWith('audio/')) {
                console.warn(`Skipping file '${key}': Invalid file type ${value.type}`);
                continue;
            }

            const arrayBuffer = await value.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            audioBuffers.push(buffer);
        } catch (error: any) {
            console.error(`Error processing audio file '${key}':`, error);
            throw new Error(`Failed to process audio file '${key}': ${error.message}`);
        }
    }

    if (audioBuffers.length === 0) {
        throw new Error('No valid audio files found in form data');
    }

    return audioBuffers;
}

async function transcribeAudio(audioBuffers: Buffer[]) {
	try {
    await ensureDirectoryExists(TEMP_DIR);
    const timestamp = Date.now();
    const outputPath = path.join(TEMP_DIR, `final-${timestamp}.mp3`);

    // Process each audio buffer
    for (const audioBuffer of audioBuffers) {
      const mp3Audio = await convertAudioToMp3(audioBuffer);
      await fsPromises.writeFile(outputPath, mp3Audio); // may need to append mutlipe audio to one file
    }

    // Transcribe
    // const transcription = {text: "Dummy transcription text"}; //remove if Whisper API used
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: "whisper-1",
    });

    // Cleanup
    await fsPromises.unlink(outputPath).catch(() => {});

    return transcription.text;
  } catch (error) {
		console.error("Error in transcribeAudio: ", error);
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

	// Check if FFmpeg installed
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
