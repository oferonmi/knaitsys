'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState, useEffect, useCallback, type FormEvent } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { withAuth } from '@/components/HOC/withAuth';
import { CONSTANTS } from '@/components/MultiModal/constants';
import { LoadingSpinner } from '@/components/MultiModal/LoadingSpinner';
import { AudioRecorder } from "@/components/AudioRecorder";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css';
import { Footer } from "@/components/Footer";
import { Tooltip } from "flowbite-react";
import { Loader2 } from "lucide-react"

const TEXTAREA_CONFIG = {
    minHeight: "100px",
    placeholder: "Got questions? Ask ...",
};

function MultiModalChat() {
    const [sourcesForMessages, setSourcesForMessages] = useState<Record<string, any>>({});
    const [files, setFiles] = useState<FileList | undefined>();
    const [showAudioRecorder, setShowAudioRecorder] = useState(false);
    const [audioInTranscript, setAudioInTranscript] = useState("");
    const [showFileAttachmentUI, setShowFileAttachmentUI] = useState(false);
    const [showSendButton, setShowSendButton] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const sendButtonRef = useRef<HTMLButtonElement>(null);

    const handleResponse = useCallback((response: Response) => {
        const sourcesHeader = response.headers.get("x-sources");
        const sources = sourcesHeader ? JSON.parse(atob(sourcesHeader)) : [];
        const messageIndexHeader = response.headers.get("x-message-index");

        if (sources.length && messageIndexHeader !== null) {
            setSourcesForMessages(prev => ({
                ...prev,
                [messageIndexHeader]: sources,
            }));
        }
        setShowSendButton(false);
    }, []);

    const { 
        messages,
        reload,
        append,  
        setMessages, 
        input, 
        setInput, 
        handleInputChange, 
        handleSubmit, 
        isLoading 
    } = useChat({
        api: CONSTANTS.API_ROUTES.LLM,
        onResponse: handleResponse,
        onError: (e) => toast(e.message, { theme: "dark" })
    });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages?.length]);

    const processRecordedAudioIn = useCallback(async (audioBlob: Blob) => {
        if (!audioBlob?.size) {
            toast("Invalid audio data", { theme: "dark" });
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", audioBlob, "audio.webm");

            const response = await fetch(CONSTANTS.API_ROUTES.WHISPER, {
                method: "POST",
                body: formData,
                headers: { Accept: "application/json" }
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const { transcript } = await response.json();
            if (!transcript) throw new Error("Invalid response format");

            setAudioInTranscript(transcript);
            setMessages(prev => [...prev, {
                id: String(Date.now()),
                role: "user",
                content: transcript,
            }]);
            reload();
            setShowSendButton(true);
        } catch (error) {
            console.error("Error processing audio:", error);
            toast("Error processing audio recording", { theme: "dark" });
            setAudioInTranscript("");
        }
    }, [reload, setMessages]);

    const handleFormSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
        handleSubmit(event, { experimental_attachments: files });
        setFiles(undefined);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowFileAttachmentUI(false);
    }, [files, handleSubmit]);

    const handleRecordingStart = useCallback(async (recorderControls: any) => {
        if (!recorderControls.recorderReady) {
            toast("Recorder not ready. Please wait a moment.", { theme: "dark" });
            return;
        }

        try {
            await recorderControls.startRecording();
            setShowAudioRecorder(true);
        } catch (error) {
            toast("Failed to start recording. Please check microphone permissions.", { theme: "dark" });
            console.error("Recording failed to start:", error);
        }
    }, []);

    // const recorderSettings = {
    //     noiseSuppression: true,
    //     echoCancellation: true,
    // }
    const recorderSettings = CONSTANTS.RECORDER_SETTINGS;

    const recorderControls = useAudioRecorder(recorderSettings);

    const audioRecorderWidget = (
        <div className="flex items-center rounded-full bg-white dark:bg-gray-900 border border-kaito-brand-ash-green dark:border-kaito-brand-ash-green mr-auto ml-auto py-1 px-1">
            <AudioRecorder
                audioTrackSettings={recorderSettings}
                recorderCtrls={recorderControls}
                showVisualizer={true}
                onRecordingComplete={processRecordedAudioIn}
                setShowRecorder={setShowAudioRecorder}
            />
        </div>
    );

    const loadingAnimation = (
        <div role="status" className="flex justify-center">
            <Loader2 className="animate-spin w-4 h-6" />
            <span className="sr-only">Loading...</span>
        </div>
    );

    // Common button styles
    const buttonBaseStyle = "inline-flex bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 dark:text-gray-100 rounded-full px-4 py-3";

    // Clear chat button
    const ClearChatButton = messages.length > 0 && (
        <Tooltip content="Clear Chat Thread" className="inline-flex">
            <button
                className={`${buttonBaseStyle} mr-2 absolute right-16 bottom-3 z-10`}
                type="button"
                onClick={() => setMessages([])}
            >
                <i className="bi bi-trash3-fill" />
            </button>
        </Tooltip>
    );

    // File Upload node
    const FileUpload = (
        <div>
            {!showFileAttachmentUI ? (
                <Tooltip content="Upload File" className="inline-flex bg-white dark:bg-gray-900">
                    <button
                        type="button"
                        className={`${buttonBaseStyle} absolute right-auto bottom-3 z-10 ml-3`}
                        onClick={() => setShowFileAttachmentUI(true)}
                    >
                        <i className="bi bi-paperclip" />
                        <span className="sr-only">Attach file</span>
                    </button>
                </Tooltip>
            ) : (
                <input
                    type="file"
                    id="multimod-file-in"
                    className="border bg-white dark:bg-gray-900 border-kaito-brand-ash-green dark:border-kaito-brand-ash-green rounded-lg inline-flex pl-2 absolute right-auto bottom-3 z-10 ml-3 text-black dark:text-gray-100"
                    onChange={(e) => e.target.files && setFiles(e.target.files)}
                    multiple
                    ref={fileInputRef}
                />
            )}
        </div>
    );

    // Send Button
    const SendButton = (
        <button
            className={`${buttonBaseStyle} absolute bottom-3 right-3`}
            type="submit"
            ref={sendButtonRef}
        >
            { isLoading? loadingAnimation : (
            // <span className={isLoading ? "hidden" : ""}>
                <i className="bi bi-send-fill" />
            // </span>
            )}
        </button>
    );

    const ChatInput = (
        <textarea
            autoComplete="off"
            autoFocus={false}
            name="prompt"
            className="w-full h-full min-h-[100px] bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700 focus:border-transparent resize-none text-kaito-brand-ash-green dark:text-kaito-brand-ash-green/80 placeholder:text-gray-400 dark:placeholder:text-gray-500 sm:leading-6"
            id="multimod-text-in"
            value={input}
            placeholder={TEXTAREA_CONFIG.placeholder}
            required
            style={{ minHeight: TEXTAREA_CONFIG.minHeight }} // ref={textInputRef}
                onChange={(e) => {
                setShowSendButton(e.target.value.length > 0);
                handleInputChange(e);
            }}
        />
    );

    const chatFormWidgets = (
        <div className="flex flex-row space-x-2 w-full">
            {showAudioRecorder ? (
                audioRecorderWidget
            ) : (
                <main className='w-full max-w-full rounded-lg bg-white dark:bg-gray-900 relative' >
                    {messages.length > 0 &&  ClearChatButton}
                    {FileUpload}
                    {ChatInput}
                    {showSendButton ? SendButton  : (
                        <button
                            className={`${buttonBaseStyle} absolute bottom-3 right-3`}
                            type="button"
                            onClick={() => handleRecordingStart(recorderControls)}
                        >
                            <i className="bi bi-mic-fill" />
                        </button>
                    )}
                </main>
            )}
        </div>
    );

    const landingSectionUI = (
        <main className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-gray-900 text-black dark:text-gray-100">
            <div className="max-w-3xl w-full mx-auto md:p-8">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl text-gray-700 font-mono dark:text-gray-100 mb-4">
                        Query or Question a Multimodal AI Chatbot
                    </h1>
                    <p className="text-lg text-black dark:text-gray-200">
                        Use any of the inputs to make your inquiry
                    </p>
                </header>

                {/*border border-gray-300 rounded-lg shadow-xl p-9 space-y-4 */}
                <form
                    onSubmit={(event) => handleFormSubmit(event)}
                    className="w-full relative"
                >
                    {chatFormWidgets}
                </form>
            </div>
        </main>
    );

    return (
        <>
            {messages.length > 0 ? (
                <main className="pt-36 bg-white dark:bg-gray-900 text-black dark:text-gray-100">
                    {/* Chat thread section */}
                    <div className="flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden text-black dark:text-gray-100 min-h-screen bg-white dark:bg-gray-900">
                        <div className="flex flex-col w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out pb-40 text-black dark:text-gray-100">
                            {messages.length > 0
                            ? [...messages].map((m, i) => {
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

                        {/**max-w-3xl  border border-gray-300 rounded-lg shadow-xl  space-x-2 text-black mb-20 container flex mx-auto my-auto pt-9 pb-9 px-5 */}
                        <form
                            className="fixed bottom-0 mb-20 container flex max-w-3xl mx-auto my-auto"
                            onSubmit={(event) => handleFormSubmit(event)}
                        >
                            {chatFormWidgets}
                        </form>
                    </div>

                    {messages.length > 0 ? (
                        <div className="bottom-0">
                            <Footer />
                        </div>
                    ) : (
                     ""
                    )}
                </main>
            ) : (
                <main>
                    {/* Landing section */}
                    {landingSectionUI}
                    <div className="bottom-0">
                    <Footer />
                    </div>
                </main>
            )}
        </>
    );
}

export default withAuth(MultiModalChat);