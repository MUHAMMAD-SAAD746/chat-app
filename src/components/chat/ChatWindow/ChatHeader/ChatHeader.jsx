import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoEllipsisVerticalSharp } from "react-icons/io5";

import { listenToUserPresence } from "../../../../firebase/services/presenceListenerService";

import "./ChatHeader.css";

function ChatHeader({ selectedUser, isOtherUserTyping }) {
    const [showMenu, setShowMenu] = useState(false);
    const [presence, setPresence] = useState(null);
    console.log("Typing:", isOtherUserTyping);
    const navigate = useNavigate();
    console.log("Selected user in ChatHeader:", selectedUser);

    useEffect(() => {
        if (!selectedUser?.uid) {
            setPresence(null);
            return;
        }

        const unsubscribe = listenToUserPresence(
            selectedUser.uid,
            setPresence
        );

        return unsubscribe;
    }, [selectedUser?.uid]);


    const handleCloseChat = () => {
        setShowMenu(false);
        navigate("/chat");
    };



    function formatLastSeen(timestamp) {
        if (!timestamp) return "some time ago";

        const now = Date.now();
        const difference = now - timestamp;

        const seconds = Math.floor(difference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) {
            return "just now";
        }

        if (minutes < 60) {
            return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
        }

        if (hours < 24) {
            return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
        }

        if (days < 7) {
            return `${days} ${days === 1 ? "day" : "days"} ago`;
        }

        return new Date(timestamp).toLocaleDateString();
    }



    return (
        <header className="chat-header">

            {/* User Profile */}
            <div className="chat-header-user">

                <div className="chat-header-avatar">
                    <img
                        src={`${selectedUser?.profileImage}`}
                        alt="User profile"
                    />
                </div>

                {/* User Information */}
                <div className="chat-header-info">
                    <p className="chat-header-name">
                        {selectedUser?.fullName || "User Name"}
                    </p>

                    <div
                        className={`chat-header-status ${presence?.online ? "online" : "offline"
                            }`}
                    >
                        <span className="chat-status-dot"></span>

                        <span>
                            {isOtherUserTyping
                                ? "typing..."
                                : presence === null
                                    ? "..."
                                    : presence.online
                                        ? "Online"
                                        : `Last seen ${formatLastSeen(presence.lastSeen)}`}
                        </span>
                    </div>
                </div>

            </div>

            {/* Header Actions */}
            <div className="chat-header-actions">

                <button
                    type="button"
                    className="chat-header-menu"
                    aria-label="Chat options"
                    onClick={() => setShowMenu((prev) => !prev)}
                >
                    <IoEllipsisVerticalSharp size={20} />
                </button>

                {/* Dropdown */}
                {showMenu && (
                    <div className="chat-options-menu">
                        <button
                            type="button"
                            onClick={handleCloseChat}
                        >
                            Close Chat
                        </button>
                    </div>
                )}

            </div>

        </header>
    );
}

export default ChatHeader;
