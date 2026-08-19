import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, getUsernames } from "../../../firebase/database";
import { sendFriendRequest } from "../../../firebase/services/friendRequestService";
import { isFriend } from "../../../firebase/services/friendService";
import { useAuth } from "../../../context/AuthContext";

import SendFriendRequestModal from "../../friends/SendFriendRequestModal/SendFriendRequestModal";
import { notify } from "../../../utils/notification";

import {
    getConversation,
    createConversation
} from "../../../firebase/services/conversationService";

import { IoArrowBack, IoSearch } from "react-icons/io5";
import "./NewChat.css";

function NewChat({ onBack }) {
    const [search, setSearch] = useState("");
    const [usernames, setUsernames] = useState({});
    const [searchResults, setSearchResults] = useState([]);

    const [selectedUser, setSelectedUser] = useState(null);
    const [sendingRequest, setSendingRequest] = useState(false);
    const [alreadyFriend, setAlreadyFriend] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        const loadUsernames = async () => {
            try {
                const data = await getUsernames();
                setUsernames(data);
            } catch (error) {
                console.error("Failed to load usernames:", error);
            }
        };

        loadUsernames();
    }, []);




    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!search.trim()) {
                setSearchResults([]);
                return;
            }

            const filteredUsernames = Object.entries(usernames).filter(
                ([username, uid]) =>
                    uid !== user?.uid &&
                    username.toLowerCase().includes(search.toLowerCase())
            );

            const users = await Promise.all(
                filteredUsernames.map(([username, uid]) => getUser(uid))
            );

            setSearchResults(users.filter(Boolean));
        };

        fetchSearchResults();
    }, [search, usernames]);




    const handleSelectUser = async (selectedUser) => {
        setSelectedUser(selectedUser);

        const friendStatus = await isFriend(
            user.uid,
            selectedUser.uid
        );

        setAlreadyFriend(friendStatus);
    };



    const handleSendFriendRequest = async () => {
        if (!user?.uid || !selectedUser?.uid) return;

        try {
            setSendingRequest(true);

            await sendFriendRequest(
                user.uid,
                selectedUser.uid
            );

            notify.success("Friend request sent", {autoClose: 2000,});

            setSelectedUser(null);

        } catch (error) {
            console.error(
                "Failed to send friend request:",
                error
            );

            notify.error(error.message, {autoClose: 2000,});

        } finally {
            setSendingRequest(false);
            setSelectedUser(null);
            setAlreadyFriend(false);
        }
    };



    const handleStartConversation = async () => {
        if (!user?.uid || !selectedUser?.uid) return;

        try {
            const conversation = await getConversation(
                user.uid,
                selectedUser.uid
            );

            if (conversation) {
                navigate(`/chat/${conversation.id}`);
                return;
            }

            const newConversation = await createConversation(
                user.uid,
                selectedUser.uid
            );

            navigate(`/chat/${newConversation.id}`);

        } catch (error) {
            console.error(
                "Failed to start conversation:",
                error
            );

            alert(error.message);
        }
    };



    return (
        <section className="new-chat">
            <header className="new-chat-header">
                <button
                    className="new-chat-back"
                    type="button"
                    aria-label="Go back"
                    onClick={onBack}
                >
                    <IoArrowBack />
                </button>

                <div className="new-chat-header-content">
                    <h2>Add New Contact</h2>
                    <p>Find someone to start a conversation</p>
                </div>
            </header>

            <div className="new-chat-search-wrapper">
                <div className="new-chat-search">
                    <IoSearch className="new-chat-search-icon" />

                    <input
                        type="text"
                        placeholder="Search by name or username..."
                        aria-label="Search contacts"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="new-chat-results">
                <div className="new-chat-results-header">
                    <h3>Search Results</h3>
                    <span>{searchResults.length} contacts</span>
                </div>

                {searchResults.map((user) => (
                    <button
                        key={user.uid}
                        className="new-chat-user"
                        type="button"
                        onClick={() => handleSelectUser(user)}
                    >
                        <img
                            src={user.profileImage}
                            alt={user.fullName}
                        />

                        <div className="new-chat-user-info">
                            <h4>{user.fullName}</h4>
                            <p>{user.userName}</p>
                        </div>
                    </button>
                ))}
            </div>


            {selectedUser && (
                <SendFriendRequestModal
                    user={selectedUser}
                    alreadyFriend={alreadyFriend}
                    onConfirm={
                        alreadyFriend
                            ? handleStartConversation
                            : handleSendFriendRequest
                    }
                    onCancel={() => {
                        setSelectedUser(null);
                        setAlreadyFriend(false);
                    }}
                    loading={sendingRequest}
                />
            )}
        </section>
    );
}

export default NewChat;