import "./DeleteMessageModal.css";

function DeleteMessageModal({
    isSender,
    onDeleteEveryone,
    onDeleteForMe,
    onCancel
}) {
    return (
        <div className="delete-modal-overlay" onClick={onCancel}>
            <div
                className="delete-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <h3>Delete message</h3>

                <div className="delete-modal-actions">
                    {isSender && (
                        <button
                            className="delete-everyone-btn"
                            onClick={onDeleteEveryone}
                        >
                            Delete for everyone
                        </button>
                    )}

                    <button
                        className="delete-me-btn"
                        onClick={onDeleteForMe}
                    >
                        Delete for me
                    </button>

                    <button
                        className="delete-cancel-btn"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteMessageModal;