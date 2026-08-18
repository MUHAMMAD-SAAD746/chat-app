import { useEffect, useState } from "react";

import "./FriendRequests.css";

import { useAuth } from "../../../context/AuthContext";

import {
    subscribeToReceivedFriendRequests
} from "../../../firebase/services/friendRequestListenerService";

import FriendRequestItem from "../FriendRequestItem/FriendRequestItem";


function FriendRequests() {
    const { user } = useAuth();

    const [requests, setRequests] = useState([]);

    useEffect(() => {
        if (!user?.uid) return;

        const unsubscribe =
            subscribeToReceivedFriendRequests(
                user.uid,
                setRequests
            );

        return unsubscribe;
    }, [user?.uid]);

    return (
        <section className="friend-requests">

            <div className="friend-requests-header">
                <h2>Friend Requests</h2>

                {requests.length > 0 && (
                    <span className="friend-requests-count">
                        {requests.length}
                    </span>
                )}
            </div>

            {requests.length === 0 ? (
                <p className="friend-requests-empty">
                    No friend requests
                </p>
            ) : (
                <div className="friend-requests-list">
                    {requests.map((request) => (
                        <FriendRequestItem
                            key={`${request.senderId}_${request.receiverId}`}
                            request={request}
                        />
                    ))}
                </div>
            )}

        </section>
    );
}

export default FriendRequests;