import { IoClose, IoDocumentText, IoSend } from "react-icons/io5";
import "./AttachmentComposer.css";

function AttachmentComposer({
    file,
    caption,
    onCaptionChange,
    onClose,
    onSend,
    isSending,
}) {
    if (!file) {
        return null;
    }

    const isImage = file.type.startsWith("image/");

    return (
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

                <span>
                    Send attachment
                </span>
            </div>


            <div className="attachment-composer-preview">

                {isImage ? (
                    <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                    />
                ) : (
                    <div className="attachment-file-preview">

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

                <button
                    type="button"
                    onClick={onSend}
                    aria-label="Send attachment"
                    disabled={isSending}
                >
                    {isSending ? (
                        <span className="attachment-send-spinner" />
                    ) : (
                        <IoSend size={20} />
                    )}
                </button>

            </div>

        </div>
    );
}

export default AttachmentComposer;