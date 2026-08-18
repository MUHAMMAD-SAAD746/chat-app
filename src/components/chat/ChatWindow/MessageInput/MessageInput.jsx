import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { IoSend } from "react-icons/io5";
import "./MessageInput.css";

import { sendMessage } from "../../../../firebase/services/messageService";
import { setTyping } from "../../../../firebase/services/typingService";
import { useAuth } from "../../../../context/AuthContext";




function MessageInput({ canSendMessage = true }) {
    const [text, setText] = useState("");
    const { user } = useAuth();

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

            <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            <button
                type="button"
                aria-label="Send message"
                onClick={handleSend}
            >
                <IoSend size={18} />
            </button>

        </div>
    );
}

export default MessageInput;