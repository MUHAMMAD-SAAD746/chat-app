import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    EmailAuthProvider,
    reauthenticateWithCredential,
    reauthenticateWithPopup,
    updatePassword,
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




export const changePassword = async (
    currentPassword,
    newPassword
) => {
    const user = auth.currentUser;

    if (!user || !user.email) {
        throw new Error("No authenticated email/password user found.");
    }

    const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
    );

    console.log("credential", credential)

    await reauthenticateWithCredential(user, credential);

    await updatePassword(user, newPassword);
};






export const reauthenticateUser = async (password) => {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("No authenticated user found.");
    }

    const provider = user.providerData.find(
        (provider) =>
            provider.providerId === "password" ||
            provider.providerId === "google.com"
    );

    if (!provider) {
        throw new Error("Unsupported authentication provider.");
    }


    // Email / Password user
    if (provider.providerId === "password") {

        if (!user.email) {
            throw new Error("User email not found.");
        }

        const credential = EmailAuthProvider.credential(
            user.email,
            password
        );

        return reauthenticateWithCredential(
            user,
            credential
        );
    }


    // Google user
    if (provider.providerId === "google.com") {

        return reauthenticateWithPopup(
            user,
            googleProvider
        );
    }
};






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