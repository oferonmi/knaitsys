"use client";

import { useRef, useState, useEffect, useCallback, Suspense, SetStateAction, Dispatch} from "react";
import React from "react";
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css';
import useAudioRecorder from "@/hooks/useAudioRecorder";
import {recorderControls, type MediaAudioTrackSettings} from "@/hooks/useAudioRecorder";
import Timer from "@/components/Timer";
import { LiveAudioVisualizer } from "@/components/LiveAudioVisualizer";


type recordingCompleteCallback = (blob: Blob) => Promise<void>;

const AudioRecorder =  (props:{
    audioTrackSettings: MediaAudioTrackSettings,
    recorderCtrls: recorderControls,
    mediaRecorderOptions?: MediaRecorderOptions,
    showVisualizer: boolean,
    onRecordingComplete: recordingCompleteCallback,
    setCloseRecorder: Dispatch<SetStateAction<boolean>>,
}) => {
    const { 
        audioTrackSettings, 
        recorderCtrls, 
        mediaRecorderOptions, 
        showVisualizer = true, 
        onRecordingComplete, 
        setCloseRecorder
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
        mediaRecorder,
    } = recorderCtrls ?? defaultCtrls;

    const stopAudioRecorder = () =>  {
        stopRecording();
    };

    useEffect(() => {
        if (recordingBlob != null && onRecordingComplete != null) {
            onRecordingComplete(recordingBlob);
        }
    }, [onRecordingComplete, recordingBlob]);

    return (
        <div className="flex space-x-2 ">
            <button
                className="flex bg-kaito-brand-ash-green hover:bg-red-600 items-center font-semibold text-gray-200 rounded-full px-5 py-4"
                onClick={() => { 
                    isRecording && stopRecording();
                    //resetRecorder();
                    setCloseRecorder(false);
                }}
                type="button"
            >
                <i className="bi bi-trash3-fill"></i>
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
                className="bg-kaito-brand-ash-green hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-5 py-4"
                onClick={() => {
                    togglePauseResume();
                }}
                type="button"
            >
                {isPaused ? <i className="bi bi-mic-fill"></i> : <i className="bi bi-pause-fill"></i>}
            </button>
            
            <button
                className="bg-red-600 hover:bg-kaito-brand-ash-green items-center font-semibold text-gray-200 rounded-full px-5 py-4"
                onClick={() => {
                    stopAudioRecorder()
                }}
                type="button"
            >
                <i className="bi bi-stop-fill"></i>
            </button>
        </div>
    );
};

export { AudioRecorder };