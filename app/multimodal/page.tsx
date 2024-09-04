'use client';

import { useChat } from 'ai/react';
import { useRef, useState, useEffect, type FormEvent } from 'react';
import Image from "next/image";
import {
  transcribeAudio,
  WaveSurferAudioRecoder,
  WaveSurferAudioPlayer,
} from "@/components/Audio";
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { ToastContainer, toast } from "react-toastify";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { SendIcon, ClipIcon } from '@/components/Icons';
import { Footer } from "@/components/Footer";
import { Tooltip } from "flowbite-react";

export default function Chat() {
    //LLM engine API route
    const [llmApiRoute, setLlmApiRoute] = useState("/api/multimodal/chat/llava");
    const [sourcesForMessages, setSourcesForMessages] = useState<
        Record<string, any>
    >({});
    const [recordedAudioUrl, setRecordedAudioUrl] = useState("");
    const { messages, input, setInput, handleInputChange, handleSubmit, isLoading } = useChat({
        api: llmApiRoute,
        onResponse(response) {
            const sourcesHeader = response.headers.get("x-sources");
            const sources = sourcesHeader ? JSON.parse(atob(sourcesHeader)) : [];
            const messageIndexHeader = response.headers.get("x-message-index");

            if (sources.length && messageIndexHeader !== null) {
                setSourcesForMessages({
                    ...sourcesForMessages,
                [   messageIndexHeader]: sources,
                });
            }

            setShowSendButton(false);
        },
        onError: (e) => {
            toast(e.message, {
                theme: "dark",
            });
        },
    });

    const [files, setFiles] = useState<FileList | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);

    const [showAudioRecorder, setShowAudioRecorder] = useState<boolean>(false);
    const [transcribedText, setTranscribedText] = useState("");

    const [showFileAttactmentUI, setShowFileAttactmentUI] = useState<boolean>(false);
    const [showSendButton, setShowSendButton] = useState<boolean>(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messages?.length > 0 ) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const transcribeAudioIn = async(audioBlob: Blob) => {
        try {
            // get recorded audio blob from blob URL
            //let audioBlob = await fetch(recordedAudioUrl).then((resp) => resp.blob());

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);

            reader.onloadend = async () => {
                // Remove the data URL prefix
                // const audioBinary = reader.result;
                // const view = new Float64Array(audioBinary.);
                // const base64Audio = view.slice(1, view.length - 1);
                //const base64Audio = reader.result?.split(",")[1];
                const base64Audio = reader.result?.slice(1, -1);

                // transcribe audio prompt
                const stt_response = await fetch("/api/speech_to_text/whisper", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ 
                        audio: base64Audio 
                    }),
                });

                // get transcript data
                const stt_resp_data = await stt_response.json();

                if (stt_response.status !== 200) {
                    throw (
                        stt_resp_data.error ||
                        new Error(
                        `speech to text failed with status ${stt_response.status}`
                        )
                    );
                }

                const stt_resp_txt = stt_resp_data.transcript.text;
                // console.log(`STT response: ${stt_resp_txt}`);

                setTranscribedText(stt_resp_txt);

                // update input data to only current input
                //setInput(stt_resp_txt);

                // pass transcribed text to LLM API end point and update completion data state
                //append(stt_resp_txt); //TO DO modify string into a Message type before appending
            };
            
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        }
    }

    const recorderCtrls = useAudioRecorder(
        {
            noiseSuppression: true,
            echoCancellation: true,
        },
        (err) => console.table(err) // onNotAllowedOrFound
    );

    const audioRecorderUI = (
        <>
            <AudioRecorder
                onRecordingComplete={(blob) => transcribeAudioIn(blob)}
                recorderControls={recorderCtrls}
                // downloadOnSavePress={true}
                // downloadFileExtension="mp3"
                showVisualizer={true}
            />
        </>
    );

    const loadingAnimation = (
        <>
            <div role="status" className={`${isLoading ? "" : "hidden"} flex justify-center`}>
                <svg
                    aria-hidden="true"
                    className="w-6 h-6 text-white animate-spin dark:text-white fill-kaito-brand-ash-green"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                    />
                    <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                    />
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
        </>
    );

    return (
        <>
            <div className="flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden text-black min-h-screen">
                <div className="flex flex-col w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out pb-40  text-black">
                    {messages.length > 0
                        ? [...messages].map((m, i) => {
                            const sourceKey = (messages.length - 1 - i).toString();
                            return (
                                <ChatMessageBubble
                                    key={m.id}
                                    message={m}
                                    aiEmoji={"🤖"}
                                    sources={sourcesForMessages[sourceKey]}
                                ></ChatMessageBubble>
                            );
                        })
                    : ""}
                </div>

                <div ref={bottomRef} />
            
                <form
                    className="fixed bottom-0 w-full max-w-3xl  border border-gray-300 rounded-lg shadow-xl  space-x-2 text-black mb-20 container flex mx-auto my-auto pt-9 pb-9 px-5"
                    onSubmit={event => {
                        handleSubmit(event, {
                            experimental_attachments: files,
                        });
                        
                        setFiles(undefined);
                        
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }

                        setShowFileAttactmentUI(false);
                    }}
                >
                    {showAudioRecorder ? <div className='w-full '>{audioRecorderUI}</div> :
                        <>
                            <div>
                                {!showFileAttactmentUI ?
                                    <Tooltip content="Upload File" className="inline-flex">
                                        <button
                                            type="button"
                                            className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-5 py-5"
                                            onClick={() => {
                                                setShowFileAttactmentUI(true);
                                            }}
                                        >
                                            <ClipIcon />
                                            <span className="sr-only">Attach file</span>
                                        </button>
                                    </Tooltip>
                                :
                                    <input
                                        type="file"
                                        className="border fill-kaito-brand-ash-green"
                                        onChange={event => {
                                            if (event.target.files) {
                                                setFiles(event.target.files);
                                            }
                                        }}
                                        multiple
                                        ref={fileInputRef}
                                    />
                                }
                            </div>

                            <input
                                className="w-full h-14 p-2 rounded-full border border-kaito-brand-ash-green focus:border-kaito-brand-ash-green text-kaito-brand-ash-green placeholder:text-gray-400 "
                                value={input}
                                placeholder=" Say something..."
                                //ref={textInputRef}
                                onChange={(e) => {
                                    handleInputChange(e);

                                    if (e.target.value.length > 0) {
                                        setShowSendButton(true);
                                    } else {
                                        setShowSendButton(false);
                                    }
                                }}
                            />

                            {showSendButton ?
                                <button
                                    className="bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-5 py-5"
                                    type="submit"
                                >
                                    { loadingAnimation }
                                    <span className={isLoading ? "hidden" : ""}>
                                        <SendIcon />
                                    </span>
                                </button>
                            :
                                <button
                                    className="bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-5 py-5"
                                    type="button"
                                    onClick={() => setShowAudioRecorder(true)}
                                >
                                    {/* { loadingAnimation } */}
                                    {/* <span className={isLoading ? "hidden" : ""}> */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-mic-fill" viewBox="0 0 16 16">
                                        <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z"/>
                                        <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/>
                                    </svg>
                                    {/* </span> */}
                                </button>
                            }
                        </>
                    }                  
                </form>   
            </div>
            {messages.length > 0 ? <div className="  bottom-0"><Footer /></div> : ""}
        </>
    );
}