import { ref, set, remove, onDisconnect } from "firebase/database";
import { database } from "../config";

export async function setActiveConversation(userId, conversationId) {
    const activeRef = ref(
        database,
        `activeConversations/${userId}`
    );

    await set(activeRef, conversationId);

    onDisconnect(activeRef).remove();
}

export async function clearActiveConversation(userId) {
    const activeRef = ref(
        database,
        `activeConversations/${userId}`
    );

    await remove(activeRef);
}