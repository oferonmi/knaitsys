"use client";
import { useState, useRef } from "react";
import ChatThread from "@/components/ChatThread"
import {
  WaveSurferAudioRecoder,
  WaveSurferAudioPlayer,
} from "@/components/Audio";
import {
  PlayFillIcon,
  StopIcon, 
  PauseFillIcon,
  MicFillIcon2,
  MicMuteFillIcon2,
  SendIcon,
  FileEarmarkMusicIcon,
  CloudUploadIcon,
} from "@/components/Icons";
import Emoji from "@/components/Emoji";
import { Footer } from "@/components/Footer";
import { useChat } from "ai/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";


function AudioPage() {
  const [audioInputType, setAudioInputType] = useState("microphone");
  const [micState, setMicState] = useState("ready"); // ready or stopped
  const [transcribedText, setTranscribedText] = useState("");

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  //will be used later to record audio
  const chunks = [];

  // sessions
  const { data: session, status } = useSession();

  //LLM engine API route
  const [llmApiRoute, setLlmApiRoute] = useState("/api/chat/openai");

  const handleLlmApiChange = (event: { target: { value: any } }) => {
    setLlmApiRoute("/api/chat/" + event.target.value);
  };

  // use OpenAI chat completion
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: llmApiRoute,
  });

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
    //check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support recording!");
      return;
    }

    if (!mediaRecorderRef.current) {
      //will be used later to record audio
      const chunks = [];

      // setup audio recorder
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            //create the Blob from the chunks
            const audioBlob = new Blob(chunks, { type: "audio/mp3" });
            const recordedAudioDataPath = URL.createObjectURL(audioBlob);
            audioRef.current.src = recordedAudioDataPath;
            // audioRef.current.play();
          };

          mediaRecorderRef.current = mediaRecorder;

          if (mediaRecorderRef.current.state === "inactive") {
            // start recording
            mediaRecorderRef.current.start();
          } else if (mediaRecorderRef.current.state === "recording") {
            // stop recording
            mediaRecorderRef.current.stop();
          }
        })
        .catch((err) => {
          alert(`The following error occurred: ${err}`);
        });
    }
  };

  const transcribeAudio = async (audioData: Blob) => {
    try {
      // You would need to implement audio recording or file selection logic here.
      // For simplicity, this example assumes you have an audio recording in a variable called "audioData."

      // Whisper API key.
      const apiKey = process.env.OPENAI_API_KEY;

      const formData = new FormData();
      formData.append("audio", audioData, "kaito_prompt.mp3");

      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setTranscribedText(result.transcription);
      } else {
        console.error("Error transcribing audio.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div className="flex flex-auto max-w-2xl pb-5 mx-auto mt-4 sm:px-4 grow">
        {messages.length == 0 && (
          <div className="mt-12 sm:mt-24 space-y-6 text-gray-500 text-base mx-8 sm:mx-4 sm:text-2xl leading-12 flex flex-col mb-12 sm:mb-24 h-screen">
            <div>
              <Emoji symbol="👋" label="waving hand" /> Hello! Select your LLM
              of choice and click on the microphone button{" "}
              <div className="inline-flex text-2xl font-extrabold">
                <MicFillIcon2 />
              </div>{" "}
              to record your question. Click on the send button{" "}
              <div className="inline-flex text-2xl font-extrabold">
                <SendIcon />
              </div>{" "}
              to get a response to your question.
            </div>
          </div>
        )}

        {messages.length > 0 && <ChatThread messages={messages} />}

        <div className="z-10 fixed left-0 right-0 bottom-0 bg-gray-100 border-t-2 border-b-2">
          <div className="container max-w-3xl mx-auto my-5 py-3 space-x-2">
            {/* <label className="text-black" htmlFor="llm-selector">Select LLM: </label> */}

            <select
              onChange={handleLlmApiChange}
              className="inline-flex items-center py-2 px-2 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green ml-2 mr-2 mb-2"
              id="llm-selector"
              required
            >
              <option value="">--Select LLM--</option>
              <option value="openai">GPT-3.5</option>
              {/* <option value="replicate">Llama-2-Rplcte</option> */}
              <option value="fireworksai">Llama-2-Fwks</option>
              <option value="langchain">LangChain</option>
              <option value="huggingface">OpenAssistant-HF</option>
              {/* <option value="anthropic">Claude-1</option> */}
            </select>

            {audioInputType === "microphone" && (
              // <button
              //   onClick={handleAudioRecording}
              //   className="inline-flex items-center py-5 px-5 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-full hover:bg-kaito-brand-ash-green"
              // >
              //   {micState === "ready" && <MicFillIcon2 />}
              //   {micState === "stopped" && <MicMuteFillIcon2 />}
              // </button>

              <WaveSurferAudioRecoder
                waveColor="#D9E2D5"
                progressColor="#3E6765"
              />
            )}

            {audioInputType === "file" && (
              <div className="flex flex-col items-center justify-center">
                <label className="relative cursor-pointer rounded-full px-2 border border-kaito-brand-ash-green bg-white text-gray-200">
                  <div className="flex flex-col items-center justify-center">
                    <CloudUploadIcon />
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* <audio
              controls
              ref={audioRef}
              className=" border border-kaito-brand-ash-green rounded-full"
            ></audio> */}

            <button
              className="inline-flex items-center py-5 px-5 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-full hover:bg-kaito-brand-ash-green"
              type="submit"
            >
              <SendIcon />
            </button>

            {audioInputType === "file" && (
              <button
                className="inline-flex justify-center items-center p-2 text-gray-500 rounded-full cursor-pointer py-5 px-5 hover:text-white border border-kaito-brand-ash-green hover:bg-kaito-brand-ash-green"
                onClick={() => setAudioInputType("microphone")}
              >
                <MicFillIcon2 />
                <span className="sr-only">Attach file</span>
              </button>
            )}

            {audioInputType === "microphone" && (
              <button
                type="button"
                className="inline-flex justify-center items-center p-2 text-gray-500 rounded-full cursor-pointer py-5 px-5 hover:text-white border border-kaito-brand-ash-green hover:bg-kaito-brand-ash-green  "
                onClick={() => setAudioInputType("file")}
              >
                <FileEarmarkMusicIcon />
                <span className="sr-only">Attach file</span>
              </button>
            )}
          </div>
          <Footer />
        </div>
      </div>

      {/* <div className="flex flex-col bg-teal-100 bg-cover bg-center items-center justify-center h-screen text-black">
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

          <button
            onClick={handleAudioRecording}
            className="inline-flex items-center py-1.5 px-3 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green"
          >
            {audioInputType === "microphone" ? (
              <MicFillIcon2 />
            ) : (
              <PlayFillIcon />
            )}
          </button>

          <audio controls ref={audioRef}></audio> */}

      {/* {transcribedText && (
            <div>
              <h2>Transcribed Text:</h2>
              <p>{transcribedText}</p>
            </div>
          )} */}
      {/* </div> */}
    </>
  );
}

export default AudioPage;
