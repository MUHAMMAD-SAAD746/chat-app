import {
    ref,
    onValue,
    set,
    onDisconnect,
    serverTimestamp,
} from "firebase/database";

import { database } from "../config";

export function setupPresence(uid) {
    if (!uid) return;

    const connectedRef = ref(database, ".info/connected");
    const presenceRef = ref(database, `presence/${uid}`);

    return onValue(connectedRef, async (snapshot) => {
        if (snapshot.val() === false) {
            return;
        }

        await onDisconnect(presenceRef).set({
            online: false,
            lastSeen: serverTimestamp(),
        });

        await set(presenceRef, {
            online: true,
            lastSeen: serverTimestamp(),
        });
    });
}