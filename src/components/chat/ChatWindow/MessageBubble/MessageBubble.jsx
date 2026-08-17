import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5";
import "./MessageBubble.css";

function MessageBubble({
    text,
    time,
    isOwn = false,
    deliveredAt,
    readAt,
}) {
    let receiptStatus = "sent";

    if (deliveredAt) {
        receiptStatus = "delivered";
    }

    if (readAt) {
        receiptStatus = "read";
    }



    return (
        <div className={`message ${isOwn ? "message-own" : "message-other"}`}>
            <div className="message-bubble">
                <p>{text}</p>


                <span className="message-time">
                    {time}

                    {isOwn && (
                        receiptStatus === "sent"
                            ? <IoCheckmark className="message-receipt" />
                            : <IoCheckmarkDone
                                className={`message-receipt message-receipt-${receiptStatus}`}
                            />
                    )}
                </span>
            </div>
        </div>
    );
}

export default MessageBubble;