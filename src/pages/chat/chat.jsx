import { useParams } from "react-router-dom";
import { useState } from "react";

import ChatWindow from "../../components/chat/ChatWindow/ChatWindow";
import EmptyChat from "../../components/chat/ChatWindow/EmptyChat/EmptyChat";
import Sidebar from "../../components/chat/sidebar/ChatSidebar";

import "./Chat.css";
import NewChat from "../../components/chat/NewChat/NewChat";

function Chat() {
    const { conversationId } = useParams();

    const [showNewChat, setShowNewChat] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);


    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setShowNewChat(false);

        console.log("Selected user:", user);
    };

    return (
        <main className="chat-page">
            <Sidebar
                onAddContact={() => {
                    console.log("Add Contact clicked");
                    setShowNewChat(true);
                }}
            />

            {showNewChat ? (
                <NewChat
                    onBack={() => setShowNewChat(false)}
                    onSelectUser={handleSelectUser}
                />
            ) : conversationId ? (
                <ChatWindow />
            ) : (
                <EmptyChat
                    onAddContact={() => setShowNewChat(true)}
                />
            )}
        </main>
    );
}

export default Chat;