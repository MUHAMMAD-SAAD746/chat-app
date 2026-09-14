import { useEffect, useRef, useState } from "react";
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
    const [uploadedFileData, setUploadedFileData] = useState({});
    const [replyingTo, setReplyingTo] = useState(null);

    const [isForwardSelectionMode, setIsForwardSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [isForwarding, setIsForwarding] = useState(false);

    const sendingAttachmentRef = useRef(false);



    useEffect(() => {
        setReplyingTo(null);
    }, [conversationId]);


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
            sendingAttachmentRef.current ||
            !file ||
            !user ||
            !conversationId
        ) {
            return;
        }

        const key =
            `${file.name}-${file.size}-${file.lastModified}`;

        sendingAttachmentRef.current = true;
        setIsSendingAttachment(true);

        try {
            setFileStatuses((prev) => ({
                ...prev,
                [key]: "uploading",
            }));

            const uploadedFile = await uploadChatFile(file);

            const fileData = {
                fileUrl: uploadedFile.url,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
            };

            const newUploadedFileData = {
                ...uploadedFileData,
                [key]: fileData,
            };

            setUploadedFileData(newUploadedFileData);

            setFileStatuses((prev) => ({
                ...prev,
                [key]: "success",
            }));

            const allFilesUploaded = selectedFiles.every(
                (selectedFile) => {
                    const selectedKey =
                        `${selectedFile.name}-${selectedFile.size}-${selectedFile.lastModified}`;

                    return Boolean(
                        newUploadedFileData[selectedKey]
                    );
                }
            );

            // Other files are still failed/pending.
            // Don't send yet.
            if (!allFilesUploaded) {
                return;
            }

            const filesToSend = selectedFiles.map(
                (selectedFile) => {
                    const selectedKey =
                        `${selectedFile.name}-${selectedFile.size}-${selectedFile.lastModified}`;

                    return newUploadedFileData[selectedKey];
                }
            );

            await sendMultipleFileMessages(
                conversationId,
                user.uid,
                filesToSend,
                attachmentCaption.trim()
            );

            setSelectedFiles([]);
            setUploadedFileData({});
            setFileStatuses({});
            setAttachmentCaption("");
            setShowAttachmentComposer(false);

        } catch (error) {
            console.error(
                "RETRY UPLOAD FAILED:",
                file.name,
                error
            );

            setFileStatuses((prev) => ({
                ...prev,
                [key]: "failed",
            }));

        } finally {
            sendingAttachmentRef.current = false;
            setIsSendingAttachment(false);
        }
    };






    const handleRetryFailedFiles = async () => {
        if (
            sendingAttachmentRef.current ||
            !selectedFiles.length ||
            !user ||
            !conversationId
        ) {
            return;
        }

        const failedFiles = selectedFiles.filter((file) => {
            const key =
                `${file.name}-${file.size}-${file.lastModified}`;

            return fileStatuses[key] === "failed";
        });

        if (!failedFiles.length) {
            return;
        }

        sendingAttachmentRef.current = true;
        setIsSendingAttachment(true);

        try {
            const currentUploadedFiles = {
                ...uploadedFileData,
            };

            const retryResults = await Promise.all(
                failedFiles.map(async (file) => {
                    const key =
                        `${file.name}-${file.size}-${file.lastModified}`;

                    try {
                        setFileStatuses((prev) => ({
                            ...prev,
                            [key]: "uploading",
                        }));

                        const uploadedFile =
                            await uploadChatFile(file);

                        const fileData = {
                            fileUrl: uploadedFile.url,
                            fileName: file.name,
                            fileType: file.type,
                            fileSize: file.size,
                        };

                        currentUploadedFiles[key] = fileData;

                        setFileStatuses((prev) => ({
                            ...prev,
                            [key]: "success",
                        }));

                        return {
                            success: true,
                            key,
                            fileData,
                        };

                    } catch (error) {
                        console.error(
                            "RETRY UPLOAD FAILED:",
                            file.name,
                            error
                        );

                        setFileStatuses((prev) => ({
                            ...prev,
                            [key]: "failed",
                        }));

                        return {
                            success: false,
                            key,
                            fileData: null,
                        };
                    }
                })
            );


            const hasRetryFailures = retryResults.some(
                (result) => !result.success
            );

            if (hasRetryFailures) {
                return;
            }

            setUploadedFileData(currentUploadedFiles);


            const allFilesUploaded = selectedFiles.every(
                (file) => {
                    const key =
                        `${file.name}-${file.size}-${file.lastModified}`;

                    return Boolean(currentUploadedFiles[key]);
                }
            );

            if (!allFilesUploaded) {
                return;
            }

            const filesToSend = selectedFiles.map(
                (file) => {
                    const key =
                        `${file.name}-${file.size}-${file.lastModified}`;

                    return currentUploadedFiles[key];
                }
            );


            await sendMultipleFileMessages(
                conversationId,
                user.uid,
                filesToSend,
                attachmentCaption.trim()
            );

            setSelectedFiles([]);
            setUploadedFileData({});
            setFileStatuses({});
            setAttachmentCaption("");
            setShowAttachmentComposer(false);

        } catch (error) {
            console.error(
                "FAILED TO RETRY ATTACHMENTS:",
                error
            );

        } finally {
            sendingAttachmentRef.current = false;
            setIsSendingAttachment(false);
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

        sendingAttachmentRef.current = true;
        setIsSendingAttachment(true);

        try {
            // Copy current uploaded files
            // so we can update it locally during this function.
            const currentUploadedFiles = {
                ...uploadedFileData,
            };

            // Only upload files which are not already uploaded.
            const filesToUpload = selectedFiles.filter((file) => {
                const key = `${file.name}-${file.size}-${file.lastModified}`;

                return !currentUploadedFiles[key];
            });


            const uploadResults = await Promise.all(
                filesToUpload.map(async (file) => {
                    const key = `${file.name}-${file.size}-${file.lastModified}`;

                    try {
                        setFileStatuses((prev) => ({
                            ...prev,
                            [key]: "uploading",
                        }));

                        const uploadedFile =
                            await uploadChatFile(file);

                        const fileData = {
                            fileUrl: uploadedFile.url,
                            fileName: file.name,
                            fileType: file.type,
                            fileSize: file.size,
                        };

                        currentUploadedFiles[key] = fileData;

                        setFileStatuses((prev) => ({
                            ...prev,
                            [key]: "success",
                        }));

                        return {
                            success: true,
                            key,
                            fileData,
                        };

                    } catch (error) {
                        console.error(
                            "UPLOAD FAILED:",
                            file.name,
                            error
                        );

                        setFileStatuses((prev) => ({
                            ...prev,
                            [key]: "failed",
                        }));

                        return {
                            success: false,
                            key,
                            fileData: null,
                        };
                    }
                })
            );


            const newUploadedFileData = {
                ...uploadedFileData,
            };

            uploadResults.forEach((result) => {
                if (result.success) {
                    newUploadedFileData[result.key] =
                        result.fileData;
                }
            });

            setUploadedFileData(newUploadedFileData);


            const allFilesUploaded = selectedFiles.every(
                (file) => {
                    const key = `${file.name}-${file.size}-${file.lastModified}`;

                    return Boolean(newUploadedFileData[key]);
                }
            );


            if (!allFilesUploaded) {
                console.warn(
                    "Some files failed. Message will not be sent yet."
                );
                return;
            }


            const filesToSend = selectedFiles.map((file) => {
                const key = `${file.name}-${file.size}-${file.lastModified}`;

                return newUploadedFileData[key];
            });


            await sendMultipleFileMessages(
                conversationId,
                user.uid,
                filesToSend,
                attachmentCaption.trim()
            );


            setSelectedFiles([]);
            setUploadedFileData({});
            setFileStatuses({});
            setAttachmentCaption("");
            setShowAttachmentComposer(false);

        } catch (error) {
            console.error(
                "FAILED TO SEND ATTACHMENTS:",
                error
            );
        } finally {
            sendingAttachmentRef.current = false;
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
                        onRetryFailedFiles={handleRetryFailedFiles}
                        caption={attachmentCaption}
                        onCaptionChange={setAttachmentCaption}
                        onSend={handleSendAttachment}
                        isSending={isSendingAttachment}
                        hasFailedFiles={Object.values(fileStatuses).some(
                            (status) => status === "failed"
                        )}
                        onAddMore={() =>
                            document
                                .getElementById("chat-file-input")
                                ?.click()
                        }
                        onClose={() => {
                            setSelectedFiles([]);
                            setUploadedFileData({});
                            setFileStatuses({});
                            setAttachmentCaption("");
                            setShowAttachmentComposer(false);
                        }}
                    />
                ) : canSendMessage === null ? (
                    <div className="chat-input"></div>
                ) : (
                    <div className="chat-input">
                        <MessageInput
                            key={conversationId}
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