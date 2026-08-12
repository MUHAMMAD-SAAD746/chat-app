import { Link } from "react-router-dom";

function ConversationItem({
    id,
    name,
    lastMessage,
    time,
    profileImage
}) {
    return (
        <Link
            to={`/chat/${id}`}
            className="chat-item"
        >

            {/* Profile Image */}
            <div className="chat-avatar">
                <img
                    src={profileImage}
                    alt={`${name} profile`}
                />
            </div>

            {/* Conversation Information */}
            <div className="chat-info">
                <div className="chat-top">
                    <p className="chat-name">
                        {name}
                    </p>

                    <span className="chat-time">
                        {time}
                    </span>
                </div>

                <p className="chat-last-message">
                    {lastMessage}
                </p>
            </div>

        </Link>
    );
}

export default ConversationItem;