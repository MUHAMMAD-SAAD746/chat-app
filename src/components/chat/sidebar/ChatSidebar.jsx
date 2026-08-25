import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import usePopupPosition from "../../../hooks/usePopupPosition";
import "./ChatSidebar.css"

import ConversationList from "./ConversationList";
import EmptyChatSidebar from "./EmptySidebar/EmptySidebar";
import ProfileWarning from "./ProfileWarning/ProfileWarning";

import { RxHamburgerMenu } from "react-icons/rx";
import { IoSearchOutline, IoSettingsSharp } from "react-icons/io5";
import { LuLogOut, LuUserPlus, LuUsers } from "react-icons/lu";

import { logout } from "../../../firebase/auth";
import { useAuth } from "../../../context/AuthContext";

import useFriendRequests from "../../../hooks/useFriendRequests";
import { subscribeToSentFriendRequests } from "../../../firebase/services/friendRequestListenerService";
import { isFriend } from "../../../firebase/services/friendService";
import { notify } from "../../../utils/notification";


function Sidebar({ conversations, onAddContact }) {
    const [showMenu, setShowMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const previousSentRequests = useRef({});

    const { requestCount } = useFriendRequests();

    const { profile, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();



    const {
        triggerRef,
        menuRef,
        position,
    } = usePopupPosition(
        showMenu,
        setShowMenu
    );



    useEffect(() => {
        if (!profile?.uid) return;

        const unsubscribe = subscribeToSentFriendRequests(
            profile.uid,
            async (requests) => {
                const currentRequests = {};

                requests.forEach((request) => {
                    currentRequests[request.id] = request;
                });

                const previousRequests =
                    previousSentRequests.current;

                for (const requestId in previousRequests) {
                    if (!currentRequests[requestId]) {
                        const previousRequest =
                            previousRequests[requestId];

                        const accepted = await isFriend(
                            profile.uid,
                            previousRequest.receiverId
                        );

                        if (accepted) {
                            notify.success("Friend request accepted", {
                                autoClose: 2000,
                            });
                        }
                    }
                }

                previousSentRequests.current = currentRequests;
            }
        );

        return unsubscribe;
    }, [profile?.uid]);




    const handleLogout = async () => {
        try {
            await logout();

            setShowMenu(false);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };


    const shouldShowProfileWarning =
        !loading &&
        !profile?.userName &&
        location.pathname !== "/settings";


    return (
        <aside className="chat-sidebar">

            {/* Sidebar Header */}
            <div className="sidebar-header">
                <div className="sidebar-menu">
                    <button
                        className="sidebar-menu-btn"
                        ref={triggerRef}
                        onClick={() => setShowMenu((prev) => !prev)}
                    >
                        <RxHamburgerMenu size={18} />

                        {!showMenu && requestCount > 0 && (
                            <span className="sidebar-request-badge">
                                {requestCount}
                            </span>
                        )}
                    </button>

                    {showMenu && (
                        <div
                            ref={menuRef}
                            className="sidebar-dropdown-menu"
                            style={{
                                top: position.top - 5,
                                left: position.left - 10,
                            }}
                        >
                            <button
                                onClick={() => {
                                    onAddContact();
                                    setShowMenu(false);
                                }}
                            >
                                <LuUserPlus size={18} />
                                Add Contact
                            </button>
                            <button
                                onClick={() => {
                                    navigate("/friends");
                                    setShowMenu(false);
                                }}
                            >
                                <LuUsers size={18} />
                                Friends

                                {requestCount > 0 && (
                                    <span className="request-count">
                                        {requestCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    navigate("/settings");
                                    setShowMenu(false);
                                }}
                            >
                                <IoSettingsSharp size={18} />
                                Settings
                            </button>
                            <button onClick={handleLogout}>
                                <LuLogOut size={18} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                <div className="sidebar-search">
                    <IoSearchOutline size={18} />

                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {shouldShowProfileWarning && (
                <ProfileWarning
                    onCompleteProfile={() => {
                        navigate("/settings");
                    }}
                />
            )}


            {searchQuery.trim() || conversations.length > 0 ? (
                <ConversationList
                    conversations={conversations}
                    searchQuery={searchQuery}
                />
            ) : (
                <EmptyChatSidebar onAddContact={onAddContact} />
            )}
        </aside>
    )
}

export default Sidebar;