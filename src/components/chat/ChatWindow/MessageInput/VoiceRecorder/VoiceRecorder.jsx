import { useEffect, useRef, useState } from "react";
import {
    IoTrashOutline,
    IoPlay,
    IoPause,
} from "react-icons/io5";
import { MdMic } from "react-icons/md";
import "./VoiceRecorder.css";

import {
    pauseRecording,
    resumeRecording,
    cancelRecording,
    getRecordingPreview,
} from "../../../../../utils/audioRecorder";

import { formatRecordingTime } from "../../../../../utils/formatUtils";



function VoiceRecorder({ onCancel }) {
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
    const previewAudioRef = useRef(null);

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

        const previewBlob = getRecordingPreview();

        console.log("PREVIEW BLOB:", previewBlob);

        if (previewBlob) {
            const url = URL.createObjectURL(previewBlob);
            setPreviewUrl(url);
        }

        setIsPaused(true);
    };


    const handleResumeRecording = () => {
        resumeRecording();
        setIsPaused(false);
    };



    const handlePreviewPlayPause = async () => {
        if (!previewAudioRef.current || !previewUrl) return;

        if (isPreviewPlaying) {
            previewAudioRef.current.pause();
            setIsPreviewPlaying(false);
        } else {
            await previewAudioRef.current.play();
            setIsPreviewPlaying(true);
        }
    };


    const handleDeleteRecording = () => {
        cancelRecording();
        onCancel();
    };

    return (
        <>
            <audio
                ref={previewAudioRef}
                src={previewUrl}
                onEnded={() => {
                    setIsPreviewPlaying(false);
                }}
            />


            <div className="voice-recorder">
                <button
                    type="button"
                    className="voice-recorder-delete"
                    onClick={handleDeleteRecording}
                    aria-label="Delete recording"
                >
                    <IoTrashOutline size={20} />
                </button>


                {isPaused && previewUrl && (
                    <button
                        type="button"
                        className="voice-recorder-preview"
                        onClick={handlePreviewPlayPause}
                        aria-label={isPreviewPlaying ? "Pause preview" : "Play preview"}
                    >
                        {isPreviewPlaying ? (
                            <IoPause size={20} />
                        ) : (
                            <IoPlay size={20} />
                        )}
                    </button>
                )}


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
                        <MdMic size={20} />
                    </button>
                ) : (
                    <button
                        type="button"
                        className="voice-recorder-control"
                        onClick={handlePauseRecording}
                        aria-label="Pause recording"
                    >
                        <IoPause size={20} />
                    </button>
                )}
            </div>
        </>
    );
}

export default VoiceRecorder;