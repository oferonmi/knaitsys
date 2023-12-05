import { useRef, useState, useEffect, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import {
    StopIcon, 
    PlayFillIcon, 
    PauseFillIcon, 
    MicFillIcon2, 
    MicMuteFillIcon2,
} from "@/components/Icons"

// transcription functions
const transcribeAudio =  async (base64AudioDataUrl) => {
    // Remove the data URL prefix.
    const base64Audio = base64AudioDataUrl.split(",")[1];

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

    let respText = responseData.transcript.text
    // console.log(respText)

    return (respText).toString();
}

// Audio visualization/control wigjets
// WaveSurfer hook
const useWavesurfer = (containerRef, options) => {
  const [wavesurfer, setWavesurfer] = useState(null);

  // Initialize wavesurfer when the container mounts
  // or any of the props change
  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      ...options,
      container: containerRef.current,
    });

    setWavesurfer(ws);

    return () => {
      ws.destroy()
    }
  }, [options, containerRef]);

  return wavesurfer;
}

// Wavesurfer audio player
const WaveSurferAudioPlayer = (waveSurferOptions) => {
    const audioContainerRef = useRef();
    // const [audioCtrlsPosition, setAudioCtrlsPosition] = useState(ctrlsPosition=="left"? "left":"right"); //ctrlsPosition ?  "left" : "right"
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const wavesurfer = useWavesurfer(audioContainerRef, waveSurferOptions);

    //set controls position
    // const audioCtrlsPosition = ctrlsPosition;
    // useEffect(() => {
    //     ctrlsPosition == "right"? setAudioCtrlsPosition("right") : setAudioCtrlsPosition("left")
    // }, [ctrlsPosition])

    // On play button click
    const onPlayClick = useCallback(() => {
        wavesurfer.isPlaying() ? wavesurfer.pause() : wavesurfer.play()
    }, [wavesurfer])

    // Initialize wavesurfer when the container mounts
    // or any of the props change
    useEffect(() => {
        if (!wavesurfer) return

        setCurrentTime(0)
        setIsPlaying(false)

        const subscriptions = [
            wavesurfer.on('play', () => setIsPlaying(true)),
            wavesurfer.on('pause', () => setIsPlaying(false)),
            wavesurfer.on('timeupdate', (currentTime) => setCurrentTime(currentTime)),
        ]

        return () => {
            subscriptions.forEach((unsub) => unsub())
        }
    }, [wavesurfer]);

    const audioCtrlButton = (
        <button 
            onClick={onPlayClick} 
            className="inline-flex items-center  py-5 px-5 mt-6 font-medium text-center text-gray-200 bg-gray-400 rounded-full hover:bg-kaito-brand-ash-green"
        >
            {isPlaying ? <PauseFillIcon /> : <PlayFillIcon />}
        </button>
    );

    return (
        <> 
            <div className="flex flex-row">
                <div>
                    {audioCtrlButton}
                </div>

                <div ref={audioContainerRef} className="border border-gray-400 bg-gray-100 rounded-md w-full ml-2" />
            </div>

            {/* {audioCtrlsPosition == "left" && (
                <div className="flex flex-row">
                    <div>
                        {audioCtrlButton}
                    </div>

                    <div ref={audioContainerRef} className="border border-gray-400 bg-gray-100 rounded-md w-full ml-2" />
                </div>
            )}
            
            {audioCtrlsPosition == "right" && (
                <div className="flex flex-row">
                    <div ref={audioContainerRef} className="border border-gray-400 bg-gray-100 rounded-md w-full mr-2" />
                    <div>
                        {audioCtrlButton}
                    </div>
                </div>
            )} */}
        </>
    );
}

// Wavesurfer audio recorder
const WaveSurferAudioRecoder = (props) => {
    const micSelectRef = useRef();
    const liveAudioVisualiserRef = useRef();
    const recorderCtrlrRef = useRef();
    const recdAudioWaveVisualiserRef = useRef();

    const [recBtnIcon, setRecbtnIcon] = useState(<MicMuteFillIcon2 />)

    const wavesurfer = useWavesurfer(liveAudioVisualiserRef, props);

    // Initialize the Record plugin
    const [recorder, setRecorder] = useState(null);
    useEffect(() => {
        if (!wavesurfer) return

        const recPlugin = wavesurfer.registerPlugin(RecordPlugin.create());
        setRecorder(recPlugin);
    }, [wavesurfer]);

    // Populate mic selection list
    useEffect(() => {
        if (!micSelectRef) return
        // Mic selection
        RecordPlugin.getAvailableAudioDevices().then((devices) => {
            devices.forEach((device) => {
                const option = document.createElement('option')
                option.value = device.deviceId
                option.text = device.label || device.deviceId
                micSelectRef.current.appendChild(option)
            })
        })
    }, [micSelectRef])

    // handle record button click event
    const onRecordClick = useCallback(() => {   
        if (recorder.isRecording()) {
            recorder.stopRecording()
            setRecbtnIcon(<MicMuteFillIcon2 />)
            return
        }

        // get selected device
        const deviceId = micSelectRef.current //value
        recorder.startRecording({ deviceId }).then(() => {
            setRecbtnIcon(<MicFillIcon2 />)
            recorderCtrlrRef.disabled = false
        })
    }, [recorder, micSelectRef, recorderCtrlrRef]);

    // Render recorded audio
    useEffect(() => {
        if (!recorder || !recdAudioWaveVisualiserRef) return

        recorder.on('record-end', (blob) => {
            const recordedAudioUrl = URL.createObjectURL(blob)
            props.setRecordedAudioUrl(recordedAudioUrl)

            // Create wavesurfer from the recorded audio
            // const ws = WaveSurfer.create({
            //     container: recdAudioWaveVisualiserRef,
            //     waveColor: '#D9E2D5',
            //     progressColor: '#3E6765',
            //     url: recordedAudioUrl,
            // });
        });
    }, [recorder, props]);

    return (
        <>
            <div className="flex flex-row">
                <div>
                    <select 
                        id="mic-select" 
                        ref={micSelectRef}
                        className="inline-flex items-center py-5 px-1 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green mr-2 mb-2"
                    >
                        <option value="" hidden>--Select Mic--</option>
                    </select>
                </div>

                <div id="liveAudioVisualizer" ref={liveAudioVisualiserRef} className="border border-kaito-brand-ash-green rounded-md px-15 mr-2 w-full" />

                <div>
                    <button 
                        id="record"
                        ref={recorderCtrlrRef}
                        className="inline-flex items-center py-5 px-5 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-full hover:bg-kaito-brand-ash-green"
                        onClick={onRecordClick}
                    >
                        {recBtnIcon}
                    </button>
                </div>
                {/* <button id="pause" style="display: none;">Pause</button> */}
            </div>
            
        </>
    );

}

export {
    transcribeAudio,
    WaveSurferAudioPlayer, 
    WaveSurferAudioRecoder
};
