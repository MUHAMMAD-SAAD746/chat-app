import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import "./ChatLayout.css";

import Sidebar from "../sidebar/ChatSidebar";

import { useAuth } from "../../../context/AuthContext";
import { subscribeToUserConversations } from "../../../firebase/services/conversationListenerService";

function ChatLayout() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [conversations, setConversations] = useState([]);

    const pathname = location.pathname;

    const isSettingsPage = pathname === "/settings";
    const isAddContact = pathname === "/chat/add-contact";
    const isFriendsPage = pathname === "/friends";

    const isConversationOpen =
        pathname.startsWith("/chat/") &&
        !isAddContact;



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
        <main
            className={`
                chat-layout
                ${isConversationOpen ? "conversation-open" : ""}
                ${isAddContact ? "add-contact-open" : ""}
                ${isFriendsPage ? "friends-open" : ""}
                ${isSettingsPage ? "settings-open" : ""}
            `}
        >

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