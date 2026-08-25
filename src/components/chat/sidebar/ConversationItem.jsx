import { useState } from "react";
import usePopupPosition from "../../../hooks/usePopupPosition";
import { Link } from "react-router-dom";
import { IoChevronDown } from "react-icons/io5";
import { BiPin } from "react-icons/bi";

import { useAuth } from "../../../context/AuthContext";
import { formatTime } from "../../../utils/formatUtils";

import {
    pinConversation,
    unpinConversation
} from "../../../firebase/services/conversationService";



function ConversationItem({ conversation, otherUser, onClick }) {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);


    const {
        triggerRef,
        menuRef,
        position,
    } = usePopupPosition(
        menuOpen,
        setMenuOpen
    );


    const unreadCount = conversation?.unread?.[user.uid] || 0;
    const isPinned = conversation?.pinnedBy?.[user.uid] === true;




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



                    {!onClick && (
                        <div className="chat-actions">
                            {isPinned && (
                                <BiPin className="chat-pinned-icon" />
                            )}

                            {unreadCount > 0 && (
                                <span className="unread-count">
                                    {unreadCount}
                                </span>
                            )}

                            {!onClick && (
                                <button
                                    type="button"
                                    className="conversation-menu-button"
                                    ref={triggerRef}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();


                                        setMenuOpen((prev) => !prev);
                                    }}
                                >
                                    <IoChevronDown />
                                </button>
                            )}
                        </div>
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
        <div className="conversation-item-wrapper">
            <Link
                to={`/chat/${conversation.id}`}
                className="chat-item"
            >
                {content}
            </Link>


            {
                menuOpen && (
                    <div
                        ref={menuRef}
                        className="conversation-menu"
                        style={{
                            top: position.top,
                            left: position.left,
                        }}
                    >
                        <button
                            type="button"
                            onClick={async (event) => {
                                event.stopPropagation();

                                if (isPinned) {
                                    await unpinConversation(
                                        conversation.id,
                                        user.uid
                                    );
                                } else {
                                    await pinConversation(
                                        conversation.id,
                                        user.uid
                                    );
                                }
                                setMenuOpen(false);
                            }}
                        >
                            <BiPin />
                            <span>{isPinned ? "Unpin" : "Pin"}</span>
                        </button>
                    </div>
                )
            }
        </div>
    );
}

export default ConversationItem;