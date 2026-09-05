import { useState } from "react";
import {
    IoClose,
    IoDocumentText,
    IoSend,
    IoAdd,
    IoCheckmark,
    IoRefresh,
} from "react-icons/io5";
import "./AttachmentComposer.css";

function AttachmentComposer({
    files,
    caption,
    onCaptionChange,
    onClose,
    onSend,
    isSending,
    onAddMore,
    fileStatuses,
    onRetryFile,
}) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!files || files.length === 0) {
        return null;
    }

    const file = files[selectedIndex] || files[0];
    const isImage = file?.type?.startsWith("image/");


    return (
        <div className="attachment-composer-overlay">
            <div className="attachment-composer">
                <div className="attachment-composer-header">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close attachment"
                        disabled={isSending}
                    >
                        <IoClose size={24} />
                    </button>
                </div>


                <div className="attachment-composer-preview">

                    {isImage ? (
                        <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                        />
                    ) : (
                        <div className="attachment-files-preview">

                            <IoDocumentText size={72} />

                            <p>
                                {file.name}
                            </p>

                            <span>
                                Preview not available
                            </span>

                        </div>
                    )}

                    {isSending && (
                        <div className="attachment-composer-sending">
                            Sending...
                        </div>
                    )}

                </div>


                <div className="attachment-composer-input">

                    <input
                        type="text"
                        placeholder="Add a caption..."
                        value={caption}
                        onChange={(e) =>
                            onCaptionChange(e.target.value)
                        }
                        disabled={isSending}
                    />
                </div>



                <div className="attachment-thumbnails">

                    <div className="attachment-thumbnail-list">
                        {files.map((file, index) => (
                            <div
                                className={`attachment-thumbnail ${selectedIndex === index
                                    ? "attachment-thumbnail-selected"
                                    : ""
                                    }`}
                                key={index}
                                onClick={() => setSelectedIndex(index)}
                            >
                                {file?.type?.startsWith("image/") ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                    />
                                ) : (
                                    <IoDocumentText size={28} />
                                )}


                                {fileStatuses?.[
                                    `${file.name}-${file.size}-${file.lastModified}`
                                ] === "uploading" && (
                                        <div className="attachment-status uploading">
                                            <span className="attachment-thumbnail-spinner" />
                                        </div>
                                    )}

                                {fileStatuses?.[
                                    `${file.name}-${file.size}-${file.lastModified}`
                                ] === "success" && (
                                        <div className="attachment-status success">
                                            <IoCheckmark />
                                        </div>
                                    )}

                                {fileStatuses?.[
                                    `${file.name}-${file.size}-${file.lastModified}`
                                ] === "failed" && (
                                        <div
                                            className="attachment-status failed"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRetryFile(file);
                                            }}
                                        >
                                            <IoRefresh />
                                        </div>
                                    )}
                            </div>
                        ))}

                        <div
                            className="attachment-add-more"
                            onClick={onAddMore}
                        >
                            <IoAdd size={28} />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onSend}
                        aria-label="Send attachment"
                        disabled={isSending}
                        className="attachment-send-button"
                    >
                        {isSending ? (
                            <span className="attachment-send-spinner" />
                        ) : (
                            <IoSend size={20} />
                        )}
                    </button>

                </div>

            </div>
        </div>
    );
}

export default AttachmentComposer;