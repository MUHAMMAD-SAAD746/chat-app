import { ref, get, set } from "firebase/database"
import { database } from "../config";

export function getConversationId(userId1, userId2) {
    return [userId1, userId2]
        .sort()
        .join("_");
}



export async function getConversation(userId1, userId2) {
    const conversationId = getConversationId(userId1, userId2);

    const conversationRef = ref(
        database,
        `conversations/${conversationId}`
    );

    const snapshot = await get(conversationRef);

    if (snapshot.exists()) {
        return {
            id: conversationId,
            ...snapshot.val(),
        };
    }

    return null;
}




export async function getConversationById(conversationId) {
    const conversationRef = ref(
        database,
        `conversations/${conversationId}`
    );

    const snapshot = await get(conversationRef);

    if (snapshot.exists()) {
        return {
            id: conversationId,
            ...snapshot.val(),
        };
    }

    return null;
}



export async function createConversation(userId1, userId2) {
    const conversationId = getConversationId(userId1, userId2);

    const conversationRef = ref(
        database,
        `conversations/${conversationId}`
    );

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