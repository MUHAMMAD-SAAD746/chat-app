import { useEffect, useRef, useState } from "react";
import { IoClose, IoHappyOutline, IoSend } from "react-icons/io5";
import usePopupPosition from "../../../../../hooks/usePopupPosition";

import EmojiPicker from "emoji-picker-react";

import "./EditMessageModal.css";


function EditMessageModal({
    messageText = "",
    onSave,
    onCancel,
    isSaving = false,
}) {
    const [editText, setEditText] = useState(messageText);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const textareaRef = useRef(null);

    const {
        triggerRef: emojiTriggerRef,
        menuRef: emojiPickerRef,
        position: emojiPickerPosition,
    } = usePopupPosition(
        showEmojiPicker,
        setShowEmojiPicker,
        {
            preferAbove: true,
        }
    );


    useEffect(() => {
        setEditText(messageText);

        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
    }, [messageText]);


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onCancel();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onCancel]);


    const handleSubmit = () => {
        const trimmedText = editText.trim();

        if (!trimmedText || isSaving) {
            return;
        }

        onSave(trimmedText);
    };


    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            handleSubmit();
        }
    };


    const handleEmojiClick = (emojiData) => {
        setEditText((prev) => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };


    return (
        <div
            className="edit-message-overlay"
            onClick={onCancel}
        >
            <div
                className="edit-message-modal"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="edit-message-header">
                    <button
                        type="button"
                        className="edit-message-close"
                        onClick={onCancel}
                        disabled={isSaving}
                    >
                        <IoClose />
                    </button>

                    <h2>Edit message</h2>
                </div>


                {/* Message area */}
                <div className="edit-message-content">
                    <div className="edit-message-preview">
                        {messageText}
                    </div>
                </div>



                {showEmojiPicker && (
                    <div
                        ref={emojiPickerRef}
                        className="edit-message-emoji-picker"
                        style={{
                            top: `${emojiPickerPosition.top}px`,
                            left: `${emojiPickerPosition.left}px`,
                        }}
                    >
                        <EmojiPicker
                            onEmojiClick={handleEmojiClick}
                            width={320}
                            height={350}
                            searchDisabled={false}
                            previewConfig={{
                                showPreview: false,
                            }}
                        />
                    </div>
                )}


                {/* Input */}
                <div className="edit-message-input-wrapper">
                    <textarea
                        ref={textareaRef}
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Edit message..."
                        disabled={isSaving}
                        rows={1}
                    />

                    <button
                        ref={emojiTriggerRef}
                        type="button"
                        className={`edit-message-emoji ${showEmojiPicker ? "active" : ""}`}
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        disabled={isSaving}
                    >
                        <IoHappyOutline />
                    </button>

                    <button
                        type="button"
                        className="edit-message-send"
                        onClick={handleSubmit}
                        disabled={isSaving || !editText.trim()}
                    >
                        <IoSend />
                    </button>
                </div>
            </div>
        </div>
    );
}


export default EditMessageModal;