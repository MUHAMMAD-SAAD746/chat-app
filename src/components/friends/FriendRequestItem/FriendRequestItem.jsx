import { useEffect, useState } from "react";
import "./FriendRequestItem.css";

import {
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest
} from "../../../firebase/services/friendRequestService";

import { getUser } from "../../../firebase/database";

const DEFAULT_PROFILE_IMAGE = "/default-profile.png";

function FriendRequestItem({ request, type = "received" }) {
    const [requestUser, setRequestUser] = useState(null);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const loadRequestUser = async () => {
            try {
                const userId =
                    type === "sent"
                        ? request.receiverId
                        : request.senderId;

                const userData = await getUser(userId);

                setRequestUser(userData);
            } catch (error) {
                console.error(
                    "Failed to load friend request user:",
                    error
                );
            }
        };

        loadRequestUser();
    }, [request.senderId, request.receiverId, type]);




    const handleAccept = async () => {
        try {
            setLoading(true);

            await acceptFriendRequest(
                request.senderId,
                request.receiverId
            );
        } catch (error) {
            console.error("Accept friend request error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setLoading(true);

            await rejectFriendRequest(
                request.senderId,
                request.receiverId
            );
        } catch (error) {
            console.error("Reject friend request error:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleCancel = async () => {
        try {
            setLoading(true);

            await cancelFriendRequest(
                request.senderId,
                request.receiverId
            );
        } catch (error) {
            console.error("Cancel friend request error:", error);
        } finally {
            setLoading(false);
        }
    };




    return (
        <div className="friend-request-item">

            <div className="friend-request-info">

                <img
                    className="friend-request-avatar"
                    src={requestUser?.profileImage || DEFAULT_PROFILE_IMAGE}
                    alt={requestUser?.fullName || "User"}
                />

                <div className="friend-request-details">

                    <p className="friend-request-name">
                        {requestUser?.fullName || "Loading..."}
                    </p>

                    <p className="friend-request-username">
                        {requestUser?.userName
                            ? `${requestUser?.userName}`
                            : ""}
                    </p>

                </div>

            </div>

            <div className="friend-request-actions">

                {type === "received" ? (
                    <>
                        <button
                            className="friend-request-accept"
                            onClick={handleAccept}
                            disabled={loading}
                        >
                            {loading ? "..." : "Accept"}
                        </button>

                        <button
                            className="friend-request-reject"
                            onClick={handleReject}
                            disabled={loading}
                        >
                            {loading ? "..." : "Reject"}
                        </button>
                    </>
                ) : (
                    <>
                        <span className="friend-request-sent">
                            Request sent
                        </span>

                        <button
                            className="friend-request-reject"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            {loading ? "..." : "Cancel"}
                        </button>
                    </>
                )}

            </div>

        </div>
    );
}

export default FriendRequestItem;