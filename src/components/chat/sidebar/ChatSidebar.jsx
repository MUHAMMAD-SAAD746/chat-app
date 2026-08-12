import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ChatSidebar.css"
import ConversationList from "./ConversationList";
import EmptyChatSidebar from "./EmptySidebar/EmptySidebar";

import { RxHamburgerMenu } from "react-icons/rx";
import { IoSearchOutline, IoSettingsSharp } from "react-icons/io5";
import { LuLogOut, LuUserPlus } from "react-icons/lu";

import { logout } from "../../../firebase/auth";


function Sidebar({ onAddContact }) {
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();





    const handleLogout = async () => {
        try {
            await logout();

            setShowMenu(false);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };





    const conversations = [
        // {
        //     id: 1,
        //     name: "saad"
        // }
    ]

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
                            <button>
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

            {conversations.length === 0 ? (
                <EmptyChatSidebar />
            ) : (
                <ConversationList />
            )}
        </aside>
    )
}

export default Sidebar;