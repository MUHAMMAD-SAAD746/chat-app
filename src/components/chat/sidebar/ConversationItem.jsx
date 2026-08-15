    import { Link } from "react-router-dom";

    import { useAuth } from "../../../context/AuthContext";

    function ConversationItem({ conversation, otherUser }) {
        const { user } = useAuth();
        const unreadCount = conversation.unread?.[user.uid] || 0;



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

                <div className="chat-avatar">
                    <img
                        src={`${otherUser?.profileImage}`}
                        alt={`${otherUser?.fullName || "User"} profile`}
                    />
                </div>

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