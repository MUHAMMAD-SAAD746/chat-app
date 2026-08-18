import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import ChatWindow from "../../components/chat/ChatWindow/ChatWindow";
import EmptyChat from "../../components/chat/ChatWindow/EmptyChat/EmptyChat";

import NewChat from "../../components/chat/NewChat/NewChat";

import { subscribeToTyping } from "../../firebase/services/typingListenerService";

import {
    // getConversation,
    getConversationById,
    // createConversation,
} from "../../firebase/services/conversationService";

import {
    setActiveConversation,
    clearActiveConversation,
} from "../../firebase/services/activeConversationService";

import { getUser } from "../../firebase/database";

import { useAuth } from "../../context/AuthContext";

import "./Chat.css";

function Chat() {
    const { conversationId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const isAddContact = location.pathname === "/chat/add-contact";

    const [selectedUser, setSelectedUser] = useState(null);

    const [typingUsers, setTypingUsers] = useState([]);



    useEffect(() => {
        if (!conversationId || !user?.uid) return;

        setActiveConversation(
            user.uid,
            conversationId
        ).catch((error) => {
            console.error(
                "Error setting active conversation:",
                error
            );
        });

        return () => {
            clearActiveConversation(
                user.uid
            ).catch((error) => {
                console.error(
                    "Error clearing active conversation:",
                    error
                );
            });
        };
    }, [conversationId, user?.uid]);



    // const handleSelectUser = async (selectedUser) => {
    //     setSelectedUser(selectedUser);


    //     const currentUserId = user.uid;
    //     const selectedUserId = selectedUser.uid;


    //     const conversation = await getConversation(
    //         currentUserId,
    //         selectedUserId
    //     );

    //     if (conversation) {
    //         navigate(`/chat/${conversation.id}`);
    //     } else {
    //         const newConversation = await createConversation(
    //             currentUserId,
    //             selectedUserId
    //         );


    //         navigate(`/chat/${newConversation.id}`);
    //     }
    // };



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





    useEffect(() => {
        if (!conversationId || !user?.uid) return;

        const unsubscribe = subscribeToTyping(
            conversationId,
            (typingUsers) => {
                setTypingUsers(typingUsers);
            }
        );

        return unsubscribe;
    }, [conversationId, user?.uid]);


    const isOtherUserTyping = typingUsers.some(
        (uid) => uid !== user?.uid
    );


    
    return (
        <>
            {isAddContact ? (
                <NewChat
                    onBack={() => navigate("/chat")}
                // onSelectUser={handleSelectUser}
                />
            ) : conversationId ? (
                <ChatWindow
                    selectedUser={selectedUser}
                    isOtherUserTyping={isOtherUserTyping}
                />
            ) : (
                <EmptyChat
                    onAddContact={() => navigate("/chat/add-contact")}
                />
            )}
        </>
    );
}

export default Chat;