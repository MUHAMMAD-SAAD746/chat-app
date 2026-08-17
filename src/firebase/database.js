import { ref, get, update } from "firebase/database";
import { database } from "./config";

const normalizeUsername = (username) => username?.trim().toLowerCase();


export const createUser = async (uid, data) => {
    try {
        const normalizedUsername = normalizeUsername(data.userName);

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

    return snapshot.exists()
        ? snapshot.val()
        : null;
};




export const updateUser = async (uid, oldUserName, data) => {
    try {
        const newUserName = normalizeUsername(data.userName);
        const oldUsername = normalizeUsername(oldUserName);

        const updates = {
            [`users/${uid}/fullName`]: data.fullName.trim(),
            [`users/${uid}/profileImage`]: data.profileImage || "",
            [`users/${uid}/userName`]: newUserName || "",
        };

        // -----------------------------------------
        // Case 1: User is adding username for first time
        // -----------------------------------------
        if (!oldUsername && newUserName) {
            updates[`usernames/${newUserName}`] = uid;
        }

        // -----------------------------------------
        // Case 2: User is changing existing username
        // -----------------------------------------
        else if (
            oldUsername &&
            newUserName &&
            oldUsername !== newUserName
        ) {
            // Remove old username
            updates[`usernames/${oldUsername}`] = null;

            // Create new username
            updates[`usernames/${newUserName}`] = uid;
        }

        // -----------------------------------------
        // Case 3: User removes username
        // -----------------------------------------
        else if (
            oldUsername &&
            !newUserName
        ) {
            updates[`usernames/${oldUsername}`] = null;
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

        const normalizedUsername = normalizeUsername(userName);

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
    const normalizedUsername = normalizeUsername(userName);

    const snapshot = await get(
        ref(database, `usernames/${normalizedUsername}`)
    );

    return snapshot.exists()
    ? snapshot.val()
    : null;
};


// fetch complete node from database
export const getUsernames = async () => {
    const snapshot = await get(ref(database, "usernames"));

    return snapshot.exists()
    ? snapshot.val()
    : {};
};