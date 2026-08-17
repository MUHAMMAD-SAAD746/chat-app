import { ref, get, update, serverTimestamp } from "firebase/database";
import { database } from "../config";




function getMessageRef(conversationId, messageId) {
    return ref(
        database,
        `conversations/${conversationId}/messages/${messageId}`
    );
}


// Mark a message as delivered
export const markMessageAsDelivered = async (
    conversationId,
    messageId
) => {
    if (!conversationId || !messageId) return;

    try {
        const messageRef = getMessageRef(
            conversationId,
            messageId
        );

        const snapshot = await get(messageRef);

        if (!snapshot.exists()) return;

        const message = snapshot.val();

        // Already delivered
        if (message.deliveredAt) return;

        await update(messageRef, {
            deliveredAt: serverTimestamp()
        });
    } catch (error) {
        console.error(
            "Error marking message as delivered:",
            error
        );
    }
};


// Mark a message as read
export const markMessageAsRead = async (
    conversationId,
    messageId
) => {
    if (!conversationId || !messageId) return;

    try {
        const messageRef = getMessageRef(
            conversationId,
            messageId
        );

        await update(messageRef, {
            readAt: serverTimestamp()
        });
    } catch (error) {
        console.error(
            "Error marking message as read:",
            error
        );
    }
};