import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../AuthPage.css";

import { useAuth } from "../../../context/AuthContext";

import AuthCard from "../../../components/auth/AuthCard/AuthCard";
import { signup } from "../../../firebase/auth";
import {
    createUser,
} from "../../../firebase/database";

import useUsername from "../../../hooks/useUsername";

import { uploadProfileImage } from "../../../cloudinary/cloudinaryService";


function Register() {
    const [fullName, setFullName] = useState("");
    const {
        username: userName,
        setUsername: setUserName,
        usernameError,
        usernameChecking,
        usernameAvailable
    } = useUsername();

    const [profileImage, setProfileImage] = useState(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const { setProfile } = useAuth();



    const validateForm = () => {
        const username = userName.trim();

        const errors = {};

        // Full name
        if (!fullName.trim()) {
            errors.fullName = "Full name is required";
        }

        if (usernameError) {
            errors.userName = usernameError;
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




    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Username already exists
        if (usernameAvailable !== true) {
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const result = await signup(email, password);
            const user = result.user;

            const DEFAULT_PROFILE_IMAGE = "https://res.cloudinary.com/dn7oklgm7/image/upload/v1786611251/copy_of_profile_ppp_wh9unh.png";
            let profileImageUrl = DEFAULT_PROFILE_IMAGE;

            if (profileImage?.type === "file") {
                profileImageUrl = await uploadProfileImage(profileImage.value);
            } else if (profileImage?.type === "url") {
                profileImageUrl = profileImage.value;
            }

            const profileData = {
                uid: user.uid,
                fullName,
                userName,
                email: user.email,
                profileImage: profileImageUrl,
                createdAt: Date.now()
            };

            await createUser(user.uid, profileData);
            setProfile(profileData);


            setProfileImage(null);
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
                profileImage={profileImage}
                setProfileImage={setProfileImage}

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
