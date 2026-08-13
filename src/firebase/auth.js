import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from "firebase/auth";

import {
    ref,
    set,
    serverTimestamp,
} from "firebase/database";

import { auth, database } from "./config";

const googleProvider = new GoogleAuthProvider();

export const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
}

export const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () =>
    signInWithPopup(auth, googleProvider);


export const logout = async () => {
    const uid = auth.currentUser?.uid;

    if (uid) {
        await set(ref(database, `presence/${uid}`), {
            online: false,
            lastSeen: serverTimestamp(),
        });
    }

    return signOut(auth);
};