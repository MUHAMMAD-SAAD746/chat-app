import { IoSend } from "react-icons/io5";
import "./MessageInput.css";

function MessageInput() {
    return (
        <div className="message-input">

            <input
                type="text"
                placeholder="Type a message..."
            />

            <button type="button" aria-label="Send message">
                <IoSend size={18} />
            </button>

        </div>
    );
}

export default MessageInput;