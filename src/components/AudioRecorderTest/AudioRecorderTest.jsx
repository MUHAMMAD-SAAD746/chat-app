import { useState } from "react";

import {
    startRecording,
    stopRecording,
} from "../../utils/audioRecorder";

function AudioRecorderTest() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState("");

    const handleStart = async () => {
        await startRecording();

        setIsRecording(true);
    };

    const handleStop = async () => {
        const audioBlob = await stopRecording();

        const url = URL.createObjectURL(audioBlob);

        setAudioUrl(url);
        setIsRecording(false);
    };

    return (
        <div>
            <button onClick={handleStart} disabled={isRecording}>
                Start Recording
            </button>

            <button onClick={handleStop} disabled={!isRecording}>
                Stop Recording
            </button>

            {audioUrl && (
                <audio
                    src={audioUrl}
                    controls
                />
            )}
        </div>
    );
}

export default AudioRecorderTest;