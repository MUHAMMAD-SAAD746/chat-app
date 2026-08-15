import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ChatSidebar.css"

import ConversationList from "./ConversationList";
import EmptyChatSidebar from "./EmptySidebar/EmptySidebar";
import ProfileWarning from "./ProfileWarning/ProfileWarning";

import { RxHamburgerMenu } from "react-icons/rx";
import { IoSearchOutline, IoSettingsSharp } from "react-icons/io5";
import { LuLogOut, LuUserPlus } from "react-icons/lu";

import { logout } from "../../../firebase/auth";
import { useAuth } from "../../../context/AuthContext";
// import { getUser } from "../../../firebase/database";


function Sidebar({ conversations, onAddContact }) {
    const [showMenu, setShowMenu] = useState(false);
    // const [showProfileWarning, setShowProfileWarning] = useState(false);

    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();



    // useEffect(() => {
    //     const checkUsername = async () => {
    //         if (!user?.uid) {
    //             setShowProfileWarning(false);
    //             return;
    //         }

    //         try {
    //             const profile = await getUser(user.uid);

    //             setShowProfileWarning(!profile?.userName);
    //         } catch (error) {
    //             console.error("Failed to check username:", error);
    //             setShowProfileWarning(false);
    //         }
    //     };

    //     checkUsername();
    // }, [user?.uid]);



    const handleLogout = async () => {
        try {
            await logout();

            setShowMenu(false);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };



    return (
        <aside className="chat-sidebar">

            {/* Sidebar Header */}
            <div className="sidebar-header">
                <div className="sidebar-menu">
                    <button
                        className="sidebar-menu-btn"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <RxHamburgerMenu size={18} />
                    </button>

                    {showMenu && (
                        <div className="sidebar-dropdown-menu">
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
                    />
                </div>
            </div>

            {!profile?.userName && location.pathname !== "/settings" && (
                <ProfileWarning
                    onCompleteProfile={() => {
                        navigate("/settings");
                    }}
                />
            )}

            {conversations.length === 0 ? (
                <EmptyChatSidebar onAddContact={onAddContact} />
            ) : (
                <ConversationList conversations={conversations} />
            )}
        </aside>
    )
}

export default Sidebar;