import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoEllipsisVerticalSharp } from "react-icons/io5";

import "./ChatHeader.css";

function ChatHeader() {
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();

    const handleCloseChat = () => {
        setShowMenu(false);
        navigate("/chat");
    };

    return (
        <header className="chat-header">

            {/* User Profile */}
            <div className="chat-header-user">

                <div className="chat-header-avatar">
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7GPdV2GaZgJvQsWkNO_1SgJOawLjTfuA51Ij0j8-EXTG9mJDVbSSxNNI&s=10"
                        alt="User profile"
                    />
                </div>

                {/* User Information */}
                <div className="chat-header-info">
                    <p className="chat-header-name">
                        User Name
                    </p>

                    <p className="chat-header-status">
                        Online for 10 mins
                    </p>
                </div>

            </div>

            {/* Header Actions */}
            <div className="chat-header-actions">

                <button
                    type="button"
                    className="chat-header-menu"
                    aria-label="Chat options"
                    onClick={() => setShowMenu((prev) => !prev)}
                >
                    <IoEllipsisVerticalSharp size={20} />
                </button>

                {/* Dropdown */}
                {showMenu && (
                    <div className="chat-options-menu">
                        <button 
                            type="button"
                            onClick={handleCloseChat}
                        >
                            Close Chat
                        </button>
                    </div>
                )}

            </div>

        </header>
    );
}

export default ChatHeader;
