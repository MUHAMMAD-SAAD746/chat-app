import { useState } from "react";
import "./ProfileImageInput.css";

function ProfileImageInput({
    onChange,
    showPreview = true
}) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [error, setError] = useState("");

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        // File has priority
        setSelectedFile(file);
        setImageUrl("");
        setError("");

        onChange({
            type: "file",
            value: file
        });
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;

        // URL has priority when entered
        setImageUrl(url);
        setSelectedFile(null);
        setError("");

        if (!url.trim()) {
            setImageUrl("");
            setSelectedFile(null);
            setError("");
            onChange(null);
            return;
        }

        onChange({
            type: "url",
            value: url
        });
    };

    const preview = selectedFile
        ? URL.createObjectURL(selectedFile)
        : imageUrl;

    return (
        <div className="profile-image-input">

            {showPreview && (
                <div className="profile-image-preview">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Profile preview"
                            onError={() =>
                                setError(
                                    "Unable to load this image. Please use a valid image URL."
                                )
                            }
                        />
                    ) : (
                        <span>Profile</span>
                    )}
                </div>
            )}

            <div className="profile-image-actions">

                <label
                    htmlFor="profile-image"
                    className="profile-image-button"
                >
                    Choose Image
                </label>

                <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                />

                <input
                    type="text"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    placeholder="Or paste image URL"
                    className="profile-image-url"
                />

            </div>

            {error && (
                <p className="profile-image-error">
                    {error}
                </p>
            )}

        </div>
    );
}

export default ProfileImageInput;