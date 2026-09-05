import { ref, set, remove, update, get } from "firebase/database";
import { database } from "../config";


const getFriendRequestId = (senderId, receiverId) => {
    return `${senderId}_${receiverId}`;
};



export const sendFriendRequest = async (senderId, receiverId) => {
    if (!senderId || !receiverId) {
        throw new Error("Sender and receiver are required.");
    }

    if (senderId === receiverId) {
        throw new Error("You cannot send a friend request to yourself.");
    }

    const requestId = getFriendRequestId(senderId, receiverId);
    const reverseRequestId = getFriendRequestId(receiverId, senderId);

    const requestRef = ref(database, `friendRequests/${requestId}`);
    const reverseRequestRef = ref(
        database,
        `friendRequests/${reverseRequestId}`
    );

    const [requestSnapshot, reverseRequestSnapshot] = await Promise.all([
        get(requestRef),
        get(reverseRequestRef)
    ]);

    if (requestSnapshot.exists()) {
        throw new Error("Friend request already exists.");
    }

    if (reverseRequestSnapshot.exists()) {
        throw new Error("This user has already sent you a friend request.");
    }

    const requestData = {
        senderId,
        receiverId,
        status: "pending",
        createdAt: Date.now()
    };

    await set(requestRef, requestData);
};



export const cancelFriendRequest = async (senderId, receiverId) => {
    if (!senderId || !receiverId) {
        throw new Error("Sender and receiver are required.");
    }

    const requestId = getFriendRequestId(senderId, receiverId);

    await remove(
        ref(database, `friendRequests/${requestId}`)
    );
};



export const acceptFriendRequest = async (senderId, receiverId) => {
    if (!senderId || !receiverId) {
        throw new Error("Sender and receiver are required.");
    }

    const requestId = getFriendRequestId(senderId, receiverId);

    const requestRef = ref(
        database,
        `friendRequests/${requestId}`
    );

    const snapshot = await get(requestRef);

    if (!snapshot.exists()) {
        throw new Error("Friend request does not exist.");
    }

    const request = snapshot.val();

    if (request.status !== "pending") {
        throw new Error("Friend request is no longer pending.");
    }

    const updates = {
        [`friends/${senderId}/${receiverId}`]: true,
        [`friends/${receiverId}/${senderId}`]: true,
        [`friendRequests/${requestId}`]: null
    };

    await update(ref(database), updates);
};


export const rejectFriendRequest = async (senderId, receiverId) => {
    if (!senderId || !receiverId) {
        throw new Error("Sender and receiver are required.");
    }

    const requestId = getFriendRequestId(senderId, receiverId);

    await remove(
        ref(database, `friendRequests/${requestId}`)
    );
};