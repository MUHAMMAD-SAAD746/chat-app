import { ref, push, set, get, update, serverTimestamp } from "firebase/database";
import { database } from "../config";
import { incrementUnread } from "./unreadService";
import { isFriend } from "./friendService";

export async function sendMessage(
    conversationId,
    senderId,
    text,
    replyTo = null
) {
    const conversationRef = ref(
        database,
        `conversations/${conversationId}`
    );

    const conversationSnapshot = await get(conversationRef);

    if (!conversationSnapshot.exists()) {
        throw new Error("Conversation not found");
    }

    const conversation = conversationSnapshot.val();

    const recipientId = Object.keys(conversation.members)
        .find((uid) => uid !== senderId);

    if (!recipientId) {
        throw new Error("Recipient not found");
    }

    const areFriends = await isFriend(
        senderId,
        recipientId
    );

    if (!areFriends) {
        throw new Error(
            "You are no longer friends with this user."
        );
    }

    const messagesRef = ref(
        database,
        `conversations/${conversationId}/messages`
    );

    const messageRef = push(messagesRef);

    const message = {
        senderId,
        text,
        createdAt: serverTimestamp(),
        ...(replyTo && { replyTo }),
    };

    await set(messageRef, message);

    const activeConversationRef = ref(
        database,
        `activeConversations/${recipientId}`
    );

    const activeConversationSnapshot = await get(
        activeConversationRef
    );

    const activeConversationId = activeConversationSnapshot.val();

    if (activeConversationId !== conversationId) {
        await incrementUnread(
            conversationId,
            recipientId
        );
    }

    return {
        id: messageRef.key,
        ...message,
    };
}


export async function deleteMessageForMe(
    conversationId,
    messageId,
    userId
) {
    const messageRef = ref(
        database,
        `conversations/${conversationId}/messages/${messageId}`
    );

    await update(messageRef, {
        [`deletedFor/${userId}`]: true,
    });
}


export async function deleteMessageForEveryone(
    conversationId,
    messageId
) {
    const messageRef = ref(
        database,
        `conversations/${conversationId}/messages/${messageId}`
    );

    await update(messageRef, {
        deleteStatus: "everyone",
        deletedAt: serverTimestamp(),
    });
}




export async function editMessage(
    conversationId,
    messageId,
    userId,
    text
) {
    const messageRef = ref(
        database,
        `conversations/${conversationId}/messages/${messageId}`
    );

    const messageSnapshot = await get(messageRef);

    if (!messageSnapshot.exists()) {
        throw new Error("Message not found");
    }

    const message = messageSnapshot.val();

    if (message.senderId !== userId) {
        throw new Error(
            "You can only edit your own messages."
        );
    }

    await update(messageRef, {
        text,
        editedAt: serverTimestamp(),
    });
}






export async function sendFileMessage(
    conversationId,
    senderId,
    fileUrl,
    fileName,
    fileType,
    fileSize,
    caption
) {
    const conversationRef = ref(
        database,
        `conversations/${conversationId}`
    );

    const conversationSnapshot = await get(conversationRef);

    if (!conversationSnapshot.exists()) {
        throw new Error("Conversation not found");
    }

    const conversation = conversationSnapshot.val();

    const recipientId = Object.keys(conversation.members)
        .find((uid) => uid !== senderId);

    if (!recipientId) {
        throw new Error("Recipient not found");
    }

    const areFriends = await isFriend(
        senderId,
        recipientId
    );

    if (!areFriends) {
        throw new Error(
            "You are no longer friends with this user."
        );
    }

    const messagesRef = ref(
        database,
        `conversations/${conversationId}/messages`
    );

    const messageRef = push(messagesRef);

    const message = {
        senderId,
        type: fileType.startsWith("image/")
            ? "image"
            : "file",
        fileUrl,
        fileName,
        fileType,
        fileSize,
        caption,
        createdAt: serverTimestamp(),
    };

    await set(messageRef, message);

    const activeConversationRef = ref(
        database,
        `activeConversations/${recipientId}`
    );

    const activeConversationSnapshot = await get(
        activeConversationRef
    );

    const activeConversationId = activeConversationSnapshot.val();

    if (activeConversationId !== conversationId) {
        await incrementUnread(
            conversationId,
            recipientId
        );
    }

    return {
        id: messageRef.key,
        ...message,
    };
}




