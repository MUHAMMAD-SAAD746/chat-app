import { ref, push, set, get, update } from "firebase/database";
import { database } from "../config";
import { incrementUnread } from "./unreadService";
import { isFriend } from "./friendService";

export async function sendMessage(conversationId, senderId, text) {
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
        createdAt: Date.now(),
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
        deletedAt: Date.now(),
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
        editedAt: Date.now(),
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
        createdAt: Date.now(),
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