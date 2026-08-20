import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import {
    getConversation,
    createConversation
} from "../../../firebase/services/conversationService";

import { removeFriend } from "../../../firebase/services/friendService";
import RemoveFriendModal from "../RemoveFriendModal/RemoveFriendModal";

import "./FriendItem.css";

function FriendItem({ friend, onRemove }) {
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [removingFriend, setRemovingFriend] = useState(false);


    const { user } = useAuth();
    const navigate = useNavigate();

    const DEFAULT_PROFILE_IMAGE = "/default-profile.png";


    const handleOpenChat = async () => {
        if (!user?.uid || !friend?.uid) return;

        try {
            const existingConversation = await getConversation(
                user.uid,
                friend.uid
            );

            let conversationId;

            if (existingConversation) {
                conversationId = existingConversation.id;
            } else {
                const newConversation = await createConversation(
                    user.uid,
                    friend.uid
                );

                conversationId = newConversation.id;
            }

            navigate(`/chat/${conversationId}`);

        } catch (error) {
            console.error(
                "Failed to open conversation:",
                error
            );
        }
    };


    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpenChat();
        }
    };


    const handleRemoveFriend = async () => {
        if (!user?.uid || !friend?.uid) return;

        try {
            setRemovingFriend(true);

            await removeFriend(user.uid, friend.uid);
            onRemove();

            setShowRemoveModal(false);
        } catch (error) {
            console.error("Failed to remove friend:", error);
        } finally {
            setRemovingFriend(false);
        }
    };



    return (
        <>
            <div
                className="friend-item"
                role="button"
                tabIndex={0}
                onClick={handleOpenChat}
                onKeyDown={handleKeyDown}
            >

                <div className="friend-item-info">

                    <img
                        className="friend-item-avatar"
                        src={friend.profileImage || DEFAULT_PROFILE_IMAGE}
                        alt={friend.fullName || "Friend"}
                    />

                    <div className="friend-item-details">

                        <p className="friend-item-name">
                            {friend.fullName}
                        </p>

                        <p className="friend-item-username">
                            {friend.userName
                                ? `${friend.userName}`
                                : ""}
                        </p>

                    </div>

                </div>


                <button
                    className="friend-item-remove-btn"
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowRemoveModal(true);
                    }}
                >
                    Unfriend
                </button>
            </div>


            {showRemoveModal && (
                <RemoveFriendModal
                    friend={friend}
                    onConfirm={handleRemoveFriend}
                    onCancel={() => setShowRemoveModal(false)}
                    loading={removingFriend}
                />
            )}
        </>
    );
}

export default FriendItem;