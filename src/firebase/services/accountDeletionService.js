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
    // Get user's friends
    // ========================================

    const friendsRef = ref(
        database,
        `friends/${uid}`
    );

    const friendsSnapshot = await get(
        friendsRef
    );


    // ========================================
    // Get all friend requests
    // ========================================

    const friendRequestsRef = ref(
        database,
        "friendRequests"
    );

    const friendRequestsSnapshot = await get(
        friendRequestsRef
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
    // Delete friends
    // ========================================

    if (friendsSnapshot.exists()) {

        const friends =
            friendsSnapshot.val();

        Object.keys(friends).forEach(
            (friendId) => {

                // Remove user's friend relationship
                updates[
                    `friends/${uid}/${friendId}`
                ] = null;

                // Remove reverse relationship
                updates[
                    `friends/${friendId}/${uid}`
                ] = null;
            }
        );
    }


    // ========================================
    // Delete friend requests
    // ========================================

    if (friendRequestsSnapshot.exists()) {

        const friendRequests =
            friendRequestsSnapshot.val();

        Object.entries(friendRequests).forEach(
            ([requestId, request]) => {

                if (
                    request.senderId === uid ||
                    request.receiverId === uid
                ) {
                    updates[
                        `friendRequests/${requestId}`
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