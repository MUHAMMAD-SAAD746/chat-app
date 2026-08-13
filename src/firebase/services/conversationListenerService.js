// import { ref, onValue } from "firebase/database";
// import { database } from "../config";

// export function subscribeToUserConversations(userId, callback) {
//     const conversationsRef = ref(database, "conversations");

//     const unsubscribe = onValue(conversationsRef, (snapshot) => {
//         const conversations = [];

//         snapshot.forEach((childSnapshot) => {
//             const conversation = childSnapshot.val();

//             if (conversation.members?.[userId]) {
//                 conversations.push({
//                     id: childSnapshot.key,
//                     ...conversation,
//                 });
//             }
//         });

//         callback(conversations);
//     });

//     return unsubscribe;
// }









import { ref, onValue } from "firebase/database";
import { database } from "../config";

export function subscribeToUserConversations(userId, callback) {
    const conversationsRef = ref(database, "conversations");

    const unsubscribe = onValue(conversationsRef, (snapshot) => {
        const conversations = [];

        snapshot.forEach((childSnapshot) => {
            const conversation = childSnapshot.val();

            if (conversation.members?.[userId]) {

                const messages = conversation.messages || {};

                const lastMessage = Object.values(messages).reduce(
                    (latest, message) => {
                        if (!latest || message.createdAt > latest.createdAt) {
                            return message;
                        }

                        return latest;
                    },
                    null
                );

                conversations.push({
                    id: childSnapshot.key,
                    ...conversation,

                    lastMessage: lastMessage?.text || "",
                    lastMessageTime: lastMessage?.createdAt || null,
                });
            }
        });

        callback(conversations);
    });

    return unsubscribe;
}