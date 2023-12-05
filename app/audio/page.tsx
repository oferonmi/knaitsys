"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import ChatThread from "@/components/ChatThread"
import {
  transcribeAudio,
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
import { useChat, useCompletion } from "ai/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Timeline from "wavesurfer.js/dist/plugins/timeline.js";
import { AuthHandler } from "next-auth/core";

function AudioPage() {
  const [audioInputType, setAudioInputType] = useState("microphone");
  // const [micState, setMicState] = useState("ready"); // ready or stopped
  const [transcribedText, setTranscribedText] = useState("");
  const [recordedAudioUrl, setRecordedAudioUrl] = useState("");

  const audioRef = useRef(null);
  const transcriptTextInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  //will be used later to record audio
  const chunks = [];

  // sessions
  const { data: session, status } = useSession();

  //LLM engine API route
  // const [llmApiRoute, setLlmApiRoute] = useState("/api/chat/openai");

  // const handleLlmApiChange = (event: { target: { value: any } }) => {
  //   setLlmApiRoute("/api/chat/" + event.target.value);
  // };

  // // use OpenAI chat completion
  // const { messages, input, handleInputChange, handleSubmit } = useChat({
  //   api: llmApiRoute,
  // });

  const [llmApiRoute, setLlmApiRoute] = useState("/api/completion/fireworksai");

  const handleLlmApiChange = (event: { target: { value: any } }) => {
    setLlmApiRoute("/api/completion/" + event.target.value);
  };

  // text OpenAI completion function call
  const {
    completion,
    input,
    stop,
    isLoading,
    handleInputChange,
    handleSubmit,
  } = useCompletion({
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

  const onSendButtonClick = async () => {
    try {
      // get recorded audio blob from blob URL
      let audioBlob = await fetch(recordedAudioUrl).then((resp) => resp.blob());

      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async function () {
        // Remove the data URL prefix
        const base64Audio = reader.result?.split(",")[1];

        // transcribe audio
        const response = await fetch("/api/speech_to_text/whisper", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audio: base64Audio }),
        });

        // get transcript data
        const responseData = await response.json();

        if (response.status !== 200) {
          throw (
            responseData.error ||
            new Error(`Request failed with status ${response.status}`)
          );
        }

        const respText = responseData.transcript.text;
        console.log(respText);

        setTranscribedText(respText);
        console.log(transcribedText);
      };

    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <>
      <div className="flex flex-auto max-w-2xl pb-5 mx-auto mt-4 sm:px-4 grow">
        {completion.length == 0 && recordedAudioUrl.length == 0 && (
          <div className="mt-12 sm:mt-24 space-y-6 text-gray-500 text-base mx-8 sm:mx-4 sm:text-2xl leading-12 flex flex-col mb-12 sm:mb-24 h-screen">
            <div>
              <Emoji symbol="👋" label="waving hand" /> Hello! Select your LLM
              of choice and click on the microphone button{" "}
              <div className="inline-flex text-2xl font-extrabold">
                <MicMuteFillIcon2 />
              </div>{" "}
              to record your question. Click on the send button{" "}
              <div className="inline-flex text-2xl font-extrabold">
                <SendIcon />
              </div>{" "}
              to get a response to your question.
            </div>
          </div>
        )}

        {recordedAudioUrl.length > 0 && (
          <output className="flex flex-col text-sm sm:text-base text-gray-700 flex-1 gap-y-4 mt-1 gap-x-4 rounded-md bg-gray-50 py-5 px-5 pb-80 grow">
            {transcribedText != "" ? transcribedText : recordedAudioUrl}
            <WaveSurferAudioPlayer
              waveColor="#CBD5E0"
              progressColor="#EF4444"
              url={recordedAudioUrl}
              plugins={[Timeline.create()]}
              height={80}
              // ctrlsPosition="left"
            />
            {completion.length > 0 && completion}
          </output>
        )}

        <div className="z-10 fixed left-0 right-0 bottom-0 bg-gray-100 border-t-2 border-b-2">
          <div className="container max-w-3xl mx-auto my-5 py-3 space-x-2 ">
            <div className="flex flex-row">
              <div>
                <select
                  onChange={handleLlmApiChange}
                  className="inline-flex  py-5 px-1 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green ml-2 mr-2 mb-2"
                  id="llm-selector"
                  required
                >
                  <option value="">--Select LLM--</option>
                  <option value="openai">GPT-3.5</option>
                  <option value="fireworksai">Llama-2-Fwks</option>
                  {/* <option value="replicate">Llama-2-Rplte</option> */}
                  <option value="cohere">Co:here</option>
                  <option value="huggingface">OpenAssistant-HF</option>
                  {/* <option value="anthropic">Claude-2</option> */}
                </select>
              </div>

              <div className="w-full">
                {audioInputType === "microphone" && (
                  <WaveSurferAudioRecoder
                    waveColor="#D9E2D5"
                    progressColor="#3E6765"
                    setRecordedAudioUrl={setRecordedAudioUrl}
                    height={50}
                    width={100}
                  />
                )}
              </div>

              <div>
                {/* <form onSubmit={onSendButtonClick}> */}
                <input
                  ref={transcriptTextInputRef}
                  type="hidden"
                  value={input}
                  onChange={(e) => setTranscribedText(e.target.value)}
                  // value={input}
                  // onChange={handleInputChange}
                />

                <button
                  className="inline-flex items-center py-5 px-5 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-full hover:bg-kaito-brand-ash-green"
                  // type="submit"
                  onClick={onSendButtonClick}
                  disabled={isLoading}
                >
                  <SendIcon />
                </button>
                {/* </form> */}
              </div>

              {/* <button
              className="inline-flex items-center py-5 px-5 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-full hover:bg-kaito-brand-ash-green"
              // type="submit"
              onClick={handleSendButtonClick}
              >
                <SendIcon />
              </button> */}
              <div>
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
            </div>

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

            {audioInputType === "file" && (
              <button
                className="inline-flex justify-center items-center p-2 text-gray-500 rounded-full cursor-pointer py-5 px-5 hover:text-white border border-kaito-brand-ash-green hover:bg-kaito-brand-ash-green"
                onClick={() => setAudioInputType("microphone")}
              >
                <MicFillIcon2 />
                <span className="sr-only">Attach file</span>
              </button>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default AudioPage;
