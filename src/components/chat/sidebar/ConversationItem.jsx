import { Link } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

function ConversationItem({ conversation, otherUser, onClick }) {
    const { user } = useAuth();

    const unreadCount = conversation?.unread?.[user.uid] || 0;


    const formatTime = (timestamp) => {
        if (!timestamp) return "";

        return new Date(timestamp).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        });
    };



    const content = (
        <>
            <div className="chat-avatar">
                <img
                    src={otherUser?.profileImage}
                    alt={`${otherUser?.fullName || "User"} profile`}
                />
            </div>

            <div className="chat-info">
                <div className="chat-top">
                    <p className="chat-name">
                        {otherUser?.fullName}
                    </p>

                    {!onClick && (
                        <span className="chat-time">
                            {formatTime(conversation?.lastMessageTime)}
                        </span>
                    )}
                </div>

                <div className="chat-bottom">
                    <p className="chat-last-message">
                        {onClick
                            ? otherUser?.userName
                            : conversation?.lastMessage}
                    </p>

                    {!onClick && unreadCount > 0 && (
                        <span className="unread-count">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </>
    );



    return onClick ? (
        // Search result
        <button
            type="button"
            className="chat-item chat-item-button"
            onClick={onClick}
        >

            {content}
        </button>
    ) : (
        // Existing conversation
        <Link
            to={`/chat/${conversation.id}`}
            className="chat-item"
        >
            {content}
        </Link>
    );
}

export default ConversationItem;