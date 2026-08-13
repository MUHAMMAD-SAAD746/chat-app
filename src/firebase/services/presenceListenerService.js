import { ref, onValue } from "firebase/database";
import { database } from "../config";

export function listenToUserPresence(uid, callback) {
    if (!uid) return;

    const presenceRef = ref(database, `presence/${uid}`);

    return onValue(presenceRef, (snapshot) => {
        callback(snapshot.val());
    });
}