import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConversationItem from "./ConversationItem";
import { getUser } from "../../../firebase/database";
import { useAuth } from "../../../context/AuthContext";
// import { getFriends } from "../../../firebase/services/friendService";
import { subscribeToFriends } from "../../../firebase/services/friendService";

import {
    getConversation,
    createConversation,
} from "../../../firebase/services/conversationService";


function ConversationList({ conversations, searchQuery = "" }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversationUsers, setConversationUsers] = useState({});
    const [friends, setFriends] = useState([]);


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





    useEffect(() => {
        if (!user?.uid) {
            setFriends([]);
            return;
        }

        const unsubscribe = subscribeToFriends(
            user.uid,
            async (friendIds) => {
                try {
                    const friendUsers = await Promise.all(
                        Object.keys(friendIds).map((friendId) =>
                            getUser(friendId)
                        )
                    );

                    setFriends(friendUsers.filter(Boolean));
                } catch (error) {
                    console.error("Failed to load friends:", error);
                    setFriends([]);
                }
            }
        );

        return unsubscribe;
    }, [user?.uid]);




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



    const filteredFriends = friends.filter((friend) => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return false;

        const fullName = friend.fullName?.toLowerCase() || "";
        const userName = friend.userName?.toLowerCase() || "";

        return (
            fullName.includes(query) ||
            userName.includes(query)
        );
    });



    const handleFriendClick = async (friend) => {
        try {
            let conversation = await getConversation(
                user.uid,
                friend.uid
            );

            if (!conversation) {
                conversation = await createConversation(
                    user.uid,
                    friend.uid
                );
            }

            navigate(`/chat/${conversation.id}`);
        } catch (error) {
            console.error("Failed to open conversation:", error);
        }
    };



    return (
        <div className="chat-list">

            {searchQuery.trim()
                ? filteredFriends.map((friend) => (
                    <ConversationItem
                        key={friend.uid}
                        otherUser={friend}
                        onClick={() => handleFriendClick(friend)}
                    />
                ))
                : filteredConversations.map((conversation) => (
                    <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        otherUser={conversationUsers[conversation.id]}
                    />
                ))
            }

        </div>
    );
}

export default ConversationList;