import "./MessageBubble.css";

function MessageBubble({ text, time, isOwn = false }) {
    return (
        <div className={`message ${isOwn ? "message-own" : "message-other"}`}>
            <div className="message-bubble">
                <p>{text}</p>
                <span>{time}</span>
            </div>
        </div>
    );
}

export default MessageBubble;