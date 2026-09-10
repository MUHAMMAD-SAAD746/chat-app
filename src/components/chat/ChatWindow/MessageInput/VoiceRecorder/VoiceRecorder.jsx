import { useEffect, useState } from "react";
import { IoTrashOutline } from "react-icons/io5";
import "./VoiceRecorder.css";

import {
    pauseRecording,
    resumeRecording,
    cancelRecording,
} from "../../../../../utils/audioRecorder";

import { formatRecordingTime } from "../../../../../utils/formatUtils";



function VoiceRecorder({ onCancel }) {
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            setRecordingTime((prev) => prev + 1);
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [isPaused]);

    const handlePauseRecording = () => {
        pauseRecording();
        setIsPaused(true);
    };

    const handleResumeRecording = () => {
        resumeRecording();
        setIsPaused(false);
    };


    const handleDeleteRecording = () => {
        cancelRecording();
        onCancel();
    };

    return (
        <div className="voice-recorder">
            <button
                type="button"
                className="voice-recorder-delete"
                onClick={handleDeleteRecording}
                aria-label="Delete recording"
            >
                <IoTrashOutline size={20} />
            </button>


            <span className="voice-recorder-dot"></span>

            <span className="voice-recorder-time">
                {formatRecordingTime(recordingTime)}
            </span>

            <div className="voice-recorder-waveform">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            {isPaused ? (
                <button
                    type="button"
                    className="voice-recorder-control"
                    onClick={handleResumeRecording}
                    aria-label="Resume recording"
                >
                    ▶
                </button>
            ) : (
                <button
                    type="button"
                    className="voice-recorder-control"
                    onClick={handlePauseRecording}
                    aria-label="Pause recording"
                >
                    ⏸
                </button>
            )}
        </div>
    );
}

export default VoiceRecorder;