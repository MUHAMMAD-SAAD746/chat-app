import { IoClose } from "react-icons/io5";
import "./ImageViewer.css";

function ImageViewer({ imageUrl, alt, onClose }) {
    if (!imageUrl) {
        return null;
    }

    return (
        <div
            className="image-viewer"
            onClick={onClose}
        >
            <button
                type="button"
                className="image-viewer-close"
                onClick={onClose}
                aria-label="Close image viewer"
            >
                <IoClose size={28} />
            </button>

            <img
                src={imageUrl}
                alt={alt}
                className="image-viewer-image"
                onClick={(event) => event.stopPropagation()}
            />
        </div>
    );
}

export default ImageViewer;