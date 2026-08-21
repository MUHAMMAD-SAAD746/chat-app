import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MessageBubble from "../MessageBubble/MessageBubble";
import "./MessageList.css";

import { useAuth } from "../../../../context/AuthContext";
import { subscribeToMessages } from "../../../../firebase/services/messageListenerService";
import { markConversationAsRead } from "../../../../firebase/services/unreadService";
import { markMessageAsRead } from "../../../../firebase/services/messageReceiptService";

function MessageList() {
    const { conversationId } = useParams();
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!conversationId || !user?.uid) return;

        const unsubscribe = subscribeToMessages(
            conversationId,
            (messages) => {
                setMessages(messages);

                messages.forEach((message) => {
                    if (
                        message.senderId !== user.uid &&
                        !message.readAt
                    ) {
                        markMessageAsRead(
                            conversationId,
                            message.id
                        );
                    }
                });

                markConversationAsRead(
                    conversationId,
                    user.uid
                ).catch((error) => {
                    console.error(
                        "Error marking conversation as read:",
                        error
                    );
                });
            }
        );

        return unsubscribe;
    }, [conversationId, user?.uid]);


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
                    message={message}
                    conversationId={conversationId}
                    userId={user.uid}
                    time={formatTime(message.createdAt)}
                    isOwn={message.senderId === user.uid}
                />
            ))}
        </div>
    );
}

export default MessageList;