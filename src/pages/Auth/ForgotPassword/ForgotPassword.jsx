import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../../../firebase/auth";
import "./ForgotPassword.css";
import "../AuthPage.css"

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        try {
            setLoading(true);

            await resetPassword(email.trim());

            setSuccess(
                "Password reset email sent. Please check your inbox."
            );

            setEmail("");
        } catch (error) {
            console.error("RESET PASSWORD ERROR:", error);

            if (error.code === "auth/user-not-found") {
                setError("No account found with this email.");
            } else if (error.code === "auth/invalid-email") {
                setError("Please enter a valid email.");
            } else {
                setError("Failed to send reset email. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (

        <main className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Forgot Password?</h1>

                    <p>
                        Enter your email to receive a password reset link.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label htmlFor="reset-email">
                            Email
                        </label>

                        <input
                            type="email"
                            id="reset-email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        {error && (
                            <p className="form-error">
                                {error}
                            </p>
                        )}

                        {success && (
                            <p className="form-success">
                                {success}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="auth-spinner"></span>
                        ) : (
                            "Send Reset Link"
                        )}
                    </button>

                    <div className="login-prompt">
                        <p>
                            Remember your password?

                            <Link to="/login">
                                {" "}Login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </main>



    );
}

export default ForgotPassword;