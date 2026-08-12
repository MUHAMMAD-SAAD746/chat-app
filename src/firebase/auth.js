import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from "firebase/auth";

import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

export const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
}

export const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () =>
    signInWithPopup(auth, googleProvider);

export const logout = () =>
    signOut(auth);