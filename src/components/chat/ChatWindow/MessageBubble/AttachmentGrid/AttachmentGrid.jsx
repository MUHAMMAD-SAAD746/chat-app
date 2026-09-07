import "./AttachmentGrid.css";

function AttachmentGrid({
    attachments,
    onImageClick,
}) {
    if (!attachments?.length) {
        return null;
    }

    const images = attachments.filter(
        (attachment) =>
            attachment.type === "image" ||
            attachment.fileType?.startsWith("image/")
    );

    if (!images.length) {
        return null;
    }

    const visibleImages = images.slice(0, 4);

    const gridCount = Math.min(images.length, 4);

    const remainingCount = images.length - 4;

    return (
        <div
            className={`attachment-grid attachment-grid-${gridCount}`}
        >
            {visibleImages.map((image, index) => {
                const showMore =
                    images.length > 4 &&
                    index === 3;

                return (
                    <button
                        key={`${image.fileUrl}-${index}`}
                        type="button"
                        className="attachment-grid-item"
                        onClick={() => onImageClick(index)}
                    >
                        <img
                            src={image.fileUrl}
                            alt={image.fileName || "Image"}
                        />

                        {showMore && (
                            <span className="attachment-grid-more">
                                +{remainingCount}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

export default AttachmentGrid;