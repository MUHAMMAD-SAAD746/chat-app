import { useState } from "react";
import { IoClose } from "react-icons/io5";
import "./ImageViewer.css";

function ImageViewer({
    images = [],
    initialIndex = 0,
    onClose,
}) {
    const [selectedIndex, setSelectedIndex] = useState(initialIndex);

    if (!images.length) {
        return null;
    }

    const selectedImage = images[selectedIndex];

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

            <div
                className="image-viewer-content"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <img
                    src={selectedImage.fileUrl}
                    alt={
                        selectedImage.fileName ||
                        "Image"
                    }
                    className="image-viewer-image"
                />

                <div className="image-viewer-thumbnails">
                    {images.map((image, index) => (
                        <button
                            key={`${image.fileUrl}-${index}`}
                            type="button"
                            className={`image-viewer-thumbnail ${selectedIndex === index
                                    ? "active"
                                    : ""
                                }`}
                            onClick={() =>
                                setSelectedIndex(index)
                            }
                        >
                            <img
                                src={image.fileUrl}
                                alt={
                                    image.fileName ||
                                    `Thumbnail ${index + 1}`
                                }
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ImageViewer;