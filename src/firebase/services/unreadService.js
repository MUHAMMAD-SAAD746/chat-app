import { ref, update, increment } from "firebase/database";
import { database } from "../config";

export async function incrementUnread(conversationId, userId) {
    const unreadRef = ref(
        database,
        `conversations/${conversationId}/unread`
    );

    await update(unreadRef, {
        [userId]: increment(1),
    });
}

export async function markConversationAsRead(conversationId, userId) {
    const unreadRef = ref(
        database,
        `conversations/${conversationId}/unread`
    );

    await update(unreadRef, {
        [userId]: 0,
    });
}