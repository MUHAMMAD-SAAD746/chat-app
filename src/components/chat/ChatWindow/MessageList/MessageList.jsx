import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MessageBubble from "../MessageBubble/MessageBubble";
import "./MessageList.css";

import { useAuth } from "../../../../context/AuthContext";
import { subscribeToMessages } from "../../../../firebase/services/messageListenerService";

function MessageList() {
    const { conversationId } = useParams();
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!conversationId) return;

        const unsubscribe = subscribeToMessages(
            conversationId,
            (messages) => {
                setMessages(messages);
            }
        );

        return unsubscribe;
    }, [conversationId]);


    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        });
    };



    return (
        <div className="message-list">
            {messages.map((message) => (
                <MessageBubble
                    key={message.id}
                    text={message.text}
                    time={formatTime(message.createdAt)}
                    isOwn={message.senderId === user?.uid}
                />
            ))}
        </div>
    );
}

export default MessageList;