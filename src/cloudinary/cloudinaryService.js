const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadProfileImage(file) {
    if (!file) {
        return null;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const startTime = performance.now();

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: "POST",
            body: formData
        }
    );

    console.log(
        "PROFILE CLOUDINARY UPLOAD:",
        performance.now() - startTime,
        "ms"
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

    const resourceType = file.type.startsWith("image/")
        ? "image"
        : "raw";


    const startTime = performance.now();

    let response;

    try {
        response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
            {
                method: "POST",
                body: formData
            }
        );
    } catch (error) {
        console.error(
            `UPLOAD FAILED: ${file.name}`,
            error
        );

        throw error;
    }


    if (!response.ok) {
        throw new Error(
            `Chat file upload failed: ${file.name} (${response.status})`
        );
    }

    const data = await response.json();


    return {
        url: data.secure_url,
        publicId: data.public_id,
        resourceType: data.resource_type
    };
}