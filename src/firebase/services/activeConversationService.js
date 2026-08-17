import { ref, set, remove, onDisconnect } from "firebase/database";
import { database } from "../config";

const getActiveConversationRef = (userId) =>
    ref(database, `activeConversations/${userId}`);

export async function setActiveConversation(userId, conversationId) {
    const activeRef = getActiveConversationRef(userId);

    await set(activeRef, conversationId);

    onDisconnect(activeRef).remove();
}

export async function clearActiveConversation(userId) {
    const activeRef = getActiveConversationRef(userId);

    await remove(activeRef);
}