import { ref, get, set } from "firebase/database"
import { database } from "../config";

export function getConversationId(userId1, userId2) {
    return [userId1, userId2]
        .sort()
        .join("_");
}


function getConversationRef(conversationId) {
    return ref(
        database,
        `conversations/${conversationId}`
    );
}



export async function getConversation(userId1, userId2) {
    const conversationId = getConversationId(userId1, userId2);
    const conversationRef = getConversationRef(conversationId);

    const snapshot = await get(conversationRef);

    return snapshot.exists()
        ? {
            id: conversationId,
            ...snapshot.val(),
        }
        : null;
}




export async function getConversationById(conversationId) {
    const conversationRef = getConversationRef(conversationId);
    const snapshot = await get(conversationRef);

    return snapshot.exists()
        ? {
            id: conversationId,
            ...snapshot.val(),
        }
        : null;
}



export async function createConversation(userId1, userId2) {
    const conversationId = getConversationId(userId1, userId2);
    const conversationRef = getConversationRef(conversationId);

    const conversation = {
        createdAt: Date.now(),

        members: {
            [userId1]: true,
            [userId2]: true,
        },
    };

    await set(conversationRef, conversation);

    return {
        id: conversationId,
        ...conversation,
    };
}