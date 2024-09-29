'use client';

import { useChat } from 'ai/react';
import { useRef, useState, useEffect, type FormEvent, useCallback, use } from 'react';
import Image from "next/image";
import { AudioRecorder } from "@/components/AudioRecorder";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import { ToastContainer, toast } from "react-toastify";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css';
import { Footer } from "@/components/Footer";
import { Tooltip } from "flowbite-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function MultiModalChat() {
    // sessions
    const { data: session, status } = useSession();

    //LLM engine API route
    const [llmApiRoute, setLlmApiRoute] = useState("/api/multimodal/chat/openai");
    const [sourcesForMessages, setSourcesForMessages] = useState<
        Record<string, any>
    >({});
    const [recordedAudioUrl, setRecordedAudioUrl] = useState("");

    const { 
        messages,  
        setMessages, 
        input, 
        setInput, 
        handleInputChange, 
        handleSubmit, 
        isLoading 
    } = useChat({
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
	const [audioIn, setAudioIn] = useState();

    const [showFileAttactmentUI, setShowFileAttactmentUI] = useState<boolean>(false);
    const [showSendButton, setShowSendButton] = useState<boolean>(false);

    const bottomRef = useRef<HTMLDivElement>(null);
	const sendButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (messages?.length > 0 ) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

	const transcribeAudio = async() => {
		// transcribe audio prompt
		const stt_response = await fetch("/api/speech_to_text/whisper", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ 
				audio: audioIn 
			}),
		});
		
		
		if (stt_response.status == 200) {
			// get transcript data
			const stt_resp_json = await stt_response.json();

			const stt_resp_txt = stt_resp_json.transcript.text;
			// console.log(`STT response: ${stt_resp_txt}`);

			setTranscribedText(stt_resp_txt);
			//console.log(`STT response: ${transcribedText}`);
		} else {
			throw (
				new Error(
					`speech to text failed with status ${stt_response.status}`
				)
			);
		}
	}

    const processAudioBlob = (audioBlob: Blob) => {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);

            reader.onloadend = () => {
				const audioBuffer = reader.result;
				// console.log(audioBuffer);
				// const audioStr = new TextDecoder('utf-8').decode(audioBuffer);

				// Remove the data URL prefix
				const base64Audio = reader.result?.split(",")[1];
				// console.log(typeof base64Audio);
				// const base64Audio = audioStr.split(",")[1];

				setAudioIn(base64Audio);

				// transcribe audio
				// transcribeAudio();
            };
            
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        }
    }

	const processAudioIn =  useCallback(async(audioBlob: Blob) =>  {
		// get audio content
		processAudioBlob(audioBlob);

		// convert to text
		await transcribeAudio();
		
		// update input text
    	setInput(transcribedText);

		// if (textInputRef.current?.value != null && sendButtonRef.current) {
		// 	setShowSendButton(true);
		// 	sendButtonRef.current?.click();
		// 	setTranscribedText("");
		// }
	},[textInputRef, sendButtonRef])

    const handleSend = (event: FormEvent<HTMLFormElement>) => {
        handleSubmit(event, {
            experimental_attachments: files,
        });
                            
        setFiles(undefined);
                            
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        setShowFileAttactmentUI(false);
    }

    const recorderSettings = {
        noiseSuppression: true,
        echoCancellation: true,
    }

    const recorderControls = useAudioRecorder(recorderSettings);

    const audioRecorderWidget = (
        <div className='flex items-center rounded-full bg-white border border-kaito-brand-ash-green mr-auto ml-auto py-1 px-1'>
            <AudioRecorder
                audioTrackSettings={recorderSettings}
                recorderCtrls={recorderControls}
                showVisualizer={true}
                onRecordingComplete={(blob: Blob) => processAudioIn(blob)}
                setShowRecorder={setShowAudioRecorder} 
            />
        </div>
    );

    const loadingAnimation = (
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
    );

    const chatFormWidgets = (
        <>
            {showAudioRecorder ? audioRecorderWidget : (
                //  Main form input widgets
                <div className='flex flex-row space-x-2 w-full'>
                    {messages.length > 0 && (
                        <Tooltip content="Clear Chat Thread" className="inline-flex">
                            <button
                                className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-medium text-gray-200 rounded-full px-6 py-5 mr-2"
                                type="button"
                                onClick={() => { setMessages([]); } }
                            >
                                <i className="bi bi-trash3-fill"></i>
                            </button>
                        </Tooltip>
                    )}

                    <div>
                        {!showFileAttactmentUI ? (
                            <Tooltip content="Upload File" className="inline-flex">
                                <button
                                    type="button"
                                    className="inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-6 py-5"
                                    onClick={() => {
                                        setShowFileAttactmentUI(true);
                                    }}
                                >
                                    <i className="bi bi-paperclip"></i>
                                    <span className="sr-only">Attach file</span>
                                </button>
                            </Tooltip>
						):(
                            <input
                                type="file"
                                id="multimod-file-in"
                                className="border bg-white border-kaito-brand-ash-green rounded-lg py-2 inline-flex pl-2"
                                onChange={event => {
                                    if (event.target.files) {
                                        setFiles(event.target.files);
                                    }
                                }}
                                multiple
                                ref={fileInputRef}
                            />
                        )}
                    </div>
                    
                    <input
                        className="w-full h-16 p-2 rounded-full border border-kaito-brand-ash-green focus:border-kaito-brand-ash-green text-kaito-brand-ash-green placeholder:text-gray-400 "
                        id="multimod-text-in"
                        value={input}
                        placeholder=" Say something..."
                        ref={textInputRef}
                        onChange={(e) => {   
                            if (e.target.value.length > 0) {
                                setShowSendButton(true);
                            };

							handleInputChange(e);
                        }}
                    />
                
                    {showSendButton ? (
                        <button
                            className="bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-6 py-5"
                            type="submit" ref={sendButtonRef}
                        >
                            { loadingAnimation }
                            <span className={isLoading ? "hidden" : ""}>
                                <i className="bi bi-send-fill"></i>
                            </span>
                        </button>
					):(
                        <button
                            className="bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-6 py-5"
                            type="button"
                            onClick={() => {
                                setShowAudioRecorder(true);
                                recorderControls.startRecording();
                            }}
                        >
                            <i className="bi bi-mic-fill"></i>
                        </button>
                    )}
                </div>
            )}                  
        </>
    );

    const frontSectionUI = (
       <div className="flex flex-col justify-center items-center md:p-8  min-h-screen max-w-2xl mx-auto my-auto ">
			<h1 className="text-center text-3xl md:text-3xl mb-4 text-gray-700">
				State your query / questions using the various multimodal input options.
			</h1>
			
			<p className="text-black text-lg text-center">
				Use any of the inputs to make your inquiry.
			</p>
			
			<br></br>
			
			<form
				className="w-full max-w-3xl border border-gray-300 rounded-lg shadow-xl space-x-2 text-black flex justify-center items-center pt-9 pb-9 px-5"
				onSubmit={(event) => handleSend(event) }
			>
				{chatFormWidgets}            
			</form>
       </div>
    );

	// Temporal. for debug purpose
	useEffect(() => {
		console.log(`Transcribed audio text: ${transcribedText}`);
	},[transcribedText])

	// trigger LLM text input update
	useEffect(() => {
		// update input text
    	// setInput(transcribedText);

		if (textInputRef.current?.value != null && sendButtonRef.current) {
			setShowSendButton(true);
			sendButtonRef.current?.click();
			setTranscribedText("");
		}
	},[transcribedText])

    return (
        <>
            {status === "authenticated" && (
                <>
                    {messages.length > 0 ? (
                        <>
                            {/* Chat section */}
                            <div className="flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden text-black min-h-screen">
                                <div className="flex flex-col w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out pb-40  text-black">
                                    {messages.length > 0  ?
                                        [...messages].map((m, i) => {
                                            const sourceKey = (messages.length - 1 - i).toString();
                                            return (
                                                <ChatMessageBubble
                                                    key={m.id}
                                                    message={m}
                                                    aiEmoji={"🤖"}
                                                    sources={sourcesForMessages[sourceKey]}
                                                />
                                            );
                                        })
                                    : ""} 
                                </div>

                                <div ref={bottomRef} />
                            
                                <form
                                    className="fixed bottom-0 w-full max-w-3xl  border border-gray-300 rounded-lg shadow-xl  space-x-2 text-black mb-20 container flex mx-auto my-auto pt-9 pb-9 px-5"
                                    onSubmit={(event) => handleSend(event)}
                                >
                                    {chatFormWidgets}            
                                </form>   
                            </div>
                            {messages.length > 0 ? <div className="  bottom-0"><Footer /></div> : ""}
                        </>
					):( 
                        <>
                            {/* Main section */}
                            {frontSectionUI} 
                            <div className="  bottom-0"><Footer /></div>
                        </>
                    )}
                </>
            )}
            {status === "unauthenticated" && redirect("/auth/signIn")}
        </>
    );
}