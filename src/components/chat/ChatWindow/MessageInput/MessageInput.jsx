import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { IoSend, IoAttach, IoHappyOutline } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import "./MessageInput.css";

import { sendMessage } from "../../../../firebase/services/messageService";
import { setTyping } from "../../../../firebase/services/typingService";
import { useAuth } from "../../../../context/AuthContext";





function MessageInput({ canSendMessage = true, onAttach }) {
    const { user } = useAuth();
    const [text, setText] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const { conversationId } = useParams();

    const typingTimer = useRef(null);



    const handleTyping = (value) => {
        if (!canSendMessage) return;

        setText(value);

        if (!user || !conversationId) return;

        // If input is empty, stop typing immediately
        if (!value.trim()) {
            clearTimeout(typingTimer.current);

            setTyping(
                conversationId,
                user.uid,
                false
            );

            return;
        }

        // User is typing
        setTyping(
            conversationId,
            user.uid,
            true
        );

        // Reset the timer
        clearTimeout(typingTimer.current);

        // Stop typing after 2 seconds
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
            await sendMessage(
                conversationId,
                user.uid,
                messageText
            );
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
        return () => {
            clearTimeout(typingTimer.current);

            if (user && conversationId) {
                setTyping(
                    conversationId,
                    user.uid,
                    false
                );
            }
        };
    }, [conversationId, user]);


    if (!canSendMessage) {
        return (
            <div className="message-input-disabled">
                <p>You are no longer friends with this user.</p>
            </div>
        );
    }


    return (
        <div className="message-input">

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
                    type="button"
                    aria-label="Add emoji"
                    className="message-emoji-button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                    <IoHappyOutline size={20} />
                </button>

                {showEmojiPicker && (
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width={320}
                        height={380}
                    />
                )}
            </div>


            <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            <button
                type="button"
                className="message-send-button"
                aria-label="Send message"
                onClick={handleSend}
            >
                <IoSend size={18} />
            </button>

        </div>
    );
}

export default MessageInput;