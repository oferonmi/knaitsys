"use client";
import { useState, useRef } from "react";

function AudioPage() {
  const [audioInputType, setAudioInputType] = useState("microphone");
  const [transcribedText, setTranscribedText] = useState("");
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const handleAudioInputTypeChange = (event) => {
    setAudioInputType(event.target.value);
  };

  const handleFileSelect = (event) => {
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
    if (audioInputType === "microphone") {
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
    }
  };

  // const handleAudioInput = async () => {
  //     try {
  //         // You would need to implement audio recording or file selection logic here.
  //         // For simplicity, this example assumes you have an audio recording in a variable called "audioData."

  //         // Replace 'YOUR_WHISPER_API_KEY' with your actual Whisper API key.
  //         const apiKey = "YOUR_WHISPER_API_KEY";

  //         const formData = new FormData();
  //         formData.append("audio", audioData);

  //         const response = await fetch("https://api.whisper.ai/your-endpoint", {
  //             method: "POST",
  //             body: formData,
  //             headers: {
  //                 Authorization: `Bearer ${apiKey}`,
  //             },
  //         });

  //         if (response.ok) {
  //             const result = await response.json();
  //             setTranscribedText(result.transcription);
  //         } else {
  //             console.error("Error transcribing audio.");
  //         }
  //     } catch (error) {
  //         console.error("Error:", error);
  //     }
  // };

  return (
    <div>
      <h1>Audio to Text Converter</h1>

      <div>
        <label>
          Select Audio Input Type:
          <select value={audioInputType} onChange={handleAudioInputTypeChange}>
            <option value="microphone">Microphone</option>
            <option value="file">Audio File</option>
          </select>
        </label>
      </div>

      {audioInputType === "file" && (
        <div>
          <label>
            Upload Audio File:
            <input type="file" accept="audio/*" onChange={handleFileSelect} />
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

      <button onClick={handleAudioRecording}>
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
