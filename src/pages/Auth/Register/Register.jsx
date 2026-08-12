import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../AuthPage.css";

import AuthCard from "../../../components/auth/AuthCard/AuthCard";
import { signup } from "../../../firebase/auth";
import {
    createUser,
    getUsername
} from "../../../firebase/database";


function Register() {
    const [fullName, setFullName] = useState("");
    const [userName, setUserName] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({});

    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [usernameChecking, setUsernameChecking] = useState(false);

    const navigate = useNavigate();



    const validateForm = () => {
        const username = userName.trim();

        const errors = {};

        // Full name
        if (!fullName.trim()) {
            errors.fullName = "Full name is required";
        }

        // Username
        const hasSpecialCharacter = /[^a-zA-Z0-9]/.test(username);

        if (username.length < 5 || !hasSpecialCharacter) {
            errors.userName = "Enter a valid username";
        }

        // Email
        if (!email.trim()) {
            errors.email = "Email is required";
        }

        // Password
        if (!password) {
            errors.password = "Password is required";
        } else if (password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }

        return errors;
    };





    // Debouncing to match username from database 
    useEffect(() => {
        setUsernameAvailable(null);
        setUsernameChecking(false);

        const username = userName.trim();
        const hasSpecialCharacter = /[^a-zA-Z0-9]/.test(username);

        if (userName.trim().length < 5) {
            setUsernameAvailable(null);
            return;
        }

        // / No special character → show immediately
        if (!hasSpecialCharacter) {
            setUsernameAvailable(null);

            setErrors((prev) => ({
                ...prev,
                userName:
                    "Username must contain at least one special character"
            }));

            return;
        }


        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.userName;
            return newErrors;
        });

        setUsernameChecking(true);

        const timer = setTimeout(async () => {
            try {
                const existingUsername = await getUsername(
                    userName.trim().toLowerCase()
                );

                if (existingUsername) {
                    setUsernameAvailable(false);
                    setUsernameChecking(false);
                } else {
                    setUsernameAvailable(true);
                    setUsernameChecking(false);
                }

            } catch (error) {
                console.error("Username check failed:", error);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [userName]);




    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Username already exists
        if (usernameAvailable === false) {
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const result = await signup(email, password);
            const user = result.user;

            await createUser(user.uid, {
                uid: user.uid,
                fullName,
                userName,
                email: user.email,
                createdAt: Date.now()
            });


            setFullName("");
            setUserName("");
            setEmail("");
            setPassword("");

            console.log("Account created Successfully");

            navigate("/chat");
        }
        catch (err) {
            console.error("Signup Failed");
            console.error(err.code);
            console.error(err.message);

            if (err.code === "auth/email-already-in-use") {
                setErrors({
                    email: "Email is already in use"
                });
            }
        }
        finally {
            setLoading(false);
        }
    }


    return (
        <main className="auth-page">
            <AuthCard
                fullName={fullName}
                setFullName={setFullName}

                userName={userName}
                setUserName={setUserName}

                usernameAvailable={usernameAvailable}
                usernameChecking={usernameChecking}

                email={email}
                setEmail={setEmail}

                password={password}
                setPassword={setPassword}

                errors={errors}

                onSubmit={handleSubmit}
                loading={loading}
            />
        </main>
    );
}

export default Register;
