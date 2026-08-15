import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

import { getUser } from "../firebase/database";
import { setupPresence } from "../firebase/services/presenceService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const userProfile = await getUser(currentUser.uid);
                    setProfile(userProfile);
                } catch (error) {
                    console.error("Failed to load user profile:", error);
                    setProfile(null);
                }
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);


    useEffect(() => {
        if (!user?.uid) return;

        const unsubscribePresence = setupPresence(user.uid);

        return unsubscribePresence;
    }, [user]);


    const value = {
        user,
        profile,
        setProfile,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}