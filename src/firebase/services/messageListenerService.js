import { ref, onValue } from "firebase/database";
import { database } from "../config";


function mapMessages(data) {
    return Object.entries(data).map(([id, message]) => ({
        id,
        ...message,
    }));
}


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

        const messages = mapMessages(data);

        callback(messages);
    });

    return unsubscribe;
}