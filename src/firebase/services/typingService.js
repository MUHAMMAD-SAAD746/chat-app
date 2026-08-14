import { ref, set, remove } from "firebase/database";
import { database } from "../config";



export async function setTyping(conversationId, userId, isTyping) {
    const typingRef = ref(
        database,
        `typing/${conversationId}/${userId}`
    );

    if (isTyping) {
        await set(typingRef, true);
    } else {
        await remove(typingRef);
    }
}