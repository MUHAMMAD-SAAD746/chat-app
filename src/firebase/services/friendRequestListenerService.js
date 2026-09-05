import { ref, onValue } from "firebase/database";
import { database } from "../config";


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