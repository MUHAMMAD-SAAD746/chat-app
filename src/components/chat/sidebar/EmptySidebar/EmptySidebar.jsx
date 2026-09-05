import { LuMessageSquareText, LuUserPlus } from "react-icons/lu";
import "./EmptySidebar.css"

function EmptyChatSidebar({ onAddContact }) {
    return (
        <div className="empty-sidebar">

            <div className="empty-sidebar-icon">
                <LuMessageSquareText />
            </div>

            <h3>No conversations</h3>

            <p>
                Add a friend to start a conversation.
            </p>

            <button 
                className="empty-sidebar-btn"
                onClick={onAddContact}
            >
                <LuUserPlus size={18} />
                Add Contact
            </button>

        </div>
    );
}

export default EmptyChatSidebar;