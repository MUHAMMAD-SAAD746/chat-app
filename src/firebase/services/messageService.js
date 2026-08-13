import { ref, push, set } from "firebase/database";
import { database } from "../config";

export async function sendMessage(conversationId, senderId, text) {
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

    return {
        id: messageRef.key,
        ...message,
    };
}