import { useEffect, useState } from "react";
import { getUser, getUsernames } from "../../../firebase/database";
import { useAuth } from "../../../context/AuthContext";

import { IoArrowBack, IoSearch } from "react-icons/io5";
import "./NewChat.css";

function NewChat({ onBack, onSelectUser }) {
    const [search, setSearch] = useState("");
    const [usernames, setUsernames] = useState({});
    const [searchResults, setSearchResults] = useState([]);

    const { user } = useAuth();



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
                        onClick={() => onSelectUser(user)}
                    >
                        <img
                            src={user.profilePicture || "/assets/hero.png"}
                            alt={user.fullName}
                        />

                        <div className="new-chat-user-info">
                            <h4>{user.fullName}</h4>
                            <p>{user.userName}</p>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}

export default NewChat;