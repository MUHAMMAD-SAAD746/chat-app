import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

import ChatHeader from "./ChatHeader/ChatHeader";
import MessageInput from "./MessageInput/MessageInput";
import MessageList from "./MessageList/MessageList";

import { isFriend } from "../../../firebase/services/friendService";

import "./ChatWindow.css";

function ChatWindow({ selectedUser, isOtherUserTyping }) {
    const { user } = useAuth();
    const [canSendMessage, setCanSendMessage] = useState(true);



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

            {/* Chat Header */}
            <ChatHeader
                selectedUser={selectedUser}
                isOtherUserTyping={isOtherUserTyping}
            />

            {/* Messages */}
            <section className="chat-messages">
                <MessageList />
            </section>

            {/* Message Input */}
            <div className="chat-input">
                <MessageInput canSendMessage={canSendMessage} />
            </div>

        </main>
    );
}

export default ChatWindow;