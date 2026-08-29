import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import ChatHeader from "./ChatHeader/ChatHeader";
import MessageInput from "./MessageInput/MessageInput";
import MessageList from "./MessageList/MessageList";
import AttachmentComposer from "./AttachmentComposer/AttachmentComposer";
import ForwardMessageModal from "../ForwardMessageModal/ForwardMessageModal";

import { IoClose } from "react-icons/io5";
import { RiShareForwardFill } from "react-icons/ri";

import { getOrCreateConversation } from "../../../firebase/services/conversationService";
import { sendFileMessage, forwardMessage } from "../../../firebase/services/messageService";
import { uploadChatFile } from "../../../cloudinary/cloudinaryService";

import { isFriend } from "../../../firebase/services/friendService";

import "./ChatWindow.css";

function ChatWindow({ selectedUser, isOtherUserTyping }) {
    const { user } = useAuth();
    const { conversationId } = useParams();
    const [canSendMessage, setCanSendMessage] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showAttachmentComposer, setShowAttachmentComposer] = useState(false);
    const [attachmentCaption, setAttachmentCaption] = useState("");
    const [isSendingAttachment, setIsSendingAttachment] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);

    const [isForwardSelectionMode, setIsForwardSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [isForwarding, setIsForwarding] = useState(false);



    const handleFileSelect = (e) => {
        if (isSendingAttachment) {
            e.target.value = "";
            return;
        }

        const file = e.target.files[0];

        if (!file) return;

        setSelectedFile(file);
        setShowAttachmentComposer(true);

        e.target.value = "";
    };





    const handleSendAttachment = async () => {
        if (
            isSendingAttachment ||
            !selectedFile ||
            !user ||
            !conversationId
        ) {
            return;
        }

        setIsSendingAttachment(true);

        try {
            const uploadedFile = await uploadChatFile(
                selectedFile
            );

            await sendFileMessage(
                conversationId,
                user.uid,
                uploadedFile.url,
                selectedFile.name,
                selectedFile.type,
                selectedFile.size,
                attachmentCaption.trim()
            );

            setSelectedFile(null);
            setAttachmentCaption("");
            setShowAttachmentComposer(false);

        } catch (error) {
            console.error(
                "Failed to send attachment:",
                error
            );
        } finally {
            setIsSendingAttachment(false);
        }
    };




    useEffect(() => {
        const checkFriendship = async () => {
            if (!user?.uid || !selectedUser?.uid) {
                setCanSendMessage(false);
                return;
            }

            try {
                const friendStatus = await isFriend(
                    user.uid,
                    selectedUser.uid
                );

                setCanSendMessage(friendStatus);
            } catch (error) {
                console.error(
                    "Failed to check friendship:",
                    error
                );

                setCanSendMessage(false);
            }
        };

        checkFriendship();
    }, [user?.uid, selectedUser?.uid]);







    // ==========================================
    // forward message logics below 29-aug-2026
    // ===========================================

    const handleStartForwardSelection = (message) => {
        setIsForwardSelectionMode(true);
        setSelectedMessages([message]);
    };

    const handleToggleMessageSelection = (message) => {
        setSelectedMessages((prev) => {
            const alreadySelected = prev.some(
                (selected) => selected.id === message.id
            );

            if (alreadySelected) {
                const updated = prev.filter(
                    (selected) => selected.id !== message.id
                );

                // If no messages remain, exit selection mode
                if (updated.length === 0) {
                    setIsForwardSelectionMode(false);
                }

                return updated;
            }

            return [...prev, message];
        });
    };

    const handleCancelForwardSelection = () => {
        setIsForwardSelectionMode(false);
        setSelectedMessages([]);
    };

    const handleOpenForwardModal = () => {
        if (!selectedMessages.length) return;

        setShowForwardModal(true);
    };




    const handleForwardToFriends = async (selectedFriends) => {
        if (!selectedFriends?.length || !selectedMessages?.length) {
            return;
        }

        try {
            setIsForwarding(true);

            for (const friend of selectedFriends) {
                if (!friend?.uid) {
                    throw new Error("Friend not found.");
                }

                const destinationConversation =
                    await getOrCreateConversation(
                        user.uid,
                        friend.uid
                    );

                for (const message of selectedMessages) {
                    await forwardMessage(
                        destinationConversation.id,
                        user.uid,
                        message
                    );
                }
            }

            console.log("Messages forwarded successfully.");

            setShowForwardModal(false);
            setIsForwardSelectionMode(false);
            setSelectedMessages([]);

        } catch (error) {
            console.error(
                "Failed to forward messages:",
                error
            );
        } finally {
            setIsForwarding(false);
        }
    };




    return (
        <main className="chat-window">

            <ChatHeader
                selectedUser={selectedUser}
                isOtherUserTyping={isOtherUserTyping}
            />

            <section className="chat-content">

                <section className="chat-messages">
                    <MessageList
                        onReply={setReplyingTo}
                        selectedUser={selectedUser}
                        isForwardSelectionMode={isForwardSelectionMode}
                        selectedMessages={selectedMessages}
                        onStartForwardSelection={handleStartForwardSelection}
                        onToggleMessageSelection={handleToggleMessageSelection}
                    />
                </section>

                {isForwardSelectionMode ? (
                    <div className="forward-selection-bar">

                        {/* Left side */}
                        <div className="forward-selection-left">

                            <button
                                type="button"
                                className="forward-cancel-button"
                                onClick={handleCancelForwardSelection}
                                aria-label="Cancel selection"
                            >
                                <IoClose />
                            </button>

                            <span className="forward-selected-count">
                                {selectedMessages.length}{" "}
                                {selectedMessages.length === 1
                                    ? "message"
                                    : "messages"}
                            </span>

                        </div>


                        {/* Right side */}
                        <button
                            type="button"
                            className="forward-send-button"
                            onClick={handleOpenForwardModal}
                            disabled={!selectedMessages.length}
                            aria-label="Forward messages"
                        >
                            {/* <IoArrowForwardOutline /> */}
                            <RiShareForwardFill />
                        </button>

                    </div>
                ) : showAttachmentComposer ? (
                    <AttachmentComposer
                        file={selectedFile}
                        caption={attachmentCaption}
                        onCaptionChange={setAttachmentCaption}
                        onSend={handleSendAttachment}
                        isSending={isSendingAttachment}
                        onClose={() => {
                            setSelectedFile(null);
                            setAttachmentCaption("");
                            setShowAttachmentComposer(false);
                        }}
                    />
                ) : (
                    <div className="chat-input">
                        <MessageInput
                            canSendMessage={canSendMessage}
                            replyingTo={replyingTo}
                            onCancelReply={() => setReplyingTo(null)}
                            onAttach={() =>
                                document
                                    .getElementById("chat-file-input")
                                    ?.click()
                            }
                        />
                    </div>
                )}

            </section>


            {showForwardModal && (
                <ForwardMessageModal
                    isOpen={showForwardModal}
                    onClose={() => setShowForwardModal(false)}
                    userId={user.uid}
                    selectedMessages={selectedMessages}
                    onSelectFriend={handleForwardToFriends}
                    isForwarding={isForwarding}
                />
            )}



            <input
                id="chat-file-input"
                type="file"
                hidden
                onChange={handleFileSelect}
            />

        </main>
    );
}

export default ChatWindow;