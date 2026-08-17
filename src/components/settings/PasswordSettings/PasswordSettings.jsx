import { useState } from "react";
import "./PasswordSettings.css";

import { changePassword } from "../../../firebase/auth";
import { useAuth } from "../../../context/AuthContext";

function PasswordSettings() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();

    const isEmailPasswordUser = user?.providerData?.some(
        (provider) => provider.providerId === "password"
    );

    if (!isEmailPasswordUser) {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (currentPassword === newPassword) {
            setError("New password must be different from current password.");
            return;
        }

        try {
            setLoading(true);

            await changePassword(
                currentPassword,
                newPassword
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setSuccess("Password changed successfully.");
        } catch (error) {
            console.error(error);

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password"
            ) {
                setError("Current password is incorrect.");
            } else if (error.code === "auth/weak-password") {
                setError("New password is too weak.");
            } else if (error.code === "auth/requires-recent-login") {
                setError(
                    "Please log in again before changing your password."
                );
            } else {
                setError("Failed to change password. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="password-settings">

            {/* Header */}

            <div className="password-settings-header">
                <h2>Change Password</h2>

                <p>
                    Update your password to keep your account secure.
                </p>
            </div>


            {/* Card */}

            <div className="password-settings-card">

                <form
                    className="password-settings-section"
                    onSubmit={handleSubmit}
                >

                    <h3>Password</h3>

                    <p className="password-settings-section-description">
                        Choose a strong password that you don't use elsewhere.
                    </p>


                    {/* Current Password */}

                    <div className="password-settings-field">

                        <label htmlFor="current-password">
                            Current password
                        </label>

                        <input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => {
                                setCurrentPassword(e.target.value);
                                setError("");
                                setSuccess("");
                            }}
                            autoComplete="current-password"
                        />

                    </div>


                    {/* New Password */}

                    <div className="password-settings-field">

                        <label htmlFor="new-password">
                            New password
                        </label>

                        <input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                setError("");
                                setSuccess("");
                            }}
                            autoComplete="new-password"
                        />

                    </div>


                    {/* Confirm Password */}

                    <div className="password-settings-field">

                        <label htmlFor="confirm-password">
                            Confirm new password
                        </label>

                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setError("");
                                setSuccess("");
                            }}
                            autoComplete="new-password"
                        />

                    </div>


                    {/* Messages */}

                    {error && (
                        <p className="password-settings-error">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="password-settings-success">
                            {success}
                        </p>
                    )}


                    {/* Action */}

                    <div className="password-settings-actions">

                        <button
                            className="password-settings-save"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Changing..."
                                : "Change Password"}
                        </button>

                    </div>

                </form>

            </div>

        </section>
    );
}

export default PasswordSettings;