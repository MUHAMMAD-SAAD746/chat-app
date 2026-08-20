import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Friends.css";

import FriendRequests from "../../components/friends/FriendRequests/FriendRequests";
import FriendList from "../../components/friends/FriendList/FriendList";
import SentFriendRequests from "../../components/friends/SentFriendRequests/SentFriendRequests";

import useFriendRequests from "../../hooks/useFriendRequests";
import { IoArrowBack } from "react-icons/io5";

function Friends() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("friends");
    const {
        requestCount,
        sentRequestCount
    } = useFriendRequests();

    return (
        <div className="friends-page">

            <div className="friends-header">
                <div className="friends-title-row">

                    <button
                        className="friends-back-button"
                        onClick={() => navigate("/chat")}
                        aria-label="Back to chats"
                    >
                        <IoArrowBack />
                    </button>

                    <h1>Friends</h1>

                </div>

                <div className="friends-tabs">

                    <button
                        className={`friends-tab ${activeTab === "friends" ? "active" : ""
                            }`}
                        onClick={() => setActiveTab("friends")}
                    >
                        Friends
                    </button>

                    <button
                        className={`friends-tab ${activeTab === "requests" ? "active" : ""
                            }`}
                        onClick={() => setActiveTab("requests")}
                    >
                        Requests

                        {activeTab === "friends" && requestCount > 0 && (
                            <span className="friends-request-count">
                                {requestCount}
                            </span>
                        )}
                    </button>

                    <button
                        className={`friends-tab ${activeTab === "sent" ? "active" : ""}`}
                        onClick={() => setActiveTab("sent")}
                    >
                        Sent

                        {sentRequestCount > 0 && (
                            <span className="friends-sent-count">
                                {sentRequestCount}
                            </span>
                        )}
                    </button>

                </div>
            </div>

            <div className="friends-content">
                {activeTab === "friends" && (
                    <FriendList />
                )}

                {activeTab === "requests" && (
                    <FriendRequests />
                )}

                {activeTab === "sent" && (
                    <SentFriendRequests />
                )}
            </div>

        </div>
    );
}

export default Friends;