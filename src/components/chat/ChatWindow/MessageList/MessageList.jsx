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




    const formatMessageDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();

        const isToday =
            date.toDateString() === today.toDateString();

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isYesterday =
            date.toDateString() === yesterday.toDateString();

        if (isToday) {
            return "Today";
        }

        if (isYesterday) {
            return "Yesterday";
        }

        return date.toLocaleDateString([], {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };



    return (
        <div className="message-list">
            {messages.map((message, index) => {
                const currentDate = formatMessageDate(message.createdAt);

                const previousDate =
                    index > 0
                        ? formatMessageDate(messages[index - 1].createdAt)
                        : null;

                const showDateSeparator = currentDate !== previousDate;

                return (
                    <div key={message.id}>
                        {showDateSeparator && (
                            <div className="message-date">
                                {currentDate}
                            </div>
                        )}

                        <MessageBubble
                            message={message}
                            conversationId={conversationId}
                            userId={user.uid}
                            time={formatTime(message.createdAt)}
                            isOwn={message.senderId === user.uid}
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default MessageList;