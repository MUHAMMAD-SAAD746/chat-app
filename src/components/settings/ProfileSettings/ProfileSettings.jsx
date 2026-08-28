import { useEffect, useState } from "react";

import ProfileImageInput from "../../../components/ProfileImageInput/ProfileImageInput";

import { useAuth } from "../../../context/AuthContext";
import {
    getUser,
    updateUser
} from "../../../firebase/database";
import useUsername from "../../../hooks/useUsername";
import { uploadProfileImage } from "../../../cloudinary/cloudinaryService";
import { notify } from "../../../utils/notification";
import { formatMessageDate } from "../../../utils/formatUtils";

import "./ProfileSettings.css";

function ProfileSettings() {
    const { user, setProfile } = useAuth();

    const [dbProfileImage, setDbProfileImage] = useState("");
    const [newProfileImage, setNewProfileImage] = useState(null);

    const [showPhotoInput, setShowPhotoInput] = useState(false);

    const [profile, setLocalProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [fullName, setFullName] = useState("");

    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    const DEFAULT_PROFILE_IMAGE = "https://res.cloudinary.com/dn7oklgm7/image/upload/v1786611251/copy_of_profile_ppp_wh9unh.png";

    const {
        username: userName,
        setUsername: setUserName,
        usernameError,
        usernameChecking,
        usernameAvailable,
        isCurrentUsername
    } = useUsername({
        initialValue: profile?.userName || "",
        currentUsername: profile?.userName || ""
    });


    const hasChanges =
        fullName.trim() !== (profile?.fullName || "").trim() ||
        userName.trim().toLowerCase() !==
        (profile?.userName || "").trim().toLowerCase() ||
        newProfileImage !== null;


    const usernameChanged =
        userName.trim().toLowerCase() !==
        (profile?.userName || "").trim().toLowerCase();




    useEffect(() => {
        if (!user?.uid) return;

        const loadProfile = async () => {

            try {
                setLoading(true);

                const userData = await getUser(user.uid);
                setLocalProfile(userData);


                const finalImage =
                    userData.profileImage || DEFAULT_PROFILE_IMAGE;

                setDbProfileImage(finalImage);
                setNewProfileImage(null);

                setFullName(userData.fullName || "");

            } catch (error) {
                console.error(
                    "Failed to load profile:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [user?.uid]);






    const handleSave = async () => {
        setSaveMessage("");

        if (!fullName.trim()) {
            setSaveMessage("Full name is required");
            return;
        }

        if (!userName.trim()) {
            setSaveMessage("Username is required");
            return;
        }

        if (
            usernameChanged &&
            (
                usernameChecking ||
                usernameError ||
                usernameAvailable !== true
            )
        ) {
            return;
        }

        let toastId;
        try {
            setSaving(true);

            toastId = notify.loading("Updating your profile...");

            let finalProfileImage = dbProfileImage;

            // New uploaded file
            if (newProfileImage?.type === "file") {
                finalProfileImage = await uploadProfileImage(
                    newProfileImage.value
                );
            }

            // New URL
            if (newProfileImage?.type === "url") {
                finalProfileImage = newProfileImage.value;
            }

            const updatedData = {
                fullName: fullName.trim(),
                userName: userName.trim().toLowerCase(),
                profileImage: finalProfileImage,
            };

            await updateUser(
                user.uid,
                profile.userName,
                updatedData
            );

            setLocalProfile((prev) => ({
                ...prev,
                ...updatedData,
            }));

            setProfile((prev) => ({
                ...prev,
                ...updatedData,
            }));


            setDbProfileImage(finalProfileImage);
            setNewProfileImage(null);

            setUserName(updatedData.userName);

            setShowPhotoInput(false);

            notify.updateSuccess(
                toastId,
                "Profile updated successfully"
            );

        } catch (error) {
            console.error(
                "Failed to update profile:",
                error
            );

            notify.updateError(
                toastId,
                "Failed to update profile"
            );

            setSaveMessage("Failed to update profile");

        } finally {
            setSaving(false);
        }
    };






    if (loading) {
        return (
            <div className="profile-settings-loading">
                Loading profile...
            </div>
        );
    }



    if (!profile) {
        return (
            <div className="profile-settings-error">
                Unable to load your profile.
            </div>
        );
    }




    return (
        <div className="profile-settings">

            {/* Header */}

            <div className="profile-settings-header">
                <h2>Profile</h2>

                <p>
                    Manage your profile information and how other users
                    find you.
                </p>
            </div>


            {/* Profile Card */}

            <div className="profile-settings-card">
                {/* Profile Image */}
                <div className="profile-settings-avatar-section">

                    <div className="profile-settings-avatar">
                        <img
                            src={
                                newProfileImage?.type === "file"
                                    ? URL.createObjectURL(newProfileImage.value)
                                    : newProfileImage?.type === "url"
                                        ? newProfileImage.value
                                        : dbProfileImage
                            }
                            alt={profile.fullName}
                            onError={(e) => {
                                e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
                            }}
                        />
                    </div>

                    <div className="profile-settings-avatar-info">

                        <h3>Profile picture</h3>

                        <p>
                            This image will be visible to other users.
                        </p>

                        {!showPhotoInput && (
                            <button
                                type="button"
                                className="profile-settings-photo-button"
                                onClick={() => setShowPhotoInput(true)}
                            >
                                Change photo
                            </button>
                        )}

                    </div>

                    {showPhotoInput && (
                        <div className="profile-settings-photo-actions">

                            <ProfileImageInput
                                onChange={setNewProfileImage}
                                showPreview={false}
                            />

                            <button
                                type="button"
                                className="profile-settings-photo-button cancel"
                                onClick={() => {
                                    setNewProfileImage(null);
                                    setShowPhotoInput(false);
                                }}
                            >
                                Cancel
                            </button>

                        </div>
                    )}

                </div>



                <div className="profile-settings-divider" />


                {/* Editable Information */}

                <div className="profile-settings-section">

                    <h3>Personal information</h3>

                    <p className="profile-settings-section-description">
                        These details can be changed and will be visible
                        to other users.
                    </p>


                    {/* Full Name */}

                    <div className="profile-settings-field">

                        <label htmlFor="fullName">
                            Full name
                        </label>

                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                        />

                    </div>


                    {/* Username */}

                    <div className="profile-settings-field">

                        <label htmlFor="userName">
                            Username
                        </label>

                        <input
                            id="userName"
                            type="text"
                            value={userName}
                            onChange={(e) => {
                                setUserName(e.target.value);
                            }}
                            placeholder="Enter your username"
                        />

                        {isCurrentUsername ? (
                            <span className="profile-settings-current-text">
                                Other users can use this username to find you.
                            </span>
                        ) : usernameChecking ? (
                            <span className="profile-settings-checking-text">
                                Checking username...
                            </span>
                        ) : usernameError ? (
                            <span className="profile-settings-error-text">
                                {usernameError}
                            </span>
                        ) : usernameAvailable === true ? (
                            <span className="username-status username-available">
                                Username is available.
                            </span>
                        ) : null}

                    </div>

                </div>


                <div className="profile-settings-divider" />


                {/* Account Information */}

                <div className="profile-settings-section">

                    <h3>Account information</h3>

                    <p className="profile-settings-section-description">
                        These details are managed by your account and
                        cannot be changed here.
                    </p>


                    {/* Email */}

                    <div className="profile-settings-field">

                        <label htmlFor="email">
                            Email
                        </label>

                        <div className="profile-settings-readonly-wrapper">

                            <input
                                id="email"
                                type="email"
                                value={profile.email || ""}
                                readOnly
                            />

                            <span className="profile-settings-lock">
                                🔒
                            </span>

                        </div>

                    </div>


                    {/* UID */}

                    <div className="profile-settings-field">

                        <label htmlFor="uid">
                            Account ID
                        </label>

                        <div className="profile-settings-readonly-wrapper">

                            <input
                                id="uid"
                                type="text"
                                value={profile.uid || ""}
                                readOnly
                            />

                            <span className="profile-settings-lock">
                                🔒
                            </span>

                        </div>

                        <span>
                            Your account ID cannot be changed.
                        </span>

                    </div>


                    {/* Created At */}

                    <div className="profile-settings-field">

                        <label>
                            Member since
                        </label>

                        <div className="profile-settings-readonly">
                            {formatMessageDate(profile.createdAt)}
                        </div>

                    </div>

                </div>


                {/* Actions */}

                <div className="profile-settings-actions">

                    <button
                        className="profile-settings-save"
                        onClick={handleSave}
                        disabled={
                            saving ||
                            !hasChanges ||
                            !fullName.trim() ||
                            !userName.trim() ||
                            (
                                usernameChanged &&
                                (
                                    usernameChecking ||
                                    usernameError ||
                                    usernameAvailable !== true
                                )
                            )
                        }
                    >
                        {saving ? "Saving..." : "Save changes"}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ProfileSettings;