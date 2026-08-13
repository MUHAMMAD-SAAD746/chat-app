import ChatHeader from "./ChatHeader/ChatHeader";
import "./ChatWindow.css";
import MessageInput from "./MessageInput/MessageInput";
import MessageList from "./MessageList/MessageList";

function ChatWindow({ selectedUser }) {
    return (
        <main className="chat-window">

            {/* Chat Header */}
            <ChatHeader selectedUser={selectedUser} />

            {/* Messages */}
            <section className="chat-messages">
                <MessageList />
            </section>

            {/* Message Input */}
            <div className="chat-input">
                <MessageInput />
            </div>

        </main>
    );
}

export default ChatWindow;