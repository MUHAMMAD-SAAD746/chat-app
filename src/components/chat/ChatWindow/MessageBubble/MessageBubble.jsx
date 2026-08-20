import { useState, useEffect } from "react";
import { IoCheckmark, IoCheckmarkDone, IoChevronDown } from "react-icons/io5";
import DeleteMessageModal from "../../DeleteMessageModal/DeleteMessageModal";

import {
    deleteMessageForMe,
    deleteMessageForEveryone,
} from "../../../../firebase/services/messageService";

import "./MessageBubble.css";

function MessageBubble({
    conversationId,
    messageId,
    userId,
    text,
    time,
    isOwn = false,
    deliveredAt,
    readAt,
    deleteStatus,
    deletedFor,
}) {
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    let receiptStatus = "sent";

    if (deliveredAt) {
        receiptStatus = "delivered";
    }

    if (readAt) {
        receiptStatus = "read";
    }


    const isDeletedForMe = deletedFor?.[userId] === true;
    const isDeletedForEveryone = deleteStatus === "everyone";
    

    useEffect(() => {
        const handleClick = () => {
            setShowMenu(false);
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);


    if (isDeletedForMe) {
        return null;
    }



    const handleDeleteForMe = async () => {
        try {
            await deleteMessageForMe(
                conversationId,
                messageId,
                userId
            );

            setShowDeleteModal(false);
        } catch (error) {
            console.error("Failed to delete message for me:", error);
        }
    };



    const handleDeleteForEveryone = async () => {
        try {
            await deleteMessageForEveryone(
                conversationId,
                messageId
            );

            setShowDeleteModal(false);
        } catch (error) {
            console.error(
                "Failed to delete message for everyone:",
                error
            );
        }
    };





    return (
        <div className={`message ${isOwn ? "message-own" : "message-other"}`}>
            <div className="message-bubble">

                {!isDeletedForMe && (
                    <div
                        className="message-actions"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="message-action-button"
                            onClick={() => setShowMenu((prev) => !prev)}
                        >
                            <IoChevronDown />
                        </button>

                        {showMenu && (
                            <div className="message-menu">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(true);
                                        setShowMenu(false);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {!isDeletedForMe && (
                    <>
                        {isDeletedForEveryone ? (
                            <p className="message-deleted">
                                Message deleted
                            </p>
                        ) : (
                            <p>
                                {text}
                            </p>
                        )}
                    </>
                )}


                <span className="message-time">
                    {time}

                    {isOwn && (
                        receiptStatus === "sent"
                            ? <IoCheckmark className="message-receipt" />
                            : <IoCheckmarkDone
                                className={`message-receipt message-receipt-${receiptStatus}`}
                            />
                    )}
                </span>
            </div>


            {showDeleteModal && (
                <DeleteMessageModal
                    isSender={isOwn}
                    onDeleteEveryone={handleDeleteForEveryone}
                    onDeleteForMe={handleDeleteForMe}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </div>
    );
}

export default MessageBubble;