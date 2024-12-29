import { useState, useCallback, useRef } from "react";

export interface recorderControls {
	startRecording: () => void;
	stopRecording: () => void;
	togglePauseResume: () => void;
	recordingBlob?: Blob;
	isRecording: boolean;
	isPaused: boolean;
	recordingTime: number;
	mediaRecorder?: MediaRecorder;
}

export type MediaAudioTrackSettings = Pick<
	MediaTrackConstraints,
	| "deviceId"
	| "groupId"
	| "autoGainControl"
	| "channelCount"
	| "echoCancellation"
	| "noiseSuppression"
	| "sampleRate"
	| "sampleSize"
>;

/**
 * @returns Controls for the recording. Details of returned controls are given below
 *
 * @param `audioTrackSettings`: Takes a {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings#instance_properties_of_audio_tracks subset} of `MediaTrackConstraints` that apply to the audio track
 * @details `startRecording`: Calling this method would result in the recording to start. Sets `isRecording` to true
 * @details `stopRecording`: This results in a recording in progress being stopped and the resulting audio being present in `recordingBlob`. Sets `isRecording` to false
 * @details `togglePauseResume`: Calling this method would pause the recording if it is currently running or resume if it is paused. Toggles the value `isPaused`
 * @details `recordingBlob`: This is the recording blob that is created after `stopRecording` has been called
 * @details `isRecording`: A boolean value that represents whether a recording is currently in progress
 * @details `isPaused`: A boolean value that represents whether a recording in progress is paused
 * @details `recordingTime`: Number of seconds that the recording has gone on. This is updated every second
 * @details `mediaRecorder`: The current mediaRecorder in use
 */
const useAudioRecorder: (
	audioTrackSettings?: MediaAudioTrackSettings,
	mediaRecorderOptions?: MediaRecorderOptions
) => recorderControls = (
	audioTrackSettings,
	mediaRecorderOptions
) => {
	const [isRecording, setIsRecording] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>();
	const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout>();
	const [recordingBlob, setRecordingBlob] = useState<Blob>();

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);

	const _startTimer: () => void = useCallback(() => {
		const interval = setInterval(() => {
			setRecordingTime((time) => time + 1);
		}, 1000);
		setTimerInterval(interval);
	}, [setRecordingTime, setTimerInterval]);

	const _stopTimer: () => void = useCallback(() => {
		timerInterval != null && clearInterval(timerInterval);
		setTimerInterval(undefined);
	}, [timerInterval, setTimerInterval]);

	/* 
	* Calling this method would result in the recording to start. Sets `isRecording` to true
	*/ 
	const startRecording: () => void = useCallback(() => {
		if (timerInterval != null) return;

		navigator.mediaDevices
		.getUserMedia({ audio: audioTrackSettings ?? true })
		.then((stream) => {
			setIsRecording(true);
			const recorder: MediaRecorder = new MediaRecorder(
				stream,
				mediaRecorderOptions
			);

			// mediaRecorderRef.current = recorder;
			// setMediaRecorder(recorder);
			// recorder.start();
			// _startTimer();

			// recorder.addEventListener("dataavailable", (event) => {
			// 	chunksRef.current = [];
			// 	if (event.data.size > 0) {
			// 		chunksRef.current.push(event.data);
			// 	}
			
			// 	try {
			// 		const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
			// 		setRecordingBlob(audioBlob);
			// 	} catch (error: any) {
			// 		throw new Error(`Failed to create Blob of audio : ${error.message}`);
			// 	}
			// 	recorder.stream.getTracks().forEach((t) => t.stop());
			// 	setMediaRecorder(undefined);
			// });

			recorder.ondataavailable = (e) => {
				if (e.data.size > 0) {
					chunksRef.current.push(e.data);
				}
			};

			recorder.onstop = () => {
				setTimeout(async () => {
					try {
						const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
						setRecordingBlob(audioBlob);
					} catch (error) {
						console.error('Error processing audio after stop:', error);
					}
				}, 2);
			};

			setMediaRecorder(recorder);
			recorder.start();
			_startTimer();
		})
		.catch((err: DOMException) => {
			console.log(err.name, err.message, err.cause);
		});
	}, [timerInterval, audioTrackSettings, mediaRecorderOptions, _startTimer]);

	/* 
	Calling this method results in a recording in progress being stopped and the resulting audio being present in `recordingBlob`. Sets `isRecording` to false
	 */
	const stopRecording: () => void = useCallback(() => {
		try {
			// if (!mediaRecorderRef.current || !isRecording) {
			// 	return;
			// }
			if (!mediaRecorder || isRecording == false) {
				return;
			}

			// Stop recording
			// mediaRecorderRef.current.stop();
			mediaRecorder?.stop();
			
			// Cleanup
			const cleanup = () => {
				_stopTimer();
				setRecordingTime(0);
				setIsRecording(false);
				setIsPaused(false);
				
				// Stop all tracks
				// mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
				mediaRecorder?.stream.getTracks().forEach(track => track.stop());
				// mediaRecorderRef.current = null;
			};

			cleanup();
		} catch (error) {
			console.error('Error stopping recording:', error);
			// Ensure state is reset even if error occurs
			setIsRecording(false);
			setIsPaused(false);
		}
	}, [_stopTimer, isRecording, mediaRecorder]);

	/**
	 * Calling this method would pause the recording if it is currently running or resume if it is paused. Toggles the value `isPaused`
	 */
	const togglePauseResume: () => void = useCallback(() => {
		if (isPaused) {
			setIsPaused(false);
			// mediaRecorder?.resume();
			mediaRecorderRef.current?.resume();
			_startTimer();
		} else {
			setIsPaused(true);
			_stopTimer();
			// mediaRecorder?.pause();
			mediaRecorderRef.current?.pause();
		}
	}, [isPaused, _startTimer, _stopTimer]);

	return {
		startRecording,
		stopRecording,
		togglePauseResume,
		recordingBlob,
		isRecording,
		isPaused,
		recordingTime,
		mediaRecorder
	};
};

export default useAudioRecorder;
