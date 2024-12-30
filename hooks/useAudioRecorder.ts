import { useState, useCallback, useRef, useEffect } from "react";

export interface recorderControls {
	startRecording: () => void;
	stopRecording: () => void;
	togglePauseResume: () => void;
	recorderReady: boolean;
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
 * @details `recorderReady` : A bollean value indicating if recorder is ready for use.
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
	const [recorderReady, setRecorderReady] = useState(false);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);

	/*
	* Initiallize recorder once on component mount
	*/
	useEffect(() => {
		const initializeRecorder = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				mediaRecorderRef.current = new MediaRecorder(stream);
				setRecorderReady(true);
				setMediaRecorder(mediaRecorderRef.current);
				// Cleanup stream
				stream.getTracks().forEach(track => track.stop());
			} catch (error) {
				console.error('Failed to initialize recorder:', error);
			}
		};

		initializeRecorder();
		
		return () => {
			mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
			setRecorderReady(false);
		};
	}, []);

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
	* Method starts recording to start. Sets `isRecording` to true
	*/ 
	const startRecording: () => void = useCallback(async () => {
		if (timerInterval != null) return;
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorderRef.current = new MediaRecorder(stream);
			setMediaRecorder(mediaRecorderRef.current);
			
			// Initialize chunks array at start of recording
			const chunks: BlobPart[] = [];
			
			mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
				if (event.data.size > 0) {
					chunks.push(event.data);
				}
			};

			mediaRecorderRef.current.onstop = () => {
				const blob = new Blob(chunks, { type: 'audio/webm' });
				setRecordingBlob(blob);
				chunks.length = 0; // Clear chunks
			};

			// Request data every 1 second (or less) while recording
			mediaRecorderRef.current.start(1000);
			setIsRecording(true);
			_startTimer();
		} catch (error) {
			console.error('Error starting recording:', error);
			setIsRecording(false);
		}
	}, [_startTimer, timerInterval]);

	/* 
	Calling this method results in a recording in progress being stopped and the resulting audio being present in `recordingBlob`. Sets `isRecording` to false
	 */
	const stopRecording: () => void = useCallback(async () => {
		try {
			if (!mediaRecorderRef.current || !isRecording) {
				return;
			}
			
			// Cleanup 
			const cleanup = () => {
				_stopTimer();
				setRecordingTime(0);
				setIsRecording(false);
				setIsPaused(false);
				
				// Stop all tracks
				mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
				// mediaRecorder?.stream.getTracks().forEach(track => track.stop());
				// mediaRecorderRef.current = null;
			};

			// Add minimum recording duration
			const minRecordingTime = 1000; // 1 second
			if (recordingTime < minRecordingTime) {
				setTimeout(() => {
					mediaRecorderRef.current?.stop();
					cleanup();
				}, minRecordingTime - recordingTime);
				return;
			}

       		mediaRecorderRef.current.stop();
			cleanup();
		} catch (error) {
			console.error('Error stopping recording:', error);
			setIsRecording(false);
			setIsPaused(false);
		}
	}, [_stopTimer, isRecording, recordingTime]);

	/**
	 * Method pauses the recording if currently running or resume if paused. Toggles value of `isPaused`
	 */
	const togglePauseResume: () => void = useCallback(async () => {
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
		recorderReady,
		recordingBlob,
		isRecording,
		isPaused,
		recordingTime,
		mediaRecorder
	};
};

export default useAudioRecorder;
