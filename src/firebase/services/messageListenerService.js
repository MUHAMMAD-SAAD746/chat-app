import { ref, onValue } from "firebase/database";
import { database } from "../config";

export function subscribeToMessages(conversationId, callback) {
    const messagesRef = ref(
        database,
        `conversations/${conversationId}/messages`
    );

    const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();

        if (!data) {
            callback([]);
            return;
        }

        const messages = Object.entries(data).map(([id, message]) => ({
            id,
            ...message,
        }));

        callback(messages);
    });

    return unsubscribe;
}