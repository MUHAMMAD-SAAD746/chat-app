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



    const handleFileSelect = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        setSelectedFile(file);
        setShowAttachmentComposer(true);

        e.target.value = "";
    };



    const handleSendAttachment = async () => {
        if (
            !selectedFile ||
            !user ||
            !conversationId
        ) {
            return;
        }

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



    // return (
    //     <main className="chat-window">

    //         <input
    //             id="chat-file-input"
    //             type="file"
    //             hidden
    //             onChange={handleFileSelect}
    //         />

    //         {/* Chat Header */}
    //         <ChatHeader
    //             selectedUser={selectedUser}
    //             isOtherUserTyping={isOtherUserTyping}
    //         />

    //         {/* Messages */}
    //         <section className="chat-messages">
    //             <MessageList />
    //         </section>

    //         {/* Message Input */}
    //         <div className="chat-input">
    //             <MessageInput
    //                 canSendMessage={canSendMessage}
    //                 onAttach={() =>
    //                     document
    //                         .getElementById("chat-file-input")
    //                         ?.click()
    //                 }
    //             />
    //         </div>

    //     </main>
    // );


    return (
        <main className="chat-window">

            <ChatHeader
                selectedUser={selectedUser}
                isOtherUserTyping={isOtherUserTyping}
            />

            <section className="chat-content">

                <section className="chat-messages">
                    <MessageList />
                </section>

                {showAttachmentComposer ? (
                    <AttachmentComposer
                        file={selectedFile}
                        caption={attachmentCaption}
                        onCaptionChange={setAttachmentCaption}
                        onSend={handleSendAttachment}
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