export async function sendVoiceMessage(
    conversationId,
    senderId,
    fileUrl,
    fileType,
    fileSize,
    duration,
    waveform
) {
    const conversationRef = ref(
        database,
        `conversations/${conversationId}`
    );

    const conversationSnapshot = await get(
        conversationRef
    );

    if (!conversationSnapshot.exists()) {
        throw new Error("Conversation not found");
    }

    const conversation = conversationSnapshot.val();

    const recipientId = Object.keys(
        conversation.members
    ).find((uid) => uid !== senderId);

    if (!recipientId) {
        throw new Error("Recipient not found");
    }

    const areFriends = await isFriend(
        senderId,
        recipientId
    );

    if (!areFriends) {
        throw new Error(
            "You are no longer friends with this user."
        );
    }

    const messagesRef = ref(
        database,
        `conversations/${conversationId}/messages`
    );

    const messageRef = push(messagesRef);

    const message = {
        senderId,
        type: "voice",
        fileUrl,
        fileType,
        fileSize,
        duration,
        waveform,
        createdAt: serverTimestamp(),
    };

    await set(messageRef, message);

    const activeConversationRef = ref(
        database,
        `activeConversations/${recipientId}`
    );

    const activeConversationSnapshot = await get(
        activeConversationRef
    );

    const activeConversationId =
        activeConversationSnapshot.val();

    if (activeConversationId !== conversationId) {
        await incrementUnread(
            conversationId,
            recipientId
        );
    }

    return {
        id: messageRef.key,
        ...message,
    };
}






// export async function sendMultipleFileMessages(
//     conversationId,
//     senderId,
//     files,
//     caption
// ) {
//     const conversationRef = ref(
//         database,
//         `conversations/${conversationId}`
//     );

//     const conversationSnapshot = await get(
//         conversationRef
//     );

//     if (!conversationSnapshot.exists()) {
//         throw new Error("Conversation not found");
//     }

//     const conversation = conversationSnapshot.val();

//     const recipientId = Object.keys(
//         conversation.members
//     ).find((uid) => uid !== senderId);

//     if (!recipientId) {
//         throw new Error("Recipient not found");
//     }

//     const areFriends = await isFriend(
//         senderId,
//         recipientId
//     );

//     if (!areFriends) {
//         throw new Error(
//             "You are no longer friends with this user."
//         );
//     }

//     if (!files?.length) {
//         throw new Error("No files provided.");
//     }

//     const messagesRef = ref(
//         database,
//         `conversations/${conversationId}/messages`
//     );

//     const messageRef = push(messagesRef);

//     const attachments = files.map((file) => ({
//         fileUrl: file.fileUrl,
//         fileName: file.fileName,
//         fileType: file.fileType,
//         fileSize: file.fileSize,
//         type: file.fileType.startsWith("image/")
//             ? "image"
//             : "file",
//     }));

//     const message = {
//         senderId,
//         attachments,
//         ...(caption?.trim() && {
//             caption: caption.trim(),
//         }),
//         createdAt: serverTimestamp(),
//     };

//     await set(messageRef, message);

//     const activeConversationRef = ref(
//         database,
//         `activeConversations/${recipientId}`
//     );

//     const activeConversationSnapshot = await get(
//         activeConversationRef
//     );

//     const activeConversationId =
//         activeConversationSnapshot.val();

//     if (activeConversationId !== conversationId) {
//         await incrementUnread(
//             conversationId,
//             recipientId
//         );
//     }

//     return {
//         id: messageRef.key,
//         ...message,
//     };
// }





