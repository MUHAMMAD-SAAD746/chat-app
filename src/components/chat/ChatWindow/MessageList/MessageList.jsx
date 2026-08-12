import MessageBubble from "../MessageBubble/MessageBubble";
import "./MessageList.css";

function MessageList() {
    return (
        <div className="message-list">

            <MessageBubble
                text="Hey! How are you?"
                time="10:30 AM"
                isOwn={false}
            />

            <MessageBubble
                text="I'm doing great! How about you?"
                time="10:31 AM"
                isOwn={true}
            />

            <MessageBubble
                text="I'm good too. Working on the chat app."
                time="10:32 AM"
                isOwn={false}
            />

        </div>
    );
}

export default MessageList;