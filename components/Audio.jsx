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

const WaveSurferAudioPlayer = (props) => {
    const audioContainerRef = useRef();
    const [isPlaying, setIsPlaying] = useState(false);
    const wavesurfer = useWavesurfer(audioContainerRef, props);

    // On play button click
    const onPlayClick = useCallback(() => {
        wavesurfer.isPlaying() ? wavesurfer.pause() : wavesurfer.play()
    }, [wavesurfer])

    // Initialize wavesurfer when the container mounts
    // or any of the props change
    useEffect(() => {
        if (!wavesurfer) return

        setIsPlaying(false)

        const subscriptions = [
            wavesurfer.on('play', () => setIsPlaying(true)),
            wavesurfer.on('pause', () => setIsPlaying(false)),
        ]

        return () => {
            subscriptions.forEach((unsub) => unsub())
        }
    }, [wavesurfer]);

    return (
        <>
            <div className="flex flex-row">
                <div>
                    <button 
                        onClick={onPlayClick} 
                        className="inline-flex items-center  py-5 px-5 mt-8 font-medium text-center text-gray-200 bg-gray-400 rounded-full hover:bg-kaito-brand-ash-green"
                    >
                        {isPlaying ? <PauseFillIcon /> : <PlayFillIcon />}
                    </button>
                </div>

                <div ref={audioContainerRef} className="border bg-gray-100 rounded-md w-full ml-2" />

            </div>
        </>
    );
}

const WaveSurferAudioRecoder = (props) => {
    const micSelectRef = useRef();
    const liveAudioVisualiserRef = useRef();
    const recorderCtrlrRef = useRef();
    const recdAudioWaveVisualiserRef = useRef();

    const [isRecording, setIsRecording] = useState(false);
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
            recorderCtrlrRef.innerHTML = recBtnIcon
            return
        }

        // get selected device
        const deviceId = micSelectRef.current //value
        recorder.startRecording({ deviceId }).then(() => {
            setRecbtnIcon(<MicFillIcon2 />)
            recorderCtrlrRef.innerHTML = recBtnIcon
            recorderCtrlrRef.disabled = false
        })
    }, [recorder, micSelectRef, recorderCtrlrRef, recBtnIcon]);

    // Render recorded audio
    useEffect(() => {
        if (!recorder || !recdAudioWaveVisualiserRef) return

        recorder.on('record-end', (blob) => {
            // const recordingContainer = document.querySelector('#recordings')
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
            <select 
                id="mic-select" 
                ref={micSelectRef}
                className="inline-flex items-center py-2 px-2 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-md hover:bg-kaito-brand-ash-green mr-2 mb-2"
            >
                <option value="" hidden>--Select Mic--</option>
            </select>

            {/* <div id="recordings" ref={recdAudioWaveVisualiserRef}></div> */}

            <div id="liveAudioVisualizer" ref={liveAudioVisualiserRef} className="border border-kaito-brand-ash-green rounded-md px-15 " />

            <button 
                id="record"
                ref={recorderCtrlrRef}
                className="inline-flex items-center py-5 px-5 font-medium text-center text-gray-200 bg-kaito-brand-ash-green rounded-full hover:bg-kaito-brand-ash-green"
                onClick={onRecordClick}
            >
                {recBtnIcon}
            </button>
            {/* <button id="pausrecBtnIcone" style="display: none;">Pause</button> */}
            
        </>
    );

}

export {WaveSurferAudioPlayer, WaveSurferAudioRecoder};
