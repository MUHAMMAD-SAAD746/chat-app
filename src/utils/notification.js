import { toast } from "react-toastify";

const defaultOptions = {
    autoClose: 3000,
    position: "top-right",
};

export const notify = {
    success(message, options = {}) {
        toast.success(message, {
            ...defaultOptions,
            ...options,
        });
    },

    error(message, options = {}) {
        toast.error(message, {
            ...defaultOptions,
            ...options,
        });
    },

    warning(message, options = {}) {
        toast.warning(message, {
            ...defaultOptions,
            ...options,
        });
    },

    info(message, options = {}) {
        toast.info(message, {
            ...defaultOptions,
            ...options,
        });
    },

    loading(message, options = {}) {
        return toast.loading(message, {
            ...options,
            autoClose: false,
        });
    },

    updateSuccess(toastId, message, options = {}) {
        toast.update(toastId, {
            render: message,
            type: "success",
            isLoading: false,
            autoClose: 3000,
            ...options,
        });
    },

    updateError(toastId, message, options = {}) {
        toast.update(toastId, {
            render: message,
            type: "error",
            isLoading: false,
            autoClose: 3000,
            ...options,
        });
    },

    dismiss(toastId) {
        toast.dismiss(toastId);
    },
};