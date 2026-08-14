import { ref, set, get, update, remove } from "firebase/database";
import { database } from "./config";

export const createUser = async (uid, data) => {
    try {
        const normalizedUsername = data.userName
            ?.trim()
            .toLowerCase();

        const updates = {
            [`users/${uid}`]: {
                ...data,
                userName: normalizedUsername || ""
            }
        };

        // Only create username lookup if username exists
        if (normalizedUsername) {
            updates[`usernames/${normalizedUsername}`] = uid;
        }

        await update(ref(database), updates);

    } catch (err) {
        console.error("Error creating user:", err);
        throw err;
    }
};


export const getUser = async (uid) => {
    const snapshot = await get(ref(database, `users/${uid}`));

    if (snapshot.exists()) {
        return snapshot.val();
    }

    return null;
};




export const updateUser = async (uid, oldUserName, data) => {
    try {
        const newUserName = data.userName
            ?.trim()
            .toLowerCase();

        const oldUserNameNormalized = oldUserName
            ?.trim()
            .toLowerCase();

        const updates = {
            [`users/${uid}/fullName`]: data.fullName.trim(),
            [`users/${uid}/profileImage`]: data.profileImage || "",
            [`users/${uid}/userName`]: newUserName || "",
        };

        // -----------------------------------------
        // Case 1: User is adding username for first time
        // -----------------------------------------
        if (!oldUserNameNormalized && newUserName) {
            updates[`usernames/${newUserName}`] = uid;
        }

        // -----------------------------------------
        // Case 2: User is changing existing username
        // -----------------------------------------
        else if (
            oldUserNameNormalized &&
            newUserName &&
            oldUserNameNormalized !== newUserName
        ) {
            // Remove old username
            updates[`usernames/${oldUserNameNormalized}`] = null;

            // Create new username
            updates[`usernames/${newUserName}`] = uid;
        }

        // -----------------------------------------
        // Case 3: User removes username
        // -----------------------------------------
        else if (
            oldUserNameNormalized &&
            !newUserName
        ) {
            updates[`usernames/${oldUserNameNormalized}`] = null;
        }

        await update(ref(database), updates);

    } catch (err) {
        console.error("Error updating user:", err);
        throw err;
    }
};





export const deleteUser = async (uid, userName) => {
    try {
        const updates = {
            [`users/${uid}`]: null,
        };

        const normalizedUsername = userName
            ?.trim()
            .toLowerCase();

        if (normalizedUsername) {
            updates[`usernames/${normalizedUsername}`] = null;
        }

        await update(ref(database), updates);

    } catch (err) {
        console.error("Error deleting user:", err);
        throw err;
    }
};





// fetch a single username from data base 
export const getUsername = async (userName) => {
    const normalizedUsername = userName
        .trim()
        .toLowerCase();

    const snapshot = await get(
        ref(database, `usernames/${normalizedUsername}`)
    );

    if (snapshot.exists()) {
        return snapshot.val();
    }

    return null;
};


// fetch complete node from database
export const getUsernames = async () => {
    const snapshot = await get(ref(database, "usernames"));

    if (snapshot.exists()) {
        return snapshot.val();
    }

    return {};
};