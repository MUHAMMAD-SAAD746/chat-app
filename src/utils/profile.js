export const getDefaultProfileImage = (fullName) =>
    `https://api.dicebear.com/10.x/initials/svg?seed=${encodeURIComponent(fullName || "User")}`;