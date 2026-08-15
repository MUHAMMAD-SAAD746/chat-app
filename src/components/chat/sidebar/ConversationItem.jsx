import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
import { getUser } from "../../../firebase/database";

function ConversationItem({ conversation }) {
    const { user } = useAuth();
    const unreadCount = conversation.unread?.[user.uid] || 0;

    const [otherUser, setOtherUser] = useState(null);

    const otherUserId = Object.keys(conversation.members)
        .find((uid) => uid !== user.uid);

    console.log("Other user ID:", otherUserId);


    useEffect(() => {
        const fetchOtherUser = async () => {
            const userData = await getUser(otherUserId);

            console.log("Other user:", userData);

            setOtherUser(userData);
        };

        fetchOtherUser();
    }, [otherUserId]);



    const formatTime = (timestamp) => {
        if (!timestamp) return "";

        return new Date(timestamp).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        });
    };



    return (
        <Link
            to={`/chat/${conversation.id}`}
            className="chat-item"
        >

            {/* Profile Image */}
            <div className="chat-avatar">
                <img
                    src={`${otherUser?.profileImage}`}
                    alt={`${otherUser?.fullName || "User"} profile`}
                />
            </div>

            {/* Conversation Information */}
            <div className="chat-info">
                <div className="chat-top">
                    <p className="chat-name">
                        {otherUser?.fullName}
                    </p>

                    <span className="chat-time">
                        {formatTime(conversation.lastMessageTime)}
                    </span>
                </div>

                <div className="chat-bottom">
                    <p className="chat-last-message">
                        {conversation.lastMessage}
                    </p>

                    {unreadCount > 0 && (
                        <span className="unread-count">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>

        </Link>
    );
}

export default ConversationItem;