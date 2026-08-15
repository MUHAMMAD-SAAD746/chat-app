import { useEffect, useState } from "react";
import ConversationItem from "./ConversationItem";
import { getUser } from "../../../firebase/database";
import { useAuth } from "../../../context/AuthContext";

function ConversationList({ conversations, searchQuery = "" }) {
    const { user } = useAuth();
    const [conversationUsers, setConversationUsers] = useState({});


    useEffect(() => {
        const fetchConversationUsers = async () => {
            const users = {};

            for (const conversation of conversations) {
                const otherUserId = Object.keys(conversation.members)
                    .find((uid) => uid !== user.uid);

                if (!otherUserId) continue;

                const userData = await getUser(otherUserId);

                if (userData) {
                    users[conversation.id] = userData;
                }
            }

            setConversationUsers(users);
        };

        if (user?.uid && conversations.length > 0) {
            fetchConversationUsers();
        } else {
            setConversationUsers({});
        }
    }, [conversations, user?.uid]);



    const filteredConversations = conversations.filter((conversation) => {
        const otherUser = conversationUsers[conversation.id];

        if (!otherUser) return false;

        const query = searchQuery.trim().toLowerCase();

        if (!query) return true;

        const fullName = otherUser.fullName?.toLowerCase() || "";
        const userName = otherUser.userName?.toLowerCase() || "";

        return (
            fullName.includes(query) ||
            userName.includes(query)
        );
    });



    return (
        <div className="chat-list">
            {filteredConversations.map((conversation) => (
                <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    otherUser={conversationUsers[conversation.id]}
                />
            ))}
        </div>
    );
}

export default ConversationList;