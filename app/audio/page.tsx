"use client";
import { useState, useRef } from "react";
import {transcribeAudio} from "@/components/Audio"

function AudioPage() {
    
    const [audioInputType, setAudioInputType] = useState("microphone");
    const [transcribedText, setTranscribedText] = useState("");
    const audioRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    const handleAudioInputTypeChange = (event: { target: { value: any } }) => {
      setAudioInputType(event.target.value);
    };

    const handleAudioFileSelect = (event: { target: { value: any } }) => {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          const audioDataFromFile = e.target.result;
          audioRef.current.src = audioDataFromFile;
          audioRef.current.play();
        };
        fileReader.readAsDataURL(selectedFile);
      }
    };

    const handleAudioRecording = () => {
        if (!mediaRecorderRef.current) {
            const mediaRecorder = new MediaRecorder({ audio: true });
            const chunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: "audio/wav" });
                const audioDataFromRecording = URL.createObjectURL(audioBlob);
                audioRef.current.src = audioDataFromRecording;
                audioRef.current.play();
            };

            mediaRecorderRef.current = mediaRecorder;
        }

        if (mediaRecorderRef.current.state === "inactive") {
            mediaRecorderRef.current.start();
        } else if (mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    };


    return (
      <div className="flex flex-col bg-teal-100 bg-cover bg-center items-center justify-center h-screen text-black">
        <h1>Audio to Text Converter</h1>

        <div>
          <label>
            Select Audio Input Type:
            <select
              value={audioInputType}
              onChange={handleAudioInputTypeChange}
            >
              <option value="microphone">Microphone</option>
              <option value="file">Audio File</option>
            </select>
          </label>
        </div>

        {audioInputType === "file" && (
          <div>
            <label>
              Upload Audio File:
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioFileSelect}
              />
            </label>
          </div>
        )}

        {/* <button onClick={handleAudioInput}>Transcribe</button>
                    {transcribedText && (
                        <div>
                            <h2>Transcribed Text:</h2>
                            <p>{transcribedText}</p>
                        </div>
                    )} */}

        <button
          onClick={handleAudioRecording}
          className="inline-flex items-center py-1.5 px-3 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green"
        >
          {audioInputType === "microphone" ? "Start Recording" : "Play Audio"}
        </button>

        <audio controls ref={audioRef}></audio>

        {transcribedText && (
          <div>
            <h2>Transcribed Text:</h2>
            <p>{transcribedText}</p>
          </div>
        )}
      </div>
    );
}

export default AudioPage;
