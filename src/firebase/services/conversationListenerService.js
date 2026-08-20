import { ref, onValue } from "firebase/database";
import { database } from "../config";
import { markMessageAsDelivered } from "./messageReceiptService";


function getLastMessage(messages) {
    return Object.values(messages).reduce(
        (latest, message) => {
            if (!latest || message.createdAt > latest.createdAt) {
                return message;
            }

            return latest;
        },
        null
    );
}


function markIncomingMessagesAsDelivered(
    conversationId,
    messages,
    userId
) {
    Object.entries(messages).forEach(([messageId, message]) => {
        if (message.senderId !== userId) {
            markMessageAsDelivered(
                conversationId,
                messageId
            );
        }
    });
}



export function subscribeToUserConversations(userId, callback) {
    const conversationsRef = ref(database, "conversations");

    const unsubscribe = onValue(conversationsRef, (snapshot) => {
        const conversations = [];

        snapshot.forEach((childSnapshot) => {
            const conversation = childSnapshot.val();

            if (conversation.members?.[userId]) {
                const messages = conversation.messages || {};

                markIncomingMessagesAsDelivered(
                    childSnapshot.key,
                    messages,
                    userId
                );

                const lastMessage = getLastMessage(messages);

                conversations.push({
                    id: childSnapshot.key,
                    ...conversation,

                    lastMessage: lastMessage?.text || "",
                    lastMessageTime: lastMessage?.createdAt || null,
                });
            }
        });

        conversations.sort(
            (a, b) =>
                (b.lastMessageTime || 0) -
                (a.lastMessageTime || 0)
        );


        callback(conversations);
    });

    return unsubscribe;
}