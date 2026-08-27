import { ref, onValue } from "firebase/database";
import { database } from "../config";


function mapMessages(data) {
    return Object.entries(data).map(([id, message]) => ({
        id,
        ...message,
    }));
}


export function subscribeToMessages(
    conversationId,
    userId,
    callback
) {
    const conversationRef = ref(
        database,
        `conversations/${conversationId}`
    );

    const unsubscribe = onValue(
        conversationRef,
        (snapshot) => {
            const conversation = snapshot.val();

            if (!conversation) {
                callback({
                    messages: [],
                    clearedAt: 0,
                });

                return;
            }

            const messages = conversation.messages || {};

            const clearedAt =
                conversation.clearedAt?.[userId] || 0;

            callback({
                messages: mapMessages(messages),
                clearedAt,
            });
        }
    );

    return unsubscribe;
}