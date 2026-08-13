import ConversationItem from "./ConversationItem";

function ConversationList({ conversations }) {

    return (
        <div className="chat-list">
            {conversations.map((conversation) => (
                <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                />
            ))}
        </div>
    );
}

export default ConversationList;