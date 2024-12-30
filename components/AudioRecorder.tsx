"use client";

import { useRef, useState, useEffect, useCallback, Suspense, SetStateAction, Dispatch, use} from "react";
import React from "react";
import '@/node_modules/bootstrap-icons/font/bootstrap-icons.css';
import useAudioRecorder from "@/hooks/useAudioRecorder";
import {recorderControls, type MediaAudioTrackSettings} from "@/hooks/useAudioRecorder";
import Timer from "@/components/Timer";
import { LiveAudioVisualizer } from "@/components/LiveAudioVisualizer";

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
        // Recording controls
        startRecording,
        stopRecording,
        togglePauseResume,

        // Recording state
        isRecording,
        isPaused,
        recordingTime,

        // Recording data
        recordingBlob,
        mediaRecorder,
    } = recorderCtrls ?? defaultCtrls;

    const closeAudioRecorder = useCallback(() => {
        try {
            stopRecording();
            setShowRecorder(false);
        } catch (error) {
            console.error('Failed to close audio recorder:', error);
            // Ensure recorder UI is hidden even if stopping fails
            setShowRecorder(false);
        }
    }, [stopRecording, setShowRecorder]);

    const stopAudioRecorder = useCallback(() => {
        closeAudioRecorder();

        if (recordingBlob && onRecordingComplete) {
            onRecordingComplete(recordingBlob);
        }
    }, [closeAudioRecorder, onRecordingComplete, recordingBlob]);

    const buttonBaseStyle = "flex items-center font-semibold text-gray-200 rounded-full px-5 py-4 bg-kaito-brand-ash-green hover:bg-red-600";

    const AudioControls = () => (
        <div className="flex space-x-2">
            {/* Close Button */}
            <button
                className={buttonBaseStyle}
                onClick={closeAudioRecorder}
                type="button"
                aria-label="Close recorder"
            >
                <i className="bi bi-x" />
            </button>
            
            {/* Audio Visualizer */}
            {showVisualizer && (
                <div className="flex items-center">
                    {mediaRecorder && (
                        <Suspense fallback={null}>
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

            {/* Timer */}
            <div className="flex items-center">
                <Timer secondsElasped={recordingTime} />
            </div>

            {/* Pause/Resume Button */}
            <button
                className={buttonBaseStyle}
                onClick={togglePauseResume}
                type="button"
                aria-label={isPaused ? "Resume recording" : "Pause recording"}
            >
                <i className={`bi ${isPaused ? "bi-mic-fill" : "bi-pause-fill"}`} />
            </button>
            
            {/* Stop Button */}
            <button
                className={buttonBaseStyle}
                onClick={stopAudioRecorder}
                type="button"
                aria-label="Stop recording"
            >
                <i className="bi bi-stop-fill" />
            </button>
        </div>
    );

    return (
        <div className="flex space-x-2 ">
            <AudioControls />
        </div>
    );
};

export { AudioRecorder };