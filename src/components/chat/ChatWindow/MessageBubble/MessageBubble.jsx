import { useState, useEffect } from "react";
import usePopupPosition from "../../../../hooks/usePopupPosition";
import EmojiPicker from "emoji-picker-react";
import {
    IoCheckmark,
    IoCheckmarkDone,
    IoChevronDown,
    IoDocumentText,
    IoDownloadOutline,
    IoHappyOutline,
    IoArrowUndoOutline,
    IoCreateOutline,
    IoArrowForwardOutline,
    IoTrashOutline,
} from "react-icons/io5";
import { RiShareForwardFill } from "react-icons/ri";
import DeleteMessageModal from "../../DeleteMessageModal/DeleteMessageModal";
import EditMessageModal from "./EditMessageModal/EditMessageModal";
import ImageViewer from "./ImageViewer/ImageViewer";

import {
    deleteMessageForMe,
    deleteMessageForEveryone,
    editMessage,
} from "../../../../firebase/services/messageService";
import { toggleMessageReaction } from "../../../../firebase/services/messageReactionService";

import { formatFileSize } from "../../../../utils/formatUtils";
import { groupReactions } from "../../../../utils/reactionUtils";

import "./MessageBubble.css";

const reactionEmojis = [
    "❤️",
    "😂",
    "👍",
    "😮",
    "😢",
    "🙏",
];


const REACTION_PICKER_WIDTH = 190;
const EMOJI_PICKER_WIDTH = 320;



