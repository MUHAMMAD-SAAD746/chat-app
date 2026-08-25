import { ref, get, update } from "firebase/database";
import { database } from "../config";

export async function toggleMessageReaction(
    conversationId,
    messageId,
    userId,
    emoji
) {
    const reactionsRef = ref(
        database,
        `conversations/${conversationId}/messages/${messageId}/reactions`
    );

    const snapshot = await get(reactionsRef);

    const reactions = snapshot.exists()
        ? snapshot.val()
        : {};

    const currentReaction = reactions[userId];

    // Clicking the same emoji removes the reaction
    if (currentReaction === emoji) {
        await update(reactionsRef, {
            [userId]: null,
        });

        return null;
    }

    // Clicking a different emoji adds/changes the reaction
    await update(reactionsRef, {
        [userId]: emoji,
    });

    return emoji;
}