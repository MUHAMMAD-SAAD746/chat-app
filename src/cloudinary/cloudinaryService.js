const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadProfileImage(file) {
    if (!file) {
        return null;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        throw new Error("Profile image upload failed");
    }

    const data = await response.json();

    return data.secure_url;
}










export async function uploadChatFile(file) {
    if (!file) {
        return null;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        throw new Error("Chat file upload failed");
    }

    const data = await response.json();

    console.log("Uploaded chat file:", {
        url: data.secure_url,
        publicId: data.public_id,
        resourceType: data.resource_type,
        type: data.type,
    });

    return {
        url: data.secure_url,
        publicId: data.public_id,
        resourceType: data.resource_type
    };
}