import { ref, get, update, onValue } from "firebase/database";
import { database } from "../config";


/**
 * Check whether two users are friends.
 */
export const isFriend = async (userId, otherUserId) => {
    if (!userId || !otherUserId) {
        return false;
    }

    const friendRef = ref(
        database,
        `friends/${userId}/${otherUserId}`
    );

    const snapshot = await get(friendRef);

    return snapshot.exists() && snapshot.val() === true;
};


/**
 * Get all friend IDs of a user.
 */
export const getFriends = async (userId) => {
    if (!userId) {
        return {};
    }

    const friendsRef = ref(
        database,
        `friends/${userId}`
    );

    const snapshot = await get(friendsRef);

    if (!snapshot.exists()) {
        return {};
    }

    return snapshot.val();
};




export const subscribeToFriends = (userId, callback) => {
    if (!userId) return () => { };

    const friendsRef = ref(
        database,
        `friends/${userId}`
    );

    return onValue(friendsRef, (snapshot) => {
        callback(snapshot.exists() ? snapshot.val() : {});
    });
};





/**
 * Remove a friendship between two users.
 */
export const removeFriend = async (userId, friendId) => {
    if (!userId || !friendId) {
        throw new Error("User IDs are required.");
    }

    const updates = {
        [`friends/${userId}/${friendId}`]: null,
        [`friends/${friendId}/${userId}`]: null
    };

    await update(ref(database), updates);
};