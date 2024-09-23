"use client";

import { useRef, useState, useEffect, useCallback, Suspense, SetStateAction, Dispatch, use} from "react";
import React from "react";
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css';
import useAudioRecorder from "@/hooks/useAudioRecorder";
import {recorderControls, type MediaAudioTrackSettings} from "@/hooks/useAudioRecorder";
import Timer from "@/components/Timer";
import { LiveAudioVisualizer } from "@/components/LiveAudioVisualizer";


// type recordingCompleteCallback = (blob: Blob) => Promise<void>;
// type recordingResetCallback = () => void;

const AudioRecorder =  (props:{
    audioTrackSettings: MediaAudioTrackSettings,
    recorderCtrls: recorderControls,
    mediaRecorderOptions?: MediaRecorderOptions,
    showVisualizer: boolean,
    onRecordingComplete: (blob: Blob) => void,
    setShowRecorder: Dispatch<SetStateAction<boolean>>,
}) => {
    const { 
        audioTrackSettings, 
        recorderCtrls, 
        mediaRecorderOptions, 
        showVisualizer = true, 
        onRecordingComplete,
        setShowRecorder,
    } = props;

    const defaultCtrls = useAudioRecorder(
        audioTrackSettings,
        mediaRecorderOptions
    );

    const {
        startRecording,
        stopRecording,
        togglePauseResume,
        recordingBlob,
        isRecording,
        isPaused,
        recordingTime,
        mediaRecorder
    } = recorderCtrls ?? defaultCtrls;

    const closeAudioRecorder: () => void = useCallback(() => {
        stopRecording();
        setShowRecorder(false);
    },[isRecording, setShowRecorder, stopRecording]);

    const stopAudioRecorder: () => void = useCallback(() =>  {
        closeAudioRecorder();

        if (recordingBlob != null && onRecordingComplete != null) {
            onRecordingComplete(recordingBlob);
        }

    },[closeAudioRecorder, onRecordingComplete, recordingBlob]);

    return (
        <div className="flex space-x-2 ">
            <button
                className="flex bg-kaito-brand-ash-green hover:bg-red-600 items-center font-semibold text-gray-200 rounded-full px-5 py-4"
                onClick={() => { 
                    closeAudioRecorder();
                }}
                type="button"
            >
                <i className="bi bi-x"></i>
            </button>
            
            {showVisualizer && (
                <div className="flex items-center ">
                    {mediaRecorder && (
                        <Suspense fallback={<></>}>
                            <LiveAudioVisualizer
                                mediaRecorder={mediaRecorder}
                                barWidth={2}
                                gap={2}
                                width={140}
                                height={20}
                                fftSize={512}
                                maxDecibels={-10}
                                minDecibels={-80}
                                smoothingTimeConstant={0.4}
                            />
                        </Suspense>
                    )}
                </div>
            )}

            <div className={`flex items-center`}>
                <Timer secondsElasped={recordingTime}/>
            </div>

            <button
                className="bg-kaito-brand-ash-green hover:bg-red-600 items-center font-semibold text-gray-200 rounded-full px-5 py-4"
                onClick={() => {
                    togglePauseResume();
                }}
                type="button"
            >
                {isPaused ? <i className="bi bi-mic-fill"></i> : <i className="bi bi-pause-fill"></i>}
            </button>
            
            <button
                className="hover:bg-red-600 bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-5 py-4"
                onClick={() => {
                    stopAudioRecorder();
                }}
                type="button"
            >
                <i className="bi bi-stop-fill"></i>
            </button>
        </div>
    );
};

export { AudioRecorder };