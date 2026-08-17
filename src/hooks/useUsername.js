import { useEffect, useState } from "react";
import { getUsername } from "../firebase/database";


function normalizeUsername(username) {
    return username?.trim().toLowerCase() || "";
}


function validateUsername(username) {
    if (!username) {
        return "Username is required";
    }

    if (username.length < 5) {
        return "Username must be at least 5 characters";
    }

    const hasSpecialCharacter = /[^a-zA-Z0-9]/.test(username);

    if (!hasSpecialCharacter) {
        return "Username must contain at least one special character";
    }

    return "";
}

function useUsername({
    initialValue = "",
    currentUsername = ""
} = {}) {
    const [username, setUsername] = useState(initialValue);
    const [usernameError, setUsernameError] = useState("");
    const [usernameChecking, setUsernameChecking] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [isCurrentUsername, setIsCurrentUsername] = useState(false);

    useEffect(() => {
        setUsername(initialValue || "");
    }, [initialValue]);

    useEffect(() => {
        const normalizedUsername = normalizeUsername(username);
        const normalizedCurrentUsername = normalizeUsername(currentUsername);

        setUsernameAvailable(null);
        setIsCurrentUsername(false);

        if (!normalizedUsername) {
            setUsernameChecking(false);
            setUsernameError("Username is required");
            return;
        }

        const validationError = validateUsername(normalizedUsername);

        if (validationError) {
            setUsernameChecking(false);
            setUsernameError(validationError);
            return;
        }

        // Current username is automatically available
        if (
            normalizedCurrentUsername &&
            normalizedUsername === normalizedCurrentUsername
        ) {
            setUsernameChecking(false);
            setUsernameError("");
            setUsernameAvailable(true);
            setIsCurrentUsername(true);
            return;
        }

        setUsernameChecking(true);
        setUsernameError("");

        const timer = setTimeout(async () => {
            try {
                const existingUsername = await getUsername(
                    normalizedUsername
                );

                if (existingUsername) {
                    setUsernameAvailable(false);
                    setUsernameError("Username is already taken");
                    return;
                }

                setUsernameAvailable(true);
                setUsernameError("");
            } catch (error) {
                console.error(
                    "Username availability check failed:",
                    error
                );

                setUsernameAvailable(false);
                setUsernameError(
                    "Unable to check username availability"
                );
            } finally {
                setUsernameChecking(false);
            }
        }, 600);

        return () => {
            clearTimeout(timer);
        };
    }, [username, currentUsername]);

    return {
        username,
        setUsername,
        usernameError,
        usernameChecking,
        usernameAvailable,
        isCurrentUsername
    };
}

export default useUsername;