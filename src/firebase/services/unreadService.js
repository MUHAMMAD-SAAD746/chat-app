import { ref, update, increment } from "firebase/database";
import { database } from "../config";


function getUnreadRef(conversationId) {
    return ref(
        database,
        `conversations/${conversationId}/unread`
    );
}


export async function incrementUnread(conversationId, userId) {
    const unreadRef = getUnreadRef(conversationId);

    await update(unreadRef, {
        [userId]: increment(1),
    });
}

export async function markConversationAsRead(conversationId, userId) {
    const unreadRef = getUnreadRef(conversationId);

    await update(unreadRef, {
        [userId]: 0,
    });
}