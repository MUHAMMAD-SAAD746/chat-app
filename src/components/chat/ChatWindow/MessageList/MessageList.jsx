import { useEffect, useRef, useState } from "react";
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

function MessageList({
    onReply,
    selectedUser,
    isForwardSelectionMode,
    selectedMessages,
    onStartForwardSelection,
    onToggleMessageSelection,
}) {
    const { conversationId } = useParams();
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [clearedAt, setClearedAt] = useState(0);

    const bottomRef = useRef(null);



    useEffect(() => {
        if (!conversationId || !user?.uid) return;

        const unsubscribe = subscribeToMessages(
            conversationId,
            user.uid,
            ({ messages, clearedAt }) => {
                setMessages(messages);
                setClearedAt(clearedAt);

                // Mark incoming messages as read
                messages.forEach((message) => {
                    if (
                        message.senderId !== user.uid &&
                        !message.readAt
                    ) {
                        console.log("MARKING MESSAGE AS READ:", message.id);

                        markMessageAsRead(
                            conversationId,
                            message.id
                        );
                    }
                });

                // Mark conversation as read
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



    useEffect(() => {
        if (visibleMessages.length === 0) return;

        bottomRef.current?.scrollIntoView({
            behavior: "auto",
        });
    }, [visibleMessages.length]);


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
                            isForwardSelectionMode={isForwardSelectionMode}
                            isSelected={selectedMessages.some(
                                (selected) => selected.id === message.id
                            )}
                            onStartForwardSelection={onStartForwardSelection}
                            onToggleMessageSelection={onToggleMessageSelection}
                        />
                    </div>
                );
            })}

            <div ref={bottomRef} />
        </div>
    );
}

export default MessageList;