export async function sendMultipleFileMessages(
    conversationId,
    senderId,
    files,
    caption
) {
    const conversationRef = ref(
        database,
        `conversations/${conversationId}`
    );

    const conversationSnapshot = await get(
        conversationRef
    );

    if (!conversationSnapshot.exists()) {
        throw new Error("Conversation not found");
    }

    const conversation = conversationSnapshot.val();

    const recipientId = Object.keys(
        conversation.members
    ).find((uid) => uid !== senderId);

    if (!recipientId) {
        throw new Error("Recipient not found");
    }

    const areFriends = await isFriend(
        senderId,
        recipientId
    );

    if (!areFriends) {
        throw new Error(
            "You are no longer friends with this user."
        );
    }

    if (!files?.length) {
        throw new Error("No files provided.");
    }

    const messagesRef = ref(
        database,
        `conversations/${conversationId}/messages`
    );

    const imageFiles = files.filter(
        (file) =>
            file.fileType?.startsWith("image/")
    );

    const documentFiles = files.filter(
        (file) =>
            !file.fileType?.startsWith("image/")
    );

    const createdMessages = [];

    /*
     * ==========================================
     * 1. SEND ALL IMAGES AS ONE MESSAGE
     * ==========================================
     */

    if (imageFiles.length > 0) {
        const messageRef = push(messagesRef);

        const attachments = imageFiles.map((file) => ({
            fileUrl: file.fileUrl,
            fileName: file.fileName,
            fileType: file.fileType,
            fileSize: file.fileSize,
            type: "image",
        }));

        const message = {
            senderId,
            attachments,

            ...(caption?.trim() && {
                caption: caption.trim(),
            }),

            createdAt: serverTimestamp(),
        };

        await set(messageRef, message);

        createdMessages.push({
            id: messageRef.key,
            ...message,
        });
    }


    /*
     * ==========================================
     * 2. SEND EACH DOCUMENT AS SEPARATE MESSAGE
     * ==========================================
     */

    for (const file of documentFiles) {
        const messageRef = push(messagesRef);

        const message = {
            senderId,

            attachments: [
                {
                    fileUrl: file.fileUrl,
                    fileName: file.fileName,
                    fileType: file.fileType,
                    fileSize: file.fileSize,
                    type: "file",
                },
            ],

            ...(caption?.trim() && {
                caption: caption.trim(),
            }),

            createdAt: serverTimestamp(),
        };

        await set(messageRef, message);

        createdMessages.push({
            id: messageRef.key,
            ...message,
        });
    }


    /*
     * ==========================================
     * 3. UPDATE UNREAD ONCE
     * ==========================================
     */

    const activeConversationRef = ref(
        database,
        `activeConversations/${recipientId}`
    );

    const activeConversationSnapshot = await get(
        activeConversationRef
    );

    const activeConversationId =
        activeConversationSnapshot.val();

    if (
        activeConversationId !== conversationId
    ) {
        await incrementUnread(
            conversationId,
            recipientId
        );
    }


    return createdMessages;
}







export async function forwardMessage(
    destinationConversationId,
    senderId,
    originalMessage
) {
    if (
        !destinationConversationId ||
        !senderId ||
        !originalMessage
    ) {
        throw new Error("Invalid forwarding data.");
    }

    const conversationRef = ref(
        database,
        `conversations/${destinationConversationId}`
    );

    const conversationSnapshot = await get(
        conversationRef
    );

    if (!conversationSnapshot.exists()) {
        throw new Error("Conversation not found.");
    }

    const conversation = conversationSnapshot.val();

    const recipientId = Object.keys(
        conversation.members || {}
    ).find((uid) => uid !== senderId);

    if (!recipientId) {
        throw new Error("Recipient not found.");
    }

    const areFriends = await isFriend(
        senderId,
        recipientId
    );

    if (!areFriends) {
        throw new Error(
            "You are no longer friends with this user."
        );
    }

    const messagesRef = ref(
        database,
        `conversations/${destinationConversationId}/messages`
    );

    const messageRef = push(messagesRef);

    const {
        text,
        type,
        fileUrl,
        fileName,
        fileType,
        fileSize,
        caption,
    } = originalMessage;

    const message = {
        senderId,

        ...(text !== undefined && {
            text,
        }),

        ...(type !== undefined && {
            type,
        }),

        ...(fileUrl !== undefined && {
            fileUrl,
        }),

        ...(fileName !== undefined && {
            fileName,
        }),

        ...(fileType !== undefined && {
            fileType,
        }),

        ...(fileSize !== undefined && {
            fileSize,
        }),

        ...(caption !== undefined && {
            caption,
        }),

        forwarded: true,

        createdAt: serverTimestamp(),
    };

    await set(messageRef, message);

    const activeConversationRef = ref(
        database,
        `activeConversations/${recipientId}`
    );

    const activeConversationSnapshot = await get(
        activeConversationRef
    );

    const activeConversationId =
        activeConversationSnapshot.val();

    if (
        activeConversationId !==
        destinationConversationId
    ) {
        await incrementUnread(
            destinationConversationId,
            recipientId
        );
    }

    return {
        id: messageRef.key,
        ...message,
    };
}