import {
    ref,
    runTransaction,
    serverTimestamp,
} from "firebase/database";

import { database } from "../config";


function getMessageRef(conversationId, messageId) {
    return ref(
        database,
        `conversations/${conversationId}/messages/${messageId}`
    );
}


export const markMessageAsDelivered = async (
    conversationId,
    messageId
) => {
    if (!conversationId || !messageId) return;

    try {
        const messageRef = getMessageRef(
            conversationId,
            messageId
        );

        await runTransaction(
            messageRef,
            (message) => {

                if (!message) {
                    return;
                }

                if (message.deliveredAt) {
                    return;
                }

                return {
                    ...message,
                    deliveredAt: serverTimestamp(),
                };
            },
            {
                applyLocally: false,
            }
        );

    } catch (error) {
        console.error(
            "Error marking message as delivered:",
            error
        );
    }
};


export const markMessageAsRead = async (
    conversationId,
    messageId
) => {
    if (!conversationId || !messageId) return;

    try {
        const messageRef = getMessageRef(
            conversationId,
            messageId
        );

        await runTransaction(
            messageRef,
            (message) => {

                if (!message) {
                    return;
                }

                return {
                    ...message,
                    readAt: serverTimestamp(),
                };
            },
            {
                applyLocally: false,
            }
        );

    } catch (error) {
        console.error(
            "Error marking message as read:",
            error
        );
    }
};