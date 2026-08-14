import { ref, onValue } from "firebase/database";
import { database } from "../config";

export function subscribeToTyping(conversationId, callback) {
    const typingRef = ref(
        database,
        `typing/${conversationId}`
    );

    const unsubscribe = onValue(typingRef, (snapshot) => {
        const data = snapshot.val();

        if (!data) {
            callback([]);
            return;
        }

        const typingUsers = Object.keys(data);

        callback(typingUsers);
    });

    return unsubscribe;
}