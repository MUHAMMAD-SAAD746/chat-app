import { useState } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import ProfileImageInput from "../../ProfileImageInput/ProfileImageInput";
import GoogleButton from "../GoogleButton/GoogleButton";
import "./AuthCard.css";

function AuthCard({
    isLogin = false,

    profileImage,
    setProfileImage,

    fullName,
    setFullName,
    userName,
    setUserName,

    usernameAvailable,
    usernameChecking,

    email,
    setEmail,
    password,
    setPassword,
    errors,
    onSubmit,
    loading
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="auth-card">
            {/* Header */}
            <div className="auth-header">
                <h1>
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h1>

                <p>
                    {isLogin
                        ? "Sign in to continue"
                        : "Register to continue"}
                </p>
            </div>

            <form className="auth-form" onSubmit={onSubmit}>
                {/* Register-only fields */}
                {!isLogin && (
                    <>
                        <ProfileImageInput
                            value={profileImage}
                            onChange={setProfileImage}
                        />

                        {/* Full Name */}
                        <div className="form-group">
                            <label htmlFor="full-name">
                                Full Name
                            </label>

                            <input
                                type="text"
                                id="full-name"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />

                            {errors?.fullName && (
                                <p className="form-error">{errors.fullName}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="user-name">
                                User Name
                            </label>

                            <input
                                type="text"
                                id="user-name"
                                placeholder="User Name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                            />

                            {errors?.userName && (
                                <p className="form-error">
                                    {errors.userName}
                                </p>
                            )}

                            {usernameChecking && (
                                <p className="username-status username-checking">
                                    Checking username...
                                </p>
                            )}

                            {usernameAvailable === true && (
                                <p className="username-status username-available">
                                    Username is available
                                </p>
                            )}

                            {usernameAvailable === false && (
                                <p className="username-status username-taken">
                                    Username is already taken
                                </p>
                            )}
                        </div>
                    </>
                )}

                <div className="form-group">
                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        type="email"
                        id="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {errors?.email && (
                        <p className="form-error">{errors.email}</p>
                    )}
                </div>

                <div className="form-group password-group">
                    <label htmlFor="password">
                        Password
                    </label>

                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <IoEyeOffOutline />
                            ) : (
                                <IoEyeOutline />
                            )}
                        </button>
                    </div>

                    {errors?.password && (
                        <p className="form-error">{errors.password}</p>
                    )}

                    {isLogin && (
                        <div className="password-options">
                            <Link to="/forgot-password">
                                Forgot Password?
                            </Link>
                        </div>
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
                        isLogin ? "Sign In" : "Create Account"
                    )}

                </button>

                <div className="login-prompt">
                    <p>
                        {isLogin
                            ? "Don't have an account?"
                            : "Already have an account?"}

                        <Link to={isLogin ? "/register" : "/login"}>
                            {isLogin ? " Register" : " Login"}
                        </Link>
                    </p>
                </div>

                <div className="auth-divider">
                    <span>or</span>
                </div>

                <GoogleButton />

            </form>
        </div>
    );
}

export default AuthCard;