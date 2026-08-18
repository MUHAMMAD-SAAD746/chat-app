import "./RemoveFriendModal.css";

function RemoveFriendModal({
    friend,
    onConfirm,
    onCancel,
    loading = false
}) {
    if (!friend) return null;

    return (
        <div className="remove-friend-modal-overlay">

            <div className="remove-friend-modal">

                <div className="remove-friend-modal-header">
                    <h2>Unfriend {friend.fullName}?</h2>

                    <button
                        className="remove-friend-modal-close"
                        onClick={onCancel}
                        disabled={loading}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>


                <div className="remove-friend-modal-user">

                    <img
                        className="remove-friend-modal-avatar"
                        src={
                            friend.profileImage ||
                            "/default-profile.png"
                        }
                        alt={friend.fullName || "Friend"}
                    />

                    <div className="remove-friend-modal-user-info">

                        <p className="remove-friend-modal-name">
                            {friend.fullName}
                        </p>

                        {friend.userName && (
                            <p className="remove-friend-modal-username">
                                @{friend.userName}
                            </p>
                        )}

                    </div>

                </div>


                <p className="remove-friend-modal-message">
                    You will no longer be friends with this user.
                    Your conversation will not be deleted.
                </p>


                <div className="remove-friend-modal-actions">

                    <button
                        className="remove-friend-modal-cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        className="remove-friend-modal-confirm"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Unfriending..." : "Unfriend"}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default RemoveFriendModal;