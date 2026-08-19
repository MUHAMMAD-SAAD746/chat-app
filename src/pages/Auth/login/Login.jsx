import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthCard from "../../../components/auth/AuthCard/AuthCard";
import "../AuthPage.css";

import { login } from "../../../firebase/auth";
import { notify } from "../../../utils/notification";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);



    const handleLogin = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "Email is required";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Enter a valid password";
        }

        setErrors(newErrors);

        // Stop if validation failed
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        let toastId;

        try {
            setLoading(true);

            toastId = notify.loading("Signing in...");

            await login(email, password);

            notify.dismiss(toastId);

            // Login successful
            navigate("/chat");

        } catch (error) {
            console.error("Login failed:", error);
            notify.dismiss(toastId);

            if (error.code === "auth/invalid-credential") {
                setErrors({
                    email: "Invalid email or password"
                });

            } else {
                setErrors({
                    email: "Something went wrong. Please try again."
                });
            }
        } finally {
            setLoading(false);
        }
    };



    return (
        <main className="auth-page">
            <AuthCard
                isLogin={true}

                email={email}
                setEmail={setEmail}

                password={password}
                setPassword={setPassword}

                errors={errors}

                onSubmit={handleLogin}

                loading={loading}
            />
        </main>
    );
}

export default Login;