import "./SendFriendRequestModal.css";

function SendFriendRequestModal({
    user,
    alreadyFriend,
    onConfirm,
    onCancel,
    loading = false
}) {
    if (!user) return null;

    return (
        <div className="friend-request-modal-overlay">

            <div className="friend-request-modal">

                <div className="friend-request-modal-header">
                    <h2>
                        {alreadyFriend
                            ? "Already Friends"
                            : "Send Friend Request?"}
                    </h2>

                    <button
                        className="friend-request-modal-close"
                        onClick={onCancel}
                        disabled={loading}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>


                <div className="friend-request-modal-user">

                    <img
                        className="friend-request-modal-avatar"
                        src={
                            user.profileImage ||
                            "/default-profile.png"
                        }
                        alt={user.fullName || "User"}
                    />

                    <div className="friend-request-modal-user-info">

                        <p className="friend-request-modal-name">
                            {user.fullName}
                        </p>

                        {user.userName && (
                            <p className="friend-request-modal-username">
                                @{user.userName}
                            </p>
                        )}

                    </div>

                </div>


                <p className="friend-request-modal-message">
                    {alreadyFriend
                        ? "You are already friends with this user."
                        : "Would you like to send a friend request to this user?"}
                </p>


                <div className="friend-request-modal-actions">

                    <button
                        className="friend-request-modal-cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        className="friend-request-modal-confirm"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {alreadyFriend
                            ? "Start Conversation"
                            : loading
                                ? "Sending..."
                                : "Send Request"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SendFriendRequestModal;