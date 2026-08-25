export const formatFileSize = (bytes) => {
    if (!bytes) return "";

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};




export const formatLastSeen = (timestamp) => {
    if (!timestamp) return "some time ago";

    const now = Date.now();
    const difference = now - timestamp;

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return "just now";
    }

    if (minutes < 60) {
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    if (hours < 24) {
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    if (days < 7) {
        return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    return new Date(timestamp).toLocaleDateString();
};




export const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
};




export const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();

    const isToday =
        date.toDateString() === today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isYesterday =
        date.toDateString() === yesterday.toDateString();

    if (isToday) {
        return "Today";
    }

    if (isYesterday) {
        return "Yesterday";
    }

    return date.toLocaleDateString([], {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};