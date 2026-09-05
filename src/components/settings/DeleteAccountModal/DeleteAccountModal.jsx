import { useState } from "react";

import {
    reauthenticateUser,
} from "../../../firebase/auth";

import {
    deleteAccount,
} from "../../../firebase/services/accountDeletionService";

import { useAuth } from "../../../context/AuthContext";

import "./DeleteAccountModal.css";


function DeleteAccountModal({ onClose }) {

    const { user } = useAuth();

    const [confirmation, setConfirmation] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // ========================================
    // Authentication Provider
    // ========================================

    const isEmailPasswordUser = user?.providerData?.some(
        (provider) =>
            provider.providerId === "password"
    );


    const isConfirmed = confirmation === "DELETE";


    const handleDelete = async () => {

        setError("");

        if (!isConfirmed) {
            return;
        }

        try {

            setLoading(true);


            // ========================================
            // Reauthenticate
            // ========================================

            if (isEmailPasswordUser) {

                await reauthenticateUser(password);

            } else {

                await reauthenticateUser();

            }



            await deleteAccount();


            onClose();

        } catch (error) {

            console.error(
                "Delete account failed:",
                error
            );


            if (
                error.code === "auth/wrong-password" ||
                error.code === "auth/invalid-credential"
            ) {

                setError(
                    "Current password is incorrect."
                );

            } else if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {

                setError(
                    "Google authentication was cancelled."
                );

            } else if (
                error.code ===
                "auth/popup-blocked"
            ) {

                setError(
                    "Please allow popups to continue."
                );

            } else {

                setError(
                    "Failed to delete account. Please try again."
                );
            }

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="delete-modal-overlay">

            <div className="delete-modal">

                {/* Header */}

                <div className="delete-modal-header">

                    <h2>
                        Delete account
                    </h2>

                </div>


                {/* Content */}

                <div className="delete-modal-content">

                    <p className="delete-modal-question">
                        Are you sure you want to
                        delete your account?
                    </p>

                    <p className="delete-modal-warning">
                        This action is permanent and
                        cannot be undone.
                        <br />
                        Your profile, conversations,
                        and other account data will be
                        permanently deleted.
                    </p>


                    {/* Current Password */}

                    {isEmailPasswordUser && (
                        <div className="delete-modal-field">

                            <label htmlFor="delete-password">
                                Current password
                            </label>

                            <input
                                id="delete-password"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(
                                        e.target.value
                                    );

                                    setError("");
                                }}
                                autoComplete="current-password"
                                disabled={loading}
                            />

                        </div>
                    )}


                    {/* Confirmation */}

                    <div className="delete-modal-field">

                        <label htmlFor="delete-confirmation">
                            Type DELETE to confirm:
                        </label>

                        <input
                            id="delete-confirmation"
                            type="text"
                            value={confirmation}
                            onChange={(e) => {
                                setConfirmation(
                                    e.target.value
                                );

                                setError("");
                            }}
                            autoComplete="off"
                            disabled={loading}
                        />

                    </div>


                    {/* Error */}

                    {error && (
                        <p className="delete-modal-error">
                            {error}
                        </p>
                    )}

                </div>


                {/* Actions */}

                <div className="delete-modal-actions">

                    <button
                        type="button"
                        className="delete-modal-cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="delete-modal-confirm"
                        onClick={handleDelete}
                        disabled={
                            !isConfirmed ||
                            (isEmailPasswordUser && !password) ||
                            loading
                        }
                    >
                        {loading
                            ? "Deleting..."
                            : "Delete Account"}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default DeleteAccountModal;