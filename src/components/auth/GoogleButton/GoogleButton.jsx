import { FcGoogle } from "react-icons/fc";
import { loginWithGoogle } from "../../../firebase/auth";
import { getUser, createUser } from "../../../firebase/database";
import { useNavigate } from "react-router-dom";

import "./GoogleButton.css"

function GoogleButton() {
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            const result = await loginWithGoogle();
            const user = result.user;

            const existingUser = await getUser(user.uid);


            if (!existingUser) {
                await createUser(user.uid, {
                    uid: user.uid,
                    fullName: user.displayName || "",
                    userName: "",
                    email: user.email,
                    createdAt: Date.now()
                });
            }


            console.log("Google login successful:", result.user);

        } catch (error) {
            console.error("Google login failed:", error);
        }
    };

    return (
        <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
        >
            <FcGoogle size={20} />
            Continue with Google
        </button>
    );
}

export default GoogleButton;