import OpenAI from "openai";
// Audio processing functions

export const handleAudioFileSelect = (event, audioRef) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            const audioDataFromFile = e.target.result;
            audioRef.current.src = audioDataFromFile;
            audioRef.current.play();
        };
        fileReader.readAsDataURL(selectedFile);
    }
};

export const handleAudioRecording = (mediaRecorderRef,audioRef) => {
    //check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Your browser does not support recording!");
    return;
    }

    if (!mediaRecorderRef.current) {
        //will be used later to record audio
        const chunks = [];

        // setup audio recorder
        navigator.mediaDevices.getUserMedia({
            audio: true,
        }).then((stream) => {
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                //create the Blob from the chunks
                const audioBlob = new Blob(chunks, { type: "audio/mp3" });
                const recordedAudioDataPath = URL.createObjectURL(audioBlob);
                audioRef.current.src = recordedAudioDataPath;
                // audioRef.current.play();
            };

            mediaRecorderRef.current = mediaRecorder;

            if (mediaRecorderRef.current.state === "inactive") {
                // start recording
                mediaRecorderRef.current.start();
            } else if (mediaRecorderRef.current.state === "recording") {
                // stop recording
                mediaRecorderRef.current.stop();
            }

        }).catch((err) => {
            alert(`The following error occurred: ${err}`);
        });
    }
};

export const transcribeAudio = async (audioData, setTranscribedText) => {
    try {
        // You would need to implement audio recording or file selection logic here.
        // For simplicity, this example assumes you have an audio recording in a variable called "audioData."

        // Whisper API key.
        const apiKey = process.env.OPENAI_API_KEY;

        const formData = new FormData();
        formData.append("audio", audioData, 'kaito_prompt.mp3');

        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (response.ok) {
            const result = await response.json();
            setTranscribedText(result.transcription);
        } else {
            console.error("Error transcribing audio.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
};

// export const handleAudioRecording = () => {
//     if (!mediaRecorderRef.current) {
//         const mediaRecorder = new MediaRecorder({ audio: true });
//         const chunks = [];

//         mediaRecorder.ondataavailable = (event) => {
//             if (event.data.size > 0) {
//                 chunks.push(event.data);
//             }
//         };

//         mediaRecorder.onstop = async () => {
//             const audioBlob = new Blob(chunks, { type: "audio/wav" });
//             const audioDataFromRecording = URL.createObjectURL(audioBlob);
//             audioRef.current.src = audioDataFromRecording;
//             audioRef.current.play();
//         };

//         mediaRecorderRef.current = mediaRecorder;
//     }

//     if (mediaRecorderRef.current.state === "inactive") {
//         mediaRecorderRef.current.start();
//     } else if (mediaRecorderRef.current.state === "recording") {
//         mediaRecorderRef.current.stop();
//     }
// };