function MessageBubble({
    message,
    conversationId,
    userId,
    time,
    isOwn = false,
    onReply,
    selectedUser,
    isForwardSelectionMode,
    isSelected,
    onStartForwardSelection,
    onToggleMessageSelection,
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
        editedAt,
        reactions,
        replyTo,
        forwarded,
    } = message;


    const [showMenu, setShowMenu] = useState(false);

    const {
        triggerRef: menuTriggerRef,
        menuRef,
        position: menuPosition,
    } = usePopupPosition(
        showMenu,
        setShowMenu
    );


    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showFullEmojiPicker, setShowFullEmojiPicker] = useState(false);


    const {
        triggerRef: reactionTriggerRef,
        menuRef: reactionPickerRef,
        position: reactionPickerPosition,
    } = usePopupPosition(
        showReactionPicker,
        setShowReactionPicker,
        {
            preferAbove: true,
        }
    );

    const {
        triggerRef: emojiTriggerRef,
        menuRef: emojiPickerRef,
        position: emojiPickerPosition,
    } = usePopupPosition(
        showFullEmojiPicker,
        setShowFullEmojiPicker,
        {
            preferAbove: true,
        }
    );


    const [isReacting, setIsReacting] = useState(false);


    const receiptStatus = readAt
        ? "read"
        : deliveredAt
            ? "delivered"
            : "sent";



    const isDeletedForMe = deletedFor?.[userId] === true;
    const isDeletedForEveryone = deleteStatus === "everyone";


    useEffect(() => {
        const handleClick = () => {
            setShowReactionPicker(false);
            setShowFullEmojiPicker(false);
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




    const handleEdit = async (newText) => {
        const trimmedText = newText.trim();

        if (!trimmedText) {
            return;
        }

        if (trimmedText === text) {
            setIsEditing(false);
            return;
        }

        try {
            setIsSavingEdit(true);

            await editMessage(
                conversationId,
                messageId,
                userId,
                trimmedText
            );

            setIsEditing(false);
        } catch (error) {
            console.error("Failed to edit message:", error);
        } finally {
            setIsSavingEdit(false);
        }
    };




    const handleOpenFile = () => {
        window.open(fileUrl, "_blank");
    };


    const handleReaction = async (emoji) => {
        if (isReacting) return;

        try {
            setIsReacting(true);

            await toggleMessageReaction(
                conversationId,
                messageId,
                userId,
                emoji
            );

            setShowReactionPicker(false);
            setShowFullEmojiPicker(false);
        } catch (error) {
            console.error(
                "Failed to update message reaction:",
                error
            );
        } finally {
            setIsReacting(false);
        }
    };


    const handleFullEmojiPickerToggle = (event) => {
        event.stopPropagation();

        setShowFullEmojiPicker((prev) => !prev);
    };


    const handleMenuToggle = (event) => {
        event.stopPropagation();

        setShowMenu((prev) => !prev);
    };


    const getReactionPickerLeft = () => {
        const trigger = reactionTriggerRef.current;

        if (!trigger) {
            return reactionPickerPosition.left;
        }

        const rect = trigger.getBoundingClientRect();

        return (
            rect.left +
            rect.width / 2 -
            REACTION_PICKER_WIDTH / 2
        );
    };


    const getEmojiPickerLeft = () => {
        const trigger = reactionTriggerRef.current;

        if (!trigger) {
            return emojiPickerPosition.left;
        }

        const rect = trigger.getBoundingClientRect();

        return (
            rect.left +
            rect.width / 2 -
            EMOJI_PICKER_WIDTH / 2
        );
    };


    const handleReactionPickerToggle = (event) => {
        event.stopPropagation();
        setShowReactionPicker((prev) => !prev);
    };


    const handleReactionClick = async () => {
        if (isReacting) return;

        const myReaction = reactions?.[userId];

        if (myReaction) {
            await handleReaction(myReaction);
            return;
        }

        setShowReactionPicker((prev) => !prev);
    };


    const groupedReactions = groupReactions(reactions, userId);


    const handleReplyClick = () => {
        const originalMessage = document.getElementById(
            replyTo?.messageId
        );

        if (!originalMessage) return;

        originalMessage.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        originalMessage.classList.add("message-highlight");

        setTimeout(() => {
            originalMessage.classList.remove("message-highlight");
        }, 1200);
    };



    return (
        <div
            id={messageId}
            className={`message ${isOwn ? "message-own" : "message-other"} ${isForwardSelectionMode && isSelected
                ? "message-forward-selected"
                : ""
                } ${isForwardSelectionMode ? "message-forward-mode" : ""}`}
            onClick={() => {
                if (isForwardSelectionMode) {
                    onToggleMessageSelection(message);
                }
            }}
        >
            {isForwardSelectionMode && (
                <div className="message-selection">
                    <div
                        className={`message-checkbox ${isSelected ? "selected" : ""
                            }`}
                    >
                        {isSelected && <span>✓</span>}
                    </div>
                </div>
            )}
            <div className="message-container">
                <div className="message-main">
                    <div className="message-bubble">
                        {forwarded && (
                            <div className="message-forwarded">
                                ↪ Forwarded
                            </div>
                        )}


                        <div
                            className="message-actions"
                            onClick={(event) => event.stopPropagation()}
                        >

                            <button
                                className={`message-action-button ${showMenu ? "active" : ""}`}
                                ref={menuTriggerRef}
                                onClick={handleMenuToggle}
                            >
                                <IoChevronDown />
                            </button>

                            {showMenu && (
                                <div
                                    ref={menuRef}
                                    className="message-menu"
                                    style={{
                                        top: `${menuPosition.top}px`,
                                        left: `${isOwn
                                            ? menuPosition.left - 35
                                            : menuPosition.left}px`,
                                    }}
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    {!isDeletedForEveryone && (
                                        <button
                                            onClick={() => {
                                                console.log("Reply clicked:", message);
                                                onReply(message);
                                                setShowMenu(false);
                                            }}
                                        >
                                            <IoArrowUndoOutline />
                                            <span>Reply</span>
                                        </button>
                                    )}

                                    {isOwn && !type && !isDeletedForEveryone && (
                                        <button
                                            onClick={() => {
                                                setIsEditing(true);
                                                setShowMenu(false);
                                            }}
                                        >
                                            <IoCreateOutline />
                                            <span>Edit</span>
                                        </button>
                                    )}

                                    {/* Forward */}
                                    {!isDeletedForEveryone && (
                                        <button
                                            onClick={() => {
                                                onStartForwardSelection(message);
                                                setShowMenu(false);
                                            }}
                                        >
                                            <RiShareForwardFill />
                                            <span>Forward</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(true);
                                            setShowMenu(false);
                                        }}
                                    >
                                        <IoTrashOutline />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            )}
                        </div>



                        {showReactionPicker && (
                            <div
                                ref={reactionPickerRef}
                                className={`reaction-picker`}
                                style={{
                                    top: `${reactionPickerPosition.top}px`,
                                    left: `${getReactionPickerLeft()}px`,
                                }}
                                onClick={(event) => event.stopPropagation()}
                            >
                                {reactionEmojis.slice(0, 5).map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => handleReaction(emoji)}
                                        disabled={isReacting}
                                    >
                                        {emoji}
                                    </button>
                                ))}

                                <button
                                    ref={emojiTriggerRef}
                                    type="button"
                                    className="reaction-picker-more"
                                    onClick={handleFullEmojiPickerToggle}
                                >
                                    +
                                </button>
                            </div>
                        )}


                        {showFullEmojiPicker && (
                            <div
                                ref={emojiPickerRef}
                                className="message-full-emoji-picker"
                                style={{
                                    top: `${emojiPickerPosition.top}px`,
                                    left: `${getEmojiPickerLeft() - (isOwn ? 50 : 0)}px`,
                                }}
                                onClick={(event) => event.stopPropagation()}
                            >
                                <EmojiPicker
                                    onEmojiClick={(emojiData) => {
                                        handleReaction(emojiData.emoji);
                                        setShowFullEmojiPicker(false);
                                        setShowReactionPicker(false);
                                    }}
                                    width={320}
                                    height={350}
                                    searchDisabled={false}
                                    previewConfig={{
                                        showPreview: false,
                                    }}
                                />
                            </div>
                        )}


                        <>
                            {replyTo && (
                                <div
                                    className="message-reply-preview"
                                    onClick={handleReplyClick}
                                >
                                    <strong>
                                        {replyTo.senderId === userId
                                            ? "You"
                                            : selectedUser?.fullName || "User"}
                                    </strong>

                                    <p>
                                        {replyTo.text ||
                                            replyTo.caption ||
                                            replyTo.fileName ||
                                            "Attachment"}
                                    </p>
                                </div>
                            )}


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
                                </div>
                            ) : (
                                <p>
                                    {text}
                                </p>
                            )}
                        </>



                        <div className="message-footer">
                            {editedAt && (
                                <span className="message-edited">
                                    Edited
                                </span>
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
                    </div>


                    <button
                        ref={reactionTriggerRef}
                        type="button"
                        className={`message-reaction-button ${showReactionPicker ? "active" : ""
                            }`}
                        onClick={handleReactionPickerToggle}
                    >
                        <IoHappyOutline />
                    </button>
                </div>


                {groupedReactions.length > 0 && (
                    <div className="message-reactions">
                        <button
                            type="button"
                            className="message-reaction"
                            onClick={handleReactionClick}
                        >
                            <span className="message-reaction-emojis">
                                {groupedReactions.map((reaction) => (
                                    <span key={reaction.emoji}>
                                        {reaction.emoji}
                                    </span>
                                ))}
                            </span>

                            <span className="message-reaction-count">
                                {Object.values(reactions || {}).length}
                            </span>
                        </button>
                    </div>
                )}
            </div>


            {isEditing && (
                <EditMessageModal
                    messageText={text || ""}
                    onSave={handleEdit}
                    onCancel={() => setIsEditing(false)}
                    isSaving={isSavingEdit}
                />
            )}


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