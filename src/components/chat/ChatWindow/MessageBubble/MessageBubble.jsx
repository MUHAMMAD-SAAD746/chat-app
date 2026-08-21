import { useState, useEffect } from "react";
import {
    IoCheckmark,
    IoCheckmarkDone,
    IoChevronDown,
    IoDocumentText,
    IoDownloadOutline
} from "react-icons/io5";
import DeleteMessageModal from "../../DeleteMessageModal/DeleteMessageModal";
import ImageViewer from "./ImageViewer/ImageViewer";

import {
    deleteMessageForMe,
    deleteMessageForEveryone,
} from "../../../../firebase/services/messageService";

import "./MessageBubble.css";

function MessageBubble({
    message,
    conversationId,
    userId,
    time,
    isOwn = false,
}) {
    const {
        id: messageId,
        text,
        type,
        fileUrl,
        fileName,
        fileType,
        fileSize,
        caption,
        deliveredAt,
        readAt,
        deleteStatus,
        deletedFor,
    } = message;


    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);
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


    const formatFileSize = (bytes) => {
        if (!bytes) return "";

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };


    const handleOpenFile = () => {
        window.open(fileUrl, "_blank");
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
                        ) : type === "image" ? (
                            <div className="message-attachment">
                                <img
                                    src={fileUrl}
                                    alt={fileName}
                                    className="message-image"
                                    onClick={() => setShowImageViewer(true)}
                                />

                                {caption && (
                                    <p className="message-caption">
                                        {caption}
                                    </p>
                                )}
                            </div>
                        ) : type === "file" ? (
                            <div className="message-attachment">
                                <div
                                    className="message-file"
                                    onClick={handleOpenFile}
                                >
                                    <div className="message-file-icon">
                                        <IoDocumentText size={32} />
                                    </div>

                                    <div className="message-file-info">
                                        <p className="message-file-name">
                                            {fileName}
                                        </p>

                                        <span className="message-file-preview">
                                            {fileType?.split("/")[1]?.toUpperCase()} • {formatFileSize(fileSize)}
                                        </span>
                                    </div>

                                    <div className="message-file-download">
                                        <IoDownloadOutline size={20} />
                                    </div>
                                </div>

                                {caption && (
                                    <p className="message-caption">
                                        {caption}
                                    </p>
                                )}

                                {caption && (
                                    <p className="message-caption">
                                        {caption}
                                    </p>
                                )}
                            </div>
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


            {showImageViewer && (
                <ImageViewer
                    imageUrl={fileUrl}
                    alt={fileName}
                    onClose={() => setShowImageViewer(false)}
                />
            )}
        </div>
    );
}

export default MessageBubble;