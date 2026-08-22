import {
    LuMessageSquareText,
    LuUserPlus,
    LuLogOut,
    LuSettings
} from "react-icons/lu";

import "./EmptyChat.css";
// import { useTheme } from "../../../../context/ThemeContext";
import { logout } from "../../../../firebase/auth";
import { useNavigate } from "react-router-dom";

function EmptyChat({ onAddContact }) {
    // const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();



    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };


    return (
        <section className="empty-chat">

            {/* Empty Chat Content */}
            <div className="empty-chat-content">
                <h1>Welcome to Chat</h1>

                <LuMessageSquareText className="empty-chat-icon" />

                <p>
                    Select a conversation from the sidebar
                    to start chatting.
                </p>
            </div>

            {/* Empty Chat Actions */}
            <div className="empty-chat-actions">
                {/* Add Contact */}
                <button
                    type="button"
                    onClick={onAddContact}
                >
                    <LuUserPlus size={18} />
                    <span>Add Contact</span>
                </button>

                {/* Theme Toggle */}
                {/* <div className="theme-toggle">
                    <button
                        type="button"
                        className={`theme-switch ${darkMode ? "active" : ""}`}
                        onClick={toggleTheme}
                        aria-label="Toggle dark theme"
                        aria-pressed={darkMode}
                    >
                        <span className="theme-switch-thumb"></span>
                    </button>

                    <span>
                        Dark Theme
                    </span>
                </div> */}


                {/* Settings */}
                <button
                    type="button"
                    onClick={() => navigate("/settings")}
                >
                    <LuSettings size={18} />
                    <span>Settings</span>
                </button>


                {/* Logout */}
                <button type="button" onClick={handleLogout}>
                    <LuLogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>

        </section>
    );
}

export default EmptyChat;