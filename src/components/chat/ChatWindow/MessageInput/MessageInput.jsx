import { useState } from "react";
import { useParams } from "react-router-dom";
import { IoSend } from "react-icons/io5";
import "./MessageInput.css";

import { sendMessage } from "../../../../firebase/services/messageService";
import { useAuth } from "../../../../context/AuthContext";




function MessageInput() {
    const [text, setText] = useState("");
    const { user } = useAuth();

    const { conversationId } = useParams();


    const handleSend = async () => {
        if (!text.trim() || !user || !conversationId) return;

        try {
            await sendMessage(
                conversationId,
                user.uid,
                text.trim()
            );

            setText("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };


    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };


    return (
        <div className="message-input">

            <input
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
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