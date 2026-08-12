import { ref, set, get, update, remove } from "firebase/database";
import { database } from "./config";

export const createUser = async (uid, data) => {
    try {
        const updates = {
            [`users/${uid}`]: data,
            [`usernames/${data.userName}`]: uid
        };

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


export const updateUser = async (uid, data) => {
    await update(ref(database, `users/${uid}`), data);
};


export const deleteUser = async (uid) => {
    await remove(ref(database, `users/${uid}`));
};


// fetch a single username from data base 
export const getUsername = async (userName) => {
    const snapshot = await get(
        ref(database, `usernames/${userName}`)
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