// import { ref, update, increment } from "firebase/database";
// import { database } from "../config";


// function getUnreadRef(conversationId) {
//     return ref(
//         database,
//         `conversations/${conversationId}/unread`
//     );
// }


// export async function incrementUnread(conversationId, userId) {
//     const unreadRef = getUnreadRef(conversationId);

//     await update(unreadRef, {
//         [userId]: increment(1),
//     });
// }

// export async function markConversationAsRead(conversationId, userId) {
//     const unreadRef = getUnreadRef(conversationId);

//     await update(unreadRef, {
//         [userId]: 0,
//     });
// }














import {
    ref,
    get,
    update,
    increment,
} from "firebase/database";

import { database } from "../config";


function getUnreadRef(conversationId) {
    return ref(
        database,
        `conversations/${conversationId}/unread`
    );
}


function getConversationRef(conversationId) {
    return ref(
        database,
        `conversations/${conversationId}`
    );
}


export async function incrementUnread(
    conversationId,
    userId
) {
    const unreadRef = getUnreadRef(conversationId);

    await update(unreadRef, {
        [userId]: increment(1),
    });
}


export async function markConversationAsRead(
    conversationId,
    userId
) {
    if (!conversationId || !userId) return;

    try {
        const conversationRef =
            getConversationRef(conversationId);

        const snapshot = await get(
            conversationRef
        );

        // Conversation was already deleted
        if (!snapshot.exists()) {
            return;
        }

        const unreadRef =
            getUnreadRef(conversationId);

        await update(unreadRef, {
            [userId]: 0,
        });

    } catch (error) {
        console.error(
            "Error marking conversation as read:",
            error
        );
    }
}