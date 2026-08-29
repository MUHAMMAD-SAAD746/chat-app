import React, { useEffect, useState } from "react";
import { IoClose, IoSearch, IoSend } from "react-icons/io5";
import "./ForwardMessageModal.css";

import { getFriends } from "../../../firebase/services/friendService";
import { getUser } from "../../../firebase/database";

const ForwardMessageModal = ({
    isOpen,
    onClose,
    userId,
    selectedMessages,
    onSelectFriend,
    isForwarding,
}) => {

    const [search, setSearch] = useState("");

    const [friends, setFriends] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedFriends, setSelectedFriends] = useState([]);



    useEffect(() => {
        if (!isOpen || !userId) return;

        const loadFriends = async () => {
            try {
                setIsLoading(true);
                setError("");

                const friendIds = await getFriends(userId);


                const ids = Object.keys(friendIds || {});

                const friendUsers = await Promise.all(
                    ids.map((friendId) => getUser(friendId))
                );

                const validFriends = friendUsers.filter(Boolean);

                setFriends(validFriends);
            } catch (error) {
                console.error("Failed to load friends:", error);

                setError("Failed to load friends.");
            } finally {
                setIsLoading(false);
            }
        };

        loadFriends();
    }, [isOpen, userId]);



    useEffect(() => {
        if (!isOpen) {
            setSearch("");
            setSelectedFriends([]);
            setError("");
        }
    }, [isOpen]);



    if (!isOpen) return null;


    const filteredFriends = friends.filter((friend) => {
        const searchValue = search.toLowerCase().trim();

        if (!searchValue) return true;

        return (
            friend.fullName?.toLowerCase().includes(searchValue) ||
            friend.userName?.toLowerCase().includes(searchValue)
        );
    });

    const handleFriendClick = (friend) => {
        setSelectedFriends((prev) => {
            const alreadySelected = prev.some(
                (selectedFriend) =>
                    selectedFriend.uid === friend.uid
            );

            if (alreadySelected) {
                return prev.filter(
                    (selectedFriend) =>
                        selectedFriend.uid !== friend.uid
                );
            }

            return [...prev, friend];
        });
    };

    return (
        <div className="forward-modal-overlay">
            <div className="forward-modal">

                {/* Header */}
                <div className="forward-modal-header">
                    <button
                        className="forward-close-button"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <IoClose />
                    </button>

                    <h2>Forward messages</h2>
                </div>

                {/* Search */}
                <div className="forward-search-wrapper">
                    <IoSearch className="forward-search-icon" />

                    <input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Friends */}
                <div className="forward-friends-section">

                    <div className="forward-section-title">
                        Friends
                    </div>

                    <div className="forward-friends-list">
                        {isLoading && (
                            <div className="forward-loading">
                                <div className="forward-spinner" />
                                <span>Loading friends...</span>
                            </div>
                        )}

                        {!isLoading && error && (
                            <div className="forward-error">
                                <span className="forward-error-icon">!</span>

                                <span className="forward-error-text">
                                    {error}
                                </span>
                            </div>
                        )}

                        {filteredFriends.length > 0 ? (
                            filteredFriends.map((friend) => (
                                <button
                                    key={friend.uid}
                                    className={`forward-friend-item ${selectedFriends.some(
                                        (selectedFriend) =>
                                            selectedFriend.uid === friend.uid
                                    )
                                        ? "selected"
                                        : ""
                                        }`}
                                    disabled={isForwarding}
                                    onClick={() =>
                                        handleFriendClick(friend)
                                    }
                                >
                                    <div className="forward-checkbox">
                                        {selectedFriends.some(
                                            (selectedFriend) =>
                                                selectedFriend.uid === friend.uid
                                        ) && (
                                                <span>✓</span>
                                            )}
                                    </div>

                                    <div className="forward-friend-avatar">
                                        {friend.profileImage ? (
                                            <img
                                                src={friend.profileImage}
                                                alt={friend.fullName}
                                            />
                                        ) : (
                                            <span>
                                                {friend.fullName
                                                    ?.charAt(0)
                                                    ?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="forward-friend-info">
                                        <div className="forward-friend-name">
                                            {friend.fullName}
                                        </div>

                                        <div className="forward-friend-username">
                                            @{friend.userName}
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="forward-no-friends">
                                No friends found
                            </div>
                        )}

                    </div>
                </div>


                {selectedFriends.length > 0 && (
                    <div className="forward-selection-bar">
                        <span className="forward-selected-count">
                            {selectedFriends.length} selected
                        </span>

                        <button
                            type="button"
                            className="forward-send-button"
                            onClick={() => {
                                if (onSelectFriend) {
                                    onSelectFriend(selectedFriends);
                                }
                            }}
                        >
                            {isForwarding ? (
                                <div className="forward-send-spinner" />
                            ) : (
                                <IoSend />
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForwardMessageModal;
