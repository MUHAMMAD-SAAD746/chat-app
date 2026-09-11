import { useRef, useState } from "react";
import { getDefaultProfileImage } from "../../../../../utils/profile";
import { IoPlay, IoPause } from "react-icons/io5";

import "./VoiceMessageBubble.css";

function VoiceMessageBubble({
    fileUrl,
    duration,
    waveform,
    profileImage,
    fullName,
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(duration);
    const audioRef = useRef(null);


    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
    };


    const playbackProgress = audioDuration
        ? (currentTime / audioDuration) * 100
        : 0;


    const maxWaveformValue = waveform?.length
        ? Math.max(...waveform)
        : 1;



    const handlePlayPause = async () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            await audioRef.current.play();
            setIsPlaying(true);
        }
    };



    const handleWaveformClick = (event) => {
        if (!audioRef.current || !audioDuration) return;

        const rect = event.currentTarget.getBoundingClientRect();

        const clickPosition = event.clientX - rect.left;

        const percentage = Math.max(
            0,
            Math.min(clickPosition / rect.width, 1)
        );

        audioRef.current.currentTime = percentage * audioDuration;

        setCurrentTime(audioRef.current.currentTime);
    };

    return (
        <>
            <audio
                ref={audioRef}
                src={fileUrl}
                onTimeUpdate={(event) => {
                    setCurrentTime(event.target.currentTime);
                }}
                onEnded={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                }}
                onLoadedMetadata={(event) => {
                    setAudioDuration(event.target.duration);
                }}
            />


            <div className="voice-message-bubble">

                <div className="voice-message-avatar">
                        <img
                            src={profileImage || getDefaultProfileImage(fullName)}
                            alt={fullName || "User"}
                        />
                </div>

                <button
                    type="button"
                    className="voice-message-play-button"
                    onClick={handlePlayPause}
                    aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
                >
                    {isPlaying ? (
                        <IoPause size={18} />
                    ) : (
                        <IoPlay size={18} />
                    )}
                </button>

                <div
                    className="voice-message-waveform"
                    onClick={handleWaveformClick}
                >
                    {waveform?.map((value, index) => (
                        <span
                            key={index}
                            className={
                                index < (playbackProgress / 100) * waveform.length
                                    ? "active"
                                    : ""
                            }
                            style={{
                                // height: `${Math.max(value * 30, 5)}px`,
                                height: `${Math.max((value / maxWaveformValue) * 30, 5)}px`,
                            }}
                        ></span>
                    ))}
                </div>

                <span className="voice-message-duration">
                    {formatDuration(
                        currentTime > 0 ? currentTime : duration
                    )}
                </span>
            </div>
        </>
    );
}

export default VoiceMessageBubble;