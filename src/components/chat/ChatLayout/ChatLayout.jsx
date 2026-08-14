import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import "./ChatLayout.css";

import Sidebar from "../sidebar/ChatSidebar";

import { useAuth } from "../../../context/AuthContext";
import { subscribeToUserConversations } from "../../../firebase/services/conversationListenerService";

function ChatLayout() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        if (!user?.uid) return;

        const unsubscribe = subscribeToUserConversations(
            user.uid,
            (conversations) => {
                setConversations(conversations);
            }
        );

        return unsubscribe;
    }, [user?.uid]);

    return (
        <main className="chat-layout">

            <Sidebar
                conversations={conversations}
                onAddContact={() => navigate("/chat/add-contact")}
            />

            <div className="chat-layout-content">
                <Outlet />
            </div>

        </main>
    );
}

export default ChatLayout;