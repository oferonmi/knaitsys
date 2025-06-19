"use client";

import { useState, useRef, type FormEvent, useCallback, useEffect } from "react";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tooltip } from "flowbite-react";
import { useDropzone } from "react-dropzone";
import copy from 'copy-to-clipboard';
import { withAuth } from "@/components/HOC/withAuth";

const SIDEBAR_BUTTONS = [
    { type: "text", icon: "bi-body-text", tooltip: "Upload Text", label: "Paste text" },
    { type: "file", icon: "bi-file-earmark-arrow-up", tooltip: "Upload PDF", label: "Upload PDF" },
    { type: "url", icon: "bi-globe2", tooltip: "Enter Webpage Address", label: "Paste webpage URL" },
    { type: "search", icon: "bi-search", tooltip: "Enter Search Query", label: "Type in your search query" },
];

const CARD_COLORS = [
    "bg-[#cba3e0]", "bg-[#d2ccf2]", "bg-[#c8a8d5]", "bg-[#e4a8b9]",
    "bg-[#db96b9]", "bg-[#afd1e2]", "bg-[#feff9c]", "bg-[#96b7a5]",
];

const toolTipsStyle = "inline-flex bg-black";

const SummarizerPage = () => {
    const [loading, setLoading] = useState(false);
    const [inputType, setInputType] = useState("text");
    const [selectedPDF, setSelectedPDF] = useState<File | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [summarizedText, setSummarizedText] = useState("");
    const [inputText, setInputText] = useState("");
    const [inputUrl, setInputUrl] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [copyIcon, setCopyIcon] = useState(<i className="bi bi-copy"></i>);
    const worker = useRef<Worker | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setUploadedFiles(acceptedFiles);
        setSelectedPDF(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    useEffect(() => {
        if (!worker.current) {
            worker.current = new Worker(
                new URL('@/app/api/summarizer/pdf_summary/worker.ts', import.meta.url),
                { type: "module" }
            );
            setLoading(false);
        }
    }, []);

    const handleSummarize = async (
        url: string,
        body: object,
        onSuccess: (json: any) => void,
        onError?: (error: string) => void
    ) => {
        setLoading(true);
        try {
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(body),
            });
            const json = await response.json();
            if (response.status === 200) {
                onSuccess(json);
            } else {
                onError?.(json.error || "Unknown error");
            }
        } catch (err: any) {
            onError?.(err.message);
        } finally {
            setLoading(false);
        }
    };

    const summarizeRawText = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSummarize(
            "/api/summarizer/plain_text_summary",
            { text: inputText },
            (json) => setSummarizedText(json.text),
            (error) => toast(`Unable to summarise text: ${error}`, { theme: "dark" })
        );
    };

    const summarizeWebPage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSummarize(
            "/api/summarizer/webpage_summary",
            { text: inputUrl },
            (json) => {
                setInputText(json.input_text);
                setSummarizedText(json.output_text);
            },
            (error) => toast(`Unable to summarize web page content: ${error}`, { theme: "dark" })
        );
    };

    const summarizeSearchResult = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSummarize(
            "/api/summarizer/search_index_summary",
            { text: searchQuery },
            (json) => {
                setInputText(json.input_text);
                setSummarizedText(json.output_text);
            },
            (error) => toast(`Unable to summarize search index pages: ${error}`, { theme: "dark" })
        );
    };

    const summarizePDF = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedPDF) {
            toast(`You must select a file to summarize.`, { theme: "dark" });
            return;
        }
        setLoading(true);
        const onMessageReceived = (e: any) => {
            switch (e.data.type) {
                case "log":
                    console.log(e.data);
                    break;
                case "error":
                    worker.current?.removeEventListener("message", onMessageReceived);
                    setLoading(false);
                    toast(`There was an issue summarizing your PDF: ${e.data.error}`, { theme: "dark" });
                    break;
                case "input_text":
                    setInputText(e.data.input_text);
                    break;
                case "output_text":
                    setSummarizedText(e.data.output_text);
                    break;
                case "complete":
                    worker.current?.removeEventListener("message", onMessageReceived);
                    setLoading(false);
                    break;
            }
        };
        worker.current?.addEventListener("message", onMessageReceived);
        worker.current?.postMessage({ pdf: selectedPDF });
    };

    const summarizerCtrlButtons = (
        <button
            className="flex px-4 py-3 bg-kaito-brand-ash-green text-gray-200 rounded-full  max-w-24 max-h-24 items-center shrink-0 absolute right-3 bottom-3 z-10 hover:bg-kaito-brand-ash-green/90 focus:outline-none focus:ring-4 focus:ring-kaito-brand-ash-green/50 disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
        >
            <div role="status" className={`${loading ? "" : "hidden"} flex justify-center`}>
                <Loader2 className="animate-spin w-4 h-6" />
                <span className="sr-only">Loading...</span>
            </div>
            <div className={`${loading ? "hidden" : ""}`}>
                <i className="bi bi-send-fill"></i>
                <span className="sr-only">Send</span>
            </div>
        </button>
    );

    const homeButton = (
        <button
            className="flex px-4 py-3 bg-kaito-brand-ash-green text-gray-200 rounded-full  max-w-24 max-h-24 items-center shrink-0 absolute right-16 bottom-3 z-10 hover:bg-kaito-brand-ash-green/90 focus:outline-none focus:ring-4 focus:ring-kaito-brand-ash-green/50 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            onClick={() => setSummarizedText("")}
        >
            <i className="bi bi-house-fill"></i>
            <span className="sr-only">Home</span>
        </button>
    );

    const TextInputForm = (
        <form className="w-full flex flex-col relative" onSubmit={summarizeRawText}>
            <textarea
                id="textInput"
                rows={13}
                className="w-full min-h-[100px] bg-white rounded-lg shadow-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-transparent resize-none text-black placeholder:text-gray-400 sm:leading-6 px-4 py-3"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste in the text you want to summarize..."
                required
            />
            {summarizerCtrlButtons}
        </form>
    );

    const FileInputForm = (
        <form
            id="pdfUploadForm"
            onSubmit={summarizePDF}
            className="flex flex-col w-full mb-4 border border-gray-200 rounded-lg shadow-md bg-gray-50  relative"
        >
            <label
                {...getRootProps({
                    htmlFor: "dropzone-file",
                    className: "grow items-center justify-center cursor-pointer bg-white border-x-0 border-t-0 border-b border-gray-200 rounded-t-lg hover:bg-gray-50",
                })}
            >
                <div className="flex flex-col items-center justify-center pt-24 pb-28">
                    <i className="bi bi-file-earmark-arrow-up text-gray-500 text-4xl"></i>
                    <div className="mb-2 text-sm text-gray-500 ">
                        <span className="font-semibold">
                            {isDragActive ? <p>Drop the files here ...</p> : <p>Click to upload or drag and drop</p>}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 ">
                        {selectedPDF ? `${selectedPDF.name} file attached` : "PDF files"}
                    </p>
                </div>
                <input {...getInputProps({ id: "dropzone-file" })} />
            </label>
            {summarizerCtrlButtons}
        </form>
    );

    const UrlInputForm = (
        <form className="w-full flex space-x-2 relative" onSubmit={summarizeWebPage}>
            <input
                type="url"
                id="urlInput"
                className="flex-grow block w-full rounded-full border py-5 pr-16 text-kaito-brand-ash-green border-gray-200 shadow-md focus:border-kaito-brand-ash-green placeholder:text-gray-400 sm:leading-6 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-transparent resize-none"
                placeholder="Enter URL (http:// address) of webpage to summarize."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                required
            />
            <button
                className="bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-5 absolute right-1 top-1/2 transform -translate-y-1/2 h-[calc(100%-8px)]"
                type="submit"
                disabled={loading}
            >
                <div role="status" className={`${loading ? "" : "hidden"} flex justify-center`}>
                    <Loader2 className="animate-spin w-5 h-6" />
                    <span className="sr-only">Loading...</span>
                </div>
                <div className={`${loading ? "hidden" : ""}`}>
                    <i className="bi bi-send-fill"></i>
                    <span className="sr-only">Send</span>
                </div>
            </button>
        </form>
    );

    const SearchInputForm = (
        <>
            <h1 className="text-center text-lg mb-4 text-kaito-brand-ash-green">
                Enter your search query, send and receive summary of the search result pages.
            </h1>
            <form className="flex w-full space-x-2 relative" id="search-form" onSubmit={summarizeSearchResult}>
                <input
                    type="text"
                    autoComplete="off"
                    name="url_input_bar"
                    className="flex-grow block w-full rounded-full border py-5 pr-16 text-kaito-brand-ash-green border-gray-200 shadow-md focus:border-kaito-brand-ash-green placeholder:text-gray-400 sm:leading-6 focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-transparent resize-none"
                    placeholder="  Search"
                    required
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                    className="bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-5 absolute right-1 top-1/2 transform -translate-y-1/2 h-[calc(100%-8px)]"
                    type="submit"
                    disabled={loading}
                >
                    <div role="status" className={`${loading ? "" : "hidden"} flex justify-center`}>
                        <Loader2 className="animate-spin w-5 h-6" />
                        <span className="sr-only">Loading...</span>
                    </div>
                    <span className={loading ? "hidden" : ""}>
                        <i className="bi bi-send-fill"></i>
                        <span className="sr-only">Send</span>
                    </span>
                </button>
            </form>
        </>
    );

    const SideNavBar = (
        <nav className="flex grow-0 gap-2 ml-2.5 mt-4 border-r border-slate-300 h-screen">
            <ul>
                {SIDEBAR_BUTTONS.map(({ type, icon, tooltip, label }) => (
                    <li className="p-3" key={type}>
                        <Tooltip content={tooltip} className={toolTipsStyle}>
                            <button
                                type="button"
                                className="inline-flex border border-kaito-brand-ash-green hover:bg-kaito-brand-ash-green bg-white items-center font-medium hover:text-gray-200 text-kaito-brand-ash-green text-lg rounded-full px-4 py-3"
                                onClick={() => setInputType(type)}
                                aria-label={label}
                            >
                                <i className={`bi ${icon}`}></i>
                                <span className="sr-only">{label}</span>
                            </button>
                        </Tooltip>
                    </li>
                ))}
            </ul>
        </nav>
    );

    const OrigTextDisplay = (
        <form className="w-full flex flex-col" onSubmit={summarizeRawText}>
            <div className="w-full h-dvh border-r border-gray-100 bg-gray-50 relative flex">
                <textarea
                    id="textInput"
                    className="flex-1 mb-0 px-4 py-4 text-sm text-black bg-white bg-opacity-60 border-0 focus:ring-0 focus:ring-inset focus:ring-kaito-brand-ash-green h-screen relative resize-none"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste in the text you want to summarize..."
                />
                <div className="fixed bottom-20 left-1/2 flex flex-col gap-2 z-50">
                    {homeButton}
                    {summarizerCtrlButtons}
                </div>
            </div>
        </form>
    );

    const FlashCard = (
        <div className="flex flex-col h-screen">
            <h2 className="text-black text-2xl flex justify-center mt-2">Summary Flash Card</h2>
            <div className="flex flex-col w-full mt-4 mb-4 overflow-auto transition-[flex-grow] ease-in-out pb-40 text-black">
                {summarizedText && (
                    <div
                        className={`${CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)]} text-black rounded px-4 py-2 max-w-[80%] mb-8 ml-auto mr-auto mt-auto flex border-1 border-gray-150`}
                    >
                        <span className="whitespace-pre-wrap flex flex-col">{summarizedText}</span>
                        <Tooltip content="Copy to clipboard" className={toolTipsStyle}>
                            <button
                                className="ml-2 mb-auto"
                                type="button"
                                onClick={() => {
                                    copy(summarizedText);
                                    setCopyIcon(<i className="bi bi-check2-square"></i>);
                                    setTimeout(() => setCopyIcon(<i className="bi bi-copy"></i>), 400);
                                }}
                            >
                                {copyIcon}
                            </button>
                        </Tooltip>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <main>
            <div className="flex flex-col pt-24">
                {!summarizedText && (
                    <div className="flex h-screen">
                        {SideNavBar}
                        <div className="flex flex-col p-4 md:p-8 bg-[#25252d00] overflow-hidden grow h-screen max-w-2xl mx-auto flex-auto">
                            <h1 className="text-center text-3xl md:text-3xl mb-4 text-gray-700">
                                Summarize your documents, web pages and search indices pages.
                            </h1>
                            <p className="text-black text-lg text-center">
                                Specify text source on the left. Send and get a summary.
                            </p>
                            <br />
                            <div className="container max-w-2xl">
                                {inputType === "text" && TextInputForm}
                                {inputType === "file" && FileInputForm}
                                {inputType === "url" && UrlInputForm}
                                {inputType === "search" && SearchInputForm}
                            </div>
                        </div>
                        <ToastContainer />
                    </div>
                )}
                {summarizedText && (
                    <div className="flex flex-col h-screen">
                        <div className="flex flex-row h-fit">
                            <div className="flex-1">{OrigTextDisplay}</div>
                            <div className="flex-1">{FlashCard}</div>
                        </div>
                        <div className="flex-auto">
                            <Footer />
                        </div>
                    </div>
                )}
                {!summarizedText && <Footer />}
            </div>
        </main>
    );
};

export default withAuth(SummarizerPage);
