import { ref, get, set, remove } from "firebase/database";
import { database } from "../config";
import { isFriend } from "./friendService";

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
    if (!userId1 || !userId2) {
        throw new Error("User IDs are required.");
    }

    const friends = await isFriend(userId1, userId2);

    if (!friends) {
        throw new Error(
            "You can only create a conversation with a friend."
        );
    }


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





export async function getOrCreateConversation(
    currentUserId,
    otherUserId
) {
    const existingConversation = await getConversation(
        currentUserId,
        otherUserId
    );

    if (existingConversation) {
        return existingConversation;
    }

    return await createConversation(
        currentUserId,
        otherUserId
    );
}



export async function pinConversation(conversationId, userId) {
    const pinRef = ref(
        database,
        `conversations/${conversationId}/pinnedBy/${userId}`
    );

    await set(pinRef, true);
}

export async function unpinConversation(conversationId, userId) {
    const pinRef = ref(
        database,
        `conversations/${conversationId}/pinnedBy/${userId}`
    );

    await remove(pinRef);
}


export async function clearConversation(
    conversationId,
    userId
) {
    if (!conversationId || !userId) {
        throw new Error(
            "Conversation ID and user ID are required."
        );
    }

    const clearedAtRef = ref(
        database,
        `conversations/${conversationId}/clearedAt/${userId}`
    );

    await set(clearedAtRef, Date.now());
}