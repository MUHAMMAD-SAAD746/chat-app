import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import {
    subscribeToReceivedFriendRequests,
    subscribeToSentFriendRequests
} from "../firebase/services/friendRequestListenerService";

function useFriendRequests() {
    const { user } = useAuth();

    const [requests, setRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);

    useEffect(() => {
        if (!user?.uid) {
            setRequests([]);
            return;
        }

        const unsubscribeReceived =
            subscribeToReceivedFriendRequests(
                user.uid,
                (receivedRequests) => {
                    setRequests(receivedRequests);
                }
            );

        const unsubscribeSent =
            subscribeToSentFriendRequests(
                user.uid,
                (sentRequests) => {
                    setSentRequests(sentRequests);
                }
            );

        return () => {
            unsubscribeReceived();
            unsubscribeSent();
        };
    }, [user?.uid]);

    return {
        requests,
        requestCount: requests.length,
        sentRequests,
        sentRequestCount: sentRequests.length
    };
}

export default useFriendRequests;