import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import ChatWindow from "../../components/chat/ChatWindow/ChatWindow";
import EmptyChat from "../../components/chat/ChatWindow/EmptyChat/EmptyChat";
import Sidebar from "../../components/chat/sidebar/ChatSidebar";

import NewChat from "../../components/chat/NewChat/NewChat";

import {
    getConversation,
    getConversationById,
    createConversation,
} from "../../firebase/services/conversationService";
import { getUser } from "../../firebase/database";

import { useAuth } from "../../context/AuthContext";
import { subscribeToUserConversations } from "../../firebase/services/conversationListenerService";

import "./Chat.css";

function Chat() {
    const { conversationId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const isAddContact = location.pathname === "/chat/add-contact";

    const { user } = useAuth();

    const [selectedUser, setSelectedUser] = useState(null);
    const [conversations, setConversations] = useState([]);



    const handleSelectUser = async (selectedUser) => {
        setSelectedUser(selectedUser);

        console.log("Selected user:", selectedUser);

        const currentUserId = user.uid;
        const selectedUserId = selectedUser.uid;

        console.log("Current user ID:", currentUserId);
        console.log("Selected user ID:", selectedUserId);

        const conversation = await getConversation(
            currentUserId,
            selectedUserId
        );

        if (conversation) {
            console.log("Conversation already exists:", conversation);

            navigate(`/chat/${conversation.id}`);
        } else {
            console.log("No conversation found. Creating one...");

            const newConversation = await createConversation(
                currentUserId,
                selectedUserId
            );

            console.log("New conversation created:", newConversation);

            navigate(`/chat/${newConversation.id}`);
        }
    };



    useEffect(() => {
        if (!user?.uid) return;


        const unsubscribe = subscribeToUserConversations(
            user.uid,
            (conversations) => {
                console.log("Conversations received:", conversations);
                setConversations(conversations);
            }
        );

        return unsubscribe;
    }, [user]);



    useEffect(() => {
        if (!conversationId || !user?.uid) return;

        setSelectedUser(null);

        const loadSelectedUser = async () => {
            try {
                const conversation = await getConversationById(conversationId);

                if (!conversation?.members) return;

                const memberIds = Object.keys(conversation.members);

                const otherUserId = memberIds.find(
                    (id) => id !== user.uid
                );

                if (!otherUserId) return;

                const otherUser = await getUser(otherUserId);

                if (!otherUser) {
                    console.error("Other user not found:", otherUserId);
                    return;
                }

                setSelectedUser({
                    uid: otherUserId,
                    ...otherUser,
                });
            } catch (error) {
                console.error("Error loading selected user:", error);
            }
        };

        loadSelectedUser();
    }, [conversationId, user?.uid]);




    return (
        <main className="chat-page">
            <Sidebar
                conversations={conversations}
                onAddContact={() => navigate("/chat/add-contact")}
            />


            {isAddContact ? (
                <NewChat
                    onBack={() => navigate("/chat")}
                    onSelectUser={handleSelectUser}
                />
            ) : conversationId ? (
                <ChatWindow selectedUser={selectedUser} />
            ) : (
                <EmptyChat
                    onAddContact={() => navigate("/chat/add-contact")}
                />
            )}
        </main>
    );
}

export default Chat;