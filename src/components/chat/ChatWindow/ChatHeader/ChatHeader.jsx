import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import usePopupPosition from "../../../../hooks/usePopupPosition";
import {
    IoArrowBack,
    IoEllipsisVerticalSharp,
    IoTrashOutline,
    IoCloseOutline,
} from "react-icons/io5";

import { useAuth } from "../../../../context/AuthContext";

import { listenToUserPresence } from "../../../../firebase/services/presenceListenerService";
import { clearConversation } from "../../../../firebase/services/conversationService";
import { formatLastSeen } from "../../../../utils/formatUtils";

import "./ChatHeader.css";

function ChatHeader({ selectedUser, isOtherUserTyping }) {
    const [showMenu, setShowMenu] = useState(false);
    const [presence, setPresence] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { conversationId } = useParams();


    const {
        triggerRef,
        menuRef,
        position,
    } = usePopupPosition(
        showMenu,
        setShowMenu
    );


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



    const handleClearConversation = async () => {
        if (!conversationId || !user?.uid) return;

        try {
            await clearConversation(
                conversationId,
                user.uid
            );

            setShowMenu(false);
        } catch (error) {
            console.error(
                "Error clearing conversation:",
                error
            );
        }
    };



    const handleBack = () => {
        setShowMenu(false);
        navigate("/chat");
    };




    return (
        <header className="chat-header">



            <div className="chat-header-left">
                <button
                    type="button"
                    className="chat-header-back"
                    aria-label="Back to chats"
                    onClick={handleBack}
                >
                    <IoArrowBack size={20} />
                </button>

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
            </div>



            {/* Header Actions */}
            <div className="chat-header-actions">

                <button
                    type="button"
                    className="chat-header-menu"
                    aria-label="Chat options"
                    onClick={() => setShowMenu((prev) => !prev)}
                    ref={triggerRef}
                >
                    <IoEllipsisVerticalSharp size={20} />
                </button>

                {/* Dropdown */}
                {showMenu && (
                    <div
                        className="chat-options-menu"
                        ref={menuRef}
                        style={{
                            top: position.top,
                            left: position.left - 28,
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleClearConversation}
                        >
                            <span className="chat-option-icon">
                                <IoTrashOutline size={16} />
                            </span>

                            <span>Clear Chat</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCloseChat}
                        >
                            <span className="chat-option-icon">
                                <IoCloseOutline size={16} />
                            </span>

                            <span>Close Chat</span>
                        </button>
                    </div>
                )}

            </div>

        </header>
    );
}

export default ChatHeader;
