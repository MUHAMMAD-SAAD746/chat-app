import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import MessageBubble from "../MessageBubble/MessageBubble";
import "./MessageList.css";

import { useAuth } from "../../../../context/AuthContext";
import { subscribeToMessages } from "../../../../firebase/services/messageListenerService";
import { markConversationAsRead } from "../../../../firebase/services/unreadService";
import { markMessageAsRead } from "../../../../firebase/services/messageReceiptService";

import {
    formatTime,
    formatMessageDate,
} from "../../../../utils/formatUtils";

function MessageList({ onReply, selectedUser }) {
    const { conversationId } = useParams();
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [clearedAt, setClearedAt] = useState(0);

    useEffect(() => {
        if (!conversationId || !user?.uid) return;

        const unsubscribe = subscribeToMessages(
            conversationId,
            user.uid,
            ({ messages, clearedAt }) => {
                setMessages(messages);
                setClearedAt(clearedAt);

                visibleMessages.forEach((message) => {
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



    const visibleMessages = messages.filter(
        (message) => message.createdAt > clearedAt
    );






    return (
        <div className="message-list">
            {visibleMessages.map((message, index) => {
                const currentDate = formatMessageDate(message.createdAt);

                const previousDate =
                    index > 0
                        ? formatMessageDate(
                            visibleMessages[index - 1].createdAt
                        )
                        : null;

                const showDateSeparator = currentDate !== previousDate;

                return (
                    <div 
                        key={message.id}
                    >
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
                            onReply={onReply}
                            selectedUser={selectedUser}
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default MessageList;