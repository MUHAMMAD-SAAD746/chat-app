import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import ChatHeader from "./ChatHeader/ChatHeader";
import MessageInput from "./MessageInput/MessageInput";
import MessageList from "./MessageList/MessageList";
import AttachmentComposer from "./AttachmentComposer/AttachmentComposer";

import { sendFileMessage } from "../../../firebase/services/messageService";
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


console.log("ChatWindow replyingTo:", replyingTo);

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
                    />
                </section>

                {showAttachmentComposer ? (
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
                                    .getElementById(
                                        "chat-file-input"
                                    )
                                    ?.click()
                            }
                        />
                    </div>
                )}

            </section>

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