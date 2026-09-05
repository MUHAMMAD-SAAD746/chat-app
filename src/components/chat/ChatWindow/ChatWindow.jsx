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
import {
    sendFileMessage,
    sendMultipleFileMessages,
    forwardMessage
} from "../../../firebase/services/messageService";
import { uploadChatFile } from "../../../cloudinary/cloudinaryService";

import { isFriend } from "../../../firebase/services/friendService";

import "./ChatWindow.css";

function ChatWindow({ selectedUser, isOtherUserTyping }) {
    const { user } = useAuth();
    const { conversationId } = useParams();
    const [canSendMessage, setCanSendMessage] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showAttachmentComposer, setShowAttachmentComposer] = useState(false);
    const [attachmentCaption, setAttachmentCaption] = useState("");
    const [isSendingAttachment, setIsSendingAttachment] = useState(false);
    const [fileStatuses, setFileStatuses] = useState({});
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

        const files = Array.from(e.target.files);

        if (!files.length) return;

        setSelectedFiles((prevFiles) => [
            ...prevFiles,
            ...files,
        ]);


        setFileStatuses((prevStatuses) => {
            const newStatuses = { ...prevStatuses };

            files.forEach((file) => {
                const key = `${file.name}-${file.size}-${file.lastModified}`;

                newStatuses[key] = "pending";
            });

            return newStatuses;
        });

        setShowAttachmentComposer(true);

        e.target.value = "";
    };





    const handleRetryFile = async (file) => {
        if (
            isSendingAttachment ||
            !file ||
            !user ||
            !conversationId
        ) {
            return;
        }

        const key = `${file.name}-${file.size}-${file.lastModified}`;

        try {
            setFileStatuses((prev) => ({
                ...prev,
                [key]: "uploading",
            }));


            const uploadedFile = await uploadChatFile(file);


            await sendMultipleFileMessages(
                conversationId,
                user.uid,
                [
                    {
                        fileUrl: uploadedFile.url,
                        fileName: file.name,
                        fileType: file.type,
                        fileSize: file.size,
                    },
                ],
                attachmentCaption.trim()
            );


            setFileStatuses((prev) => ({
                ...prev,
                [key]: "success",
            }));

            // Remove successfully retried file
            setSelectedFiles((prevFiles) => {
                const remainingFiles = prevFiles.filter(
                    (item) =>
                        `${item.name}-${item.size}-${item.lastModified}` !== key
                );

                if (remainingFiles.length === 0) {
                    setShowAttachmentComposer(false);
                    setAttachmentCaption("");
                }

                return remainingFiles;
            });

        } catch (error) {
            console.error(
                "RETRY UPLOAD/SEND FAILED:",
                file.name,
                error
            );

            setFileStatuses((prev) => ({
                ...prev,
                [key]: "failed",
            }));
        }
    };




    const handleSendAttachment = async () => {
        if (
            isSendingAttachment ||
            !selectedFiles.length ||
            !user ||
            !conversationId
        ) {
            return;
        }

        setIsSendingAttachment(true);

        const filesToUpload = selectedFiles.filter((file) => {
            const key = `${file.name}-${file.size}-${file.lastModified}`;

            const status = fileStatuses[key];

            return status === "pending" || status === "failed";
        });

        if (!filesToUpload.length) {
            setIsSendingAttachment(false);
            return;
        }

        try {
            // Keep track of files that fail
            const failedFiles = [];

            // Upload ALL files in parallel
            const uploadPromises = filesToUpload.map(async (file) => {
                const key = `${file.name}-${file.size}-${file.lastModified}`;

                try {
                    setFileStatuses((prev) => ({
                        ...prev,
                        [key]: "uploading",
                    }));



                    const uploadedFile = await uploadChatFile(file);


                    // Send this file immediately after its upload succeeds
                    await sendMultipleFileMessages(
                        conversationId,
                        user.uid,
                        [
                            {
                                fileUrl: uploadedFile.url,
                                fileName: file.name,
                                fileType: file.type,
                                fileSize: file.size,
                            },
                        ],
                        attachmentCaption.trim()
                    );

                    setFileStatuses((prev) => ({
                        ...prev,
                        [key]: "success",
                    }));


                } catch (error) {
                    console.error(
                        "UPLOAD/SEND FAILED:",
                        file.name,
                        error
                    );

                    setFileStatuses((prev) => ({
                        ...prev,
                        [key]: "failed",
                    }));

                    failedFiles.push(file);
                }
            });

            // Wait until ALL parallel operations finish
            await Promise.all(uploadPromises);


            // Keep only failed files in composer
            if (failedFiles.length > 0) {
                setSelectedFiles(failedFiles);

                console.warn(
                    `${failedFiles.length} file(s) failed and are ready for retry.`
                );
            } else {
                // Everything succeeded
                setSelectedFiles([]);
                setAttachmentCaption("");
                setShowAttachmentComposer(false);
            }


        } catch (error) {
            console.error(
                "Failed to send attachments:",
                error
            );
        } finally {
            setIsSendingAttachment(false);
        }
    };



    useEffect(() => {
        const checkFriendship = async () => {
            if (!user?.uid || !selectedUser?.uid) {
                return;
            }

            setCanSendMessage(null);

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


                        <button
                            type="button"
                            className="forward-send-button"
                            onClick={handleOpenForwardModal}
                            disabled={!selectedMessages.length}
                            aria-label="Forward messages"
                        >
                            <RiShareForwardFill />
                        </button>

                    </div>
                ) : showAttachmentComposer ? (
                    <AttachmentComposer
                        files={selectedFiles}
                        fileStatuses={fileStatuses}
                        onRetryFile={handleRetryFile}
                        caption={attachmentCaption}
                        onCaptionChange={setAttachmentCaption}
                        onSend={handleSendAttachment}
                        isSending={isSendingAttachment}
                        onAddMore={() =>
                            document
                                .getElementById("chat-file-input")
                                ?.click()
                        }
                        onClose={() => {
                            setSelectedFiles([]);
                            setAttachmentCaption("");
                            setShowAttachmentComposer(false);
                        }}
                    />
                ) : canSendMessage === null ? (
                    <div className="chat-input"></div>
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
                multiple
                hidden
                onChange={handleFileSelect}
            />

        </main>
    );
}

export default ChatWindow;