import {
    ref,
    get,
    update,
} from "firebase/database";

import {
    deleteUser,
} from "firebase/auth";

import {
    auth,
    database,
} from "../config";


export const deleteAccount = async () => {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("No authenticated user found.");
    }

    const uid = user.uid;


    // ========================================
    // Get user's profile
    // ========================================

    const userRef = ref(database, `users/${uid}`);
    const userSnapshot = await get(userRef);

    const userData = userSnapshot.exists()
        ? userSnapshot.val()
        : null;


    // ========================================
    // Get all conversations
    // ========================================

    const conversationsRef = ref(
        database,
        "conversations"
    );

    const conversationsSnapshot = await get(
        conversationsRef
    );


    // ========================================
    // Prepare deletion updates
    // ========================================

    const updates = {};


    // ========================================
    // Delete conversations belonging to user
    // ========================================

    if (conversationsSnapshot.exists()) {

        const conversations =
            conversationsSnapshot.val();

        Object.entries(conversations).forEach(
            ([conversationId, conversation]) => {

                if (
                    conversation.members?.[uid] === true
                ) {
                    updates[
                        `conversations/${conversationId}`
                    ] = null;
                }

            }
        );
    }


    // ========================================
    // Delete user profile
    // ========================================

    updates[`users/${uid}`] = null;


    // ========================================
    // Delete presence
    // ========================================

    updates[`presence/${uid}`] = null;


    // ========================================
    // Delete active conversation
    // ========================================

    updates[`activeConversations/${uid}`] = null;


    // ========================================
    // Delete username lookup
    // ========================================

    const username = userData?.userName;

    if (username) {
        updates[`usernames/${username}`] = null;
    }


    // ========================================
    // Delete RTDB data
    // ========================================

    await update(
        ref(database),
        updates
    );


    // ========================================
    // Delete Firebase Authentication account
    // ========================================

    await deleteUser(user);
};