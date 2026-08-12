import ConversationItem from "./ConversationItem";

function ConversationList() {

    return (
        <div className="chat-list">
            <ConversationItem
                id="1"
                name="User Name"
                lastMessage="Last message"
                time="10:30 AM"
                profileImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7GPdV2GaZgJvQsWkNO_1SgJOawLjTfuA51Ij0j8-EXTG9mJDVbSSxNNI&s=10"
            />
        </div>
    );
}

export default ConversationList;