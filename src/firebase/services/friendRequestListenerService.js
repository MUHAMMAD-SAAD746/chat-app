import { ref, onValue } from "firebase/database";
import { database } from "../config";


/**
 * Listen for friend requests received by a user.
 */
export const subscribeToReceivedFriendRequests = (
    userId,
    callback
) => {
    if (!userId) return () => { };

    const requestsRef = ref(
        database,
        "friendRequests"
    );

    const unsubscribe = onValue(requestsRef, (snapshot) => {
        const requests = snapshot.val() || {};

        const receivedRequests = Object.entries(requests)
            .filter(
                ([_, request]) =>
                    request.receiverId === userId &&
                    request.status === "pending"
            )
            .map(([id, request]) => ({
                id,
                ...request,
            }));

        callback(receivedRequests);
    });

    return unsubscribe;
};


/**
 * Listen for friend requests sent by a user.
 */
export const subscribeToSentFriendRequests = (
    userId,
    callback
) => {
    if (!userId) return () => { };

    const requestsRef = ref(
        database,
        "friendRequests"
    );

    const unsubscribe = onValue(requestsRef, (snapshot) => {
        const requests = snapshot.val() || {};

        // const sentRequests = Object.values(requests).filter(
        //     (request) =>
        //         request.senderId === userId &&
        //         request.status === "pending"
        // );

        const sentRequests = Object.entries(requests)
            .filter(
                ([_, request]) =>
                    request.senderId === userId
            )
            .map(([id, request]) => ({
                id,
                ...request,
            }));



        callback(sentRequests);
    });

    return unsubscribe;
};