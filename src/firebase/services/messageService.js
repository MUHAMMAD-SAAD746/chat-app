import { ref, push, set, get } from "firebase/database";
import { database } from "../config";
import { incrementUnread } from "./unreadService";

export async function sendMessage(conversationId, senderId, text) {
    const conversationRef = ref(
        database,
        `conversations/${conversationId}`
    );

    const conversationSnapshot = await get(conversationRef);

    if (!conversationSnapshot.exists()) {
        throw new Error("Conversation not found");
    }

    const conversation = conversationSnapshot.val();

    const recipientId = Object.keys(conversation.members)
        .find((uid) => uid !== senderId);

    if (!recipientId) {
        throw new Error("Recipient not found");
    }

    const messagesRef = ref(
        database,
        `conversations/${conversationId}/messages`
    );

    const messageRef = push(messagesRef);

    const message = {
        senderId,
        text,
        createdAt: Date.now(),
    };

    await set(messageRef, message);

    await incrementUnread(
        conversationId,
        recipientId
    );

    return {
        id: messageRef.key,
        ...message,
    };
}