import { useEffect, useState } from "react";
import "./FriendList.css";

import { useAuth } from "../../../context/AuthContext";
import { getFriends } from "../../../firebase/services/friendService";
import { getUser } from "../../../firebase/database";

import FriendItem from "../FriendItem/FriendItem";

function FriendList() {
    const { user } = useAuth();

    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFriends = async () => {
            if (!user?.uid) return;

            try {
                setLoading(true);

                const friendsData = await getFriends(user.uid);

                const friendIds = Object.keys(friendsData);

                const friendProfiles = await Promise.all(
                    friendIds.map((friendId) => getUser(friendId))
                );

                setFriends(
                    friendProfiles.filter(Boolean)
                );
            } catch (error) {
                console.error("Failed to load friends:", error);
            } finally {
                setLoading(false);
            }
        };

        loadFriends();
    }, [user?.uid]);

    if (loading) {
        return (
            <div className="friend-list-message">
                <p>Loading friends...</p>
            </div>
        );
    }

    if (friends.length === 0) {
        return (
            <div className="friend-list-message">
                <p>You don't have any friends yet.</p>
            </div>
        );
    }

    return (
        <div className="friend-list">
            {friends.map((friend) => (
                <FriendItem
                    key={friend.uid}
                    friend={friend}
                    onRemove={() => {
                        setFriends((currentFriends) =>
                            currentFriends.filter(
                                (currentFriend) =>
                                    currentFriend.uid !== friend.uid
                            )
                        );
                    }}
                />
            ))}
        </div>
    );
}

export default FriendList;