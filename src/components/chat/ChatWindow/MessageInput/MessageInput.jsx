import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import usePopupPosition from "../../../../hooks/usePopupPosition";
import { IoSend, IoAttach, IoHappyOutline } from "react-icons/io5";
import { MdMicNone } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";
import "./MessageInput.css";

import VoiceRecorder from "./VoiceRecorder/VoiceRecorder";

import {
    startRecording,
    stopRecording,
    getAudioDuration,
    generateWaveform,
    cancelRecording,
} from "../../../../utils/audioRecorder";

import { uploadVoiceMessage } from "../../../../cloudinary/cloudinaryService";

import {
    sendMessage,
    sendVoiceMessage,
} from "../../../../firebase/services/messageService";
import { setTyping } from "../../../../firebase/services/typingService";
import { useAuth } from "../../../../context/AuthContext";





function MessageInput({
    canSendMessage = true,
    onAttach,
    replyingTo,
    onCancelReply,
}) {
    const { user } = useAuth();
    const [text, setText] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const [isSendingVoice, setIsSendingVoice] = useState(false);

    const { conversationId } = useParams();

    const typingTimer = useRef(null);
    const recordingRef = useRef(false);


    const {
        triggerRef: emojiTriggerRef,
        menuRef: emojiPickerRef,
        position: emojiPickerPosition,
    } = usePopupPosition(
        showEmojiPicker,
        setShowEmojiPicker,
        {
            preferAbove: true,
        }
    );



    const handleTyping = (value) => {
        if (!canSendMessage) return;

        setText(value);

        if (!user || !conversationId) return;

        if (!value.trim()) {
            clearTimeout(typingTimer.current);

            setTyping(
                conversationId,
                user.uid,
                false
            );

            return;
        }

        setTyping(
            conversationId,
            user.uid,
            true
        );

        clearTimeout(typingTimer.current);

        typingTimer.current = setTimeout(() => {
            setTyping(
                conversationId,
                user.uid,
                false
            );
        }, 2000);
    };


    const handleEmojiClick = (emojiData) => {
        setText((prevText) => {
            const newText = prevText + emojiData.emoji;

            return newText;
        });
    };


    const handleStartRecording = async () => {
        try {
            await startRecording();

            setIsRecording(true);
            recordingRef.current = true;
        } catch (error) {
            console.error("Failed to start recording:", error);
        }
    };



    const handleSendVoice = async () => {
        if (
            !canSendMessage ||
            !user ||
            !conversationId ||
            !isRecording
        ) return;

        try {
            setIsSendingVoice(true);
            setIsRecording(false);
            recordingRef.current = false;

            const audioBlob = await stopRecording();
            const duration = await getAudioDuration(audioBlob);
            console.log("VOICE DURATION:", duration);

            const waveform = await generateWaveform(audioBlob);
            console.log("VOICE WAVEFORM:", waveform);

            console.log("VOICE BLOB:", audioBlob);
            console.log("VOICE TYPE:", audioBlob.type);
            console.log("VOICE SIZE:", audioBlob.size);

            const voiceUpload = await uploadVoiceMessage(audioBlob);
            console.log("VOICE UPLOAD:", voiceUpload);

            await sendVoiceMessage(
                conversationId,
                user.uid,
                voiceUpload.url,
                audioBlob.type,
                audioBlob.size,
                duration,
                waveform
            );

            setIsSendingVoice(false);
            setIsRecording(false);
            recordingRef.current = false;
        } catch (error) {
            console.error("Failed to send voice recording:", error);
        } finally {
            setIsSendingVoice(false);
        }
    };



    const handleSend = async () => {
        if (
            !canSendMessage ||
            !text.trim() ||
            !user ||
            !conversationId
        ) return;

        const messageText = text.trim();

        setText("");

        clearTimeout(typingTimer.current);

        setTyping(
            conversationId,
            user.uid,
            false
        );

        try {
            const replyTo = replyingTo
                ? {
                    messageId: replyingTo.id,
                    senderId: replyingTo.senderId,
                    text: replyingTo.text || "",
                    type: replyingTo.type || "text",
                    fileUrl: replyingTo.fileUrl || "",
                    fileName: replyingTo.fileName || "",
                    caption: replyingTo.caption || "",
                    deleteStatus: replyingTo.deleteStatus || null,
                }
                : null;


            await sendMessage(
                conversationId,
                user.uid,
                messageText,
                replyTo
            );

            onCancelReply?.();
        } catch (error) {
            console.error("Failed to send message:", error);

            setText(messageText);
        }
    };


    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };




    useEffect(() => {
        setText("");

        return () => {
            clearTimeout(typingTimer.current);

            if (recordingRef.current) {
                cancelRecording();
                recordingRef.current = false;
                setIsRecording(false);
            }

            if (user && conversationId) {
                setTyping(
                    conversationId,
                    user.uid,
                    false
                );
            }
        };
    }, [conversationId, user]);


    if (canSendMessage === false) {
        return (
            <div className="message-input-disabled">
                <p>You are no longer friends with this user.</p>
            </div>
        );
    }


    return (
        <div className="message-input">
            {replyingTo && (
                <div className="reply-preview">
                    <div className="reply-preview-content">
                        <strong>Replying to</strong>

                        <p>
                            {replyingTo.text ||
                                replyingTo.caption ||
                                replyingTo.fileName ||
                                "Attachment"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCancelReply}
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="message-input-row">
                <div className="message-input-wrapper">
                    <div className="message-input-left">
                        <button
                            type="button"
                            className="message-attach-button"
                            aria-label="Attach file"
                            onClick={onAttach}
                        >
                            <IoAttach size={20} />
                        </button>


                        <div className="emoji-picker-container">
                            <button
                                ref={emojiTriggerRef}
                                type="button"
                                aria-label="Add emoji"
                                className="message-emoji-button"
                                onClick={() => setShowEmojiPicker((prev) => !prev)}
                            >
                                <IoHappyOutline size={20} />
                            </button>

                            {showEmojiPicker && (
                                <div
                                    ref={emojiPickerRef}
                                    className="message-emoji-picker"
                                    style={{
                                        top: emojiPickerPosition.top,
                                        left: emojiPickerPosition.left,
                                    }}
                                >
                                    <EmojiPicker
                                        onEmojiClick={handleEmojiClick}
                                        width={320}
                                        height={380}
                                    />
                                </div>
                            )}
                        </div>
                    </div>



                    {isRecording ? (
                        <VoiceRecorder
                            isSending={isSendingVoice}
                            onCancel={() => {
                                setIsRecording(false);
                                recordingRef.current = false;
                            }}
                        />
                    ) : (
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={text}
                            onChange={(e) => handleTyping(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    )}


                    {isRecording || text.trim() ? (
                        <button
                            type="button"
                            className="message-send-button"
                            aria-label="Send message"
                            onClick={isRecording ? handleSendVoice : handleSend}
                        >
                            <IoSend size={18} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="message-send-button message-mic-button"
                            aria-label="Record voice message"
                            onClick={handleStartRecording}
                        >
                            <MdMicNone size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MessageInput;