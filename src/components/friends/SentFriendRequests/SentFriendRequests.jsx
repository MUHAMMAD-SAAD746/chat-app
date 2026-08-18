import { useEffect, useState } from "react";
import "./SentFriendRequests.css";

import { useAuth } from "../../../context/AuthContext";

import {
    subscribeToSentFriendRequests
} from "../../../firebase/services/friendRequestListenerService";

import FriendRequestItem from "../FriendRequestItem/FriendRequestItem";

function SentFriendRequests() {
    const { user } = useAuth();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) {
            setRequests([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const unsubscribe = subscribeToSentFriendRequests(
            user.uid,
            (sentRequests) => {
                setRequests(sentRequests);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [user?.uid]);

    if (loading) {
        return (
            <div className="sent-friend-requests-message">
                <p>Loading sent requests...</p>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="sent-friend-requests-message">
                <p>You don't have any sent requests.</p>
            </div>
        );
    }

    return (
        <div className="sent-friend-requests">
            {requests.map((request) => (
                <FriendRequestItem
                    key={`${request.senderId}_${request.receiverId}`}
                    request={request}
                    type="sent"
                />
            ))}
        </div>
    );
}

export default SentFriendRequests;